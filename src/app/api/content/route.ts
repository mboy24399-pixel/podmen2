import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const collections = ["tracks", "podcasts", "episodes"] as const;

export async function GET() {
  try {
    if (!adminDb) return NextResponse.json({ ok: false, error: "Content service is not configured" }, { status: 503 });
    const results = await Promise.all(collections.map(async (collection) => {
      const snap = await adminDb.collection(collection).where("status", "==", "PUBLISHED").limit(100).get();
      return [collection, snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))] as const;
    }));
    const data = Object.fromEntries(results);
    return NextResponse.json({ ok: true, data, generatedAt: Date.now() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Public content load failed", error);
    return NextResponse.json({ ok: false, error: "Unable to load published content" }, { status: 500 });
  }
}
