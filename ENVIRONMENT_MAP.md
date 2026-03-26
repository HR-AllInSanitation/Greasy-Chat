# Environment Variables Map (Canonical)

Date: 2026-03-26  
Scope: Runtime + build variables used by the current code in [api](api) and UI entry points.

---

## Frontend / Build

| Variable | Required | Used In | Purpose |
|---|---:|---|---|
| `VITE_OFFICE_PHONE` | Yes | [vite.config.ts](vite.config.ts), [components/ChatInterface.tsx](components/ChatInterface.tsx), [api/estimate.ts](api/estimate.ts) | Office phone for handoff CTA and fallback contact text |
| `VITE_E2E` | No | [vite.config.ts](vite.config.ts), [components/ChatInterface.tsx](components/ChatInterface.tsx) | Enables local E2E hooks in dev builds |

---

## Core Lead Pipeline (Required for production)

| Variable | Required | Used In | Purpose |
|---|---:|---|---|
| `UPSTASH_REDIS_REST_URL` | Yes | [api/estimate.ts](api/estimate.ts), [api/hq-send.ts](api/hq-send.ts), [api/geocode.ts](api/geocode.ts) | Redis storage for lead state/payload and geocode cache |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | [api/estimate.ts](api/estimate.ts), [api/hq-send.ts](api/hq-send.ts), [api/geocode.ts](api/geocode.ts) | Redis authentication token |
| `QSTASH_TOKEN` | Yes | [api/estimate.ts](api/estimate.ts), [api/hq-send.ts](api/hq-send.ts) | QStash publish and verification support |
| `QSTASH_CURRENT_SIGNING_KEY` | Yes | [api/hq-send.ts](api/hq-send.ts) | Signature verification for `/api/hq-send` callback |
| `HQ_EMAIL_DELAY_SECONDS` | No | [api/estimate.ts](api/estimate.ts) | Delay before HQ follow-up job is executed (default 120s) |
| `HQ_SEND_URL` | No | [api/estimate.ts](api/estimate.ts) | Optional explicit callback target for QStash |
| `VERCEL_URL` | No | [api/estimate.ts](api/estimate.ts) | Preferred callback URL source in Vercel deployments |

---

## Email + Office Routing

| Variable | Required | Used In | Purpose |
|---|---:|---|---|
| `RESEND_API_KEY` | Yes | [api/estimate.ts](api/estimate.ts), [api/hq-send.ts](api/hq-send.ts) | Sends HQ and customer emails |
| `RESEND_FROM` | Yes | [api/estimate.ts](api/estimate.ts), [api/hq-send.ts](api/hq-send.ts) | Sender identity (validated by API) |
| `HQ_LEADS_EMAILS` | Yes | [api/estimate.ts](api/estimate.ts), [api/hq-send.ts](api/hq-send.ts) | Comma-separated HQ inbox recipients |
| `OFFICE_PHONE` | No | [api/estimate.ts](api/estimate.ts), [api/hq-send.ts](api/hq-send.ts) | Office contact number included in messages |

---

## Webhook + External APIs

| Variable | Required | Used In | Purpose |
|---|---:|---|---|
| `OFFICE_WEBHOOK_URL` | Yes* | [api/estimate.ts](api/estimate.ts) | Office/Sheets webhook endpoint for lead forwarding |
| `GOOGLE_SHEETS_WEBHOOK` | Alias | [api/estimate.ts](api/estimate.ts) | Backward-compatible alias used if `OFFICE_WEBHOOK_URL` is not set |
| `GOOGLE_MAPS_API_KEY` | Yes | [api/geocode.ts](api/geocode.ts) | Address geocoding for distance-sensitive pricing |
| `GEMINI_API_KEY` | No | [api/gemini.ts](api/gemini.ts), [api/gemini_models.ts](api/gemini_models.ts) | Optional AI parse/model endpoints |
| `GEMINI_MODEL` | No | [api/gemini.ts](api/gemini.ts) | Optional model override |

\* The API can still return success without webhook forwarding in some branches, but production should treat this as required.

---

## Deploy-time Env Validation Checklist (Release Gate)

1. Confirm all required vars above exist in Vercel Project Settings (Preview + Production).
2. Validate `RESEND_FROM` format is a valid sender (`name <email@domain>` or plain email).
3. Validate `HQ_LEADS_EMAILS` contains at least one valid mailbox and is comma-separated.
4. Validate Redis credentials (`UPSTASH_*`) against active Upstash instance.
5. Validate QStash pair (`QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`) matches current project.
6. Validate callback URL behavior:
	- if `VERCEL_URL` exists, `/api/hq-send` resolves there;
	- otherwise set explicit `HQ_SEND_URL`.
7. Validate `OFFICE_WEBHOOK_URL` responds with non-5xx to a test POST.
8. Validate `GOOGLE_MAPS_API_KEY` can geocode a known LA address via [api/geocode.ts](api/geocode.ts).
9. Validate `VITE_OFFICE_PHONE` and/or `OFFICE_PHONE` produce a working handoff CTA in UI.

