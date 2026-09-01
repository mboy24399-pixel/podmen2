import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/server-auth";
import { applyCoinLedger } from "@/lib/coins";
import { ok, fail } from "@/lib/api-response";

export async function POST(request: NextRequest, { params }: { params: { tournamentId: string } }) {
  try {
    const { user } = await requireUser(request);
    if (!adminDb) return fail("Server is not configured", 503);
    const tournamentRef = adminDb.collection("tournaments").doc(params.tournamentId);
    const entryRef = tournamentRef.collection("entries").doc(user.uid);
    const now = Date.now();
    const result = await adminDb.runTransaction(async (tx) => {
      const [tourSnap, entrySnap] = await Promise.all([tx.get(tournamentRef), tx.get(entryRef)]);
      if (!tourSnap.exists) throw new Error("TOURNAMENT_NOT_FOUND");
      if (entrySnap.exists) return { duplicate: true, fee: 0 };
      const t = tourSnap.data() || {};
      if (!["OPEN", "REGISTRATION_OPEN"].includes(String(t.status))) throw new Error("TOURNAMENT_CLOSED");
      if (t.startsAt && Number(t.startsAt) <= now) throw new Error("REGISTRATION_CLOSED");
      const maxPlayers = Math.max(1, Math.floor(Number(t.maxPlayers || 0)));
      const joined = Math.max(0, Math.floor(Number(t.joinedPlayers || 0)));
      if (maxPlayers && joined >= maxPlayers) throw new Error("TOURNAMENT_FULL");
      const fee = Math.max(0, Math.floor(Number(t.entryCoins || 0)));
      tx.create(entryRef, { userId: user.uid, tournamentId: params.tournamentId, status: "CONFIRMED", fee, joinedAt: now });
      tx.update(tournamentRef, { joinedPlayers: joined + 1, updatedAt: now });
      return { duplicate: false, fee };
    });
    if (!result.duplicate && result.fee > 0) await applyCoinLedger({ uid: user.uid, direction: "DEBIT", amount: result.fee, reason: "TOURNAMENT_ENTRY", source: "tournament", sourceId: params.tournamentId });
    const userSnap = await adminDb.collection("users").doc(user.uid).get();
    return ok({ joined: true, duplicate: result.duplicate, entryFee: result.fee, coinBalance: Number(userSnap.data()?.coinBalance || 0) });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return fail("Authentication required", 401);
    if (e?.message === "TOURNAMENT_NOT_FOUND") return fail("Tournament not found", 404);
    if (["TOURNAMENT_CLOSED", "REGISTRATION_CLOSED", "TOURNAMENT_FULL", "INSUFFICIENT_COINS"].includes(e?.message)) return fail(e.message.replaceAll("_", " "), 409);
    console.error("[tournaments/join] failed", e);
    return fail("Unable to join tournament", 500);
  }
}
