import admin from "firebase-admin";

let formattedPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
if (formattedPrivateKey) {
  formattedPrivateKey = formattedPrivateKey.trim();
  if (
    (formattedPrivateKey.startsWith('"') && formattedPrivateKey.endsWith('"')) ||
    (formattedPrivateKey.startsWith("'") && formattedPrivateKey.endsWith("'"))
  ) {
    formattedPrivateKey = formattedPrivateKey.slice(1, -1);
  }
  formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, "\n");
}

if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && formattedPrivateKey) {
  try {
    if (!formattedPrivateKey.includes("-----BEGIN PRIVATE KEY-----")) {
      console.warn("Firebase Admin warning: FIREBASE_PRIVATE_KEY does not appear to be a valid PEM private key.");
    } else {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: formattedPrivateKey,
        }),
      });
    }
  } catch (error: any) {
    console.error("Firebase Admin initialization error:", error.message || error);
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;
export default admin;
