# Greasy Chat – Canonical Context & Plan

## Goal
Fix the Greasy chat intake flow so it is deterministic, stable, and never asks the wrong question.

The chat must:
- Never "guess" what step it is on
- Never ask system/parking/gallons while still collecting business name + address
- Never show generic prompts like “Could you clarify?”
- Never depend on Gemini for quoting logic

---

## Non-Negotiable Constraints
- Touch ONLY: components/ChatInterface.tsx
- Minimal diff, no refactors
- No new UI sections
- No Maps / geocoding / tools
- Pricing logic stays as-is (calculateServiceEstimate)
- Suggestion chips are strictly gated
- conversationStep is the single source of truth

---

## Conversation Steps (Source of Truth)

ASK_BUSINESS_NAME_ADDRESS (default)
ASK_SYSTEM_TYPE
ASK_GALLONS
ASK_PARKING_DISTANCE
CONFIRM_QUOTE
SHOW_QUOTE

---

## Step 1 – Hard Gate Flow
- conversationStep exists and controls everything
- No step advances unless required data for that step is captured
- ASK_BUSINESS_NAME_ADDRESS always runs before any Gemini call

---

## Step 2 – Business Name + Address Parsing (CRITICAL)

When conversationStep === ASK_BUSINESS_NAME_ADDRESS:

### Address heuristic (case-insensitive)

looksLikeAddress(text) === true if EITHER:

A) Leading number + street token  
(st|street|rd|road|ave|avenue|blvd|boulevard|pkwy|parkway|dr|drive|ln|lane|way|ct|court|pl|place|ter|terrace|cir|circle)

OR

B) Comma + state + zip  
`, CA 91354` or `, NY 10001-1234`

---

### Allowed outcomes ONLY

A) **Name + Address present**
→ store both  
→ advance to next step

B) **Address only**
→ store address  
→ DO NOT advance  
→ reply exactly:
> “Thanks — what’s the business name?”

C) **Name only**
→ store name  
→ DO NOT advance  
→ reply exactly:
> “Got it — what’s the address?”

D) **Parsing fails**
→ reply exactly:
> “What’s your business name and address?”

❌ Never say:
- “Could you clarify?”
- “System type or address?”

---

## Step 3 – Suggestion Chips (STRICT)

- Suggestions derived ONLY from conversationStep
- Render chips ONLY when:
  conversationStep === ASK_PARKING_DISTANCE
- Chips must be exactly:
['50','100','150','200','Unsure']
- All other steps → suggestions = []

---

## Step 4 – Gemini Safety & Reliability

- Gemini wrapped in Promise.race timeout (12s)
- inFlight ref lock to prevent double sends
- setIsLoading(false) ALWAYS in finally

### Error messages (exact)

- 401 / 403:
  “Chat key not authorized. Please request a manual quote.”
- 429:
  “Chat is busy. Try again in 30 seconds.”
- Else:
  “Chat temporarily unavailable. Please request a manual quote.”

---

## Step 5 – Quote Flow (Gemini-Independent)

When user confirms quote:
- Call calculateServiceEstimate() immediately
- DO NOT call Gemini
- If inputs missing → ask missing question instead

---

## Manual Test Checklist

- Refresh → type “hello”
  - Greeting + ask business name & address
  - NO chips

- Paste address only:
  “27800 McBean Pkwy Valencia, CA 91354”
  → “Thanks — what’s the business name?”

- Paste name only:
  “Taco Bell”
  → “Got it — what’s the address?”

- Chips appear ONLY at parking distance step
