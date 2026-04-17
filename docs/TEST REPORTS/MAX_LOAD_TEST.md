# 🔥 Max Load Smoke Test (Stress & Concurrency)

**Date**: April 17, 2026  
**Test Type**: Stress testing, concurrent users, edge cases, max payload  
**Backend**: Northflank (0.2 vCPU, 512MB)  
**Expected Outcome**: System should handle 3-5 concurrent operations before degrading

---

## Test Scenarios

### 📊 Scenario 1: Sequential Single User (Baseline)

**Goal**: Verify one user's complete flow works perfectly

```bash
User 1: Upload PDF (5 pages) → Checkout → Pay → Get PIN → Print
```

**Expected Results**:
- ✅ Upload latency: < 500ms
- ✅ Checkout latency: 2-5s (file conversion)
- ✅ Payment: < 1s
- ✅ PIN generation: < 100ms
- ✅ Print dispatch: < 1s (cache hit)
- **Total time**: ~7-10 seconds

**Failure Thresholds**:
- ❌ Upload > 2s
- ❌ Checkout > 15s
- ❌ Payment error
- ❌ PIN not generated
- ❌ Print fails

---

### 🔥 Scenario 2: 3 Concurrent Users (Free Tier Limit)

**Goal**: Test system at near-max capacity

```
User 1: Upload PDF (5 pages)        [0ms]
User 2: Upload PDF (10 pages)       [100ms]
User 3: Upload PDF (3 pages)        [200ms]
User 1: Checkout                    [500ms]
User 2: Checkout                    [600ms]
User 3: Checkout                    [700ms]
User 1: Pay → Get PIN → Print       [~5s]
User 2: Pay → Get PIN → Print       [~5s]
User 3: Pay → Get PIN → Print       [~5s]
```

**Expected Results** (Northflank free tier):
- ✅ All 3 users complete successfully OR 2 users succeed with 1 queued
- ✅ No pod crashes
- ✅ Memory stays < 450MB
- ✅ At least 1 user prints within 20s

**Failure Thresholds**:
- ❌ Any pod restart/crash
- ❌ Memory spike > 500MB
- ❌ > 1 user gets timeout (>30s per operation)
- ❌ Order creation fails for any user
- ❌ PIN generation fails

---

### 💥 Scenario 3: 5 Concurrent Users (Stress Test)

**Goal**: Find breaking point and graceful degradation

```
User 1: Upload (50 pages)        [0ms]    ← Large file
User 2: Upload (50 pages)        [50ms]   ← Large file
User 3: Checkout (while 1,2 uploading) [100ms]
User 4: Upload (10 pages)        [150ms]
User 5: Checkout (while all uploading) [200ms]
User 1: Checkout                 [300ms]
User 2: Checkout                 [400ms]
User 3: Print immediately        [500ms]
User 4: Checkout                 [600ms]
User 5: Print immediately        [700ms]
```

**Expected Results**:
- ⚠️ **Likely degradation**: 2-3 operations time out (>30s) OR queue with 503 retry-after
- ⚠️ **Pod memory**: May spike to 480-510MB
- ✅ At least 2-3 users succeed completely
- ✅ No pod **crash** (graceful degradation)
- ✅ Operations that timeout return proper 503 error

**Acceptable Failures**:
- ⚠️ User 5's print gets 503 "Printer busy" → retry succeeds
- ⚠️ User 4's checkout delays 5-10s due to queue
- ⚠️ Memory spikes to 480MB (within free tier limit)

**Critical Failures** (test fails):
- ❌ Pod crashes/restarts
- ❌ Memory exceeds 512MB (OOM kill)
- ❌ Users get 500 errors (server error, not 503)
- ❌ Data loss (job lost mid-conversion)

---

### 📈 Scenario 4: Max File Size

**Goal**: Test conversion system with largest supported files

```bash
User 1: Upload 100MB PDF (500 pages)
User 2: Upload 50MB DOCX (250 pages)
User 3: Upload 25MB Image (100 pages)
```

**Expected Results**:
- ✅ User 1: Download timeout at 30s, then converts partially OR 503 retry
- ✅ User 2: Converts successfully (~20-30s)
- ✅ User 3: Converts quickly (~2-3s)

**Failure Thresholds**:
- ❌ Memory spike > 512MB (OOM)
- ❌ Conversion hangs indefinitely (>60s no response)
- ❌ Pod crash

---

### 💰 Scenario 5: Max Order Amount

**Goal**: Test payment flow with high amounts

```bash
User 1: 500 pages → ₹1,150 order
User 2: 1000 pages → ₹2,300 order
User 3: 100 pages → ₹230 order
```

**Expected Results**:
- ✅ Cashfree accepts orders
- ✅ Payment processes
- ✅ PIN generated correctly
- ✅ No precision errors (₹ calculations exact)

**Checks**:
- ✅ amount = pageCount * 2.3 (no floating-point errors)
- ✅ Cashfree order_amount matches backend calculation
- ✅ Coins earned calculated correctly

---

### 🔄 Scenario 6: Rapid PIN Lookups (Kiosk Spam)

**Goal**: Test kiosk with rapid PIN entry attempts

```bash
Kiosk User 1: Enter PIN "1234" → [0ms]
Kiosk User 1: Enter PIN "1234" again → [100ms]
Kiosk User 2: Enter PIN "5678" → [150ms]
Kiosk User 1: Enter PIN "1234" again → [200ms]
Kiosk User 3: Enter PIN "9999" → [250ms]  ← Invalid PIN
Kiosk User 1: Enter PIN "1234" again → [300ms]
```

**Expected Results**:
- ✅ Valid PINs return documents (multiple times OK)
- ✅ Invalid PIN returns 404
- ✅ No rate limiting (should process all)
- ✅ Each lookup < 200ms

**Failure Thresholds**:
- ❌ Timeout on valid PIN
- ❌ Cache miss after prefetch

---

### 🚨 Scenario 7: Cache Overflow

**Goal**: Test cache system under memory pressure

```bash
User 1: Upload PDF → Pay → Get PIN "1111" → Prefetch PDF (cache size: 5MB)
User 2: Upload PDF → Pay → Get PIN "2222" → Prefetch PDF (cache size: 10MB)
User 3: Upload PDF → Pay → Get PIN "3333" → Prefetch PDF (cache size: 15MB)
...repeat until cache cleanup triggers...
User N: Print → Cache should still hit
```

**Expected Results**:
- ✅ Cache cleanup removes expired PDFs every 5 minutes
- ✅ No memory leak
- ✅ Cache hit rate stays 70%+

---

### ⏱️ Scenario 8: Timeout Recovery

**Goal**: Test graceful degradation when timeouts occur

```bash
Backend pause 6+ seconds during /kiosk/print

User 1: PIN → Print
├─ Tries to download PDF (5s timeout)
├─ Times out
├─ Resets job to status="paid"
└─ Returns 503 "System busy, retry after 10s"

User 1: Retry immediately
├─ PDF in cache now (prefetched)
├─ Prints successfully
```

**Expected Results**:
- ✅ First attempt: 503 error (not 500)
- ✅ Job reverted to safe state (status="paid")
- ✅ Second attempt succeeds (cache hit)

---

## Test Execution Plan

### Phase 1: Manual Single User (Baseline)
```bash
1. Upload PDF (5 pages)
2. Check backend logs for:
   - File upload time
   - Conversion time
   - pageCount extracted
3. Checkout → verify pages/amount shown
4. Pay with test card
5. Verify PIN generated
6. Kiosk: Enter PIN
7. Print → check Raspberry Pi output
```

**Expected**: All steps complete in < 15s total

---

### Phase 2: Load Test with 3 Users (Concurrent)

**Option A: Manual (slow)**
```bash
Terminal 1: Open https://mimo-web-nine.vercel.app (User 1)
Terminal 2: Open https://mimo-web-nine.vercel.app (User 2)
Terminal 3: Open https://mimo-web-nine.vercel.app (User 3)

All three upload files simultaneously
All three proceed to checkout
All three pay simultaneously
```

**Option B: Automated Script (fast)**
```bash
# Run this in backend to simulate 3 users
node << 'EOF'
const API = "http://localhost:3000";
const token = process.env.TEST_TOKEN;

async function testUser(userId, fileName) {
  const file = fs.readFileSync(fileName);
  
  // 1. Upload
  const upload = await fetch(`${API}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  console.log(`User ${userId} upload:`, upload.status);
  
  // 2. Checkout
  const order = await fetch(`${API}/create-order`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`User ${userId} checkout:`, order.status);
}

Promise.all([
  testUser(1, "test1.pdf"),
  testUser(2, "test2.pdf"),
  testUser(3, "test3.pdf")
]);
EOF
```

---

### Phase 3: Stress Test with 5 Users

Run the same load test but with 5 concurrent users and monitor:

```bash
# Watch memory in Northflank
watch -n 1 'curl http://localhost/health | jq .memory'

# Watch backend logs in real-time
tail -f northflank.log | grep -E "PDF|conversion|timeout|memory"
```

---

## Monitoring Checklist

During tests, monitor these metrics in real-time:

```bash
# Backend health
$ curl http://localhost:3000/health
{
  "status": "ok",
  "uptime": 123,
  "memory": { "used": 234, "total": 512 }  ← Should stay < 450MB
}

# Northflank Pod CPU/Memory (via dashboard)
- CPU: Should stay 10-50% (0.2 vCPU max)
- Memory: Should stay < 450MB (512MB max)
- Restarts: Should be 0

# Logs to check
$ grep -E "processPendingConversionsForUser|PDF conversion|timeout|error|500|503" logs.txt
```

---

## Expected Behavior Matrix

| Scenario | Users | Expected Outcome | Risk |
|----------|-------|------------------|------|
| Single user flow | 1 | ✅ All succeed | Low |
| Concurrent uploads | 3 | ✅ All succeed | Medium |
| Concurrent checkouts | 3 | ✅ 2-3 succeed | Medium |
| Concurrent prints | 3 | ✅ 2-3 print, 1 queues | High |
| **Stress test** | 5 | ⚠️ 2-3 succeed, 2+ timeout | **HIGH** |
| **5x concurrent conversions** | 5 | ⚠️ 1-2 succeed, others queue | **CRITICAL** |

---

## Failure Recovery

If test fails at any stage:

### 1. Memory Spike (> 480MB)
```bash
# Check what's eating memory
$ ps aux | grep node

# If cache is problem
$ # Check /internal/process-conversions cleanup logs
$ # May need to increase cleanup frequency (currently 5 min)
```

### 2. Pod Restart
```bash
# Check Northflank pod restart logs
# If repeated: indicates OOM or crash loop
# Solution: Reduce concurrent operations or upgrade to paid tier
```

### 3. Timeout Errors
```bash
# This is expected under load (graceful degradation)
# Check that:
# - Errors are 503 (not 500)
# - Jobs revert to safe state
# - Retry succeeds
```

### 4. Order Creation Fails
```bash
# Check Firestore printJobs collection
# Verify jobs have status="pending" (not pending_conversion)
# If stuck: run /internal/process-conversions manually
```

---

## Pass/Fail Criteria

### ✅ TEST PASSES if:
- [x] Scenario 1 (single user): All steps complete < 15s
- [x] Scenario 2 (3 users): At least 2 users complete successfully
- [x] Scenario 3 (5 users): No pod crash, graceful degradation (503 errors acceptable)
- [x] Scenario 4 (large files): Conversions don't hang indefinitely
- [x] Scenario 6 (kiosk spam): All lookups respond < 500ms
- [x] Scenario 7 (cache): Hit rate > 50%

### ❌ TEST FAILS if:
- ❌ Any scenario causes pod crash/restart
- ❌ Memory exceeds 512MB (OOM kill)
- ❌ Any user gets 500 error (server exception)
- ❌ Jobs are lost or stuck permanently
- ❌ Data corruption (wrong pageCount, wrong amount)

---

## Performance Baselines (Track These)

Create a before/after comparison:

| Metric | Before Optimization | After Optimization | Target |
|--------|---------------------|-------------------|--------|
| Upload latency (1 user) | 5-15s | <500ms | ✅ 97% faster |
| Checkout latency (1 user) | N/A | 2-5s | ✅ Conversion during checkout |
| Print latency (cached) | 3-8s | <1s | ✅ 87% faster |
| Print latency (5 concurrent) | 20-45s | 5-12s | ✅ 60-75% faster |
| Payment failure rate | 12.2% | <3% | ✅ Expected improvement |
| Cache hit rate | N/A | 70%+ | ✅ 70% PDF reuse |
| Memory usage (idle) | ?MB | <200MB | ✅ Lean |
| Memory usage (3 users) | OOM crash | <450MB | ✅ No crash |

---

## Sign-Off

**Tester**: ___________________  
**Date**: ___________________  
**Result**: ✅ PASS / ⚠️ DEGRADED / ❌ FAIL  

**Scenario Results**:
- Scenario 1 (single user): ___________________
- Scenario 2 (3 concurrent): ___________________
- Scenario 3 (5 concurrent): ___________________
- Scenario 4 (large files): ___________________
- Scenario 6 (kiosk spam): ___________________
- Scenario 7 (cache): ___________________

**Issues Found**: ___________________  
**Recommended Actions**: ___________________

---

## Rollback Plan

If stress test reveals critical issues:

```bash
# 1. Revert to known-good commit
git log --oneline
# Find last working commit before de0b1a4

# 2. Redeploy to Northflank
git checkout <commit-hash>
# Wait for auto-deploy

# 3. Verify old behavior
curl http://localhost:3000/health

# 4. Post-mortem
# - Document what broke
# - Create issue for fix
# - Plan incremental improvement
```

