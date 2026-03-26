# Quick Reference: Deployment Commands

## 1. Pre-Deployment Verification

```bash
# Verify TypeScript (should show 0 errors)
npx tsc --noEmit --pretty false

# Verify production build
npm run build

# Check git status
git log --oneline -5
git status -sb
```

**Expected Output:**
```
TypeScript: No errors
Build: ✓ 32 modules transformed, 243.85 kB (gzip 75.73 kB)
Git: main branch, 7 commits total, clean working tree
```

---

## 2. Environment Variables Setup

### In Vercel Dashboard

Go to: **Project Settings → Environment Variables**

Add these variables:

```
UPSTASH_REDIS_REST_URL
  Value: https://your-upstash-redis-url.com
  Scopes: Production, Preview, Development

UPSTASH_REDIS_REST_TOKEN
  Value: <your-redis-token>
  Scopes: Production, Preview, Development

QSTASH_TOKEN
  Value: <your-qstash-token>
  Scopes: Production, Preview, Development

QSTASH_CURRENT_SIGNING_KEY
  Value: <your-signing-key>
  Scopes: Production, Preview, Development

HQ_EMAIL_DELAY_SECONDS
  Value: 120
  Scopes: Production, Preview, Development

RESEND_API_KEY
  Value: <your-resend-api-key>
  Scopes: Production, Preview, Development

GOOGLE_SHEETS_WEBHOOK
  Value: https://script.google.com/macros/d/{id}/usercontent
  Scopes: Production, Preview, Development
```

### Or via Vercel CLI

```bash
# If using Vercel CLI
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
vercel env add QSTASH_TOKEN
vercel env add QSTASH_CURRENT_SIGNING_KEY
vercel env add HQ_EMAIL_DELAY_SECONDS
vercel env add RESEND_API_KEY
vercel env add GOOGLE_SHEETS_WEBHOOK

# Verify
vercel env ls
```

---

## 3. Deploy to Vercel

```bash
# Option A: Push to GitHub (auto-deploys if Vercel connected)
git push origin main

# Option B: Deploy via Vercel CLI
vercel --prod

# Option C: Click "Deploy" in Vercel UI
# (after environment variables are set)
```

**Wait for:** Vercel shows "✓ Deployment complete" and URL

---

## 4. Runtime Testing (After Deployment)

### 4.1 Test Event A

1. Open deployed app
2. Enter customer info and estimate
3. **DO NOT click "Move Forward" yet**
4. Open Chrome DevTools → Network tab
5. Find `/api/estimate` POST request
6. Verify response: `"qstashScheduled": true`

### 4.2 Test Event B

1. Wait for "Move Forward" button
2. Click it
3. Select "YES" or "NO"
4. Watch Network tab for 2nd `/api/estimate` POST
5. Verify response: `"success": true`

### 4.3 Test QStash Webhook (120s)

1. Wait 120 seconds after Event A
2. Check Vercel logs: `vercel logs --prod`
3. Look for: `POST /api/hq-send` execution
4. Verify log: `HQ_EMAIL_SENT`

### 4.4 Verify Emails

1. Check Resend dashboard
2. Should see 2 emails:
   - HQ email (from Event A + QStash)
   - Customer email (from Event B, only if YES)

### 4.5 Verify Sheet State

1. Check Google Sheets webhook receiver
2. Should have 2 rows for same quoteId:
   - Row 1: status=PENDING (Event A)
   - Row 2: status=ACTIVE, decision=YES/NO (Event B)

---

## 5. Monitoring & Debugging

### Check Vercel Logs

```bash
# Real-time logs
vercel logs --prod --follow

# Last 50 lines
vercel logs --prod | head -50

# Filter for specific errors
vercel logs --prod | grep ERROR
vercel logs --prod | grep QSTASH
vercel logs --prod | grep hq-send
```

### Check Redis State (if needed)

```bash
# Requires UPSTASH_REDIS_REST_URL + TOKEN
# Via Upstash console:
1. Go to https://console.upstash.com
2. Select your Redis instance
3. Use built-in Redis CLI browser

# Commands:
GET greasy:lead:quote-123:state
GET greasy:lead:quote-123:payload
KEYS greasy:lead:*
```

### Check Resend Emails

```bash
# Via Resend dashboard: https://resend.com/emails
1. Click on message
2. View subject, recipient, status
3. Copy messageId for reference
```

---

## 6. Rollback (if needed)

```bash
# Revert all changes
git log --oneline | head -5  # See commits
git revert ff36599           # Hardening
git revert 198d132           # Frontend
git revert c0fad1f           # Backend

# Deploy
git push origin main

# Wait for Vercel to redeploy
```

---

## 7. Testing with Short Delay (DEV)

To test with faster delay (instead of 120s):

```bash
# In Vercel Environment Variables, set:
HQ_EMAIL_DELAY_SECONDS=10

# Test:
1. Event A POST
2. Wait 10 seconds
3. QStash should execute /api/hq-send
```

---

## 8. Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Event A POST returns error | Redis not set up | Check UPSTASH_REDIS_REST_URL/TOKEN |
| HQ email doesn't arrive | QStash not configured | Check QSTASH_TOKEN and QSTASH_CURRENT_SIGNING_KEY |
| Signature verification fails | Wrong signing key | Verify QSTASH_CURRENT_SIGNING_KEY in QStash console |
| Event B doesn't send email | RESEND_API_KEY missing | Check RESEND_API_KEY in env vars |
| VERCEL_URL is localhost | Not deployed to Vercel | Deploy to Vercel, don't test locally |

---

## 9. Full Testing Checklist

- [ ] TypeScript: 0 errors
- [ ] Build: Success
- [ ] Env vars: All set in Vercel
- [ ] Event A: POST succeeds, qstashScheduled=true
- [ ] Event B: POST succeeds, customerEmailSent=true (if YES)
- [ ] QStash: Executes /api/hq-send after 120s
- [ ] HQ Email: Arrives with decision status
- [ ] Customer Email: Only when YES
- [ ] Sheet: 2 rows with same quoteId
- [ ] Idempotency: Re-trigger Event A → no duplicate QStash
- [ ] Fallback: Event A failure → user sees message
- [ ] No errors: Vercel logs clean

---

## 10. Support Contacts

- **Upstash Support:** https://upstash.com/support
- **QStash Docs:** https://upstash.com/docs/qstash
- **Resend Support:** https://resend.com/support
- **Vercel Support:** https://vercel.com/help

---

## Summary

**Ready to deploy after:**
1. Set environment variables in Vercel ✅
2. Push code: `git push origin main` ✅
3. Wait for Vercel deployment ✅
4. Follow runtime testing checklist ✅

**Estimated time:**
- Setup env vars: 5 minutes
- Deploy: 2-5 minutes
- Runtime testing: 5 minutes (plus 120s QStash delay)
- Total: ~15 minutes

---

Generated: 2026-02-04 22:11 UTC
