# Runtime Validation Guide - 2-Event Architecture

## Phase 1: Pre-Deployment Checklist

### Code Quality ✅
```
TypeScript:     0 errors  ✅
Production:     243.85 kB (gzip 75.73 kB)  ✅
Dependencies:   @upstash/redis, @upstash/qstash installed  ✅
Commits:        4 total (c0fad1f, 198d132, ff36599)  ✅
```

### Git History ✅
```
commit ff36599 (HEAD -> main)
  Commit 4: Hardening patches
  - Duplicate QStash scheduling prevention (hqScheduled flag)
  - Event B late arrival handling (payload check)
  - Event A failure user visibility (fallback messages)
  - URL normalization (VERCEL_URL priority)

commit 198d132
  Commit 3: Frontend 2-event POSTs

commit c0fad1f
  Commit 1: Backend 2-event architecture
```

---

## Phase 2: Environment Setup (Vercel Dashboard)

Set the following environment variables in Vercel project settings:

```
UPSTASH_REDIS_REST_URL=https://your-upstash-redis-url.com
UPSTASH_REDIS_REST_TOKEN=your-redis-token
QSTASH_TOKEN=your-qstash-token
QSTASH_CURRENT_SIGNING_KEY=your-signing-key
HQ_EMAIL_DELAY_SECONDS=120
RESEND_API_KEY=your-resend-api-key
GOOGLE_SHEETS_WEBHOOK=https://your-sheets-webhook
```

---

## Phase 3: Runtime Testing (Browser)

### Setup: Open Developer Tools
1. Open app at deployed URL
2. Open Chrome DevTools → Network tab
3. Filter for `/api/estimate` requests
4. Keep Resend dashboard open in another tab

### Test 1: Event A - Estimate Created

**Steps:**
1. Enter customer info: name, phone, email, address
2. Estimate shows in chat
3. **CRITICAL:** DO NOT click "Move Forward" yet
4. Watch Network tab

**Expected Results:**

Event A POST Request:
```
POST /api/estimate
Headers:
  Content-Type: application/json

Body (Request):
{
  "leadEvent": "estimate_created",
  "quoteId": "quote-123",
  "customer": {
    "name": "John Doe",
    "phone": "555-1234",
    "email": "john@example.com",
    "address": "123 Main St"
  },
  "estimate": { ... }
}

Response (200 OK):
{
  "success": true,
  "quoteId": "quote-123",
  "redisPayloadStored": true,
  "qstashScheduled": true,
  "messageId": "msg_123"
}
```

**UI Indicators:**
- ✅ Estimate appears in chat
- ✅ NO "Move Forward" button (should wait for backend readiness signal)
- ✅ Status message: "Recording your estimate... QStash scheduled"

**Redis State Created:**
- Key: `greasy:lead:quote-123:payload` → Full payload stored
- Key: `greasy:lead:quote-123:state` → `{quoteId, decision: PENDING, hqScheduled: 1, hqSent: 0}`

**QStash Scheduled:**
- Message scheduled for delivery in 120 seconds
- Vercel logs show: `QSTASH_SCHEDULED {quoteId, delaySeconds: 120, messageId}`

---

### Test 2: Event B - Move Forward Decision

**Prerequisite:** Event A POST succeeded (see Test 1)

**Steps:**
1. Wait for "Move Forward" button to appear (triggered by Event A response)
2. Click "Move Forward"
3. Chat shows handoff request: "Should we proceed?"
4. User clicks "YES" (or "NO")
5. Watch Network tab for 2nd POST

**Expected Results:**

Event B POST Request (User clicked YES):
```
POST /api/estimate
Headers:
  Content-Type: application/json

Body (Request):
{
  "leadEvent": "move_forward_decided",
  "quoteId": "quote-123",
  "decision": "YES",
  "customer": { ... }
}

Response (200 OK):
{
  "success": true,
  "quoteId": "quote-123",
  "decisionRecorded": true,
  "customerEmailSent": true,
  "messageId": "resend_cust_456"
}
```

**UI Indicators:**
- ✅ Chat shows: "Decision recorded: YES"
- ✅ Status message: "We'll follow up with your customer"

**Redis State Updated:**
- Key: `greasy:lead:quote-123:state` → `{decision: YES, decisionAt: <timestamp>, hqScheduled: 1}`

**Customer Email Sent (Resend):**
- Resend dashboard shows: 1 email to customer (john@example.com) with messageId
- Email subject: "Next Steps for Your Service Estimate"
- Email contains estimate + next steps

---

### Test 3: Async HQ Email (120-second delay)

**Prerequisite:** Event A POST succeeded (see Test 1)

**Wait:** 120+ seconds after Event A POST

**Expected Results:**

QStash Webhook Execution:
```
POST /api/hq-send (called by QStash after 120s)
Headers:
  Upstash-Signature: <JWT signature>

Body (from Event A):
{
  "quoteId": "quote-123"
}

Response (200 OK):
{
  "success": true,
  "hqEmailSent": true,
  "messageId": "resend_hq_789",
  "decisionStatus": "YES"
}
```

**Vercel Logs:**
- Should show `/api/hq-send` execution at ~120s mark
- Log message: `HQ_EMAIL_SENT {quoteId, delaySeconds: 120, decisionStatus: YES, messageId}`

**Resend Dashboard:**
- Total emails now: 2 (1 customer + 1 HQ)
- HQ email to `hq@allinsanitation.com`
- Email subject: "New Service Request (Decision: YES)"
- Email contains: Full estimate + customer contact + decision status

**Redis State Final:**
- Key: `greasy:lead:quote-123:state` → `{decision: YES, hqScheduled: 1, hqSent: 1, hqMessageId: resend_hq_789, hqSentAt: <timestamp>}`

---

### Test 4: Sheet State Verification

**Expected Sheet Rows:**

Row 1 (Created by Event A):
```
| quoteId   | status  | customer_name | phone      | email                |
|-----------|---------|---------------|------------|----------------------|
| quote-123 | PENDING | John Doe      | 555-1234   | john@example.com     |
```

Row 2 (Updated by Event B):
```
| quoteId   | status | decision | decided_at           | email_sent |
|-----------|--------|----------|----------------------|------------|
| quote-123 | ACTIVE | YES      | 2026-02-04T22:30:00Z | true       |
```

---

### Test 5: Customer Email Rule Verification

**Scenario A: User clicks YES**
- Event B POST sends customer email ✅
- Resend dashboard shows messageId for customer email

**Scenario B: User clicks NO**
- Event B POST does NOT send customer email ✅
- Resend dashboard shows only HQ email (no customer)
- Chat shows: "We'll document this decision"

---

### Test 6: Hardening Validation

#### Test 6.1: Duplicate QStash Scheduling (hqScheduled flag)

**Steps:**
1. Complete Event A POST (see Test 1)
2. In browser console, manually POST Event A again (simulating retry)
3. Watch Vercel logs and Resend dashboard

**Expected Results:**
- Vercel logs: 1st POST shows `hqScheduled=1` and schedules QStash
- Vercel logs: 2nd POST (retry) shows `ALREADY_SCHEDULED` (no duplicate)
- Resend dashboard: Only 1 HQ email arrives (not 2)
- Final state: `hqScheduled: 1` (idempotent)

#### Test 6.2: Event B Late Arrival (Payload check)

**Steps:**
1. Simulate Event A failure: Delete Redis payload manually
   ```bash
   redis-cli DEL "greasy:lead:quote-123:payload"
   ```
2. Trigger Event B POST (user clicks YES)
3. Watch Vercel logs

**Expected Results:**
- Vercel logs: Event B shows warning `PAYLOAD_MISSING`
- Event B still sends customer email (doesn't fail)
- Chat shows: "Decision recorded: YES" (no user-visible error)

#### Test 6.3: Event A Failure UI Message (Fallback)

**Steps:**
1. Disable Redis (simulate Event A failure)
2. Try to generate estimate
3. Watch chat for error message

**Expected Results:**
- Chat shows fallback message:
  ```
  "We had trouble recording your estimate. 
   Please call/text 555-1234 or continue to schedule a follow-up."
  ```
- No silent failure
- User has clear next step

---

## Phase 4: Idempotency Validation

### Test 7: Re-trigger Event A (Page refresh during Event A)

**Steps:**
1. Start Event A POST
2. Immediately refresh page (before response)
3. Browser auto-retries POST
4. Wait 120s for QStash execution

**Expected Results:**
- 1st Event A POST: `hqScheduled=1`, QStash scheduled
- 2nd Event A POST (retry): `ALREADY_SCHEDULED`, no new QStash job
- At 120s: Only 1 HQ email arrives (not 2)

### Test 8: Re-trigger Event B (User clicks YES twice)

**Steps:**
1. Complete Event A and Event B with YES
2. Before handoff page clears, click YES again (rapid double-click)
3. Watch Network tab and Resend

**Expected Results:**
- 1st Event B POST: `customerEmailSent=true`, messageId
- 2nd Event B POST: State already has `decision=YES`, handled gracefully
- Resend: Only 1 customer email (not 2)

---

## Phase 5: Production Evidence Collection

### Screenshots Required (For Deployment Proof)

1. **Chrome Network Tab (Event A + Event B)**
   - Show 2 POST requests to `/api/estimate`
   - Expand each request to show:
     - Request body (leadEvent, quoteId)
     - Response status (200 OK)
     - Response body (success, messageId)

2. **Vercel Logs (120-second window)**
   - Show Event A POST: `QSTASH_SCHEDULED`
   - Show QStash execution at 120s: `HQ_EMAIL_SENT`
   - Copy-paste full log lines

3. **Resend Dashboard**
   - Show 2 emails: 1 customer (Event B), 1 HQ (QStash)
   - Copy messageIds for both
   - Show email subject lines and recipient

4. **Sheet Row State**
   - Screenshot showing:
     - Row 1: quoteId, PENDING, customer_name, phone
     - Row 2: quoteId, ACTIVE, YES/NO decision, timestamp

5. **Chat UI**
   - Show estimate in chat
   - Show "Move Forward" button
   - Show handoff request ("Should we proceed?")
   - Show final decision recorded message

---

## Phase 6: Error Scenarios (Optional Hardening Validation)

### Scenario 1: QStash fails to schedule
- Event A POST still succeeds (returns 200)
- Chat shows estimate
- HQ email never arrives
- **Fix:** Check QSTASH_TOKEN and QSTASH_CURRENT_SIGNING_KEY

### Scenario 2: Redis unavailable
- Event A POST fails
- Chat shows fallback message
- User can retry or call
- **Fix:** Check UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN

### Scenario 3: Customer email fails
- Event B POST still succeeds (returns 200)
- HQ email still arrives at 120s
- **Fix:** Check RESEND_API_KEY

### Scenario 4: Webhook signature verification fails
- /api/hq-send rejects request
- HQ email not sent
- **Fix:** Verify QSTASH_CURRENT_SIGNING_KEY matches signing key in QStash console

---

## ✅ Ready to Deploy When

- [ ] All Phase 3 tests (1-6) pass
- [ ] Phase 4 idempotency tests pass
- [ ] Phase 5 evidence collected
- [ ] No silent failures
- [ ] All emails arrive with correct recipients
- [ ] Sheet state matches expected rows

---

## Rollback Plan

If production issues found:

1. **Revert to previous commit:**
   ```bash
   git revert ff36599  # Hardening
   git revert 198d132  # Frontend
   git revert c0fad1f  # Backend
   ```

2. **Redeploy to Vercel**

3. **Notify HQ if HQ emails affected**

---

## Notes

- Event A should NOT show "Move Forward" immediately (backend should signal when ready)
- Event B should only appear after Event A succeeds
- QStash delay is 120 seconds (can test with HQ_EMAIL_DELAY_SECONDS=10 first)
- All errors should be visible in chat (no silent failures)
- Sheet webhook should fire for each event
