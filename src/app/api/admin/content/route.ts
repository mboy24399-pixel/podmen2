import { NextRequest } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { requireRole } from "@/lib/server-auth";
import { fail, ok } from "@/lib/api-response";

const schema = z.object({
  type: z.enum(["tracks", "podcasts", "episodes"]),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).default(""),
  audioUrl: z.string().url().refine((v) => v.startsWith("https://"), "HTTPS audio URL required").max(4000),
  accessType: z.enum(["FREE", "PREMIUM"]).default("FREE"),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]).default("DRAFT"),
  thumbnailUrl: z.string().url().max(4000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireRole(request, ["ADMIN", "SUPER_ADMIN", "EDITOR"]);
    if (!adminDb) return fail("Server is not configured", 503);
    const input = schema.parse(await request.json());
    const collection = input.type;
    const ref = adminDb.collection(collection).doc();
    const now = Date.now();
    const slug = `${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${ref.id.slice(0, 6)}`;
    await ref.set({
      id: ref.id, title: input.title, slug, description: input.description,
      audioUrl: input.audioUrl, accessType: input.accessType, status: input.status,
      thumbnailUrl: input.thumbnailUrl || "", creatorId: user.uid, playCount: 0, likeCount: 0,
      createdAt: now, updatedAt: now,
    });
    await adminDb.collection("auditLogs").add({ actorId: user.uid, action: "CONTENT_CREATE", collection, targetId: ref.id, createdAt: now });
    return ok({ id: ref.id, slug }, 201);
  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED") return fail("Authentication required", 401);
    if (error?.message === "FORBIDDEN") return fail("Forbidden", 403);
    if (error?.name === "ZodError") return fail("Invalid content payload", 400);
    return fail("Unable to create content", 500);
  }
}
