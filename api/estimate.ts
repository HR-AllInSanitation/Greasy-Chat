import type { VercelRequest, VercelResponse } from '@vercel/node';

const sendCustomerEmail = async (payload: any) => {
  const { intake, contact, estimate } = payload || {};
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'estimates@greasy-chat.com';
  const to = contact?.email || contact?.contact_email;

  if (!apiKey) {
    console.warn('RESEND_API_KEY not set; skipping transactional email');
    return;
  }
  if (!to) {
    console.warn('Contact email missing; skipping transactional email');
    return;
  }

  const amount = typeof estimate?.amount === 'number' ? `$${estimate.amount.toFixed(2)}` : String(estimate?.amount ?? '');
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

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject: 'Your Grease Trap Service Estimate',
        text,
      }),
    });

    if (!resp.ok) {
      console.error('Resend email failed', resp.status, await resp.text());
    }
  } catch (err: any) {
    console.error('Resend email error', err?.message || err);
  }
};

// Minimal serverless endpoint to receive completed chat estimates.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { intake, contact, estimate, source, createdAt } = body || {};

    if (!intake || !contact || !estimate) {
      return res.status(400).json({ ok: false, error: 'intake, contact, and estimate are required' });
    }

    // Log the received payload for observability/debugging
    console.log('Received estimate payload', { intake, contact, estimate, source, createdAt });

    const webhookUrl = process.env.OFFICE_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('OFFICE_WEBHOOK_URL is not set; skipping webhook forward');
      return res.status(200).json({ ok: true, forwarded: false });
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intake, contact, estimate, source, createdAt }),
      });

      if (!response.ok) {
        console.error('Webhook responded with non-OK status', response.status, await response.text());
        return res.status(200).json({ ok: false, error: 'Webhook call failed' });
      }
    } catch (err: any) {
      console.error('Webhook call errored', err?.message || err);
      return res.status(200).json({ ok: false, error: 'Webhook call errored' });
    }

    // Fire-and-forget customer email; do not affect response
    void sendCustomerEmail({ intake, contact, estimate });

    return res.status(200).json({ ok: true, forwarded: true });
  } catch (err: any) {
    console.error('Unexpected error in /api/estimate', err?.message || err);
    return res.status(500).json({ ok: false, error: 'Internal error' });
  }
}
