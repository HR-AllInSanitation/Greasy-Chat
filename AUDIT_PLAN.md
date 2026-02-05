# Greasy-Chat Audit & Validation Plan
**Date:** February 4, 2026  
**Deployed SHA:** c0cd0ce87e03892687d160203dfbcb8135dd3fc4

---

## Executive Summary

Three interconnected bugs affect lead capture and pricing accuracy:

1. **Gallons Parsing Bug**: "2,500+" input → `Number("2,500+")` → NaN → fallback 0 → pricing defaults to <=1600 tier (WRONG)
2. **Handoff Timing Bug**: Reassuring message sent BEFORE user explicitly answers "Move Forward" (confusing UX, premature lead trigger)
3. **UI/Data Bug**: Pinned estimate card hides chat messages; duplicate "ESTIMATE SUMMARY" message; sheet stores only raw gallons (no audit trail)

---

## Bug Evidence & Trace

### Bug #1: Gallons Parsing
- **File:** `components/ChatInterface.tsx`
- **Line:** 749-758 (orchestrateContact)
- **Code:** `gallons: unknownGallons ? 0 : Number(intakeRef.current.gallons) || 0`
- **Issue:** `Number("2,500+")` → NaN, NaN || 0 → 0
- **Impact:** Pricing engine receives 0 → defaults to <=1600 tier (instead of 2500+ tier)
- **Expected:** "2,500+" → parse to 2500, set plus_flag=true, use 2500 for tier lookup

### Bug #2: Handoff Timing
- **File:** `components/ChatInterface.tsx`
- **Lines:** 564-679 (maybeSendEstimateLead) + 349-355 (sendHandoffOnce)
- **Issue:** maybeSendEstimateLead called from orchestrateContact (L780), BEFORE move-forward button clicked
  - POST succeeds → handoffSuccess() called → sendHandoffOnce() fires → message shown
  - User sees reassuring message BEFORE choosing Yes/No on move-forward buttons
- **Expected:** Lead sent + handoff message only AFTER explicit moveForward=true (or contact-only service flows)

### Bug #3: UI/Data
- **File:** `components/ChatInterface.tsx`
- **Lines:** 1280-1299 (pinned card render, sticky inside scroll container)
- **Lines:** 764-775 ("ESTIMATE SUMMARY" message push)
- **Issue:** Estimate appears twice; sticky card takes up scroll real estate; sheet has no raw/parsed gallons separation
- **Expected:** Pinned card outside scroll OR collapsible; no duplicate message; sheet row includes gallons_num + parse metadata

---

## Pre-Fix Audit: Reproduce & Capture Evidence

### Test Case #1: Gallons Parsing

**Setup:**
- Deploy current code to local dev server
- Open browser console (F12 → Console tab)
- Open network tab (F12 → Network tab)

**Repro Steps:**
1. Enter business name (e.g., "Test Business")
2. Enter address (e.g., "123 Main St")
3. Enter city (e.g., "Los Angeles")
4. Enter state (e.g., "CA")
5. Enter ZIP (e.g., "90001")
6. Select system type (e.g., "Interceptor")
7. **Enter gallons as: "2,500+"** ← KEY INPUT
8. Enter parking distance (e.g., "50")
9. Enter last service (e.g., "3")
10. Enter additional services (e.g., "None")
11. Enter contact name, phone, email

**Expected Pre-Fix Behavior (BUGGY):**
- Console shows: `Number("2,500+") → NaN`
- Estimate renders with <=1600 tier (WRONG)
- Pricing shows low estimate (e.g., $150–$250 instead of $500+)
- Sheet row shows "Gallons" = "2,500+" but pricing tier = wrong

**Capture Evidence:**
- Screenshot: Chat showing "2,500+" input and resulting estimate card
- Console: Log `GALLONS_PARSE { raw: "2,500+", num: NaN, status: "parse_failed" }`
- Network POST /api/estimate: Capture request body (estimate.gallons = "2,500+", minPrice/maxPrice)
- Sheet: Screenshot final row showing Gallons column value

**Expected Post-Fix Behavior:**
- Console shows: `GALLONS_PARSE { raw: "2,500+", num: 2500, plus_flag: true, status: "success" }`
- Estimate renders with 2500+ tier (2500–3500 gal) ← CORRECT
- Pricing shows higher estimate (e.g., $500–$750)
- Sheet row shows Gallons_Raw="2,500+", Gallons_Num="2500", Gallons_Plus_Flag="true"

---

### Test Case #2: Handoff Timing

**Setup:**
- Deploy code
- Open browser console
- Filter for logs: LEAD_POST_*, LEAD_GATE, handoff

**Repro Steps:**
1. Complete intake (pick any gallons value, e.g., "1000")
2. Enter contact details
3. **PAUSE before clicking any move-forward button**
4. Watch console and chat

**Expected Pre-Fix Behavior (BUGGY):**
- After contact email entered, estimate displays
- **IMMEDIATELY (within 1-2 sec), reassuring message appears** ("Perfect — we sent this to our office...")
- **User has NOT clicked Yes/No buttons yet**
- Console shows: `LEAD_POST_START`, `LEAD_POST_OK` (message sent before user chose)
- Contact-only flows: Lead sent even though moveForward = 'UNSURE'

**Capture Evidence:**
- Screenshot: Chat showing reassuring message BEFORE move-forward buttons visible
- Console: Timestamp of LEAD_POST_OK vs. timestamp of user clicking move-forward button
- Network: POST /api/estimate shows wants_to_move_forward field (check value)

**Expected Post-Fix Behavior:**
- After contact email, estimate displays
- **Message does NOT appear**
- "Do you want to move forward?" buttons visible and user must click
- Only AFTER clicking "Yes, move forward" does:
  - Console show: `LEAD_GATE { moveForward: true, isContactOnly: false }`
  - `LEAD_POST_START`
  - Reassuring message appears

---

### Test Case #3: UI Duplication & Sheet Data

**Setup:**
- Deploy code
- Open sheet in second tab: https://docs.google.com/spreadsheets/d/1V0xoeseiVYzQB7TI873Sx_E3MmXOt2a3hO_qHdat8ms/

**Repro Steps:**
1. Complete full intake → contact flow
2. Watch chat messages
3. Once lead sent, check sheet for new row

**Expected Pre-Fix Behavior (BUGGY):**
- Chat shows estimate in **two places**:
  - Pinned sticky card at top (hides messages if scroll up)
  - "ESTIMATE SUMMARY" message in chat flow (duplicate)
- Sheet row shows "Gallons" = "2,500+" (raw string only, no numeric version)
- No columns for Gallons_Num, Gallons_Raw, Gallons_Plus_Flag

**Capture Evidence:**
- Screenshot: Chat showing estimate card + "ESTIMATE SUMMARY" message both visible
- Screenshot: Sheet row showing Gallons column only (no parsed/raw separation)
- Check if messages are scrolled off-screen when pinned card active

**Expected Post-Fix Behavior:**
- Estimate appears in **one place only**: pinned card (not in chat stream)
- Pinned card positioned **outside scroll container** (stays visible but doesn't hide messages)
- Sheet row has columns: Gallons_Raw="2,500+", Gallons_Num="2500", Gallons_Plus_Flag="true"

---

## Validation Checklist (Post-Fix)

### Unit: Gallons Parsing
- [ ] `parseGallonsInput("2,500+")` returns `{ raw: "2,500+", num: 2500, plus: true, status: "success" }`
- [ ] `parseGallonsInput("2500")` returns `{ raw: "2500", num: 2500, plus: false, status: "success" }`
- [ ] `parseGallonsInput("unsure")` returns `{ raw: "unsure", num: 0, plus: false, status: "unsure" }`
- [ ] Pricing engine receives `gallonsNum: 2500` and correctly selects 2500+ tier
- [ ] Console logs `GALLONS_PARSE { ... }` for each parse attempt (dev mode)

### Unit: Lead Gating
- [ ] maybeSendEstimateLead() requires moveForward !== 'UNSURE' for estimator flows
- [ ] maybeSendEstimateLead() runs immediately for contact-only flows (Septic, Jetting)
- [ ] handoffSuccess() only called after moveForward explicit (true/false)
- [ ] Console logs `LEAD_GATE { moveForward, isContactOnly, ... }` before POST

### Unit: UI & Data
- [ ] Pinned estimate card renders **outside scroll container**
- [ ] "ESTIMATE SUMMARY" message **not pushed** to chat when pinned card active
- [ ] Sheet row includes Gallons_Raw, Gallons_Num, Gallons_Plus_Flag columns
- [ ] Pinned card sticky position does NOT hide chat messages

### Integration: Full Flow (Estimator)
- [ ] User enters "2,500+" for gallons
- [ ] Pricing calculates with correct 2500+ tier
- [ ] After contact entry, estimate visible in pinned card (not chat)
- [ ] Move-forward prompt appears
- [ ] User clicks "Yes, move forward"
- [ ] Handoff message appears
- [ ] POST sent with gallons_num=2500, moveForward=true
- [ ] Sheet row populated with Gallons_Raw, Gallons_Num, Gallons_Plus_Flag

### Integration: Contact-Only Flow
- [ ] Service selected: "Septic / Holding Tank Pumping"
- [ ] Intake collected (no gallons needed)
- [ ] Manual estimate created
- [ ] Lead sent immediately (no move-forward gate)
- [ ] Handoff message appears (before move-forward exists)

### Regression: Existing Flows
- [ ] Contact-only flows still work (no gallons required)
- [ ] Numeric gallons (e.g., "1000") still parse correctly
- [ ] "UNSURE" gallons still work (unsure tier)
- [ ] Out-of-area lead capture still works (no estimate, just contact)

---

## Build & Type Validation

**After implementing all fixes:**

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Check build succeeds
npm run build

# Manual test on dev server
npm run dev
```

**Expected:** No TS errors, clean build, chat functional.

---

## Deployment Checklist

- [ ] All three commits implemented
- [ ] All tests pass
- [ ] git status shows 3 commits (one per fix)
- [ ] Push to main
- [ ] Vercel deploys automatically
- [ ] Production SHA recorded
- [ ] Sheet headers added (if permission granted)
- [ ] Live test with "2,500+" input on production

