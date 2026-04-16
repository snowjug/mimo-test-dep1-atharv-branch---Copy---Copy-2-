const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

const rawStorageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_BUCKET || "startup-bca3e.firebasestorage.app";
const storageBucket = rawStorageBucket.replace(/^gs:\/\//, "").replace(/^https?:\/\//, "");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket,
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { db, bucket };