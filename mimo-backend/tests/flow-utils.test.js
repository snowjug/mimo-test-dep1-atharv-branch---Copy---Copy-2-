const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeApiError,
  buildUploadApiResponse,
  summarizeOps,
  detectOpsAlerts,
} = require("../api/flow-utils");

test("normalizeApiError provides safe fallback shape", () => {
  const normalized = normalizeApiError(null, "sample_code", "Sample message");
  assert.equal(normalized.code, "sample_code");
  assert.equal(normalized.message, "Sample message");
  assert.equal(normalized.details, null);
});

test("buildUploadApiResponse computes totals from completed files only", () => {
  const response = buildUploadApiResponse(
    [
      { status: "completed", pageCount: 2, amount: 4.6 },
      { status: "completed", pageCount: 3, amount: 6.9 },
      { status: "failed", pageCount: 8, amount: 18.4 },
    ],
    3
  );

  assert.equal(response.filesUploaded, 3);
  assert.equal(response.completedFiles, 2);
  assert.equal(response.failedFiles, 1);
  assert.equal(response.totalPages, 5);
  assert.equal(response.amount, 11.5);
  assert.equal(response.status, "partial_success");
});

test("summarizeOps + detectOpsAlerts flags queue backlog and low virtual stock", () => {
  const summary = summarizeOps({
    pendingConversionCount: 20,
    pendingPaymentCount: 10,
    paidReadyCount: 3,
    kiosks: [
      { kioskId: "A", status: { paperLevelPercent: 18, tonerLevelPercent: 60 } },
      { kioskId: "B", status: { paperLevelPercent: 65, tonerLevelPercent: 10 } },
      { kioskId: "C", status: { paperLevelPercent: 60, tonerLevelPercent: 55 } },
    ],
  });

  const alerts = detectOpsAlerts(summary, { backlogThreshold: 25 });
  const codes = alerts.map((a) => a.code).sort();

  assert.equal(summary.queue.backlogScore, 30);
  assert.equal(summary.virtualStock.lowStockCount, 2);
  assert.deepEqual(codes, ["queue_backlog_high", "virtual_stock_low"]);
});
