const path = require("node:path");

const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", "api", ".env") });
dotenv.config();

const { db } = require("../api/firebase");

const COLLECTION_NAME = "printJobs";
const PAGE_SIZE = 200;
const APPLY_CHANGES = process.argv.includes("--apply");

const nowMs = () => Date.now();

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key);

const normalizeStatus = (status) => {
  if (!status) return "uploaded";
  if (status === "paid") return "paid";
  if (status === "printing") return "printing";
  if (status === "completed") return "completed";
  if (status === "pending_conversion") return "uploaded";
  if (status === "pending") return "uploaded";
  return String(status);
};

const buildPatch = (docId, data) => {
  const createdAtMs = data.createdAt?.toMillis?.() || nowMs();
  const sourceName = data.sourceFileName || data.fileName || "unknown";

  const patch = {};

  if (!hasOwn(data, "jobId")) patch.jobId = docId;
  if (!hasOwn(data, "orderId")) patch.orderId = null;
  if (!hasOwn(data, "kioskId")) patch.kioskId = null;

  if (!hasOwn(data, "sourceFile")) {
    patch.sourceFile = {
      fileName: sourceName,
      originalExtension: path.extname(sourceName || "").toLowerCase() || null,
      mimeType: "application/octet-stream",
      fileSizeBytes: 0,
      uploadedAt: createdAtMs,
      uploadDurationMs: null,
    };
  }

  if (!hasOwn(data, "conversionDetails")) {
    patch.conversionDetails = {
      convertedAt: null,
      originalPageCount: typeof data.pageCount === "number" ? data.pageCount : null,
      actualPageCount: typeof data.pageCount === "number" ? data.pageCount : null,
      isConverting: false,
      conversionDurationMs: null,
      conversionSuccess: null,
      conversionError: null,
      storagePath: data.fileUrl || null,
      storageSizeBytes: 0,
    };
  }

  if (!hasOwn(data, "printOptions")) {
    patch.printOptions = {
      copies: Number(data.copies || 1),
      colorMode: data.color || "bw",
      layout: "single",
      pageSelection: "all",
      startPage: null,
      endPage: null,
      duplexMode: "simplex",
    };
  }

  if (!hasOwn(data, "pricing")) {
    const totalPages = Number(data.pageCount || 0) || null;
    const estimatedAmount = typeof data.cost === "number" ? data.cost : null;
    patch.pricing = {
      pricePerPage: 2.3,
      totalPages,
      copiesRequested: Number(data.copies || 1),
      totalPagesToPrint: totalPages,
      estimatedAmount,
      finalAmount: estimatedAmount,
      currency: "INR",
      taxPercent: 0,
      taxAmount: 0,
      discountCode: null,
      discountAmount: 0,
    };
  }

  if (!hasOwn(data, "paymentStatus")) {
    patch.paymentStatus = {
      status: data.status === "paid" ? "completed" : "pending",
      paymentMethod: "cashfree",
      transactionId: null,
      paidAt: null,
      paymentGatewayResponse: null,
    };
  }

  if (!hasOwn(data, "printStatus")) {
    patch.printStatus = {
      status: normalizeStatus(data.status),
      retrievedAt: null,
      printStartedAt: null,
      printCompletedAt: null,
      durationSeconds: null,
      printErrorCode: null,
      printErrorMessage: null,
      printerJobId: null,
    };
  }

  if (!hasOwn(data, "timeline")) {
    patch.timeline = {
      createdAt: createdAtMs,
      uploadedAt: createdAtMs,
      conversionStartedAt: null,
      conversionCompletedAt: null,
      orderCreatedAt: null,
      paymentInitiatedAt: null,
      paymentCompletedAt: null,
      retrievedAt: null,
      printStartedAt: null,
      printCompletedAt: null,
      expiresAt: null,
    };
  }

  if (!hasOwn(data, "metadata")) {
    patch.metadata = {
      ipAddress: null,
      userAgent: null,
      sessionId: null,
      tags: [],
    };
  }

  return patch;
};

const run = async () => {
  console.log(`Backfill mode: ${APPLY_CHANGES ? "APPLY" : "DRY-RUN"}`);
  console.log(`Collection: ${COLLECTION_NAME}`);

  let updatedDocs = 0;
  let scannedDocs = 0;
  let lastDoc = null;

  while (true) {
    let query = db.collection(COLLECTION_NAME).orderBy("createdAt").limit(PAGE_SIZE);
    if (lastDoc) query = query.startAfter(lastDoc);

    const snap = await query.get();
    if (snap.empty) break;

    if (APPLY_CHANGES) {
      const batch = db.batch();
      for (const doc of snap.docs) {
        scannedDocs += 1;
        const patch = buildPatch(doc.id, doc.data());
        if (Object.keys(patch).length > 0) {
          batch.set(doc.ref, patch, { merge: true });
          updatedDocs += 1;
        }
      }
      await batch.commit();
    } else {
      for (const doc of snap.docs) {
        scannedDocs += 1;
        const patch = buildPatch(doc.id, doc.data());
        if (Object.keys(patch).length > 0) {
          updatedDocs += 1;
          console.log(`Would update ${doc.id} with fields: ${Object.keys(patch).join(", ")}`);
        }
      }
    }

    lastDoc = snap.docs[snap.docs.length - 1];
    if (snap.size < PAGE_SIZE) break;
  }

  console.log(`Scanned documents: ${scannedDocs}`);
  console.log(`${APPLY_CHANGES ? "Updated" : "Would update"} documents: ${updatedDocs}`);
};

run()
  .then(() => {
    console.log("Backfill completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Backfill failed:", error.message);
    process.exit(1);
  });
