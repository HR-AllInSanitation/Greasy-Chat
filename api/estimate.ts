
// Minimal buildId: hardcoded short string (update as needed)
const BUILD_ID = 'DEV20260119';

/*
Manual QA (customer email should send, customerResendStatus=200):
- curl -X POST "https://www.larestaurantservices.com/api/estimate" -H "Content-Type: application/json" -d '{"intake":{"businessName":"QA ContactEmail","wantsToMoveForward":true},"contact":{"contactEmail":"test@example.com"},"estimate":{"amount":100}}'
- curl -X POST "https://www.larestaurantservices.com/api/estimate" -H "Content-Type: application/json" -d '{"intake":{"businessName":"QA Email","wantsToMoveForward":true},"contact":{"email":"test@example.com"},"estimate":{"amount":100}}'
*/

// pdf-lib is imported dynamically only when needed

import { Redis } from '@upstash/redis';
import { Client as QStashClient } from '@upstash/qstash';

type ResendResult = { ok: boolean; status?: number; messageId?: string; errorCode?: string };

type NormalizedContact = {
  name?: string;
  email?: string;
  phone?: string;
  keyUsed: {
    name?: string;
    email?: string;
    phone?: string;
  };
};

const logJson = (event: string, data: Record<string, unknown>) => {
  try {
    console.log(JSON.stringify({ event, ...data }));
  } catch (err) {
    console.log(event, data, err);
  }
};

const withTimeout = async <T>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`${label}_timeout`)), ms);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

// Redis helper: get or create Redis client
const getRedisClient = (): Redis | null => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return null;
  }
  try {
    return new Redis({ url, token });
  } catch (err: any) {
    console.warn('Redis initialization failed:', err?.message);
    return null;
  }
};

// QStash helper: get or create QStash client
const getQStashClient = (): QStashClient | null => {
  const token = process.env.QSTASH_TOKEN;
  if (!token) {
    return null;
  }
  try {
    return new QStashClient({ token });
  } catch (err: any) {
    console.warn('QStash initialization failed:', err?.message);
    return null;
  }
};

// Redis state management for leads
interface LeadState {
  quoteId: string;
  decision?: 'YES' | 'NO' | 'PENDING';
  hqScheduled?: number; // 0 or 1
  hqScheduledAt?: string;
  hqSent?: number; // 0 or 1
  createdAt?: string;
  decisionAt?: string;
  hqSentAt?: string;
  hqMessageId?: string;
  customerEmailSent?: number; // 0 or 1
  customerEmailSentAt?: string;
  customerEmailMessageId?: string;
}

const storeLeadState = async (quoteId: string, state: Partial<LeadState>): Promise<boolean> => {
  const redis = getRedisClient();
  if (!redis) {
    console.warn('Redis unavailable; skipping lead state storage', { quoteId });
    return false;
  }
  try {
    const key = `greasy:lead:${quoteId}:state`;
    await withTimeout(redis.hset(key, state as Record<string, string | number>), 1500, 'redis_hset_state');
    // Set expiry to 30 days
    await withTimeout(redis.expire(key, 30 * 24 * 60 * 60), 1500, 'redis_expire_state');
    if (process.env.DEV) console.log('Lead state stored', { quoteId, key });
    return true;
  } catch (err: any) {
    console.error('Failed to store lead state:', err?.message, { quoteId });
    return false;
  }
};

const storeLeadPayload = async (quoteId: string, payload: any): Promise<boolean> => {
  const redis = getRedisClient();
  if (!redis) {
    console.warn('Redis unavailable; skipping lead payload storage', { quoteId });
    return false;
  }
  try {
    const key = `greasy:lead:${quoteId}:payload`;
    const json = JSON.stringify(payload);
    await withTimeout(redis.set(key, json, { ex: 30 * 24 * 60 * 60 }), 1500, 'redis_set_payload');
    if (process.env.DEV) console.log('Lead payload stored', { quoteId, key });
    return true;
  } catch (err: any) {
    console.error('Failed to store lead payload:', err?.message, { quoteId });
    return false;
  }
};

const scheduleHqEmailViaQStash = async (quoteId: string): Promise<boolean> => {
  const qstash = getQStashClient();
  if (!qstash) {
    console.warn('QStash unavailable; skipping HQ email scheduling', { quoteId });
    return false;
  }
  try {
    const delaySeconds = parseInt(process.env.HQ_EMAIL_DELAY_SECONDS || '120', 10);
    
    // **HARDENING**: Use absolute URL for consistency with Receiver
    // Prefer VERCEL_URL (set by Vercel), fall back to HQ_SEND_URL, then localhost
    let hqSendUrl = process.env.HQ_SEND_URL || 'http://localhost:3000/api/hq-send';
    if (process.env.VERCEL_URL) {
      hqSendUrl = `https://${process.env.VERCEL_URL}/api/hq-send`;
    }
    
    const messageId = await withTimeout(
      qstash.publishJSON({
        url: hqSendUrl,
        body: { quoteId },
        delay: delaySeconds,
      }),
      2500,
      'qstash_publish'
    );
    
    console.log('QSTASH_SCHEDULED', { quoteId, delaySeconds, hqSendUrl, messageId });
    return true;
  } catch (err: any) {
    console.error('Failed to schedule QStash HQ email:', err?.message, { quoteId });
    return false;
  }
};

const sendResendEmail = async (params: { apiKey: string; from: string; to: string | string[]; subject: string; text: string; attachments?: any[]; quoteId?: string }): Promise<ResendResult> => {
  const { apiKey, from, to, subject, text, attachments, quoteId } = params;
  const toList = Array.isArray(to) ? to.filter(Boolean) : [to];
  if (!apiKey || !from || toList.length === 0) {
    console.warn('RESEND_SEND_SKIPPED', { reason: 'missing-config', quoteId, toCount: toList.length });
    return { ok: false, errorCode: 'missing-config' };
  }

  const toCount = toList.length;
  console.log('Sending email to Resend...', { toCount, subject, quoteId, bodyLength: text?.length ?? 0 });
  console.log('RESEND_SEND_START', { toCount, subject, quoteId });
  try {
    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), 4000);
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to: toList, subject, text, attachments }),
      signal: ac.signal,
    });
    clearTimeout(timeout);

    const status = resp.status;
    let messageId: string | undefined;
    if (resp.ok) {
      try {
        const json = await resp.json();
        messageId = json?.id || json?.data?.id;
      } catch {
        messageId = undefined;
      }
      console.log('RESEND_SEND_OK', { toCount, subject, status, messageId, quoteId });
      return { ok: true, status, messageId };
    }

    const requestId = resp.headers.get('x-request-id') || resp.headers.get('x-resend-id') || undefined;
    let message = '';
    try {
      const json = await resp.json();
      if (typeof json?.message === 'string') message = json.message;
    } catch {
      message = '';
    }
    const errorCode = message ? message.slice(0, 200) : `status-${status}`;
    console.error('RESEND_SEND_ERROR', { toCount, subject, status, message: message || undefined, requestId, quoteId });
    return { ok: false, status, errorCode };
  } catch (err: any) {
    const errorCode = (err?.message || 'resend-exception').slice(0, 120);
    console.error('RESEND_SEND_ERROR', { toCount, subject, error: errorCode, quoteId });
    return { ok: false, errorCode };
  }
};

export const config = { runtime: 'nodejs' };

const SHEET_HEADERS = [
  'Timestamp',
  'Business Name',
  'Address',
  'City',
  'Gallons',
  'Estimate Amount',
  'Ballpark',
  'Contact Name',
  'Contact Email',
  'Contact Phone',
  'Source',
  'Created At',
  'State',
  'Zip',
  'System Type',
  'Service Type',
  'Parking Distance',
  'Last Service Months',
  'Additional Services',
  'Capacity Tier',
  'Capacity Unsure',
  'Manual Quote',
  'Tier Used',
  'Radius Band',
  'Distance Miles',
  'Distance Source',
  'Add-ons',
  'Last Cleaned',
  'Needs UCO',
  'Wants To Move Forward',
];

const isTruthyFlag = (value: any): boolean => {
  if (value === true) return true;
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase();
    return trimmed === 'true' || trimmed === 'yes' || trimmed === '1';
  }
  if (typeof value === 'number') return value === 1;
  return false;
};

const isFalseyFlag = (value: any): boolean => {
  if (value === false) return true;
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase();
    return trimmed === 'false' || trimmed === 'no' || trimmed === '0' || trimmed === 'n';
  }
  if (typeof value === 'number') return value === 0;
  return false;
};

const wantsToMoveForwardFlag = (intake: any): boolean => {
  if (!intake || typeof intake !== 'object') return false;
  return isTruthyFlag(intake.wants_to_move_forward) || isTruthyFlag(intake.wantsToMoveForward);
};

const normalizeContact = (contactRaw: any): NormalizedContact => {
  const pick = (keys: string[]): { value?: string; key?: string } => {
    for (const key of keys) {
      const val = contactRaw?.[key];
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed) return { value: trimmed, key };
      }
    }
    return {};
  };

  const namePick = pick(['name', 'contactName', 'contact_name']);
  const emailPick = pick(['email', 'contactEmail', 'contact_email']);
  const phonePick = pick(['phone', 'contactPhone', 'contact_phone']);

  const prefix = 'contact.';

  return {
    name: namePick.value,
    email: emailPick.value,
    phone: phonePick.value,
    keyUsed: {
      name: namePick.key ? `${prefix}${namePick.key}` : undefined,
      email: emailPick.key ? `${prefix}${emailPick.key}` : undefined,
      phone: phonePick.key ? `${prefix}${phonePick.key}` : undefined,
    },
  };
};

const buildSheetRow = (intake: any, contact: any, estimate: any, meta: any) => {
  const nowIso = new Date().toISOString();
  const createdAt = meta?.createdAt || meta?.created_at || nowIso;
  const source = meta?.source || 'greasy-agent';
  const serviceType = meta?.service || intake?.system_type || estimate?.baseServiceLabel || '';
  const addOnsRaw = Array.isArray(estimate?.addOns)
    ? estimate.addOns
    : Array.isArray((estimate as any)?.add_ons)
      ? (estimate as any).add_ons
      : [];
  const addOns = (addOnsRaw as { name: string; price: number }[]).map((a) => `${a.name}:${a.price}`);
  const estimateAmount = typeof estimate?.totalPrice === 'number'
    ? estimate.totalPrice
    : typeof estimate?.minPrice === 'number'
      ? estimate.minPrice
      : estimate?.amount ?? '';
  const capacityTier = (estimate as any)?.capacity_tier || estimate?.tierUsed || '';
  const capacityUnsure = (estimate as any)?.capacity_unsure === true || estimate?.gallonsUncertain === true ? 'TRUE' : '';
  const manualQuote = estimate?.manualQuote === true || (estimate as any)?.manual_quote === true ? 'TRUE' : '';
  const radiusBand = estimate?.radiusBand || (estimate as any)?.radius_band || '';
  const distanceMiles = estimate?.distanceMiles ?? estimate?.distance ?? '';
  const distanceSource = estimate?.distanceSource || (estimate as any)?.distance_source || '';
  const contactName = contact?.name || '';
  const contactEmail = contact?.email || '';
  const contactPhone = contact?.phone || '';
  const needsUcoRaw = intake?.needs_uco ?? (intake as any)?.needsUco;
  const needsUco = isTruthyFlag(needsUcoRaw) ? 'TRUE' : isFalseyFlag(needsUcoRaw) ? 'FALSE' : '';
  const wantsMoveForwardFlagged = wantsToMoveForwardFlag(intake);
  const wantsMoveForward = wantsMoveForwardFlagged ? 'TRUE' : intake?.wants_to_move_forward ?? intake?.wantsToMoveForward ?? '';

  return [
    nowIso,
    intake?.business_name || '',
    intake?.address_line || '',
    intake?.city || '',
    intake?.gallons ?? '',
    estimateAmount,
    estimate?.ballpark === true ? 'TRUE' : '',
    contactName,
    contactEmail,
    contactPhone,
    source,
    createdAt,
    intake?.state || '',
    intake?.zip || '',
    intake?.system_type || '',
    serviceType,
    intake?.parking_distance || '',
    intake?.last_service_months || '',
    intake?.additional_services || '',
    capacityTier,
    capacityUnsure,
    manualQuote,
    estimate?.tierUsed || '',
    radiusBand,
    distanceMiles,
    distanceSource,
    addOns.join('; '),
    intake?.last_cleaned_at || '',
    needsUco,
    wantsMoveForward,
  ];
};

const maskEmail = (value?: string) => {
  if (typeof value !== 'string') return value;
  const [user, domain] = value.split('@');
  if (!domain) return `${value.slice(0, 2)}***`;
  return `${user.slice(0, 2)}***@${domain}`;
};

const isValidEmail = (value?: string): boolean => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  // Lightweight email shape check; avoids sending obvious invalid addresses to Resend
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
};

const getResendFrom = (): { resolvedFrom: string; fromDomain: string } => {
  const raw = (process.env.RESEND_FROM || '').trim();
  if (!raw) {
    throw new Error('RESEND_FROM is missing');
  }

  const match = raw.match(/<\s*([^>]+)\s*>$/);
  const emailPart = match ? match[1].trim() : raw;

  if (!isValidEmail(emailPart)) {
    throw new Error('RESEND_FROM must be a valid email or "Name <email@domain>"');
  }

  const fromDomain = emailPart.split('@')[1] || '';
  if (!fromDomain) {
    throw new Error('RESEND_FROM domain is missing');
  }

  return { resolvedFrom: raw, fromDomain: fromDomain.toLowerCase() };
};

const maskPhone = (value?: string) => {
  if (typeof value !== 'string') return value;
  if (value.length <= 4) return `${value[0] || ''}***`;
  return `${value.slice(0, 2)}***${value.slice(-2)}`;
};

const sendCustomerEmail = async (payload: any, from: string): Promise<ResendResult> => {
  const { intake, contact, estimate, pdfBytes, meta } = payload || {};
  const apiKey = process.env.RESEND_API_KEY;
  const to = contact?.email;

  if (!apiKey) {
    console.warn('RESEND_API_KEY not set; skipping transactional email');
    return { ok: false, errorCode: 'missing-api-key' };
  }
  if (!to) {
    console.warn('Contact email missing; skipping transactional email');
    return { ok: false, errorCode: 'missing-contact-email' };
  }

  const manualQuote = estimate?.manualQuote === true;
  const rawAmount = manualQuote
    ? null
    : typeof estimate?.totalPrice === 'number'
      ? estimate.totalPrice
      : typeof estimate?.minPrice === 'number'
        ? estimate.minPrice
        : estimate?.amount;
  const amount = manualQuote
    ? 'Manual review required'
    : typeof rawAmount === 'number'
      ? `$${rawAmount.toFixed(2)}`
      : String(rawAmount ?? '');
  const addressParts = [intake?.address_line, intake?.city, intake?.state, intake?.zip].filter(Boolean);
  const address = addressParts.join(', ');
  const disclaimer = 'This estimate is a preliminary range and is subject to verification by our operations team. Final pricing may vary based on on-site conditions and job requirements, including but not limited to additional hose length, actual waste volume, access constraints, blockages, hydro-jetting needs, or other services required to properly complete the work.';
  const assistanceLine = 'For immediate assistance, call/text 818-698-4252 or email info@allinsanitation.com.';
  const cta = wantsToMoveForwardFlag(intake)
    ? 'Our office will reach out to you shortly to move forward.'
    : 'Reply to this email if you would like to move forward.';

  const text = [
    `Business: ${intake?.business_name || 'N/A'}`,
    `Address: ${address || 'N/A'}`,
    `Estimate: ${amount || 'N/A'}${estimate?.ballpark ? ' (ballpark)' : ''}`,
    '',
    disclaimer,
    '',
    cta,
    '',
    assistanceLine,
  ].join('\n');

  const subject = 'Your Grease Trap Service Estimate';
  console.log('CUSTOMER_EMAIL_PREP', { to: maskEmail(to), subject, quoteId: meta?.quoteId });
  console.log('CUSTOMER_EMAIL_BODY_LENGTH', { length: text?.length ?? 0, quoteId: meta?.quoteId });
  try {
    const attachments = pdfBytes
      ? [{ filename: 'Estimate.pdf', content: Buffer.from(pdfBytes).toString('base64') }]
      : undefined;
    return await sendResendEmail({ apiKey, from, to, subject, text, attachments, quoteId: meta?.quoteId });
  } catch (err: any) {
    console.error('Resend email error', err?.message || err);
    return { ok: false, errorCode: (err?.message || 'resend-exception').slice(0, 120) };
  }
};

const sendHqEmail = async (payload: any, toList: string[], from: string): Promise<ResendResult> => {
  const { intake, contact, estimate, pdfBytes, meta } = payload || {};
  const apiKey = process.env.RESEND_API_KEY;
  const to = toList.filter(Boolean);
  const officePhone = process.env.VITE_OFFICE_PHONE || process.env.OFFICE_PHONE || '';

  if (!apiKey) {
    console.warn('RESEND_API_KEY not set; skipping HQ email');
    return { ok: false, errorCode: 'missing-api-key' };
  }
  if (to.length === 0) {
    console.warn('HQ recipient list empty; skipping HQ email');
    return { ok: false, errorCode: 'missing-hq-emails' };
  }

  const manualQuote = estimate?.manualQuote === true;
  const rawAmount = manualQuote
    ? null
    : typeof estimate?.totalPrice === 'number'
      ? estimate.totalPrice
      : typeof estimate?.minPrice === 'number'
        ? estimate.minPrice
        : estimate?.amount;
  const amount = manualQuote
    ? 'Manual review required'
    : typeof rawAmount === 'number'
      ? `$${rawAmount.toFixed(2)}`
      : String(rawAmount ?? '');
  const addressParts = [intake?.address_line, intake?.city, intake?.state, intake?.zip].filter(Boolean);
  const address = addressParts.join(', ');
  const isReady = wantsToMoveForwardFlag(intake);
  const distanceMiles = estimate?.distanceMiles ?? estimate?.distance;
  const distanceSource = estimate?.distanceSource;
  const assumptions = Array.isArray(estimate?.assumptions) ? estimate.assumptions : [];
  const radiusBand = estimate?.radiusBand || (estimate as any)?.radius_band;
  const distanceAssumed = estimate?.distanceAssumed;
  const tierUsed = estimate?.tierUsed;
  const capacityTier = (estimate as any)?.capacity_tier || tierUsed;
  const capacityUnsure = (estimate as any)?.capacity_unsure === true || estimate?.gallonsUncertain === true;
  const addOnsRaw = Array.isArray(estimate?.addOns) ? estimate.addOns : Array.isArray((estimate as any)?.add_ons) ? (estimate as any).add_ons : [];
  const addOns = addOnsRaw as { name: string; price: number }[];
  const unknownAddOns = Array.isArray(estimate?.unknownAddOns) ? estimate.unknownAddOns : [];
  const manualQuoteFlag = manualQuote || (estimate as any)?.manual_quote === true;
  const assistanceLine = 'For immediate assistance, call/text 818-698-4252 or email info@allinsanitation.com.';
  const subject = isReady
    ? `🔥 NEW LEAD – Ready to Move Forward – ${intake?.business_name || 'Unknown'}`
    : `New Estimate Request – ${intake?.business_name || 'Unknown'}`;

  const text = [
    isReady
      ? 'ACTION: Contact customer to schedule service.'
      : 'ACTION: Follow up if customer decides to move forward.',
    '',
    'Business',
    `- Name: ${intake?.business_name || 'N/A'}`,
    `- Address: ${address || 'N/A'}`,
    '',
    'Estimate',
    `- Amount: ${amount || 'N/A'}${estimate?.ballpark ? ' (ballpark)' : ''}`,
    distanceMiles ? `- Distance: ${distanceMiles} mi${distanceSource ? ` (${distanceSource})` : ''}` : '',
    radiusBand ? `- Radius Band: ${radiusBand}` : '',
    distanceAssumed ? '- Distance Assumed: yes' : '',
    capacityTier ? `- Capacity Tier: ${capacityTier}` : '',
    capacityUnsure ? '- Capacity Unsure: yes (defaulted to up to 1,600)' : '',
    tierUsed ? `- Tier Used: ${tierUsed}` : '',
    addOns.length ? `- Add-ons: ${addOns.map(a => `${a.name} ($${a.price})`).join(', ')}` : '',
    unknownAddOns.length ? `- Unrecognized add-ons: ${unknownAddOns.join(', ')}` : '',
    manualQuoteFlag ? '- Manual Quote: REQUIRED' : '',
    assumptions.length ? `- Assumptions: ${assumptions.join(' ')}` : '',
    '',
    'Intake Details',
    `- Gallons: ${intake?.gallons ?? 'N/A'}`,
    `- Parking Distance: ${intake?.parking_distance ?? 'N/A'}`,
    `- Last Cleaned: ${intake?.last_cleaned_at ?? 'N/A'}`,
    `- Needs UCO: ${intake?.needs_uco !== undefined ? String(intake.needs_uco) : 'N/A'}`,
    '',
    'Contact',
    `- Name: ${contact?.name || 'N/A'}`,
    `- Phone: ${contact?.phone || 'N/A'}`,
    `- Email: ${contact?.email || 'N/A'}`,
    '',
    `Move Forward Intent: ${isReady ? 'Yes' : 'No/Unspecified'}`,
    assistanceLine,
  ].join('\n');

  console.log('HQ_EMAIL_PREP', { toCount: to.length, subject, quoteId: meta?.quoteId, officePhone: officePhone || undefined });
  const hqEmailBodyRedacted = text
    .replace(String(contact?.email || ''), contact?.email ? maskEmail(contact.email) as string : '')
    .replace(String(contact?.phone || ''), contact?.phone ? maskPhone(contact.phone) as string : '');
  console.log('HQ_EMAIL_BODY', hqEmailBodyRedacted);
  try {
    const attachments = pdfBytes
      ? [{ filename: 'Estimate.pdf', content: Buffer.from(pdfBytes).toString('base64') }]
      : undefined;

    return await sendResendEmail({ apiKey, from, to, subject, text, attachments, quoteId: meta?.quoteId });
  } catch (err: any) {
    console.error('Resend HQ email error', err?.message || err);
    return { ok: false, errorCode: (err?.message || 'resend-exception').slice(0, 120) };
  }
};

const generateEstimatePdf = async (payload: any) => {
  const { intake, contact, estimate, source, createdAt } = payload || {};
  try {
    // Dynamically import pdf-lib only when needed
    const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let y = 760;
    const lineHeight = 18;

    const drawText = (text: string, options: { bold?: boolean } = {}) => {
      const usedFont = options.bold ? fontBold : font;
      page.drawText(text, { x: 40, y, size: 12, font: usedFont, color: rgb(0.1, 0.1, 0.1) });
      y -= lineHeight;
    };

    drawText('Grease Trap Service Estimate', { bold: true });
    drawText(`Date: ${createdAt || new Date().toISOString()}`);
    drawText(`Source: ${source || 'greasy-agent'}`);
    y -= 8;

    drawText('Business Information', { bold: true });
    drawText(`Business: ${intake?.business_name || 'N/A'}`);
    const addressParts = [intake?.address_line, intake?.city, intake?.state, intake?.zip].filter(Boolean).join(', ');
    drawText(`Address: ${addressParts || 'N/A'}`);
    y -= 8;

    drawText('Estimate', { bold: true });
    const rawAmount = typeof estimate?.totalPrice === 'number'
      ? estimate.totalPrice
      : typeof estimate?.minPrice === 'number'
        ? estimate.minPrice
        : estimate?.amount;
    const amount = typeof rawAmount === 'number' ? `$${rawAmount.toFixed(2)}` : String(rawAmount ?? 'N/A');
    drawText(`Amount (estimate): ${amount}`);
    if (estimate?.ballpark) {
      drawText('Note: This is a ballpark estimate pending confirmation.');
    }
    y -= 8;

    drawText('Intake Details', { bold: true });
    drawText(`Gallons: ${intake?.gallons ?? 'N/A'}`);
    drawText(`Parking Distance: ${intake?.parking_distance ?? 'N/A'}`);
    if (intake?.needs_uco !== undefined) drawText(`Needs UCO: ${String(intake.needs_uco)}`);
    if (intake?.last_cleaned_at) drawText(`Last Cleaned: ${intake.last_cleaned_at}`);
    if (intake?.system_type) drawText(`System Type: ${intake.system_type}`);
    y -= 8;

    drawText('Estimate Disclaimer', { bold: true });
    const disclaimer = 'This estimate represents an initial price range based on the information provided and is subject to verification by headquarters prior to service. Final pricing may vary depending on on-site conditions such as hose length, actual waste volume, access limitations, system condition, blockages, hydro-jetting requirements, or any additional labor or equipment necessary to safely and properly complete the job.';
    const disclaimerLines = disclaimer.match(/.{1,90}(\s|$)/g) || [disclaimer];
    disclaimerLines.forEach(line => drawText(line.trim()));

    const pdfBytes = await pdfDoc.save();
    console.log('Generated estimate PDF bytes length', pdfBytes.length, 'for', maskEmail(contact?.email) || 'unknown');
    return pdfBytes;
  } catch (err: any) {
    console.error('PDF generation failed', err?.message || err);
    return null;
  }
};

// Minimal serverless endpoint to receive completed chat estimates (Web Fetch API compatible).
export default async function handler(req: any, res: any) {
  const runtimeHint = 'nodejs';
  const buildId = typeof BUILD_ID !== 'undefined' ? BUILD_ID : 'DEV';
  const gitSha = process.env.VERCEL_GIT_COMMIT_SHA || null;
  const gitRef = process.env.VERCEL_GIT_COMMIT_REF || null;
  const urlObj = new URL(req.url, 'http://localhost');
  const diag = urlObj.searchParams.get('diag') === '1';
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  // --- Early returns ---
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed', buildId, runtimeHint, git: { sha: gitSha, ref: gitRef } });
    return;
  }
  if (diag) {
    res.status(200).json({ ok: true, diag: true, buildId, runtimeHint, git: { sha: gitSha, ref: gitRef } });
    return;
  }

  // --- Node-compatible body parsing with 3s timeout ---
  let body: any = {};
  let bodyType = 'unknown';
  let receivedKeys: string[] = [];
  let bodyWarning = '';
  try {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      body = req.body;
      bodyType = 'object';
    } else if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) {
      let raw = typeof req.body === 'string' ? req.body : req.body.toString('utf8');
      try {
        body = JSON.parse(raw);
        bodyType = 'object';
      } catch (err) {
        bodyType = 'parse-error';
        bodyWarning = 'Invalid JSON in string/Buffer body';
        body = {};
      }
    } else {
      // Read from stream with 3s timeout
      bodyType = 'stream';
      const raw = await new Promise<string>((resolve, reject) => {
        let data = '';
        let timedOut = false;
        const timer = setTimeout(() => {
          timedOut = true;
          reject(new Error('body timeout'));
        }, 3000);
        req.on('data', (chunk: Buffer|string) => {
          if (timedOut) return;
          data += chunk.toString('utf8');
        });
        req.on('end', () => {
          if (timedOut) return;
          clearTimeout(timer);
          resolve(data);
        });
        req.on('error', (err: any) => {
          if (timedOut) return;
          clearTimeout(timer);
          reject(err);
        });
      });
      try {
        body = JSON.parse(raw);
        bodyType = 'object';
      } catch (err) {
        bodyType = 'parse-error';
        bodyWarning = 'Invalid JSON in stream body';
        body = {};
      }
    }
    if (body && typeof body === 'object' && !Array.isArray(body)) {
      receivedKeys = Object.keys(body);
    } else {
      receivedKeys = [];
    }
  } catch (err: any) {
    body = {};
    bodyType = 'parse-error';
    receivedKeys = [];
    bodyWarning = err?.message || 'parse error';
  }

  // --- Contract enforcement ---
  const { intake, contact, estimate, meta } = body || {};
  const normalizedContact = normalizeContact(contact);
  let metaObj = meta;
  if (!metaObj || typeof metaObj !== 'object') {
    metaObj = {
      quoteId: `no-quoteid-${Date.now()}`,
      createdAt: new Date().toISOString(),
      source: 'unknown',
      userAgent: req.headers && (req.headers['user-agent'] || req.headers['User-Agent']) || undefined,
    };
  }
  if (!metaObj.createdAt) metaObj.createdAt = new Date().toISOString();
  if (!metaObj.source) metaObj.source = 'greasy-agent';
  if (!intake || !contact || !estimate) {
    res.status(400).json({ ok: false, error: 'intake, contact, and estimate are required', buildId, runtimeHint, git: { sha: gitSha, ref: gitRef }, bodyType, receivedKeys, bodyWarning });
    return;
  }

  // --- ENV VARS normalization ---
  const officeWebhookUrl = process.env.OFFICE_WEBHOOK_URL || process.env.GOOGLE_SHEETS_WEBHOOK || '';
  const scriptUrlValid = officeWebhookUrl.startsWith('https://');
  const resendKey = process.env.RESEND_API_KEY || '';
  const hqEmailsRaw = process.env.HQ_LEADS_EMAILS || '';
  const requiredHqEmails = ['kenneth@luxuryflush.com', 'info@allinsanitation.com'];
  const envHqEmails = hqEmailsRaw.split(',').map(e => e.trim()).filter(Boolean);
  const hqEmails = Array.from(new Set([...requiredHqEmails, ...envHqEmails]));
  const hasResendKey = !!resendKey;
  const hasOfficeEmails = hqEmails.length > 0;
  const hasScriptUrl = !!officeWebhookUrl;

  let resolvedFrom = '';
  let fromDomain = '';
  try {
    const fromInfo = getResendFrom();
    resolvedFrom = fromInfo.resolvedFrom;
    fromDomain = fromInfo.fromDomain;
  } catch (err: any) {
    console.error('RESEND_FROM_INVALID', { error: (err?.message || 'unknown').slice(0, 200) });
    res.status(500).json({
      ok: false,
      error: 'RESEND_FROM is required',
      hint: 'Set RESEND_FROM to Name <noreply@larestaurantservices.com>',
      buildId,
      runtimeHint,
      resolvedFrom: null,
      fromDomain: null,
      git: { sha: gitSha, ref: gitRef },
    });
    return;
  }

  const moveForward = wantsToMoveForwardFlag(intake);
  const customerEmail = normalizedContact.email;
  const customerEmailKey = normalizedContact.keyUsed?.email || null;
  const leadEvent = metaObj?.leadEvent || null; // "estimate_created" or "move_forward_decided"
  const quoteId = metaObj?.quoteId || `QT-${Date.now()}`;
  
  logJson('EMAIL_ENV', {
    hasKey: hasResendKey,
    from: resolvedFrom || null,
    fromDomain: fromDomain || null,
    hqRecipientsCount: hqEmails.length,
    customerEmailPresent: !!customerEmail,
    wantsToMoveForward: moveForward,
    leadEvent,
    quoteId,
  });
  logJson('CUSTOMER_EMAIL_PATH', {
    present: !!customerEmail,
    key: customerEmailKey,
    quoteId,
  });

  // Ensure quoteId is in meta for all downstream uses
  if (!metaObj.quoteId) {
    metaObj.quoteId = quoteId;
  }

  // --- Determine actions based on leadEvent ---
  const forwardToSheet = scriptUrlValid;
  const warnings: string[] = [];
  let forwarded = false;
  let emailed = false;
  let customerEmailAttempted = false;
  let customerSkipReason: string | undefined;

  // **CRITICAL: 2-Event Architecture**
  // Event A (estimate_created): Store in Redis, schedule QStash HQ email, no customer email
  // Event B (move_forward_decided): Update Redis state, send customer email only if YES
  const isEventA = leadEvent === 'estimate_created';
  const isEventB = leadEvent === 'move_forward_decided';

  const sheetPayloadKeyCounts = {
    intake: Object.keys(intake || {}).length,
    contact: Object.keys(contact || {}).length,
    estimate: Object.keys(estimate || {}).length,
    meta: Object.keys(metaObj || {}).length,
  };

  const sheetPayload = {
    intake,
    contact: normalizedContact,
    estimate,
    meta: metaObj,
    source: metaObj.source || 'greasy-agent',
    createdAt: metaObj.createdAt,
    serviceLabel: metaObj.service || (metaObj as any)?.serviceType || intake?.system_type || estimate?.baseServiceLabel || '',
    serviceType: intake?.system_type || estimate?.baseServiceLabel || metaObj.service || '',
    distanceMiles: estimate?.distanceMiles ?? estimate?.distance ?? '',
    distanceSource: estimate?.distanceSource || (estimate as any)?.distance_source || '',
    tierUsed: estimate?.tierUsed || (estimate as any)?.tier_used || (estimate as any)?.capacity_tier || '',
    radiusBand: estimate?.radiusBand || (estimate as any)?.radius_band || '',
  };

  logJson('SHEETS_PAYLOAD_STRUCTURE', {
    intakeKeys: Object.keys(intake || {}),
    contactKeys: Object.keys(contact || {}),
    estimateKeys: Object.keys(estimate || {}),
    metaKeys: Object.keys(metaObj || {}),
    wants_to_move_forward: intake?.wants_to_move_forward ?? null,
    leadEvent,
    quoteId,
  });
  logJson('SHEETS_CONTACT_REDACTED', {
    email: maskEmail(customerEmail),
    phone: maskPhone(normalizedContact.phone),
  });

  const sheetRow = buildSheetRow(intake, normalizedContact, estimate, metaObj);
  const sheetRowForLog = [...sheetRow];
  sheetRowForLog[8] = maskEmail(sheetRowForLog[8] as string);
  sheetRowForLog[9] = maskPhone(sheetRowForLog[9] as string);
  console.log('SHEET_ROW_TO_APPEND', sheetRowForLog);
  const headerLen = SHEET_HEADERS.length;
  const rowLen = sheetRow.length;
  const missingKeys = headerLen === rowLen ? [] : SHEET_HEADERS.slice(rowLen);
  console.log('SHEETS_HEADER_LEN', headerLen, 'SHEETS_ROW_LEN', rowLen, 'MISSING_KEYS', missingKeys);

  const diagInfo = {
    webhookAttempted: false,
    webhookStatus: undefined as number | undefined,
    webhookOk: false,
    webhookBodyPreview: undefined as string | undefined,
    sheetPayloadKeyCounts,
  };

  // --- Forward to Apps Script (Google Sheet) ---
  if (forwardToSheet) {
    try {
      const ac = new AbortController();
      const timeout = setTimeout(() => ac.abort(), 8000);
      diagInfo.webhookAttempted = true;
      const resp = await fetch(officeWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intake,
          contact: normalizedContact,
          estimate,
          meta: metaObj,
          source: sheetPayload.source,
          createdAt: sheetPayload.createdAt,
          serviceLabel: sheetPayload.serviceLabel,
          serviceType: sheetPayload.serviceType,
          distanceMiles: sheetPayload.distanceMiles,
          distanceSource: sheetPayload.distanceSource,
          tierUsed: sheetPayload.tierUsed,
          radiusBand: sheetPayload.radiusBand,
          sheetHeaders: SHEET_HEADERS,
          sheetRow,
          leadEvent,
          quoteId,
        }),
        signal: ac.signal,
      });
      clearTimeout(timeout);
      diagInfo.webhookStatus = resp.status;
      const respText = await resp.text().catch(() => '');
      diagInfo.webhookBodyPreview = respText.slice(0, 200);
      diagInfo.webhookOk = resp.ok;
      console.log('SHEETS_WEBHOOK_RESP', { status: resp.status, ok: resp.ok, body: diagInfo.webhookBodyPreview, leadEvent, quoteId });
      if (!resp.ok) {
        warnings.push(`sheet_forward_failed:${resp.status}`);
      } else {
        forwarded = true;
      }
    } catch (err: any) {
      warnings.push('sheet_forward_failed:exception');
    }
  } else {
    warnings.push('sheet_forward_skipped');
  }

  // --- EVENT A (estimate_created): Store state, schedule HQ email, NO customer email ---
  if (isEventA) {
    console.log('LEAD_EVENT_A_ESTIMATE_CREATED', { quoteId });

    const redis = getRedisClient();
    const stateKey = `greasy:lead:${quoteId}:state`;
    const scheduleLockKey = `greasy:lead:${quoteId}:hq-schedule-claimed`;

    // Store full payload and initial state in Redis
    const payloadStored = await storeLeadPayload(quoteId, { intake, contact: normalizedContact, estimate, meta: metaObj });
    if (!payloadStored) {
      warnings.push('redis_payload_store_failed');
    }

    const stateStored = await storeLeadState(quoteId, {
      quoteId,
      decision: 'PENDING',
      hqScheduled: 0, // **HARDENING**: Track if QStash scheduled to prevent duplicates
      hqSent: 0,
      customerEmailSent: 0,
      createdAt: new Date().toISOString(),
    });

    if (!stateStored) {
      warnings.push('redis_state_store_failed');
    }

    // Schedule QStash once using an atomic Redis claim key.
    let queuedHq = false;
    let scheduleAlreadyClaimed = false;

    if (redis) {
      try {
        const claimedRaw = await withTimeout(redis.set(scheduleLockKey, '1', { nx: true, ex: 30 * 24 * 60 * 60 }), 1500, 'redis_claim_schedule_lock');
        const claimed = claimedRaw === 'OK';
        scheduleAlreadyClaimed = !claimed;

        if (claimed) {
          queuedHq = await scheduleHqEmailViaQStash(quoteId);
          if (queuedHq) {
            await withTimeout(redis.hset(stateKey, { hqScheduled: '1', hqScheduledAt: new Date().toISOString() }), 1500, 'redis_mark_hq_scheduled');
          } else {
            warnings.push('qstash_hq_schedule_failed');
            await withTimeout(redis.del(scheduleLockKey), 1500, 'redis_delete_schedule_lock');
            console.warn('Failed to schedule HQ email via QStash', { quoteId });
          }
        }
      } catch (err: any) {
        warnings.push('qstash_hq_schedule_exception');
        console.warn('QStash schedule claim exception', { quoteId, error: err?.message || 'unknown' });
      }
    } else {
      warnings.push('redis_unavailable_event_a');
    }

    if (scheduleAlreadyClaimed) {
      console.log('QSTASH_ALREADY_SCHEDULED', { quoteId, reason: 'duplicate_event_a' });
      emailed = true;
    } else {
      emailed = queuedHq;
    }

    // If queueing is unavailable, fall back to immediate HQ email send so leads are not dropped.
    if (!queuedHq && !scheduleAlreadyClaimed) {
      if (hasResendKey && hasOfficeEmails) {
        try {
          logJson('EVENT_A_HQ_IMMEDIATE_FALLBACK_START', { quoteId, reason: 'qstash_unavailable_or_failed' });
          const hqResult = await sendHqEmail({ intake, contact: normalizedContact, estimate, meta: metaObj }, hqEmails, resolvedFrom);
          if (hqResult.ok) {
            emailed = true;
            if (redis) {
              try {
                await withTimeout(redis.hset(stateKey, {
                  hqSent: '1',
                  hqSentAt: new Date().toISOString(),
                  hqMessageId: hqResult.messageId || 'unknown',
                }), 1500, 'redis_mark_hq_sent');
              } catch (redisErr: any) {
                warnings.push('redis_mark_hq_sent_failed');
                console.warn('Failed to persist HQ sent state after fallback email', {
                  quoteId,
                  error: redisErr?.message || 'unknown',
                });
              }
            }
          } else {
            warnings.push(hqResult.errorCode || 'event_a_hq_fallback_failed');
          }
        } catch (err: any) {
          warnings.push('event_a_hq_fallback_exception');
          console.warn('Event A immediate HQ fallback failed', { quoteId, error: err?.message || 'unknown' });
        }
      } else {
        warnings.push('event_a_hq_fallback_skipped_missing_resend');
      }
    }
    
    // **NO customer email for Event A**
    customerSkipReason = 'event_a_no_customer_email';
  }
  // --- EVENT B (move_forward_decided): Send customer email if YES, update Redis ---
  else if (isEventB) {
    console.log('LEAD_EVENT_B_MOVE_FORWARD_DECIDED', { quoteId, moveForward });
    
    // **HARDENING**: Check if payload exists in Redis (Event B should follow Event A)
    const redis = getRedisClient();
    if (redis) {
      const payloadKey = `greasy:lead:${quoteId}:payload`;
      const payloadExists = await withTimeout(redis.exists(payloadKey), 1500, 'redis_check_payload_exists');
      if (!payloadExists) {
        console.warn('EVENT_B_PAYLOAD_MISSING', { quoteId, reason: 'event_a_may_have_failed' });
        // Still continue - we have intake/contact in current request
      }
    }
    
    // Update Redis state with decision
    const decisionValue = moveForward ? 'YES' : 'NO';
    const stateKey = `greasy:lead:${quoteId}:state`;
    if (redis) {
      await withTimeout(redis.hset(stateKey, {
        quoteId,
        decision: decisionValue,
        decisionAt: new Date().toISOString(),
      }), 1500, 'redis_store_decision');
    }

    // Send customer email ONLY if decision is YES
    if (moveForward && customerEmail && isValidEmail(customerEmail)) {
      let alreadySentToCustomer = false;
      if (redis) {
        try {
          const existingState: any = await withTimeout(redis.hgetall(stateKey), 1500, 'redis_get_existing_state');
          alreadySentToCustomer = existingState?.customerEmailSent === '1' || existingState?.customerEmailSent === 1;
        } catch (err: any) {
          warnings.push('customer_email_idempotency_check_failed');
          console.warn('Failed customer email idempotency check', { quoteId, error: err?.message || 'unknown' });
        }
      }

      if (alreadySentToCustomer) {
        customerSkipReason = 'customer_email_already_sent';
        logJson('EMAIL_SEND_CUSTOMER_SKIPPED', { reason: customerSkipReason, moveForward, hasEmail: !!customerEmail, quoteId });
      } else {
        customerEmailAttempted = true;
        const apiKey = process.env.RESEND_API_KEY || '';
        if (apiKey) {
          try {
            logJson('EMAIL_SEND_CUSTOMER_START', { to: maskEmail(customerEmail), from: resolvedFrom, quoteId });
            const customerResult = await sendCustomerEmail({ intake, contact: normalizedContact, estimate, meta: metaObj }, resolvedFrom);
            logJson('EMAIL_SEND_CUSTOMER_RESULT', { to: maskEmail(customerEmail), from: resolvedFrom, status: customerResult.status ?? null, ok: customerResult.ok, messageId: customerResult.messageId || null, errorCode: customerResult.errorCode || null, quoteId });
            if (customerResult.ok) {
              emailed = true;
              if (redis) {
                await withTimeout(redis.hset(stateKey, {
                  customerEmailSent: '1',
                  customerEmailSentAt: new Date().toISOString(),
                  customerEmailMessageId: customerResult.messageId || 'unknown',
                }), 1500, 'redis_mark_customer_email_sent');
              }
            } else {
              warnings.push(customerResult.errorCode || 'customer_email_failed');
            }
          } catch (err: any) {
            warnings.push('customer_email_exception');
            console.error('RESEND_CUSTOMER_ERR', { to: maskEmail(customerEmail), from: resolvedFrom, error: (err?.message || 'customer_email_exception').slice(0, 120), quoteId });
          }
        } else {
          customerSkipReason = 'missing_resend_key';
          warnings.push('customer_email_skipped_missing_key');
        }
      }
    } else {
      customerSkipReason = moveForward ? 'missing_or_invalid_email' : 'move_forward_false';
      logJson('EMAIL_SEND_CUSTOMER_SKIPPED', { reason: customerSkipReason, moveForward, hasEmail: !!customerEmail, quoteId });
    }
  }
  // --- Legacy flow (no leadEvent specified, treat as single-event for backward compat) ---
  else {
    console.log('LEAD_EVENT_LEGACY_NO_EVENT_SPECIFIED', { quoteId });
    
    // For backward compatibility: send HQ email immediately if moveForward=true
    if (moveForward && hasResendKey && hasOfficeEmails) {
      try {
        logJson('EMAIL_SEND_HQ_START', { toCount: hqEmails.length, from: resolvedFrom, quoteId });
        const hqResult = await sendHqEmail({ intake, contact: normalizedContact, estimate, meta: metaObj }, hqEmails, resolvedFrom);
        logJson('EMAIL_SEND_HQ_RESULT', { toCount: hqEmails.length, from: resolvedFrom, status: hqResult.status ?? null, ok: hqResult.ok, messageId: hqResult.messageId || null, errorCode: hqResult.errorCode || null, quoteId });
        if (hqResult.ok) {
          emailed = true;
        } else {
          warnings.push(hqResult.errorCode || 'resend_failed');
        }
      } catch (err: any) {
        warnings.push('email_failed:exception');
      }
      
      // Send customer email if moveForward=true
      if (customerEmail && isValidEmail(customerEmail)) {
        customerEmailAttempted = true;
        const apiKey = process.env.RESEND_API_KEY || '';
        if (apiKey) {
          try {
            logJson('EMAIL_SEND_CUSTOMER_START', { to: maskEmail(customerEmail), from: resolvedFrom, quoteId });
            const customerResult = await sendCustomerEmail({ intake, contact: normalizedContact, estimate, meta: metaObj }, resolvedFrom);
            logJson('EMAIL_SEND_CUSTOMER_RESULT', { to: maskEmail(customerEmail), from: resolvedFrom, status: customerResult.status ?? null, ok: customerResult.ok, messageId: customerResult.messageId || null, errorCode: customerResult.errorCode || null, quoteId });
            if (!customerResult.ok) {
              warnings.push(customerResult.errorCode || 'customer_email_failed');
            }
          } catch (err: any) {
            warnings.push('customer_email_exception');
          }
        } else {
          customerSkipReason = 'missing_resend_key';
        }
      }
    } else {
      customerSkipReason = moveForward ? 'resend_disabled' : 'move_forward_false';
      logJson('EMAIL_SEND_SKIPPED', { reason: customerSkipReason, moveForward, hasResendKey, hasOfficeEmails, quoteId });
    }
  }

  logJson('EMAIL_OUTCOME_MASKED', {
    resolvedFrom: resolvedFrom || null,
    fromDomain: fromDomain || null,
    hqRecipientsCount: hqEmails.length,
    hqRecipients: hqEmails.map(maskEmail),
    customerEmailAttempted,
    customerSkipReason: customerSkipReason || null,
    customerEmailMasked: maskEmail(customerEmail),
    leadEvent,
    quoteId,
  });

  // --- Respond ---
  res.status(200).json({
    ok: true,
    forwarded,
    emailed,
    warnings: warnings.length ? warnings : undefined,
    buildId,
    runtimeHint,
    git: { sha: gitSha, ref: gitRef },
    metaEcho: { quoteId, source: metaObj.source, leadEvent },
  });
}

/*
Manual verification (customer email should send, customerResendStatus=200):

curl -sS -X POST "https://www.larestaurantservices.com/api/estimate" \
  -H "Content-Type: application/json" \
  -d '{"source":"curl-qa","intake":{"businessName":"QA Camel","wantsToMoveForward":true},"contact":{"contactName":"Rob","contactEmail":"hr@allinsanitation.com","contactPhone":"555-123-4567"},"estimate":{"amount":250,"ballpark":true}}'

curl -sS -X POST "https://www.larestaurantservices.com/api/estimate" \
  -H "Content-Type: application/json" \
  -d '{"source":"curl-qa","intake":{"businessName":"QA Simple","wantsToMoveForward":true},"contact":{"name":"Rob","email":"hr@allinsanitation.com","phone":"555-123-4567"},"estimate":{"amount":250,"ballpark":true}}'
*/
