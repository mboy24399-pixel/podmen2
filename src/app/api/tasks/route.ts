import { NextRequest } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/server-auth";
import { ok, fail } from "@/lib/api-response";

const createSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(2000).default(""),
  type: z.enum(["LISTEN", "FOLLOW", "SHARE", "CUSTOM"]),
  rewardCoins: z.number().int().min(1).max(100000),
  target: z.number().int().min(1).max(1000000).default(1),
  startsAt: z.number().int().optional(),
  endsAt: z.number().int().optional(),
  active: z.boolean().default(true),
});

export async function GET() {
  if (!adminDb) return fail("Server is not configured", 503);
  try {
    const now = Date.now();
    const snap = await adminDb.collection("tasks").where("active", "==", true).limit(100).get();
    const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((task: any) => !task.startsAt || task.startsAt <= now).filter((task: any) => !task.endsAt || task.endsAt >= now);
    return ok({ items });
  } catch (e) {
    console.error("[tasks] list failed", e);
    return fail("Unable to load tasks", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireUser(request);
    if (!adminDb) return fail("Server is not configured", 503);
    const role = String((await adminDb.collection("users").doc(user.uid).get()).data()?.role || "USER");
    if (!["ADMIN", "SUPER_ADMIN"].includes(role)) return fail("Forbidden", 403);
    const input = createSchema.parse(await request.json());
    const now = Date.now();
    const ref = await adminDb.collection("tasks").add({ ...input, createdBy: user.uid, createdAt: now, updatedAt: now });
    await adminDb.collection("auditLogs").add({ actorId: user.uid, action: "TASK_CREATE", targetId: ref.id, createdAt: now });
    return ok({ id: ref.id, ...input, createdAt: now }, 201);
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return fail("Authentication required", 401);
    if (e?.name === "ZodError") return fail("Invalid task payload", 400);
    console.error("[tasks] create failed", e);
    return fail("Unable to create task", 500);
  }
}
