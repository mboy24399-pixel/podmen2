"use client";

export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import { Compass, Filter } from "lucide-react";
import TrackCard from "@/components/tracks/TrackCard";
import { Track } from "@/types";
import { useToast } from "@/components/ui/Toast";

const EXPLORE_TRACKS: Track[] = [
  {
    id: "exp_1",
    title: "Cosmic Odyssey",
    slug: "cosmic-odyssey",
    description: "Ambient space synth chords and deep drone textures.",
    thumbnailUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    categoryId: "ambient",
    creatorId: "creator_1",
    accessType: "FREE",
    status: "PUBLISHED",
    featured: false,
    explicitContent: false,
    language: "en",
    releaseDate: Date.now(),
    duration: 340,
    playCount: 950,
    likeCount: 210,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "exp_2",
    title: "Tech Founders Unplugged",
    slug: "tech-founders-unplugged",
    description: "Candid conversations with Silicon Valley innovators and engineers.",
    thumbnailUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    categoryId: "podcast",
    creatorId: "creator_2",
    accessType: "PREMIUM",
    status: "PUBLISHED",
    featured: true,
    explicitContent: false,
    language: "en",
    releaseDate: Date.now(),
    duration: 2100,
    playCount: 3400,
    likeCount: 820,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export default function ExplorePage() {
  const [category, setCategory] = useState("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const { showToast } = useToast();

  const categories = ["all", "ambient", "electronic", "jazz", "podcast"];
  const filtered = category === "all" ? EXPLORE_TRACKS : EXPLORE_TRACKS.filter((t) => t.categoryId === category);

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((f) => f !== id));
      showToast("Removed from favorites");
    } else {
      setFavorites([...favorites, id]);
      showToast("Added to favorites");
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Compass className="w-8 h-8 text-accent" /> Explore Catalog
          </h1>
          <p className="text-dark-muted text-sm mt-1">Discover trending tracks, hand-curated playlists, and podcasts.</p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition ${
                category === cat
                  ? "bg-accent text-dark shadow-skeuo-btn"
                  : "bg-dark-card text-dark-muted hover:text-white border border-dark-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((track) => (
          <TrackCard
            key={track.id}
            track={track}
            onPlay={(t) => showToast(`Playing ${t.title}`)}
            onToggleFavorite={toggleFavorite}
            isFavorite={favorites.includes(track.id)}
          />
        ))}
      </div>
    </div>
  );
}
