import { NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/server-auth";
import { ok, fail } from "@/lib/api-response";

export async function POST(request: NextRequest, { params }: { params: { tournamentId: string } }) {
  try {
    const { user } = await requireUser(request);
    if (!adminDb) return fail("Tournament service is not configured", 503);
    const db = adminDb;
    const tournamentRef = db.collection("tournaments").doc(params.tournamentId);
    const userRef = db.collection("users").doc(user.uid);
    const entryRef = tournamentRef.collection("entries").doc(user.uid);
    const ledgerRef = db.collection("coinLedger").doc(`debit_${user.uid}_tournament_${params.tournamentId}`.replace(/[^a-zA-Z0-9_-]/g, "_"));
    const now = Date.now();

    const result = await db.runTransaction(async (tx) => {
      const [tourSnap, entrySnap, userSnap, ledgerSnap] = await Promise.all([tx.get(tournamentRef), tx.get(entryRef), tx.get(userRef), tx.get(ledgerRef)]);
      if (!tourSnap.exists) throw new Error("TOURNAMENT_NOT_FOUND");
      if (!userSnap.exists) throw new Error("USER_NOT_FOUND");
      if (entrySnap.exists) return { duplicate: true, fee: 0, balance: Number(userSnap.data()?.coinBalance || 0) };
      const t = tourSnap.data() || {};
      if (!["OPEN", "REGISTRATION_OPEN"].includes(String(t.status))) throw new Error("TOURNAMENT_CLOSED");
      if (Number(t.startsAt || 0) <= now) throw new Error("REGISTRATION_CLOSED");
      if (t.registrationEndsAt && Number(t.registrationEndsAt) <= now) throw new Error("REGISTRATION_CLOSED");
      const maxPlayers = Math.max(2, Math.floor(Number(t.maxPlayers || 0)));
      const joined = Math.max(0, Math.floor(Number(t.joinedPlayers || 0)));
      if (joined >= maxPlayers) throw new Error("TOURNAMENT_FULL");
      const fee = Math.max(0, Math.floor(Number(t.entryCoins || 0)));
      const currentBalance = Math.max(0, Math.floor(Number(userSnap.data()?.coinBalance || 0)));
      const nextBalance = currentBalance - fee;
      if (nextBalance < 0) throw new Error("INSUFFICIENT_COINS");
      if (fee > 0 && !ledgerSnap.exists) {
        tx.update(userRef, { coinBalance: nextBalance, updatedAt: now });
        tx.create(ledgerRef, { uid: user.uid, direction: "DEBIT", amount: fee, reason: "TOURNAMENT_ENTRY", source: "tournament", sourceId: params.tournamentId, balanceBefore: currentBalance, balanceAfter: nextBalance, createdAt: FieldValue.serverTimestamp() });
      }
      tx.create(entryRef, { userId: user.uid, tournamentId: params.tournamentId, displayName: user.name || user.email?.split("@")[0] || "Player", photoURL: user.picture || "", status: "CONFIRMED", joinedAt: now, wins: 0, score: 0 });
      tx.update(tournamentRef, { joinedPlayers: joined + 1, updatedAt: now });
      return { duplicate: false, fee, balance: fee > 0 && !ledgerSnap.exists ? nextBalance : currentBalance };
    });

    return ok({ joined: true, duplicate: result.duplicate, entryFee: result.fee, coinBalance: result.balance });
  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED") return fail("Authentication required", 401);
    if (error?.message === "TOURNAMENT_NOT_FOUND") return fail("Tournament not found", 404);
    if (error?.message === "USER_NOT_FOUND") return fail("User profile not found", 404);
    if (["TOURNAMENT_CLOSED", "REGISTRATION_CLOSED", "TOURNAMENT_FULL", "INSUFFICIENT_COINS"].includes(error?.message)) return fail(error.message.replaceAll("_", " "), 409);
    console.error("[tournaments/join] failed", error);
    return fail("Unable to join tournament", 500);
  }
}
