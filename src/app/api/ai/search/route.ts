import { NextResponse } from "next/server";
import { callGeminiAPI } from "@/lib/gemini";
import { adminAuth } from "@/lib/firebase-admin";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const searchSchema = z.object({
  query: z.string().min(1).max(200),
  catalog: z.array(z.any()).max(50).optional(), // limit catalog context to 50 items
});

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!adminAuth) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Rate limiting: 10 requests per 1 minute per user
    if (!checkRateLimit(`search_${userId}`, 10, 60 * 1000)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await request.json();
    const parsed = searchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload length or format" }, { status: 400 });
    }

    const { query, catalog } = parsed.data;

    const prompt = `A user is searching for music/podcasts with query: "${query}". Here is available track catalog summary: ${JSON.stringify(catalog?.slice(0, 20) || [])}. Return a JSON array of matching track IDs or relevance reasoning.`;

    const aiResponse = await callGeminiAPI(prompt);
    return NextResponse.json({ result: aiResponse });
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "AI semantic search failed" }, { status: 500 });
  }
}
