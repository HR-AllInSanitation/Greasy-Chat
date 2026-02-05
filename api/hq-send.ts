/**
 * /api/hq-send.ts
 * 
 * QStash webhook receiver for delayed HQ email delivery.
 * Verifies QStash signature, loads state from Redis, and sends HQ email.
 */

import { Redis } from '@upstash/redis';
import { Receiver } from '@upstash/qstash';

export const config = { runtime: 'nodejs' };

// Redis helper
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

const sendResendEmail = async (params: {
  apiKey: string;
  from: string;
  to: string | string[];
  subject: string;
  text: string;
  quoteId?: string;
}): Promise<{ ok: boolean; status?: number; messageId?: string; errorCode?: string }> => {
  const { apiKey, from, to, subject, text, quoteId } = params;
  const toList = Array.isArray(to) ? to.filter(Boolean) : [to];

  if (!apiKey || !from || toList.length === 0) {
    console.warn('RESEND_SEND_SKIPPED', { reason: 'missing-config', quoteId, toCount: toList.length });
    return { ok: false, errorCode: 'missing-config' };
  }

  const toCount = toList.length;
  console.log('Sending HQ email via Resend...', { toCount, subject, quoteId, bodyLength: text?.length ?? 0 });
  console.log('RESEND_SEND_START', { toCount, subject, quoteId });

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to: toList, subject, text }),
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
      console.log('RESEND_SEND_OK', { toCount, subject, status, messageId, quoteId });
      return { ok: true, status, messageId };
    }

    const errorText = await resp.text().catch(() => '');
    const errorCode = errorText ? errorText.slice(0, 200) : `status-${status}`;
    console.error('RESEND_SEND_ERROR', { toCount, subject, status, error: errorCode, quoteId });
    return { ok: false, status, errorCode };
  } catch (err: any) {
    const errorCode = (err?.message || 'resend-exception').slice(0, 120);
    console.error('RESEND_SEND_ERROR', { toCount, subject, error: errorCode, quoteId });
    return { ok: false, errorCode };
  }
};

const logJson = (event: string, data: Record<string, unknown>) => {
  try {
    console.log(JSON.stringify({ event, ...data }));
  } catch (err) {
    console.log(event, data, err);
  }
};

export default async function handler(req: any, res: any) {
  const buildId = 'DEV20260119';
  const gitSha = process.env.VERCEL_GIT_COMMIT_SHA || null;
  const gitRef = process.env.VERCEL_GIT_COMMIT_REF || null;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  // Only POST allowed
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed', buildId });
    return;
  }

  // Verify QStash signature
  const qstashToken = process.env.QSTASH_CURRENT_SIGNING_KEY || process.env.QSTASH_TOKEN;
  if (!qstashToken) {
    console.warn('QSTASH_CURRENT_SIGNING_KEY or QSTASH_TOKEN not set');
    res.status(500).json({ ok: false, error: 'QSTASH signing key not configured', buildId });
    return;
  }

  const receiver = new Receiver({ currentSigningKey: qstashToken });
  let body: any = {};

  try {
    // Parse and verify the request body
    const isValid = await receiver.verify({
      signature: (req.headers['upstash-signature'] || '').toString(),
      body: req.body instanceof Buffer ? req.body : JSON.stringify(req.body),
    });

    if (!isValid) {
      console.error('QStash signature verification failed');
      res.status(401).json({ ok: false, error: 'Unauthorized', buildId });
      return;
    }

    // Parse body
    if (req.body instanceof Buffer) {
      body = JSON.parse(req.body.toString('utf8'));
    } else if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else if (typeof req.body === 'object') {
      body = req.body;
    }
  } catch (err: any) {
    console.error('Request verification or parsing failed:', err?.message);
    res.status(400).json({ ok: false, error: 'Bad request', buildId });
    return;
  }

  const { quoteId } = body || {};

  if (!quoteId) {
    console.error('Missing quoteId in request body');
    res.status(400).json({ ok: false, error: 'quoteId required', buildId });
    return;
  }

  console.log('QSTASH_HQ_SEND_START', { quoteId });

  // Load from Redis
  const redis = getRedisClient();
  if (!redis) {
    console.error('Redis unavailable');
    res.status(500).json({ ok: false, error: 'Redis unavailable', buildId });
    return;
  }

  try {
    // Load state
    const stateKey = `greasy:lead:${quoteId}:state`;
    const state: any = await redis.hgetall(stateKey);

    if (!state || Object.keys(state).length === 0) {
      console.error('Lead state not found in Redis', { quoteId, stateKey });
      res.status(404).json({ ok: false, error: 'Lead state not found', buildId });
      return;
    }

    // Check if already sent (idempotent)
    if (state.hqSent === '1' || state.hqSent === 1) {
      console.log('QSTASH_HQ_SEND_IDEMPOTENT', { quoteId, reason: 'already_sent' });
      res.status(200).json({ ok: true, idempotent: true, buildId });
      return;
    }

    // Load payload
    const payloadKey = `greasy:lead:${quoteId}:payload`;
    const payloadJson: any = await redis.get(payloadKey);

    if (!payloadJson) {
      console.error('Lead payload not found in Redis', { quoteId, payloadKey });
      res.status(404).json({ ok: false, error: 'Lead payload not found', buildId });
      return;
    }

    let payload: any = {};
    try {
      payload = typeof payloadJson === 'string' ? JSON.parse(payloadJson) : payloadJson;
    } catch (err) {
      console.error('Failed to parse payload from Redis', { quoteId, err });
      res.status(500).json({ ok: false, error: 'Failed to parse payload', buildId });
      return;
    }

    const { intake, contact, estimate } = payload;
    const decision = state.decision || 'PENDING';
    const resendKey = process.env.RESEND_API_KEY || '';
    const hqEmailsRaw = process.env.HQ_LEADS_EMAILS || '';
    const requiredHqEmails = ['kenneth@luxuryflush.com', 'info@allinsanitation.com'];
    const envHqEmails = hqEmailsRaw.split(',').map((e: string) => e.trim()).filter(Boolean);
    const hqEmails = Array.from(new Set([...requiredHqEmails, ...envHqEmails]));

    if (!resendKey || hqEmails.length === 0) {
      console.warn('RESEND_CONFIG_MISSING', { hasKey: !!resendKey, hqEmailCount: hqEmails.length, quoteId });
      // Still mark as sent to avoid retry loop
      await redis.hset(stateKey, { hqSent: '1', hqSentAt: new Date().toISOString() });
      res.status(200).json({ ok: false, error: 'Resend not configured', buildId });
      return;
    }

    // Get RESEND_FROM
    let resolvedFrom = '';
    const rawFrom = (process.env.RESEND_FROM || '').trim();
    if (rawFrom) {
      const match = rawFrom.match(/<\s*([^>]+)\s*>$/);
      resolvedFrom = match ? match[1].trim() : rawFrom;
    }

    if (!resolvedFrom) {
      console.warn('RESEND_FROM not configured', { quoteId });
      await redis.hset(stateKey, { hqSent: '1', hqSentAt: new Date().toISOString() });
      res.status(200).json({ ok: false, error: 'RESEND_FROM not configured', buildId });
      return;
    }

    // Build HQ email content
    const isReady = decision === 'YES';
    const addressParts = [intake?.address_line, intake?.city, intake?.state, intake?.zip].filter(Boolean);
    const address = addressParts.join(', ');
    const distanceMiles = estimate?.distanceMiles ?? estimate?.distance;
    const distanceSource = estimate?.distanceSource;
    const assumptions = Array.isArray(estimate?.assumptions) ? estimate.assumptions : [];
    const radiusBand = estimate?.radiusBand || (estimate as any)?.radius_band;
    const tierUsed = estimate?.tierUsed;
    const capacityTier = (estimate as any)?.capacity_tier || tierUsed;
    const capacityUnsure = (estimate as any)?.capacity_unsure === true || estimate?.gallonsUncertain === true;
    const addOnsRaw = Array.isArray(estimate?.addOns) ? estimate.addOns : Array.isArray((estimate as any)?.add_ons) ? (estimate as any)?.add_ons : [];
    const addOns = addOnsRaw as { name: string; price: number }[];
    const unknownAddOns = Array.isArray(estimate?.unknownAddOns) ? estimate.unknownAddOns : [];
    const manualQuoteFlag = estimate?.manualQuote === true || (estimate as any)?.manual_quote === true;
    const officePhone = process.env.VITE_OFFICE_PHONE || process.env.OFFICE_PHONE || '';

    const rawAmount =
      typeof estimate?.totalPrice === 'number'
        ? estimate.totalPrice
        : typeof estimate?.minPrice === 'number'
          ? estimate.minPrice
          : estimate?.amount;
    const amount = typeof rawAmount === 'number' ? `$${rawAmount.toFixed(2)}` : String(rawAmount ?? 'N/A');

    const subject = isReady
      ? `🔥 NEW LEAD (Delayed) – Move Forward Status: YES – ${intake?.business_name || 'Unknown'}`
      : `New Estimate Request (Status: ${decision}) – ${intake?.business_name || 'Unknown'}`;

    const text = [
      `Move Forward Status: ${decision}`,
      isReady
        ? 'ACTION: Contact customer to schedule service.'
        : decision === 'NO'
          ? 'ACTION: Customer declined to move forward.'
          : 'ACTION: Awaiting customer decision.',
      '',
      `[Delayed Delivery - sent ${new Date().toISOString()}]`,
      `Quote ID: ${quoteId}`,
      '',
      'Business',
      `- Name: ${intake?.business_name || 'N/A'}`,
      `- Address: ${address || 'N/A'}`,
      '',
      'Estimate',
      `- Amount: ${amount}${estimate?.ballpark ? ' (ballpark)' : ''}`,
      distanceMiles ? `- Distance: ${distanceMiles} mi${distanceSource ? ` (${distanceSource})` : ''}` : '',
      radiusBand ? `- Radius Band: ${radiusBand}` : '',
      capacityTier ? `- Capacity Tier: ${capacityTier}` : '',
      capacityUnsure ? '- Capacity Unsure: yes' : '',
      addOns.length ? `- Add-ons: ${addOns.map((a) => `${a.name} ($${a.price})`).join(', ')}` : '',
      unknownAddOns.length ? `- Unrecognized add-ons: ${unknownAddOns.join(', ')}` : '',
      manualQuoteFlag ? '- Manual Quote: REQUIRED' : '',
      assumptions.length ? `- Assumptions: ${assumptions.join(' ')}` : '',
      '',
      'Contact',
      `- Name: ${contact?.name || 'N/A'}`,
      `- Phone: ${contact?.phone || 'N/A'}`,
      `- Email: ${contact?.email || 'N/A'}`,
      '',
      officePhone ? `Urgent? Call or text ${officePhone} for immediate assistance.` : '',
    ]
      .filter(Boolean)
      .join('\n');

    console.log('HQ_EMAIL_PREP_DELAYED', { toCount: hqEmails.length, subject, quoteId, decision });

    // Send email
    const emailResult = await sendResendEmail({
      apiKey: resendKey,
      from: resolvedFrom,
      to: hqEmails,
      subject,
      text,
      quoteId,
    });

    if (!emailResult.ok) {
      console.error('Failed to send HQ email', { quoteId, errorCode: emailResult.errorCode });
      // Still mark as attempted
      await redis.hset(stateKey, {
        hqSent: '1',
        hqSentAt: new Date().toISOString(),
        hqSendError: emailResult.errorCode || 'unknown',
      });
      res.status(500).json({ ok: false, error: 'Failed to send email', buildId });
      return;
    }

    // Mark as sent in Redis
    await redis.hset(stateKey, {
      hqSent: '1',
      hqSentAt: new Date().toISOString(),
      hqMessageId: emailResult.messageId || 'unknown',
    });

    logJson('HQ_SEND_SUCCESS', {
      quoteId,
      decision,
      messageId: emailResult.messageId,
      toCount: hqEmails.length,
    });

    res.status(200).json({
      ok: true,
      quoteId,
      decision,
      messageId: emailResult.messageId,
      buildId,
    });
  } catch (err: any) {
    console.error('Unexpected error in hq-send handler:', err?.message || err);
    res.status(500).json({ ok: false, error: err?.message || 'Internal error', buildId });
  }
}
