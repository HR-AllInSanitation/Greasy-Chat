

export const config = { runtime: 'nodejs18.x' };

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method !== 'POST') {
      res.status(405).json({ ok: false, error: 'Method not allowed' });
      return;
    }

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    const model = (process.env.GEMINI_MODEL || 'gemini-1.5-flash').trim();

    if (!apiKey) {
      res.status(200).json({ ok: false, disabled: true, error: 'Missing GEMINI_API_KEY' });
      return;
    }

    let body: any = {};
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    } catch {
      body = {};
    }

    const text = typeof body.text === 'string' ? body.text : '';
    const systemPrompt = typeof body.systemPrompt === 'string' ? body.systemPrompt : '';

    const prompt = systemPrompt
      ? `${systemPrompt}\n\nUser input:\n${text}\n\nReturn ONLY valid JSON.`
      : text;

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
    });

    let json: any = null;
    try { json = await r.json(); } catch { json = null; }

    if (!r.ok) {
      const status = r.status;
      const disabled = status === 401 || status === 403;
      const msg = json?.error?.message || `Gemini error (${status})`;
      res.status(200).json({ ok: false, disabled, status, error: msg });
      return;
    }

    const parts = json?.candidates?.[0]?.content?.parts;
    const outText = Array.isArray(parts)
      ? parts.map((p: any) => p?.text).filter(Boolean).join('')
      : '';

    res.status(200).json({ ok: true, text: outText });
  } catch (err: any) {
    res.status(200).json({ ok: false, disabled: false, error: err?.message || String(err) });
  }
}
