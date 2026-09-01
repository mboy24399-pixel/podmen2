import { adminDb } from "@/lib/firebase-admin";
import { fail, ok } from "@/lib/api-response";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    if (!adminDb) return fail("Leaderboard service is not configured", 503);
    const snapshot = await adminDb.collection("users").limit(100).get();
    const players = snapshot.docs.map(doc => {
      const data = doc.data();
      return { uid: doc.id, displayName: data.displayName || data.email?.split("@")[0] || "Player", photoURL: data.photoURL || "", totalWins: Number(data.totalWins || 0), totalTournaments: Number(data.totalTournaments || 0), coinBalance: Number(data.coinBalance || 0) };
    }).sort((a, b) => b.totalWins - a.totalWins || b.totalTournaments - a.totalTournaments || b.coinBalance - a.coinBalance).slice(0, 50);
    return ok({ players });
  } catch (error) {
    console.error("[leaderboard] failed", error);
    return fail("Unable to load leaderboard", 500);
  }
}
