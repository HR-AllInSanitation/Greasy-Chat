# Environment Variables Map (Canonical)

Date: 2026-03-26  
Scope: Runtime + build variables used by current implementation

---

## Frontend / Build

| Variable | Required | Used In | Purpose |
|---|---:|---|---|
| `VITE_OFFICE_PHONE` | Yes | [vite.config.ts](vite.config.ts), [components/ChatInterface.tsx](components/ChatInterface.tsx) | Office phone for call/text handoff and contact-only flows |
| `VITE_E2E` | No | [vite.config.ts](vite.config.ts), [components/ChatInterface.tsx](components/ChatInterface.tsx) | Enables local E2E test hooks (dev-only) |

---

## API / Lead Pipeline

| Variable | Required | Used In | Purpose |
|---|---:|---|---|
| `UPSTASH_REDIS_REST_URL` | Yes | [api/estimate.ts](api/estimate.ts), [api/hq-send.ts](api/hq-send.ts), [api/geocode.ts](api/geocode.ts) | Redis storage for lead state, delayed follow-up and geocode cache |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | [api/estimate.ts](api/estimate.ts), [api/hq-send.ts](api/hq-send.ts), [api/geocode.ts](api/geocode.ts) | Redis auth token |
| `QSTASH_TOKEN` | Yes | [api/estimate.ts](api/estimate.ts) | Schedules delayed HQ follow-up callback |
| `QSTASH_CURRENT_SIGNING_KEY` | Yes | [api/hq-send.ts](api/hq-send.ts) | Verifies QStash callback signatures |
| `QSTASH_DELAY_SECONDS` | No | [api/estimate.ts](api/estimate.ts) | Delay for HQ send (default fallback in code) |
| `QSTASH_CALLBACK_URL` | No | [api/estimate.ts](api/estimate.ts) | Explicit callback URL when not inferred |
| `VERCEL_URL` | No | [api/estimate.ts](api/estimate.ts) | Builds callback URL when hosted on Vercel |
| `SITE_ORIGIN` | No | [api/estimate.ts](api/estimate.ts) | Alternate base URL for callback construction |
| `NODE_ENV` | No | [api/estimate.ts](api/estimate.ts), [api/hq-send.ts](api/hq-send.ts) | Environment behavior and diagnostics |

---

## Email Delivery

| Variable | Required | Used In | Purpose |
|---|---:|---|---|
| `RESEND_API_KEY` | Yes | [api/estimate.ts](api/estimate.ts), [api/hq-send.ts](api/hq-send.ts) | Sends HQ/customer emails |
| `HQ_EMAIL_TO` | Yes | [api/estimate.ts](api/estimate.ts), [api/hq-send.ts](api/hq-send.ts) | HQ recipient inbox |
| `CUSTOMER_EMAIL_FROM` | Yes | [api/estimate.ts](api/estimate.ts) | Sender for customer confirmation |
| `HQ_EMAIL_FROM` | No | [api/estimate.ts](api/estimate.ts), [api/hq-send.ts](api/hq-send.ts) | Optional sender override for HQ emails |

---

## External APIs

| Variable | Required | Used In | Purpose |
|---|---:|---|---|
| `GOOGLE_MAPS_API_KEY` | Yes | [api/geocode.ts](api/geocode.ts) | Address geocoding for distance-sensitive pricing |
| `GOOGLE_AI_API_KEY` | No | [api/gemini.ts](api/gemini.ts) | Optional AI parsing endpoint |
| `GEMINI_MODEL` | No | [api/gemini.ts](api/gemini.ts) | Optional model override |

---

## Webhook / Sheet Integration

| Variable | Required | Used In | Purpose |
|---|---:|---|---|
| `GOOGLE_SHEETS_WEBHOOK` | Yes* | [api/estimate.ts](api/estimate.ts) | Sends lead payload row to webhook/apps script |

\* Required for sheet forwarding behavior. Lead API still accepts requests without forwarding, but production flow should treat this as required.

---

## Naming Alignment Note

Use `GOOGLE_SHEETS_WEBHOOK` as canonical code variable. Any docs mentioning `GOOGLE_SHEETS_WEBHOOK_URL` should be normalized to avoid deployment mistakes.

---

## Operational Checklist (Release Gate)

1. `VITE_OFFICE_PHONE` set and verified in UI handoff.
2. Redis URL/token valid.
3. QStash token and signing key valid.
4. Resend API key + from/to addresses verified.
5. Google Maps key enabled for geocoding API.
6. `GOOGLE_SHEETS_WEBHOOK` live and returning expected status.
7. Production callback URL derivation validated (`QSTASH_CALLBACK_URL` or inferred origin).
