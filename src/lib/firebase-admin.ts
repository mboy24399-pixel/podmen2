import admin from "firebase-admin";

function readServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.private_key) parsed.private_key = String(parsed.private_key).replace(/\\n/g, "\n");
      return parsed;
    } catch (error) {
      console.error("Firebase Admin: FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON");
    }
  }
  let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
  if (privateKey) {
    if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) privateKey = privateKey.slice(1, -1);
    privateKey = privateKey.replace(/\\n/g, "\n");
  }
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) return null;
  return { projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey };
}

if (!admin.apps.length) {
  const serviceAccount = readServiceAccount();
  if (serviceAccount) {
    try {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount as admin.ServiceAccount) });
    } catch (error: any) {
      console.error("Firebase Admin initialization error:", error?.message || error);
    }
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;
export default admin;
