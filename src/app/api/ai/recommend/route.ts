import { NextResponse } from "next/server";
import { callGeminiAPI } from "@/lib/gemini";
import { adminAuth } from "@/lib/firebase-admin";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const recommendSchema = z.object({
  userPreferences: z.array(z.string()).max(10),
  history: z.array(z.any()).max(30).optional(),
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

    // Rate limiting: 5 requests per 1 minute per user
    if (!checkRateLimit(`recommend_${userId}`, 5, 60 * 1000)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await request.json();
    const parsed = recommendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload length or format" }, { status: 400 });
    }

    const { userPreferences, history } = parsed.data;

    const prompt = `Based on user listening history and preferences (${JSON.stringify(userPreferences)}), recommend 3 music or podcast genres/vibes and provide a short friendly recommendation summary.`;

    const aiResponse = await callGeminiAPI(prompt);
    return NextResponse.json({ recommendation: aiResponse });
  } catch (error: any) {
    console.error("Recommend API Error:", error);
    return NextResponse.json({ error: "AI recommendation failed" }, { status: 500 });
  }
}
