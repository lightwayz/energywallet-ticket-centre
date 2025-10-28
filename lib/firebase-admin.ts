import * as admin from "firebase-admin";

if (!admin.apps.length) {
    const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

    if (!base64) {
        throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_BASE64 env var");
    }

    const serviceAccount = JSON.parse(
        Buffer.from(base64, "base64").toString("utf8")
    );

    if (!serviceAccount.project_id) {
        throw new Error("Decoded service account missing project_id");
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
