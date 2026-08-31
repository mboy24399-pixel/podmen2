import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/server-auth";
import { fail, ok } from "@/lib/api-response";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!adminDb) return fail("Server is not configured", 503);
    let userId: string | null = null;
    try { userId = (await requireUser(request)).uid; } catch { /* free content may be public */ }

    let snap = await adminDb.collection("tracks").doc(params.id).get();
    let data = snap.data();
    if (!snap.exists) {
      snap = await adminDb.collection("episodes").doc(params.id).get();
      data = snap.data();
    }
    if (!snap.exists || !data || data.status !== "PUBLISHED") return fail("Audio not found", 404);

    if (data.accessType === "PREMIUM") {
      if (!userId) return fail("Premium access requires sign-in", 401);
      const userSnap = await adminDb.collection("users").doc(userId).get();
      const expiry = Number(userSnap.data()?.subscriptionExpiry || 0);
      if (userSnap.data()?.isSubscribed !== true || expiry <= Date.now()) return fail("Premium subscription required", 403);
    }

    const audioUrl = String(data.audioUrl || "");
    if (!audioUrl.startsWith("https://")) return fail("Audio source is unavailable", 503);
    return ok({ audioUrl, accessType: data.accessType });
  } catch {
    return fail("Unable to resolve audio", 500);
  }
}
