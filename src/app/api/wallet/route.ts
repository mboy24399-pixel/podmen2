import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/server-auth";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireUser(request);
    if (!adminDb) return fail("Wallet service is not configured", 503);
    const [userSnap, ledgerSnap] = await Promise.all([
      adminDb.collection("users").doc(user.uid).get(),
      adminDb.collection("coinLedger").where("uid", "==", user.uid).limit(50).get(),
    ]);
    if (!userSnap.exists) return fail("Profile not found", 404);
    const ledger = ledgerSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => Number(b.createdAt?.toMillis?.() || b.createdAt || 0) - Number(a.createdAt?.toMillis?.() || a.createdAt || 0));
    return ok({ coinBalance: Math.max(0, Math.floor(Number(userSnap.data()?.coinBalance || 0))), ledger });
  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED") return fail("Authentication required", 401);
    console.error("[wallet] failed", error);
    return fail("Unable to load wallet", 500);
  }
}
