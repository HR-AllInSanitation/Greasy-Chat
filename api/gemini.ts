

export const config = { runtime: 'nodejs' };



function getBuildId() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  if (sha) return sha.slice(0, 7);
  if (process.env.VERCEL_DEPLOYMENT_ID) return process.env.VERCEL_DEPLOYMENT_ID;
  return String(Date.now());
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  const buildId = getBuildId();
  const runtimeHint = 'nodejs';
  let model = (process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest').trim();
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0;
  const hasModelEnv = !!process.env.GEMINI_MODEL && process.env.GEMINI_MODEL.trim().length > 0;

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed', buildId, modelUsed: model, runtimeHint, hasKey, hasModelEnv });
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return res.status(200).json({ ok: false, disabled: true, error: 'Missing GEMINI_API_KEY', buildId, modelUsed: model, runtimeHint, hasKey, hasModelEnv });
  }

  // Diag mode
  const urlObj = new URL(req.url, 'http://localhost');
  const diag = urlObj.searchParams.get('diag') === '1';

  let body: any = {};
  let bodyType = 'unknown';
  let text = '';
  let systemPrompt = '';
  let diagInfo: any = undefined;
  try {
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
      bodyType = 'string';
    } else if (Buffer.isBuffer(req.body)) {
      body = JSON.parse(req.body.toString('utf8'));
      bodyType = 'buffer';
    } else if (typeof req.body === 'object' && req.body !== null) {
      body = req.body;
      bodyType = 'object';
    }
  } catch {
    body = {};
    bodyType = 'parse-error';
  }
  text = typeof body.text === 'string' ? body.text : '';
  systemPrompt = typeof body.systemPrompt === 'string' ? body.systemPrompt : '';

  if (diag) {
    diagInfo = {
      receivedKeys: Object.keys(body),
      textType: typeof body.text,
      systemPromptType: typeof body.systemPrompt,
      textLen: text.length,
      systemPromptLen: systemPrompt.length,
      bodyType,
    };
  }

  const prompt = systemPrompt
    ? `${systemPrompt}\n\nUser input:\n${text}\n\nReturn ONLY valid JSON.`
    : text;

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
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
      return res.status(200).json({ ok: false, disabled, status, error: msg, buildId, modelUsed: model, runtimeHint, hasKey, hasModelEnv, diag: diagInfo });
    }

    const parts = json?.candidates?.[0]?.content?.parts;
    const outText = Array.isArray(parts)
      ? parts.map((p: any) => p?.text).filter(Boolean).join('')
      : '';

    return res.status(200).json({ ok: true, text: outText, buildId, modelUsed: model, runtimeHint, hasKey, hasModelEnv, diag: diagInfo });
  } catch (err: any) {
    return res.status(200).json({ ok: false, disabled: false, error: err?.message || String(err), buildId, modelUsed: model, runtimeHint, hasKey, hasModelEnv, diag: diagInfo });
  }
}
