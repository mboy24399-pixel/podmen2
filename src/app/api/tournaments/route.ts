import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireRole } from "@/lib/server-auth";
import { fail, ok } from "@/lib/api-response";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const allowedFormats = ["SINGLE_ELIMINATION", "ROUND_ROBIN", "FREE_FOR_ALL"] as const;
const allowedStatuses = ["DRAFT", "OPEN", "REGISTRATION_OPEN", "LIVE", "COMPLETED", "CANCELLED"] as const;

function normalizeNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback;
}

export async function GET(request: NextRequest) {
  try {
    if (!adminDb) return fail("Tournament service is not configured", 503);
    const requested = String(request.nextUrl.searchParams.get("status") || "").split(",").map(s => s.trim()).filter(Boolean);
    const snapshot = await adminDb.collection("tournaments").limit(100).get();
    let tournaments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    if (requested.length) tournaments = tournaments.filter(t => requested.includes(String(t.status)));
    tournaments.sort((a, b) => Number(a.startsAt || 0) - Number(b.startsAt || 0));
    return ok({ tournaments });
  } catch (error) {
    console.error("[tournaments] list failed", error);
    return fail("Unable to load tournaments", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireRole(request, ["ADMIN", "SUPER_ADMIN", "EDITOR"]);
    if (!adminDb) return fail("Tournament service is not configured", 503);
    const body = await request.json();
    const title = String(body?.title || "").trim();
    const game = String(body?.game || "").trim();
    if (title.length < 3 || game.length < 2) return fail("Title and game are required", 400);
    const format = allowedFormats.includes(body?.format) ? body.format : "SINGLE_ELIMINATION";
    const status = allowedStatuses.includes(body?.status) ? body.status : "DRAFT";
    const now = Date.now();
    const ref = adminDb.collection("tournaments").doc();
    const tournament = {
      title,
      game,
      description: String(body?.description || "").trim().slice(0, 2000),
      rules: String(body?.rules || "").trim().slice(0, 5000),
      format,
      status,
      maxPlayers: Math.max(2, normalizeNumber(body?.maxPlayers, 32)),
      joinedPlayers: 0,
      entryCoins: normalizeNumber(body?.entryCoins),
      prizeCoins: normalizeNumber(body?.prizeCoins),
      startsAt: normalizeNumber(body?.startsAt, now + 86400000),
      registrationEndsAt: normalizeNumber(body?.registrationEndsAt) || null,
      coverUrl: String(body?.coverUrl || "").trim().slice(0, 1000),
      organizerId: user.uid,
      createdAt: now,
      updatedAt: now,
    };
    await ref.set(tournament);
    return ok({ tournament: { id: ref.id, ...tournament } }, 201);
  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED") return fail("Authentication required", 401);
    if (error?.message === "FORBIDDEN") return fail("Forbidden", 403);
    console.error("[tournaments] create failed", error);
    return fail("Unable to create tournament", 500);
  }
}
