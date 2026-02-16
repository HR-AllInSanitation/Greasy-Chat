# Greasy-Chat — FACTS (Single Source of Truth)

> Regla: **no pegar secretos** aquí (keys/tokens). Solo “SET/REDACTED” y evidencia mínima.

Última actualización: 2026-02-16

---

## 0) Snapshot de Producción (Vercel)

**Proyecto:** greasy-chat  
**Estado:** READY  
**Commit en prod:** `eb053d6` — “Fix distance banding and Resend error logging”  
**Branch:** `main`  
**Deployment URL (vercel.app):** `greasy-chat-8vky9wj2t-roberto-coras-projects.vercel.app`  
**Dominio:** `www.larestaurantservices.com`

> Nota: si hay cambios locales no commiteados (p.ej. `components/ChatInterface.tsx`), **NO están en prod** hasta que se commiteen y se desplieguen.

---

## 1) Gates locales (A/B) — verificados

- `npx tsc --noEmit` ✅
- `npm run build` ✅
- `npx tsx scripts/grease_4000_pricing_test.ts` ✅
- Leak check en bundle: `GOOGLE_MAPS_API_KEY` / `maps.googleapis.com` **no aparecen** ✅

---

## 2) Reglas críticas del negocio (GREASE_4000)

**Trigger 4,000 gal tier:** `gallonsPlus === true` **o** `gallons > 2500`  
**Geocode:** frontend llama `/api/geocode` solo en 2,500+.

**Distance gating (pricingEngine):**
- Si **NO** `distanceVerified` ⇒ `manualQuote=true` y `tierUsed='GREASE_4000_NEEDS_LOCATION'`
- Si `distanceMiles > 160` ⇒ `manualQuote=true` y `tierUsed='GREASE_4000_NEEDS_DISTANCE_CONFIRMATION'`
- Solo calcula precio fijo cuando `distanceVerified=true` y dentro de bandas.

**Banding con decimales (FIX R1):**
- Se usa `d = ceil(distanceMiles - EPSILON)` para evitar subcobro:
  - 10.0 queda en 0–10
  - 10.1 sube a 11–20
  - 160.1 queda fuera ⇒ `null/manualQuote`

**Office review:**
- Casos manual/office-review **no deben mostrar** precio numérico en el chat.

---

## 3) Base location (para distancia)

`BASE_LOCATION` (coords):
- lat: 34.3058
- lng: -118.4488
- address: [REDACTED]

---

## 4) Integraciones / arquitectura (2 eventos)

Eventos esperados:
- **Event A:** `estimate_created`
- **Event B:** `move_forward_decided` (YES/NO)

Servicios:
- Google Geocoding (server-side)
- Upstash Redis
- QStash (delay HQ)
- Resend (emails)
- Google Sheets (webhook logging)

---

## 5) Env vars requeridas (Vercel)

En Vercel aparecen (al menos en “All Environments”) estas keys:
- `GOOGLE_MAPS_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `QSTASH_URL`
- `QSTASH_TOKEN`
- `QSTASH_CURRENT_SIGNING_KEY`
- `QSTASH_NEXT_SIGNING_KEY` (si existe)
- `HQ_EMAIL_DELAY_SECONDS` (=120)
- `RESEND_API_KEY`
- `RESEND_FROM`
- `HQ_LEADS_EMAILS`
- `GOOGLE_SHEETS_WEBHOOK_URL`
- `VITE_OFFICE_PHONE` (opcional)
- (extra vistos): `GEMINI_MODEL`, `GEMINI_API_KEY`, `OFFICE_WEBHOOK_URL`

**Pendiente recomendado (para no discutir):**
- Capturas con filtro **Preview** y **Production** mostrando `GOOGLE_MAPS_API_KEY` y `RESEND_*` como SET/REDACTED.

---

## 6) Riesgos abiertos (runtime)

- **Resend 403**: causa raíz no confirmada con evidencia runtime (ya hay logging más seguro).
- Falta evidencia completa de runtime QA (DevTools payloads, curl geocode, logs hq-send, Sheets rows).

---

## 7) Checklist mini (para no perder el orden)

1) ¿`ChatInterface.tsx` tiene cambios locales? → **decidir**: commit+deploy o revert.
2) Verificar env vars en **Preview y Production** (SET/REDACTED).
3) Confirmar prod “Current” sigue en el commit esperado.
4) `curl POST /api/geocode` en prod (verified + lat/lng).
5) DevTools: Event A (estimate_created) → 200 + quoteId.
6) DevTools: Event B YES → 200 + UI final + email HQ + email customer.
7) DevTools: Event B NO → 200 + UI NO + **no** email customer.
8) Logs: `/api/hq-send` después de 120s (quoteId + firma OK + idempotencia).
9) Sheets: 2 filas con mismo quoteId (A y B).

---

## 8) Comandos rápidos (local)

- `git status -sb`
- `npx tsc --noEmit --pretty false`
- `npm run build`
- `npx tsx scripts/grease_4000_pricing_test.ts`
- `rg -i "GOOGLE_MAPS_API_KEY|maps\\.googleapis\\.com" dist/assets/*.js || echo OK`
