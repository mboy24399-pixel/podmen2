import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/server-auth";
import { fail, ok } from "@/lib/api-response";

const TRIAL_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  let uid = "unknown";
  try {
    const user = await requireUser(request);
    uid = user.uid;
    if (!adminDb) return fail("Trial service is not configured", 503);

    const ref = adminDb.collection("users").doc(uid);
    const snap = await ref.get();
    const data = snap.data() || {};
    const now = Date.now();
    const existing = Number(data.trialStartedAt || 0);
    const existingEnd = Number(data.trialEndsAt || 0);

    if (existing || existingEnd || data.trialUsed === true) {
      return fail(existingEnd > now ? "Your free trial is already active" : "Your free trial has already been used", 409);
    }

    const trialEndsAt = now + TRIAL_MS;
    await ref.set({
      trialUsed: true,
      trialStartedAt: now,
      trialEndsAt,
      subscriptionStatus: "TRIAL",
      isSubscribed: true,
      updatedAt: now,
    }, { merge: true });

    await adminDb.collection("auditLogs").add({ actorId: uid, action: "TRIAL_START", targetId: uid, createdAt: now });
    return ok({ status: "TRIAL", trialEndsAt }, 201);
  } catch (error: any) {
    console.error("[subscriptions/trial] failed", { uid, name: error?.name, message: error?.message });
    if (error?.message === "UNAUTHORIZED") return fail("Authentication required", 401);
    return fail("Unable to start trial. Please retry; if it continues, check the account service configuration.", 500);
  }
}
