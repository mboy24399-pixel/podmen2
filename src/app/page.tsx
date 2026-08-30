"use client";

export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import { Play, Sparkles, TrendingUp, Radio } from "lucide-react";
import TrackCard from "@/components/tracks/TrackCard";
import GlobalPlayer from "@/components/player/GlobalPlayer";
import { Track } from "@/types";
import { useToast } from "@/components/ui/Toast";

const MOCK_TRACKS: Track[] = [
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
  {
    id: "track_3",
    title: "Midnight Jazz Lounge",
    slug: "midnight-jazz-lounge",
    description: "Smooth saxophones and warm upright bass from an underground NYC club.",
    thumbnailUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    categoryId: "jazz",
    creatorId: "creator_3",
    accessType: "FREE",
    status: "PUBLISHED",
    featured: false,
    explicitContent: false,
    language: "en",
    releaseDate: Date.now(),
    duration: 310,
    playCount: 2300,
    likeCount: 512,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "track_4",
    title: "Future of AI Podcast #42",
    slug: "future-of-ai-podcast-42",
    description: "Deep dive into artificial general intelligence, safety, and creative coding.",
    thumbnailUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    categoryId: "podcast",
    creatorId: "creator_4",
    accessType: "PREMIUM",
    status: "PUBLISHED",
    featured: true,
    explicitContent: false,
    language: "en",
    releaseDate: Date.now(),
    duration: 1840,
    playCount: 4100,
    likeCount: 980,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export default function HomePage() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [favorites, setFavorites] = useState<string[]>(["track_1"]);
  const { showToast } = useToast();

  const toggleFavorite = (trackId: string) => {
    if (favorites.includes(trackId)) {
      setFavorites(favorites.filter((id) => id !== trackId));
      showToast("Removed from favorites");
    } else {
      setFavorites([...favorites, trackId]);
      showToast("Added to favorites");
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-dark-surface via-dark-card to-dark-surface border border-dark-border p-8 md:p-12 shadow-skeuo overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-accent opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-dark font-bold text-xs shadow-skeuo-btn">
            <Sparkles className="w-3.5 h-3.5" /> PODMEN X EXCLUSIVE
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            Immersive Audio & Podcast Streaming
          </h1>
          <p className="text-dark-muted text-sm md:text-base leading-relaxed">
            Experience lossless-grade streaming, AI-powered discovery, and premium podcasts crafted for creators and audiophiles.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={() => {
                setCurrentTrack(MOCK_TRACKS[0]);
                showToast(`Playing ${MOCK_TRACKS[0].title}`);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-dark font-bold rounded-xl shadow-skeuo-btn hover:scale-105 transition"
            >
              <Play className="w-5 h-5 fill-current" /> Listen Now
            </button>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-accent" /> Featured Tracks & Podcasts
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {MOCK_TRACKS.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              onPlay={(t) => {
                setCurrentTrack(t);
                showToast(`Now playing: ${t.title}`);
              }}
              onToggleFavorite={toggleFavorite}
              isFavorite={favorites.includes(track.id)}
            />
          ))}
        </div>
      </div>

      {/* Persistent Audio Player */}
      <GlobalPlayer
        currentTrack={currentTrack}
        queue={MOCK_TRACKS}
        onNext={() => {
          if (!currentTrack) return;
          const currentIndex = MOCK_TRACKS.findIndex((t) => t.id === currentTrack.id);
          const nextTrack = MOCK_TRACKS[(currentIndex + 1) % MOCK_TRACKS.length];
          setCurrentTrack(nextTrack);
        }}
        onPrev={() => {
          if (!currentTrack) return;
          const currentIndex = MOCK_TRACKS.findIndex((t) => t.id === currentTrack.id);
          const prevTrack = MOCK_TRACKS[(currentIndex - 1 + MOCK_TRACKS.length) % MOCK_TRACKS.length];
          setCurrentTrack(prevTrack);
        }}
        onToggleFavorite={toggleFavorite}
        isFavorite={currentTrack ? favorites.includes(currentTrack.id) : false}
      />
    </div>
  );
}
