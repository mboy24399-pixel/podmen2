import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/server-auth";
import { fail, ok } from "@/lib/api-response";

async function optionalUser(request: NextRequest) {
  try { return await requireUser(request); } catch { return null; }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!adminDb) return fail("Playback service is not configured", 503);
    const user = await optionalUser(request);
    let found: { collection: string; data: FirebaseFirestore.DocumentData } | null = null;
    for (const collection of ["tracks", "episodes"]) {
      const snap = await adminDb.collection(collection).doc(params.id).get();
      if (snap.exists) { found = { collection, data: snap.data() || {} }; break; }
    }
    if (!found) return fail("Audio not found", 404);
    if (found.data.status !== "PUBLISHED") return fail("Audio unavailable", 404);
    const premium = String(found.data.accessType || "FREE").toUpperCase() === "PREMIUM";
    if (premium) {
      if (!user) return fail("Premium subscription required", 401);
      const profile = (await adminDb.collection("users").doc(user.uid).get()).data() || {};
      const expiry = Number(profile.subscriptionExpiry || profile.trialEndsAt || 0);
      const entitled = profile.subscriptionStatus === "ACTIVE" || (profile.subscriptionStatus === "TRIAL" && expiry > Date.now()) || (profile.isSubscribed === true && expiry > Date.now());
      if (!entitled) return fail("Premium subscription required", 402);
    }
    const audioUrl = String(found.data.audioUrl || "");
    if (!/^https:\/\//i.test(audioUrl)) return fail("Audio source unavailable", 503);
    return ok({ id: params.id, title: String(found.data.title || ""), description: String(found.data.description || ""), thumbnailUrl: String(found.data.thumbnailUrl || found.data.coverUrl || ""), audioUrl, accessType: premium ? "PREMIUM" : "FREE", duration: Number(found.data.duration || 0), collection: found.collection });
  } catch (error) {
    console.error("Playback resolution failed", error);
    return fail("Unable to resolve playback", 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!adminDb) return fail("Playback service is not configured", 503);
    const user = await requireUser(request);
    const body = await request.json().catch(() => ({}));
    const now = Date.now();
    const streamRef = adminDb.collection("streams").doc();
    await streamRef.set({ id: streamRef.id, userId: user.uid, contentId: params.id, event: String(body.event || "play").slice(0, 32), position: Math.max(0, Number(body.position || 0)), createdAt: now });
    const trackRef = adminDb.collection("tracks").doc(params.id);
    const episodeRef = adminDb.collection("episodes").doc(params.id);
    const target = (await trackRef.get()).exists ? trackRef : (await episodeRef.get()).exists ? episodeRef : null;
    if (target) await target.update({ playCount: (await target.get()).data()?.playCount ? Number((await target.get()).data()?.playCount) + 1 : 1, updatedAt: now });
    return ok({ recorded: true }, 201);
  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED") return fail("Authentication required", 401);
    console.error("Playback event failed", error);
    return fail("Unable to record playback event", 500);
  }
}
