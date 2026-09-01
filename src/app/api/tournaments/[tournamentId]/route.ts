import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireRole } from "@/lib/server-auth";
import { fail, ok } from "@/lib/api-response";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_request: NextRequest, { params }: { params: { tournamentId: string } }) {
  try {
    if (!adminDb) return fail("Tournament service is not configured", 503);
    const ref = adminDb.collection("tournaments").doc(params.tournamentId);
    const snapshot = await ref.get();
    if (!snapshot.exists) return fail("Tournament not found", 404);
    const [entriesSnapshot, matchesSnapshot] = await Promise.all([
      ref.collection("entries").limit(256).get(),
      ref.collection("matches").limit(256).get(),
    ]);
    const entries = entriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const matches = matchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => Number(a.round || 0) - Number(b.round || 0) || Number(a.matchNumber || 0) - Number(b.matchNumber || 0));
    return ok({ tournament: { id: snapshot.id, ...snapshot.data() }, entries, matches });
  } catch (error) {
    console.error("[tournament] detail failed", error);
    return fail("Unable to load tournament", 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { tournamentId: string } }) {
  try {
    await requireRole(request, ["ADMIN", "SUPER_ADMIN", "EDITOR"]);
    if (!adminDb) return fail("Tournament service is not configured", 503);
    const ref = adminDb.collection("tournaments").doc(params.tournamentId);
    const snapshot = await ref.get();
    if (!snapshot.exists) return fail("Tournament not found", 404);
    const body = await request.json();
    const allowed = ["title", "game", "description", "rules", "format", "status", "maxPlayers", "entryCoins", "prizeCoins", "startsAt", "registrationEndsAt", "coverUrl"];
    const update: Record<string, unknown> = { updatedAt: Date.now() };
    for (const key of allowed) if (body?.[key] !== undefined) update[key] = body[key];
    if (update.maxPlayers !== undefined) update.maxPlayers = Math.max(2, Math.floor(Number(update.maxPlayers)) || 2);
    if (update.entryCoins !== undefined) update.entryCoins = Math.max(0, Math.floor(Number(update.entryCoins)) || 0);
    if (update.prizeCoins !== undefined) update.prizeCoins = Math.max(0, Math.floor(Number(update.prizeCoins)) || 0);
    await ref.update(update);
    const next = await ref.get();
    return ok({ tournament: { id: next.id, ...next.data() } });
  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED") return fail("Authentication required", 401);
    if (error?.message === "FORBIDDEN") return fail("Forbidden", 403);
    console.error("[tournament] update failed", error);
    return fail("Unable to update tournament", 500);
  }
}
