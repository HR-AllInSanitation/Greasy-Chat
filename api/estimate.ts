
// Minimal buildId: hardcoded short string (update as needed)
const BUILD_ID = 'DEV20260119';

// pdf-lib is imported dynamically only when needed

type ResendResult = { ok: boolean; status?: number; messageId?: string; errorCode?: string };

const logJson = (event: string, data: Record<string, unknown>) => {
  try {
    console.log(JSON.stringify({ event, ...data }));
  } catch (err) {
    console.log(event, data, err);
  }
};

const sendResendEmail = async (params: { apiKey: string; from: string; to: string | string[]; subject: string; text: string; attachments?: any[]; quoteId?: string }): Promise<ResendResult> => {
  const { apiKey, from, to, subject, text, attachments, quoteId } = params;
  const toList = Array.isArray(to) ? to.filter(Boolean) : [to];
  if (!apiKey || !from || toList.length === 0) {
    console.warn('RESEND_SEND_SKIPPED', { reason: 'missing-config', quoteId, toCount: toList.length });
    return { ok: false, errorCode: 'missing-config' };
  }

  console.log('Sending email to Resend...', { to: toList, subject, quoteId });
  console.log('Email body:', text);
  console.log('RESEND_SEND_START', { to: toList, subject, quoteId });
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to: toList, subject, text, attachments }),
    });

    const status = resp.status;
    let messageId: string | undefined;
    if (resp.ok) {
      try {
        const json = await resp.json();
        messageId = json?.id || json?.data?.id;
      } catch {
        messageId = undefined;
      }
      console.log('RESEND_SEND_OK', { to: toList, subject, status, messageId, quoteId });
      return { ok: true, status, messageId };
    }

    const errorText = await resp.text().catch(() => '');
    const errorCode = errorText ? errorText.slice(0, 200) : `status-${status}`;
    console.error('RESEND_SEND_ERROR', { to: toList, subject, status, error: errorCode, quoteId });
    return { ok: false, status, errorCode };
  } catch (err: any) {
    const errorCode = (err?.message || 'resend-exception').slice(0, 120);
    console.error('RESEND_SEND_ERROR', { to: toList, subject, error: errorCode, quoteId });
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
  const contactName = contact?.name || contact?.contact_name || '';
  const contactEmail = contact?.email || contact?.contact_email || '';
  const contactPhone = contact?.phone || contact?.contact_phone || '';
  const needsUco = intake?.needs_uco === true ? 'TRUE' : intake?.needs_uco === false ? 'FALSE' : '';
  const wantsMoveForward = intake?.wants_to_move_forward ?? '';

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

const maskPhone = (value?: string) => {
  if (typeof value !== 'string') return value;
  if (value.length <= 4) return `${value[0] || ''}***`;
  return `${value.slice(0, 2)}***${value.slice(-2)}`;
};

const sendCustomerEmail = async (payload: any): Promise<ResendResult> => {
  const { intake, contact, estimate, pdfBytes, meta } = payload || {};
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'estimates@greasy-chat.com';
  const to = contact?.email || contact?.contact_email;

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
  const cta = intake?.wants_to_move_forward === true
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
  ].join('\n');

  const subject = 'Your Grease Trap Service Estimate';
  console.log('CUSTOMER_EMAIL_PREP', { to, subject, quoteId: meta?.quoteId });
  console.log('CUSTOMER_EMAIL_BODY', text);
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

const sendHqEmail = async (payload: any, toList: string[]): Promise<ResendResult> => {
  const { intake, contact, estimate, pdfBytes, meta } = payload || {};
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'estimates@greasy-chat.com';
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
  const isReady = intake?.wants_to_move_forward === true;
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
    `- Name: ${contact?.name || contact?.contact_name || 'N/A'}`,
    `- Phone: ${contact?.phone || contact?.contact_phone || 'N/A'}`,
    `- Email: ${contact?.email || contact?.contact_email || 'N/A'}`,
    '',
    `Move Forward Intent: ${isReady ? 'Yes' : 'No/Unspecified'}`,
    officePhone ? `Urgent? Call or text ${officePhone} for immediate assistance.` : '',
  ].join('\n');

  console.log('HQ_EMAIL_PREP', { to, subject, quoteId: meta?.quoteId, officePhone: officePhone || undefined });
  console.log('HQ_EMAIL_BODY', text);
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
    console.log('Generated estimate PDF bytes length', pdfBytes.length, 'for', contact?.email || 'unknown');
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
  const urlObj = new URL(req.url, 'http://localhost');
  const diag = urlObj.searchParams.get('diag') === '1';
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  // --- Early returns ---
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed', buildId, runtimeHint });
    return;
  }
  if (diag) {
    res.status(200).json({ ok: true, diag: true, buildId, runtimeHint });
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
    res.status(400).json({ ok: false, error: 'intake, contact, and estimate are required', buildId, runtimeHint, bodyType, receivedKeys, bodyWarning });
    return;
  }

  // --- ENV VARS normalization ---
  const officeWebhookUrl = process.env.OFFICE_WEBHOOK_URL || '';
  const scriptUrlValid = officeWebhookUrl.startsWith('https://');
  const resendKey = process.env.RESEND_API_KEY || '';
  const hqEmailsRaw = process.env.HQ_LEADS_EMAILS || '';
  const requiredHqEmails = ['kenneth@luxuryflush.com', 'info@allinsanitation.com'];
  const envHqEmails = hqEmailsRaw.split(',').map(e => e.trim()).filter(Boolean);
  const hqEmails = Array.from(new Set([...requiredHqEmails, ...envHqEmails]));
  const fromAddress = process.env.RESEND_FROM || process.env.RESEND_FROM_EMAIL || '';
  const hasResendKey = !!resendKey;
  const hasOfficeEmails = hqEmails.length > 0;
  const hasScriptUrl = !!officeWebhookUrl;

  const moveForward = intake?.wants_to_move_forward === true;
  const customerEmail = contact?.email || contact?.contact_email;
  const resolvedFrom = fromAddress || process.env.RESEND_FROM_EMAIL || 'estimates@greasy-chat.com';
  logJson('EMAIL_ENV', {
    hasKey: hasResendKey,
    from: resolvedFrom || null,
    hqRecipientsCount: hqEmails.length,
    customerEmailPresent: !!customerEmail,
    wantsToMoveForward: moveForward,
  });

  // --- Determine actions ---
  const forwardToSheet = scriptUrlValid;
  const emailOffice = hasResendKey && hasOfficeEmails && !!fromAddress;
  const warnings: string[] = [];
  let forwarded = false;
  let emailed = false;

  const sheetPayloadKeyCounts = {
    intake: Object.keys(intake || {}).length,
    contact: Object.keys(contact || {}).length,
    estimate: Object.keys(estimate || {}).length,
    meta: Object.keys(metaObj || {}).length,
  };

  const sheetPayload = {
    intake,
    contact,
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
  });
  logJson('SHEETS_CONTACT_REDACTED', {
    email: maskEmail(customerEmail),
    phone: maskPhone(contact?.phone || contact?.contact_phone),
  });

  const sheetRow = buildSheetRow(intake, contact, estimate, metaObj);
  console.log('SHEET_ROW_TO_APPEND', sheetRow);
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
          contact,
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
        }),
        signal: ac.signal,
      });
      clearTimeout(timeout);
      diagInfo.webhookStatus = resp.status;
      const respText = await resp.text().catch(() => '');
      diagInfo.webhookBodyPreview = respText.slice(0, 200);
      diagInfo.webhookOk = resp.ok;
      console.log('SHEETS_WEBHOOK_RESP', { status: resp.status, ok: resp.ok, body: diagInfo.webhookBodyPreview });
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

  // --- Email HQ + Customer via Resend ---
  let emailDiag = {
    attempted: false,
    enabled: emailOffice,
    recipientsCount: hqEmails.length,
    ok: false,
    resendStatus: undefined as number | undefined,
    resendErrorCode: undefined as string | undefined,
    error: undefined as string | undefined,
    customer: undefined as ResendResult | undefined,
  };

  if (emailOffice && !diag) {
    emailDiag.attempted = true;
    try {
      logJson('EMAIL_SEND_HQ_START', { to: hqEmails, from: resolvedFrom, quoteId: metaObj.quoteId });
      const hqResult = await sendHqEmail({ intake, contact, estimate, meta: metaObj }, hqEmails);
      emailDiag.ok = hqResult.ok;
      emailDiag.resendStatus = hqResult.status;
      emailDiag.resendErrorCode = hqResult.errorCode;
      logJson('EMAIL_SEND_HQ_RESULT', { to: hqEmails, from: resolvedFrom, status: hqResult.status ?? null, ok: hqResult.ok, messageId: hqResult.messageId || null, errorCode: hqResult.errorCode || null, quoteId: metaObj.quoteId });
      if (!hqResult.ok) {
        warnings.push(hqResult.errorCode || 'resend_failed');
        console.error('RESEND_HQ_ERR', { to: hqEmails, from: resolvedFrom, status: hqResult.status, errorCode: hqResult.errorCode, quoteId: metaObj.quoteId });
      } else {
        emailed = true;
      }
    } catch (err: any) {
      emailDiag.error = (err?.message || 'email_failed:exception').slice(0, 120);
      warnings.push('email_failed:exception');
      console.error('RESEND_HQ_ERR', { to: hqEmails, from: resolvedFrom, error: emailDiag.error, quoteId: metaObj.quoteId });
    }

    if (moveForward) {
      const customerEmail = contact?.email || contact?.contact_email;
      if (!customerEmail) {
        warnings.push('customer_email_skipped_missing_contact');
        logJson('EMAIL_SEND_CUSTOMER_SKIPPED', { reason: 'missing_email', quoteId: metaObj.quoteId });
      } else {
        try {
          logJson('EMAIL_SEND_CUSTOMER_START', { to: customerEmail, from: resolvedFrom, quoteId: metaObj.quoteId });
          const customerResult = await sendCustomerEmail({ intake, contact, estimate, meta: metaObj });
          emailDiag.customer = customerResult;
          logJson('EMAIL_SEND_CUSTOMER_RESULT', { to: customerEmail, from: resolvedFrom, status: customerResult.status ?? null, ok: customerResult.ok, messageId: customerResult.messageId || null, errorCode: customerResult.errorCode || null, quoteId: metaObj.quoteId });
          if (!customerResult.ok) {
            warnings.push(customerResult.errorCode || 'customer_email_failed');
            console.error('RESEND_CUSTOMER_ERR', { to: customerEmail, from: resolvedFrom, errorCode: customerResult.errorCode, quoteId: metaObj.quoteId });
          }
        } catch (err: any) {
          warnings.push('customer_email_exception');
          console.error('RESEND_CUSTOMER_ERR', { to: customerEmail, from: resolvedFrom, error: (err?.message || 'customer_email_exception').slice(0, 120), quoteId: metaObj.quoteId });
        }
      }
    } else {
      warnings.push('customer_email_skipped_move_forward_false');
      logJson('EMAIL_SEND_CUSTOMER_SKIPPED', { reason: 'move_forward_false', quoteId: metaObj.quoteId });
    }
  } else {
    if (!hasResendKey) warnings.push('missing_resend_key');
    if (!hasOfficeEmails) warnings.push('missing_hq_emails');
    if (!fromAddress) warnings.push('missing_resend_from');
    warnings.push('email_skipped');
    console.warn('RESEND_HQ_ERR', { reason: 'config', hasResendKey, hasOfficeEmails, fromAddress });
  }

  // --- Respond ---
  res.status(200).json({
    ok: true,
    forwarded,
    emailed,
    email: emailDiag,
    diag: diagInfo,
    warnings: warnings.length ? warnings : undefined,
    buildId,
    runtimeHint,
    metaEcho: { quoteId: metaObj.quoteId, source: metaObj.source },
  });
}
