# Project Master Plan — Monetization First

Status: Active
Owner: Product / Growth
Date: 2026-03-26

---

## 1) Mission and success criteria

### Mission
Build a conversion-first web experience that maximizes revenue by:
- increasing qualified leads
- reducing friction to quote
- improving close-ready lead quality
- expanding indexable/searchable content for SEO, Ads sitelinks, and AI retrieval

### Hard success metrics
- Quote start rate
- Quote completion rate
- Lead submit rate
- Move-forward rate
- Call click-through rate
- Cost per qualified lead (ads)

### Guardrails
- Keep current brand style (font/colors/layout language)
- Reuse existing pricing + lead pipeline
- Avoid duplicated logic and duplicated docs

---

## 2) Locked decisions (Decision Log)

- D-001: Form becomes primary quote flow; chat becomes complex-case assistant.
- D-002: “Desaturated homepage” means full FAQ moves to dedicated page.
- D-003: Keep core homepage conversion blocks (hero/services/CTA/callback).
- D-004: Reuse existing backend lead pipeline and pricing engine before adding new systems.
- D-005: Single canonical PM file governs scope, status, risks, and decisions.

---

## 3) Workstreams and checklist

## WS1 — PM Governance (Single Source of Truth)
- [x] Create canonical PM master plan
- [ ] Add owners for each workstream
- [ ] Add due dates and release milestones
- [ ] Archive/mark older planning files as supporting docs

## WS2 — IA & Content Architecture
- [ ] Define page map (core, support, conversion pages)
- [x] Move full FAQ out of homepage
- [x] Publish dedicated FAQ page
- [x] Define About / Best Practices / Environmental Impact page briefs

## WS3 — Routing & Runtime Integrity
- [x] Ensure active runtime uses the intended router entrypoint
- [x] Confirm all target routes are accessible in prod build
- [x] Add route health smoke checks

## WS4 — Homepage Desaturation + Focus
- [x] Remove full FAQ block from homepage
- [x] Add FAQ teaser module linking to /faq
- [ ] Keep estimator and service CTAs prominent

## WS5 — Form + Chat Hybrid Implementation
- [x] Extract reusable intake/validation modules from chat
- [x] Build intelligent multi-step form UI (same visual system)
- [x] Keep chat as escalation widget for complex/manual cases
- [x] Standardize service-button entry behavior into form context

## WS6 — Integrations and Env Governance
- [x] Create canonical env var mapping table
- [x] Align webhook variable naming across code/docs
- [x] Verify Redis/QStash/Resend/Google Maps dependencies
- [x] Add deploy-time env validation checklist

## WS7 — SEO / Sitelinks / Structured Data
- [x] Expand sitemap to include all live indexable pages
- [ ] Keep schema per template (LocalBusiness/Service/FAQ/Article/Breadcrumb)
- [ ] Align Google Ads sitelinks with page intent
- [ ] Add internal linking model between support and service pages

## WS8 — Analytics & Monetization Loop
- [ ] Define event taxonomy for form + content pages
- [ ] Track page-level and step-level conversion events
- [ ] Build weekly KPI review template
- [ ] Run A/B or phased rollout decision rule

---

## 4) Anti-duplication rules (must follow)

1. One canonical PM file only: this document.
2. One source of truth for service taxonomy.
3. One source of truth for env var names and purpose.
4. One source of truth for event taxonomy.
5. New docs must reference this file; no standalone “final summary” files.
6. Every major scope change requires Decision Log entry before implementation.
7. Every released change requires status update in this checklist.

---

## 5) Blindspots (what we were not considering enough)

1. Router entrypoint mismatch risk can make SEO pages non-functional in production.
2. Sitemap can be stale and block indexing value from new pages.
3. FAQ links can break if moved without updating CTA behavior.
4. Service taxonomy mismatch between homepage cards and estimator logic.
5. Conversion tracking can double count if event semantics are not tightened.
6. Env var naming mismatch between code and docs causes fragile deploys.
7. Manual-review services need explicit UX paths, not ambiguous quote language.
8. Content pages need strong CTA design or they become traffic sinks.
9. Missing ownership and deadlines lead to implementation drift.
10. Too many planning docs create confusion and contradictory execution.
11. Accessibility debt can hurt UX + SEO outcomes.
12. No formal release gate for dependencies (Redis/QStash/Resend/Maps) increases downtime risk.

---

## 6) Immediate execution phase (started)

Phase 1 objective:
- Stand up dedicated FAQ page and remove full FAQ block from homepage to improve focus.

Deliverables in Phase 1:
- Dedicated /faq route
- Homepage FAQ teaser with strong CTA
- Sitemap includes /faq
- PM checklist updated

---

## 7) Risks and mitigations

- Risk: Breaking current estimator flow while moving FAQ.
  - Mitigation: Keep estimator block untouched.
- Risk: SEO ranking fluctuation due to content move.
  - Mitigation: Keep FAQ content intact, improve internal links, update sitemap.
- Risk: Team confusion due to many docs.
  - Mitigation: this file becomes canonical and references all active work.

---

## 8) Change log

- 2026-03-26: Created canonical PM master plan.
- 2026-03-26: Locked decision: FAQ moves to dedicated page as definition of desaturation.
- 2026-03-26: Implemented dedicated FAQ route/page and replaced homepage full FAQ with teaser CTA.
- 2026-03-26: Switched runtime entry to router and expanded sitemap with active service + FAQ routes.
- 2026-03-26: Work moved to branch `feature/multipage-faq-tracking` to avoid impacting main.
- 2026-03-26: Updated Google Ads conversion snippet target to `AW-17824333319/Tqz6CM_jnZAcEIf8prNC` in tracking utility.
- 2026-03-26: Added support pages: `/about-us`, `/best-practices`, `/environmental-impact`.
- 2026-03-26: Added homepage navigation and footer resource links to support pages.
- 2026-03-26: Expanded sitemap with support page routes.
- 2026-03-26: Added support-page analytics events (`page_view_support`, `support_page_cta_click`) on FAQ/About/Best Practices/Environmental pages.
- 2026-03-26: Added canonical env/integration map in `ENVIRONMENT_MAP.md`.
- 2026-03-26: Added service-context deep links (`?service=...#estimator`) and homepage preselection handling to standardize estimator entry intent.
- 2026-03-26: Added route-reachability and service deep-link smoke coverage in Playwright; suite passing.
- 2026-03-26: Added `/instant-estimate` intelligent form route with pricing/manual-review submission path.
- 2026-03-26: Normalized docs to use `GOOGLE_SHEETS_WEBHOOK` as canonical webhook env variable name.
- 2026-03-26: Added complex-case widget beside the intelligent form and restored `ais-trigger-chat` event handling in chat UI.
- 2026-03-26: Extracted shared chat intake/question helpers and shared manual-review estimate utility.
- 2026-03-26: Hardened intelligent estimate form with per-field validation, service frequency, preferred contact, and richer result state.
- 2026-03-26: Aligned chat lead assembly with shared `buildLeadPayload()` + shared contact validators.
- 2026-03-26: Expanded smoke suite to 11 tests covering instant-estimate validation and payload fields (`frequency`, `preferred_contact`).
- 2026-03-26: Finalized deploy-time environment governance checklist and aligned env mapping with runtime usage; added webhook alias fallback (`OFFICE_WEBHOOK_URL` or `GOOGLE_SHEETS_WEBHOOK`).
