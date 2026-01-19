
export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  const headers = {
    'content-type': 'application/json',
    'cache-control': 'no-store',
  };
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), { status: 405, headers });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    if (!apiKey) {
      return new Response(JSON.stringify({ ok: false, disabled: true, error: 'Missing GEMINI_API_KEY' }), { status: 200, headers });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {}
    const text = typeof body.text === 'string' ? body.text : '';
    const systemPrompt = typeof body.systemPrompt === 'string' ? body.systemPrompt : '';
    const prompt = systemPrompt
      ? `${systemPrompt}\n\nUser input:\n${text}\n\nReturn ONLY valid JSON.`
      : text;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
    });
    const json = await r.json();
    if (!r.ok) {
      const status = r.status;
      const disabled = status === 401 || status === 403;
      return new Response(JSON.stringify({ ok: false, disabled, status, error: json?.error?.message || 'Gemini error' }), { status: 200, headers });
    }
    const parts = json?.candidates?.[0]?.content?.parts;
    const outText = Array.isArray(parts)
      ? parts.map((p: any) => p?.text).filter(Boolean).join('')
      : '';
    return new Response(JSON.stringify({ ok: true, text: outText }), { status: 200, headers });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, disabled: false, error: err?.message || String(err) }), { status: 200, headers });
  }
}
