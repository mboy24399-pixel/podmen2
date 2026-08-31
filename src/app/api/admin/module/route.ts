import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireRole } from "@/lib/server-auth";
import { fail, ok } from "@/lib/api-response";

const map: Record<string, string[]> = {
  content: ["tracks", "albums", "artists", "podcasts", "episodes"],
  "audio-sources": ["audioSources"],
  users: ["users"],
  roles: ["roles"],
  payments: ["payments", "orders"],
  subscriptions: ["subscriptions"],
  plans: ["plans"],
  moderation: ["reports", "moderationQueue"],
  reports: ["reports"],
  security: ["securityEvents"],
  logs: ["auditLogs", "webhookEvents"],
  system: ["systemConfig"],
  database: ["users", "tracks", "orders", "payments"],
  health: ["users", "tracks", "orders"],
  notifications: ["notifications"],
  maintenance: ["systemConfig"],
};

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ["ADMIN", "SUPER_ADMIN", "EDITOR", "MODERATOR"]);
    if (!adminDb) return fail("Admin database is not configured", 503);
    const module = String(request.nextUrl.searchParams.get("module") || "").trim().toLowerCase();
    const collections = map[module];
    if (!collections) return fail("Unknown admin module", 400);
    const data = await Promise.all(collections.map(async (collection) => {
      try {
        const snap = await adminDb.collection(collection).limit(50).get();
        return { collection, count: snap.size, items: snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })).slice(0, 20) };
      } catch (error) {
        console.error(`Admin module collection read failed: ${collection}`, error);
        return { collection, count: 0, items: [], error: "Collection unavailable" };
      }
    }));
    return ok({ module, collections: data, generatedAt: Date.now() });
  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED") return fail("Authentication required", 401);
    if (error?.message === "FORBIDDEN") return fail("Forbidden", 403);
    console.error("Admin module load failed", error);
    return fail("Unable to load admin module", 500);
  }
}
