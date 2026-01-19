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
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed', buildId, runtimeHint });
    return;
  }
  if (!apiKey) {
    res.status(200).json({ ok: false, error: 'Missing GEMINI_API_KEY', buildId, runtimeHint });
    return;
  }
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
    const r = await fetch(url);
    const json = await r.json();
    const models = Array.isArray(json.models)
      ? json.models.filter((m: any) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
        .map((m: any) => ({ name: m.name, supportedGenerationMethods: m.supportedGenerationMethods }))
      : [];
    res.status(200).json({ ok: true, buildId, runtimeHint, models });
  } catch (err: any) {
    res.status(200).json({ ok: false, error: err?.message || String(err), buildId, runtimeHint });
  }
}
