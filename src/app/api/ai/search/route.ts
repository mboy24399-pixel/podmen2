import { NextResponse } from "next/server";
import { callGeminiAPI } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const { query, catalog } = await request.json();
    const prompt = `A user is searching for music/podcasts with query: "${query}". Here is available track catalog summary: ${JSON.stringify(catalog?.slice(0, 20) || [])}. Return a JSON array of matching track IDs or relevance reasoning.`;

    const aiResponse = await callGeminiAPI(prompt);
    return NextResponse.json({ result: aiResponse });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "AI semantic search failed" }, { status: 500 });
  }
}
