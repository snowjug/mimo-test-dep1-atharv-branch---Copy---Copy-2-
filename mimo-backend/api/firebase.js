const admin = require("firebase-admin");
const fs = require("node:fs");
const path = require("node:path");

const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");

const loadServiceAccount = () => {
  if (fs.existsSync(serviceAccountPath)) {
    return require("./serviceAccountKey.json");
  }

  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;
  if (rawServiceAccount) {
    return JSON.parse(rawServiceAccount);
  }

  const encodedServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;
  if (encodedServiceAccount) {
    return JSON.parse(Buffer.from(encodedServiceAccount, "base64").toString("utf8"));
  }

  throw new Error(
    "Missing Firebase service account. Provide api/serviceAccountKey.json or set FIREBASE_SERVICE_ACCOUNT_JSON / FIREBASE_SERVICE_ACCOUNT_JSON_BASE64."
  );
};

const serviceAccount = loadServiceAccount();

const deriveDefaultBucket = () => {
  const projectId = serviceAccount?.project_id;
  if (!projectId) {
    return "";
  }

  // Firebase Storage default bucket format for this project.
  return `${projectId}.firebasestorage.app`;
};

const rawStorageBucket =
  process.env.FIREBASE_STORAGE_BUCKET ||
  process.env.FIREBASE_BUCKET ||
  deriveDefaultBucket();

const storageBucket = rawStorageBucket.replace(/^gs:\/\//, "").replace(/^https?:\/\//, "");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket,
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { db, bucket };