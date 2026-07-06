<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1rSBqWvIRzc49aWlNDfPYoisRv-7SN6IP

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## SOP: dev and smoke tests

- Dev (auto port selection): `npm run dev`
- Dev (strict port 3000): `npm run dev:strict`
- Smoke tests: `npm run test:smoke`

## Cleanup if ports are stuck

- Check listeners on 3000/3002/3003/4173/5173: `npm run ports:check`
- Kill only vite dev servers: `npm run ports:kill:vite`

## Configuration guard

- Env vars:
   - `VITE_OFFICE_PHONE` (e.g. `+16612009126`) — set in Vercel project env for Production/Preview/Dev.
   - `VITE_E2E` — **never** set in Production/Preview/Build; only local E2E runs use it.
- For prod safety, `npm run build` fails if `VITE_E2E` is set; `build:verify:prod` also checks bundles for test hooks/attrs.
- If `VITE_OFFICE_PHONE` is empty in dev, the CTA will not render; set it locally to exercise the handoff link.
- If you hit exit 137 / OOM or have stray dev servers, run `npm run dev:clean` (kills repo ports then starts dev:strict). Avoid running multiple dev servers concurrently.

## IndexNow setup

- Key file hosted at site root: `/891709ac5542488e8e52426bc1c5c58a.txt`
- To validate payload before submit: `npm run indexnow:dry-run`
- To submit URLs in bulk from `public/sitemap.xml`: `npm run indexnow:submit`

Optional environment variables:

- `SITE_ORIGIN` (default: auto-detected from first URL in `public/sitemap.xml`)
- `INDEXNOW_ENDPOINT` (default: `https://api.indexnow.org/indexnow`)
- `INDEXNOW_KEY` (default: `891709ac5542488e8e52426bc1c5c58a`)
- `INDEXNOW_KEY_FILE_PATH` (default: `/<key>.txt`)
- `SITEMAP_PATH` (default: `./public/sitemap.xml`)
