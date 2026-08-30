"use client";

export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import { Heart } from "lucide-react";
import TrackCard from "@/components/tracks/TrackCard";
import { Track } from "@/types";
import { useToast } from "@/components/ui/Toast";

const FAV_TRACKS: Track[] = [
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
];

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<string[]>(["track_1"]);
  const { showToast } = useToast();

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <Heart className="w-8 h-8 text-red-500 fill-current" /> Favorite Tracks
        </h1>
        <p className="text-dark-muted text-sm mt-1">Your liked songs and bookmarked podcast episodes.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {FAV_TRACKS.map((track) => (
          <TrackCard
            key={track.id}
            track={track}
            onPlay={(t) => showToast(`Playing ${t.title}`)}
            onToggleFavorite={() => showToast("Removed from favorites")}
            isFavorite={true}
          />
        ))}
      </div>
    </div>
  );
}
