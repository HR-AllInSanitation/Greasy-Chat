import type { VercelRequest, VercelResponse } from '@vercel/node';

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

    return res.status(200).json({ ok: true, forwarded: true });
  } catch (err: any) {
    console.error('Unexpected error in /api/estimate', err?.message || err);
    return res.status(500).json({ ok: false, error: 'Internal error' });
  }
}
