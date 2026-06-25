# Google Ads Conversion Tracking Audit
## larestaurantservices.com — June 24, 2026

---

## EXECUTIVE SUMMARY

**Current Status:** Partially configured  
**Google Ads ID:** `AW-17824333319` ✓  
**GA4 Property:** Not installed ⚠️  
**Form Conversion Tracking:** Yes (quote/lead submit only)  
**Phone Click Tracking:** Partial (event tracking exists, but not geo-targeted call conversion asset)  
**CRM Integration:** Not visible (no GHL/lead re-import to Google Ads found)  

---

## DETAILED FINDINGS

### 1) Is the Google Ads gtag installed?
✅ **YES**  
- **Location:** `index.html` (lines 21–27)  
- **ID:** `AW-17824333319`  
- **Script:** Google's async gtag.js loaded correctly  
- **Status:** Active on all pages

```html
<!-- index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-17824333319"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-17824333319');
</script>
```

---

### 2) Is GA4 installed?
❌ **NO**  
- No `G-*` GA4 property ID found in `index.html`  
- No GA4 config in gtag  
- Only Google Ads (conversion) tracking is configured  
- **Impact:** You are NOT capturing:
  - Page views, scrolls, engagement  
  - User demographics/interests  
  - Traffic sources / attribution chains  
  - Conversion paths (user journey before form submit)

---

### 3) Are form submissions tracked?
✅ **YES (partial)**  
- **File:** `components/IntelligentEstimateForm.tsx`  
- **Event on form view:**  
  ```typescript
  trackEvent('quote_form_view', { entry: 'instant-estimate', service_key: selectedServiceKey })
  ```
- **Event on form step completion:**  
  ```typescript
  trackEvent('quote_step_complete', { step_number, service_key })
  ```
- **Event on lead submit (main conversion):**  
  ```typescript
  trackConversion({ phone, email, service })
  trackEvent('quote_lead_submit', { service_key, quote_mode: 'estimate' | 'manual_review' })
  ```
- **Conversion destination:** `AW-17824333319/Tqz6CM_jnZAcEIf8prNC` (conversion action ID)

---

### 4) Are quote-agent completions tracked?
✅ **YES (partial)**  
- **File:** `components/ChatInterface.tsx`  
- **On successful chat completion:**  
  ```typescript
  trackConversion({
    phone: contact.normalizedPhone,
    email: contact.email,
    service: selectedService?.label
  })
  ```
- **Caveat:** Only when chat flow completes and contact info is captured  
- **Missing:** Stage-specific events (e.g., "chat_engaged", "chat_service_selected", "chat_converted")

---

### 5) Are phone clicks tracked?
✅ **PARTIAL**  
- **Current status:** Event tracking exists on select pages  
- **Pages with tracking:**
  - `FAQ.tsx`: `trackEvent('support_page_cta_click', { page_type: 'faq', cta: 'call_dispatch' })`  
  - `AboutUs.tsx`: Same pattern  
  - `BestPractices.tsx`: Same pattern  
  - `EnvironmentalImpact.tsx`: Same pattern  

- **Example (FAQ.tsx, lines 59–62):**
  ```tsx
  <a
    href="tel:8186984252"
    onClick={() => trackEvent('support_page_cta_click', { page_type: 'faq', cta: 'call_dispatch' })}
  >
    Call Dispatch
  </a>
  ```

- **Coverage Gap:** Not all phone CTAs have `onClick` handlers:
  - `SiteFooter.tsx` (line 40): `<a href="tel:8186984252">` — **no tracking**  
  - `SepticHoldingTankPumpingLA.tsx` (line 80): `<a href="tel:8186984252">` — **no tracking**  
  - `HydroJettingLA.tsx`, `HoodCleaningLA.tsx`, `JanitorialServicesLA.tsx`, etc.: **no tracking**  
  - **>20 tel: links across codebase without tracking**

---

### 6) Are call extensions/call assets tracked inside Google Ads?
❌ **NOT FOUND**  
- No evidence of:
  - Google Ads call extensions being configured  
  - Call asset performance data capture  
  - Click-to-call conversion actions in Google Ads  
- **What's needed:** Set up in Google Ads UI (not code-level):
  - Add phone call extensions to ad groups  
  - Enable call conversion tracking (Google will auto-track tel: clicks if configured)  
  - OR manually configure call extension conversion action

---

### 7) Are website call conversions enabled?
❌ **NOT CONFIGURED IN GOOGLE ADS**  
- **Code-side:** Phone click events ARE being fired (`support_page_cta_click` with `cta: 'call_dispatch'`)  
- **Platform-side:** Need to verify:
  - Is a "Phone Call" conversion action created in Google Ads?  
  - Is the `send_to` targeting this action?  
  - Is call duration/forwarding number set up?  

**Current conversion send_to:** `AW-17824333319/Tqz6CM_jnZAcEIf8prNC`  
- This appears to be for form/lead conversions only  
- **No separate phone call conversion action visible**

---

### 8) Is /instant-estimate a form page or a thank-you/conversion page?
**FORM PAGE (with inline success message)**  
- **File:** `pages/InstantEstimate.tsx`  
- **Structure:**
  - Hero + CTA copy  
  - Embeds `<IntelligentEstimateForm />` (the actual form)  
  - Embeds `<ComplexCaseWidget />` (side panel for complex cases)  
- **Post-submit behavior:** 
  - Form clears  
  - Inline success message appears in form: `"Confirmation sent to {email}"`  
  - User stays on `/instant-estimate` (no redirect to thank-you page)  
- **Conversion event fired:** Yes, on submit (before clearing)  
- **Issue:** No distinct thank-you page = harder to segment converters for retargeting

---

### 9) Is there a dedicated thank-you page?
❌ **NO**  
- Post-form, user sees inline confirmation within the form component  
- No redirect to `/thank-you` or similar  
- No dedicated conversion confirmation page  
- **Impact:**
  - Cannot retarget form completers separately  
  - No attribution pass-through (e.g., UTM parameters, referral source)  
  - Harder to implement post-conversion upsells or lead nurturing

---

### 10) Are conversions imported from GHL/CRM back into Google Ads?
❌ **NOT FOUND**  
- No evidence of:
  - GHL integration in codebase  
  - Bi-directional CRM↔Google Ads API calls  
  - Lead status imports (qualified, won, lost)  
  - Conversion value adjustments based on deal stage  
- **What exists:**
  - Leads are sent to backend (`/api/estimate` endpoint)  
  - Redis state tracking for leads (decision, HQ sent, email sent)  
  - Email/SMS follow-up via QStash  
- **What's missing:**
  - No code connecting CRM outcomes back to Google Ads for conversion value optimization

---

### 11) Are qualified/won leads tracked separately from raw leads?
❌ **NO (not in tracking)**  
- **Code captures:**
  - `quote_form_view` (all form impressions)  
  - `quote_step_complete` (form step progress)  
  - `quote_lead_submit` (all submissions, both estimate and manual review)  
  - `conversion` (generic, fires on submit)  

- **Not captured:**
  - `qualified_lead` (vs. raw lead)  
  - `won_deal` (vs. inquiry)  
  - `estimated_deal_value`  
  - Lead quality score / qualification tier  

- **Existing infrastructure (unused for tracking):**
  - Redis stores `decision` (YES/NO/PENDING)  
  - Estimates have quality/confidence metadata  
  - Could be exposed to Google Ads conversion values

---

### 12) Are Google Ads campaigns optimizing for real lead quality or only clicks/form starts?
**LIKELY CLICKS/FORM STARTS ONLY**  
- **Current conversion action:** Generic "conversion" (fires on any form submit)  
- **No value differentiation:**
  - A $200 grease trap estimate counts same as $5000 restaurant overhaul  
  - Manual review estimates (lower confidence) count same as algorithmic quotes  
  - All form views + submissions weighted equally  

- **Missing:**
  - Conversion value tracking ($ per lead)  
  - Lead quality signals (estimate confidence, service type profitability)  
  - Post-conversion outcomes (lead marked won/lost/qualified)  

---

## CURRENT TRACKING SETUP

### Events Being Fired
| Event | Location | Params | Purpose |
|-------|----------|--------|---------|
| `quote_form_view` | IntelligentEstimateForm.tsx | `entry`, `service_key` | Form impressions |
| `quote_step_complete` | IntelligentEstimateForm.tsx | `step_number`, `service_key` | Multi-step progress |
| `quote_form_start` | IntelligentEstimateForm.tsx | `service_key` | User clicked a service |
| `quote_lead_submit` | IntelligentEstimateForm.tsx | `service_key`, `quote_mode` | Form submission |
| `conversion` | gtag-utils.ts | `phone_number`, `email`, `service_type`, `value` | Main Google Ads conversion |
| `support_page_cta_click` | Multiple pages | `page_type`, `cta` | CTA clicks (est., call, message) |
| `page_view_support` | Resource pages | `page_type` | Page views (FAQ, guides, etc.) |

### Conversion Action
- **Google Ads Conversion ID:** `AW-17824333319/Tqz6CM_jnZAcEIf8prNC`  
- **Send-to target:** Hardcoded in `api/gtag-utils.ts`  
- **Conversion value:** Not passed (generic conversion only)

---

## MISSING CONVERSION EVENTS

### Safe to Add (No Protected File Changes)
1. **Phone click conversion**  
   - Wrap all `href="tel:"` links with `onClick` tracker  
   - Event: `phone_click` or `call_button_click`  
   - Params: `page_type`, `location` (header, footer, CTA block, etc.)  
   - **Safe method:** Add to non-form pages (Best Practices, FAQ, service pages)

2. **Estimate form funnel depth**  
   - Already partially tracked (`quote_step_complete`)  
   - Could add: `form_field_interaction` for specific high-drop fields  
   - **Safe method:** Add to form component without changing payload/submission

3. **Chat to form conversion**  
   - Event: `chat_to_form_fallback`  
   - Tracks when user exits chat and lands on form  
   - **Safe method:** Add in route transition logic

4. **Thank-you page redirect (post-conversion)**  
   - Create `/thank-you` route  
   - Event: `conversion_confirmed_page_view`  
   - **Safe method:** Redirect after form submit, do not modify form component

5. **Page engagement (scrolling, time on page)**  
   - Event: `page_engagement` or `scroll_depth`  
   - Helps segment high-intent users  
   - **Safe method:** Add global scroll listener in `main.tsx` or root component

### Requires Protected File Changes
1. **Lead quality signals**  
   - Would need to expose estimate confidence/quality in conversion value  
   - **Location:** `services/pricingEngine.ts` (protected) + `utils/estimateFlow.ts` (protected)  
   - **Risk:** Could break pricing logic if modified incorrectly

2. **Post-conversion CRM sync**  
   - Would need to modify `api/estimate.ts` (protected)  
   - **Required for:** Importing lead outcomes back to Google Ads  
   - **Risk:** Could affect HQ/SMS dispatch flow

3. **Deal value tracking**  
   - Would need to expose `totalPrice` from estimate to conversion value  
   - **Location:** `components/IntelligentEstimateForm.tsx` (protected)  
   - **Risk:** Could expose pricing logic to external systems

---

## RECOMMENDED CONVERSION ACTIONS FOR GOOGLE ADS

### Priority 1 (Do immediately)
1. **Add GA4 property**  
   - Enables attribution, audience building, and cross-domain tracking  
   - Non-invasive (parallel to existing Google Ads gtag)  
   - Action: Add `GA-` config line to `index.html`

2. **Expand phone click tracking coverage**  
   - Cover all `tel:` links with `onClick` handlers  
   - Centralize tracking in utility function  
   - Action: Add tracking to SiteFooter, all service pages, article panels

3. **Create dedicated /thank-you page**  
   - Enables retargeting and post-conversion nurturing  
   - Allows UTM parameter pass-through  
   - Action: Create new route, redirect after form submit

4. **Set up Google Ads call conversion action**  
   - In Google Ads UI: Create "Phone Call" conversion action  
   - Link to existing phone click events  
   - Map conversion ID to code

### Priority 2 (Important, ~1-2 sprints)
1. **Add conversion value tracking**  
   - Pass `totalPrice` as conversion value  
   - Helps optimize for high-value quotes  
   - **Requires:** Minor `gtag-utils.ts` update (add value param)

2. **Add lead quality dimension**  
   - Create conversion action for "qualified leads" vs. raw inquiries  
   - Use estimate confidence + service type to qualify  
   - **Requires:** New GA4 event or custom dimension

3. **Set up post-conversion lead scoring**  
   - Capture: form completion → estimate quality → lead marked won/lost  
   - Feed back to Google Ads for ROAS optimization  
   - **Requires:** Protected file changes (backend only)

### Priority 3 (Nice-to-have)
1. **Create custom audiences in Google Ads**  
   - Site visitors who viewed but didn't submit  
   - Form completers  
   - Phone clickers  
   - Service page visitors (to retarget)

2. **Set up dynamic remarketing**  
   - Retarget form completers with follow-up offers  
   - Show service-specific ads based on quote history

---

## PRIORITY ORDER (by impact & effort)

| # | Task | Effort | Impact | Protected Files? |
|---|------|--------|--------|------------------|
| 1 | Add GA4 property | 5 min | HIGH | No |
| 2 | Expand phone click tracking | 1-2 hrs | HIGH | No |
| 3 | Create /thank-you page | 2-3 hrs | HIGH | No |
| 4 | Set up Google Ads call conversion | 30 min (UI) | HIGH | No |
| 5 | Add conversion value param | 1 hr | MEDIUM | No (minor utils change) |
| 6 | Create "qualified lead" conversion | 2-3 hrs | MEDIUM | No (GA4 event only) |
| 7 | Post-conversion lead scoring | 3-5 hrs | MEDIUM-HIGH | **Yes** (backend) |
| 8 | Dynamic remarketing setup | 2 hrs (UI) | MEDIUM | No |

---

## SUMMARY TABLE

| Question | Current Status | Gap | Priority |
|----------|----------------|-----|----------|
| Google Ads gtag? | ✅ Yes | None | — |
| GA4 installed? | ❌ No | **Missing attribution data** | P1 |
| Form conversions tracked? | ✅ Partial | No quality differentiation | P2 |
| Quote-agent tracked? | ✅ Partial | No stage-specific events | P2 |
| Phone clicks tracked? | ⚠️ Partial (4/20+ links) | **Inconsistent coverage** | P1 |
| Call extensions tracked? | ❌ No | Needs Google Ads UI setup | P1 |
| Website call conversions? | ❌ No | Needs conversion action + GA4 | P1 |
| Form vs thank-you page? | Form only | **No retargeting capability** | P1 |
| Dedicated thank-you page? | ❌ No | **Blocks post-conversion flows** | P1 |
| CRM sync to Ads? | ❌ No | No deal outcome tracking | P3 |
| Qualified vs raw leads? | ❌ No | **All conversions equal value** | P2 |
| Optimizing for quality? | Clicks only | No value-based optimization | P2 |

---

## NEXT STEPS

1. **This week:** Add GA4 property ID to `index.html`  
2. **This week:** Create `/thank-you` page and redirect form logic  
3. **Next week:** Audit and expand phone click tracking coverage  
4. **Next week:** Set up Google Ads call conversion action (UI-only)  
5. **Backlog:** Implement lead quality and conversion value tracking  

---

**Generated:** June 24, 2026  
**Audit by:** GitHub Copilot AI Assistant  
**Scope:** Non-protected analysis; no code modifications applied
