export const config = { runtime: 'nodejs' };

type DispatchMessagePayload = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  serviceKey?: string;
  serviceLabel?: string;
  pagePath?: string;
  source?: string;
};

const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

const parseBody = async (req: any): Promise<Record<string, any>> => {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }

  if (typeof req.body === 'string') {
    return JSON.parse(req.body || '{}');
  }

  if (Buffer.isBuffer(req.body)) {
    return JSON.parse(req.body.toString('utf8') || '{}');
  }

  const raw = await new Promise<string>((resolve, reject) => {
    let data = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      reject(new Error('body_timeout'));
    }, 3000);

    req.on('data', (chunk: Buffer | string) => {
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

  return JSON.parse(raw || '{}');
};

const resolveResendFrom = (): string => {
  const raw = (process.env.RESEND_FROM || '').trim();
  if (!raw) throw new Error('RESEND_FROM is required');
  return raw;
};

const resolveHqRecipients = (): string[] => {
  const hqEmailsRaw = process.env.HQ_LEADS_EMAILS || '';
  const requiredHqEmails = ['kenneth@luxuryflush.com', 'info@allinsanitation.com'];
  const envHqEmails = hqEmailsRaw.split(',').map(email => email.trim()).filter(Boolean);
  return Array.from(new Set([...requiredHqEmails, ...envHqEmails]));
};

const sendResendEmail = async (params: {
  apiKey: string;
  from: string;
  to: string[];
  subject: string;
  text: string;
}): Promise<{ ok: boolean; status?: number; error?: string }> => {
  const ac = new AbortController();
  const timeout = setTimeout(() => ac.abort(), 4000);

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.apiKey}`,
      },
      body: JSON.stringify({
        from: params.from,
        to: params.to,
        subject: params.subject,
        text: params.text,
      }),
      signal: ac.signal,
    });

    if (resp.ok) {
      return { ok: true, status: resp.status };
    }

    let error = `status-${resp.status}`;
    try {
      const json = await resp.json();
      if (typeof json?.message === 'string' && json.message.trim()) error = json.message.trim();
    } catch {
      // ignore
    }

    return { ok: false, status: resp.status, error };
  } catch (err: any) {
    return { ok: false, error: err?.name === 'AbortError' ? 'resend_timeout' : (err?.message || 'resend_exception') };
  } finally {
    clearTimeout(timeout);
  }
};

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  let body: DispatchMessagePayload = {};
  try {
    body = await parseBody(req);
  } catch (err: any) {
    res.status(400).json({ ok: false, error: err?.message || 'Invalid request body' });
    return;
  }

  const name = String(body?.name || '').trim();
  const email = String(body?.email || '').trim();
  const phone = String(body?.phone || '').trim();
  const message = String(body?.message || '').trim();
  const serviceKey = String(body?.serviceKey || '').trim();
  const serviceLabel = String(body?.serviceLabel || '').trim();
  const pagePath = String(body?.pagePath || '').trim();
  const source = String(body?.source || 'instant-estimate-message').trim();

  if (!name) {
    res.status(400).json({ ok: false, error: 'Name is required' });
    return;
  }
  if (!isValidEmail(email)) {
    res.status(400).json({ ok: false, error: 'Valid email is required' });
    return;
  }
  if (!message) {
    res.status(400).json({ ok: false, error: 'Message is required' });
    return;
  }

  const resendKey = process.env.RESEND_API_KEY || '';
  const recipients = resolveHqRecipients();
  let from = '';
  try {
    from = resolveResendFrom();
  } catch (err: any) {
    res.status(503).json({ ok: false, error: err?.message || 'Email sender not configured' });
    return;
  }

  if (!resendKey || recipients.length === 0) {
    res.status(503).json({ ok: false, error: 'Dispatch email not configured' });
    return;
  }

  const subject = `Dispatch message${serviceLabel ? ` — ${serviceLabel}` : ''}`;
  const lines = [
    'New dispatch message from Instant Estimate.',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || 'Not provided'}`,
    `Service: ${serviceLabel || 'Not specified'}`,
    `Service Key: ${serviceKey || 'Not specified'}`,
    `Page: ${pagePath || 'Not provided'}`,
    `Source: ${source}`,
    '',
    'Message:',
    message,
  ];

  const result = await sendResendEmail({
    apiKey: resendKey,
    from,
    to: recipients,
    subject,
    text: lines.join('\n'),
  });

  if (!result.ok) {
    res.status(502).json({ ok: false, error: result.error || 'Failed to send dispatch message' });
    return;
  }

  res.status(200).json({ ok: true });
}
