"use client";

export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import TrackCard from "@/components/tracks/TrackCard";
import { Track } from "@/types";
import { useToast } from "@/components/ui/Toast";

const ALL_CATALOG: Track[] = [
  {
    id: "track_1",
    title: "Neon Horizon",
    slug: "neon-horizon",
    description: "Synthwave electronic journey across futuristic cyberpunk landscapes.",
    thumbnailUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    categoryId: "electronic",
    creatorId: "creator_1",
    accessType: "FREE",
    status: "PUBLISHED",
    featured: true,
    explicitContent: false,
    language: "en",
    releaseDate: Date.now(),
    duration: 372,
    playCount: 1420,
    likeCount: 320,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "track_2",
    title: "Deep Focus Ambient",
    slug: "deep-focus-ambient",
    description: "Relaxing atmospheric soundscapes designed for deep concentration and flow.",
    thumbnailUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    categoryId: "ambient",
    creatorId: "creator_2",
    accessType: "PREMIUM",
    status: "PUBLISHED",
    featured: true,
    explicitContent: false,
    language: "en",
    releaseDate: Date.now(),
    duration: 420,
    playCount: 890,
    likeCount: 245,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const results = ALL_CATALOG.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleAiSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, catalog: ALL_CATALOG }),
      });
      const data = await res.json();
      setAiResult(data.result || "AI semantic search completed.");
    } catch (error) {
      showToast("AI search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <Search className="w-8 h-8 text-accent" /> Semantic & Normal Search
        </h1>
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, vibe, or description..."
            className="flex-1 bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent shadow-skeuo-inset"
          />
          <button
            onClick={handleAiSearch}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 bg-accent text-dark font-bold rounded-xl shadow-skeuo-btn hover:scale-105 transition disabled:opacity-50 text-sm"
          >
            <Sparkles className="w-4 h-4 fill-current" /> {loading ? "Analyzing..." : "Gemini AI Search"}
          </button>
        </div>
      </div>

      {aiResult && (
        <div className="bg-dark-card border border-accent/40 rounded-2xl p-6 shadow-skeuo space-y-2">
          <h3 className="text-sm font-bold text-accent flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Gemini AI Insights
          </h3>
          <p className="text-sm text-dark-muted whitespace-pre-wrap">{aiResult}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {results.map((track) => (
          <TrackCard
            key={track.id}
            track={track}
            onPlay={(t) => showToast(`Playing ${t.title}`)}
            onToggleFavorite={() => {}}
            isFavorite={false}
          />
        ))}
      </div>
    </div>
  );
}
