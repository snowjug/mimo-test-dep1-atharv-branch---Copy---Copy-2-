const PRICE_PER_PAGE = 2.3;

const normalizeApiError = (error, fallbackCode = "internal_error", fallbackMessage = "Something went wrong") => {
  if (!error) {
    return {
      code: fallbackCode,
      message: fallbackMessage,
      details: null,
    };
  }

  return {
    code: error.code || fallbackCode,
    message: error.message || fallbackMessage,
    details: error.details || error.response?.data || null,
  };
};

const buildUploadApiResponse = (results, filesUploaded) => {
  const completed = results.filter((item) => item.status === "completed");
  const failed = results.filter((item) => item.status === "failed");

  const totalPages = completed.reduce((sum, item) => sum + Number(item.pageCount || 0), 0);
  const amount = completed.reduce((sum, item) => {
    const itemAmount = Number(item.amount || Number((Number(item.pageCount || 0) * PRICE_PER_PAGE).toFixed(2)));
    return sum + itemAmount;
  }, 0);

  return {
    message: failed.length > 0 ? "Some files failed to process" : "Files uploaded and processed",
    filesUploaded,
    completedFiles: completed.length,
    failedFiles: failed.length,
    totalPages,
    amount: Number(amount.toFixed(2)),
    status: failed.length > 0 ? "partial_success" : "ready",
    files: results,
  };
};

const summarizeOps = ({ pendingConversionCount, pendingPaymentCount, paidReadyCount, kiosks = [] }) => {
  const lowStockKiosks = kiosks.filter((kiosk) => {
    const paper = Number(kiosk?.status?.paperLevelPercent ?? 100);
    const toner = Number(kiosk?.status?.tonerLevelPercent ?? 100);
    return paper <= 20 || toner <= 15;
  });

  return {
    queue: {
      pendingConversionCount,
      pendingPaymentCount,
      paidReadyCount,
      backlogScore: pendingConversionCount + pendingPaymentCount,
    },
    virtualStock: {
      lowStockCount: lowStockKiosks.length,
      lowStockKiosks: lowStockKiosks.map((kiosk) => ({
        kioskId: kiosk.kioskId || kiosk.id || "unknown",
        paperLevelPercent: Number(kiosk?.status?.paperLevelPercent ?? 100),
        tonerLevelPercent: Number(kiosk?.status?.tonerLevelPercent ?? 100),
      })),
    },
  };
};

const detectOpsAlerts = (opsSummary, thresholds = {}) => {
  const alerts = [];
  const backlogThreshold = Number(thresholds.backlogThreshold || 25);

  if (opsSummary.queue.backlogScore >= backlogThreshold) {
    alerts.push({
      code: "queue_backlog_high",
      severity: "high",
      message: `Queue backlog is high (${opsSummary.queue.backlogScore})`,
      context: opsSummary.queue,
    });
  }

  if (opsSummary.virtualStock.lowStockCount > 0) {
    alerts.push({
      code: "virtual_stock_low",
      severity: "medium",
      message: `${opsSummary.virtualStock.lowStockCount} kiosk(s) are below virtual stock thresholds`,
      context: opsSummary.virtualStock,
    });
  }

  return alerts;
};

module.exports = {
  PRICE_PER_PAGE,
  normalizeApiError,
  buildUploadApiResponse,
  summarizeOps,
  detectOpsAlerts,
};
