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
- **P0 /api/geocode prod**: `https://greasy-chat.vercel.app/api/geocode` responde `{"verified":false,"error":"REQUEST_DENIED"}` (HTTP 200) → bloqueo para GREASE_4000.
- **P0 /api/geocode custom domain**: `https://www.larestaurantservices.com/api/geocode` responde `{"verified":false,"error":"REQUEST_DENIED"}` (HTTP 200).
- **Deployment Protection**: `https://greasy-chat-8vky9wj2t-roberto-coras-projects.vercel.app/api/geocode` devuelve 401 (SSO/Protection).

---

## 6.1) P0 Triage — Google Cloud (ordenado)

1) **Billing activo** en el proyecto de Google Cloud usado por `GOOGLE_MAPS_API_KEY`.
2) **Geocoding API habilitada** en el mismo proyecto.
3) **Restricciones de key**:
  - Si la key es de **Server-side**: permitir IPs de Vercel o quitar restricción para validar.
  - Si la key está restringida por **HTTP referrer**: añadir `https://greasy-chat.vercel.app/*` y `https://www.larestaurantservices.com/*`.
  - **API restrictions**: limitar a “Geocoding API” (y “Distance Matrix API” solo si se usa). Verificar que Geocoding esté en la lista permitida.

---

## 6.2) P0 Validación — pruebas exactas

**Objetivo:** respuesta con `verified: true` y `lat/lng` válidos.

**Curl esperado (custom domain):**
- POST `https://greasy-chat.vercel.app/api/geocode`
- Body: `{ "addressLine1":"123 Main St", "city":"Los Angeles", "state":"CA", "zip":"90001" }`
- **Esperado:** HTTP 200 y JSON con `verified:true`, `lat`, `lng`, `normalizedAddress`.

**Nota:** si se usa `www.larestaurantservices.com`, repetir mismo POST (debe funcionar igual).

**Resultado actual (custom domain):** `REQUEST_DENIED` (HTTP 200).

---

## 6.3) Deployment Protection / SSO

- **Preview URL (vercel.app)** protegida por SSO → 401 en `/api/geocode`.
- Para pruebas públicas usar **custom domain** (`greasy-chat.vercel.app` o `www.larestaurantservices.com`).
- Alternativa controlada: usar **bypass token** de Vercel para acceder al preview.

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

## 9) Estado actual, decisiones y next actions

**Estado actual:** P0 en prod por `REQUEST_DENIED` en `/api/geocode` en dominio público. Preview protegido por SSO.

**Decisiones:**
- Validar /api/geocode **solo** vía dominios públicos (custom domain).
- Priorizar fix de Google Cloud antes de continuar runtime QA (D).

**Next actions (máx 10):**
1) Confirmar **billing activo** en el proyecto de la key.
2) Verificar **Geocoding API habilitada**.
3) Revisar **restricciones de key** (server IP o HTTP referrer) y ajustar para dominios públicos.
4) Reintentar **curl** en `https://greasy-chat.vercel.app/api/geocode` hasta obtener `verified:true`.
5) Repetir curl en `https://www.larestaurantservices.com/api/geocode`.
6) Si sigue 401 en preview, usar **bypass token** o evitar preview para QA.
7) Continuar con D: DevTools Event A/B una vez P0 resuelto.

---

## 10) Evidencia P0 (curl)

**Custom domain (www.larestaurantservices.com):**
```
HTTP/2 200 
cache-control: public, max-age=0, must-revalidate
content-type: application/json; charset=utf-8
date: Mon, 16 Feb 2026 20:38:57 GMT
etag: W/"2b-6XXvkMbWsGbIBDG61T3t0gencb4"
server: Vercel
strict-transport-security: max-age=63072000
x-vercel-cache: MISS
x-vercel-id: sfo1::iad1::79sxl-1771274337480-0e7af2e538f0
content-length: 43

{"verified":false,"error":"REQUEST_DENIED"}
```

---

## 11) Estado P0/P1/P2

- **P0 (Geocoding prod):** ✅ **PASS** (fixed 2026-02-17) — `/api/geocode` devuelve `verified:true` + lat/lng en ambos dominios tras force redeploy Vercel.
- **P1 (Runtime QA automated):** ✅ **PASS** — `scripts/runtime_smoke_prod.ts` valida Event A + Event B YES/NO con HTTP 200 + quoteId correctos.
- **P1 (Runtime QA manual):** ⚠️ **DEFERRED** — DevTools/Resend/Sheets pendiente de validación manual opcional.
- **P2 (Repo hygiene):** ⚠️ En progreso — limpiando cambios locales en `components/ChatInterface.tsx` y este archivo.

---

## 8) Comandos rápidos (local)

- `git status -sb`
- `npx tsc --noEmit --pretty false`
- `npm run build`
- `npx tsx scripts/grease_4000_pricing_test.ts`
- `rg -i "GOOGLE_MAPS_API_KEY|maps\\.googleapis\\.com" dist/assets/*.js || echo OK`
