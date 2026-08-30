import { NextResponse } from "next/server";
import { callGeminiAPI } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const { userPreferences, history } = await request.json();
    const prompt = `Based on user listening history and preferences (${JSON.stringify(userPreferences)}), recommend 3 music or podcast genres/vibes and provide a short friendly recommendation summary.`;

    const aiResponse = await callGeminiAPI(prompt);
    return NextResponse.json({ recommendation: aiResponse });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "AI recommendation failed" }, { status: 500 });
  }
}
