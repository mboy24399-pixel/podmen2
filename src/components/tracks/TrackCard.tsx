"use client";

import React from "react";
import { Play, Heart, Crown } from "lucide-react";
import { Track } from "@/types";

interface TrackCardProps {
  track: Track;
  onPlay: (track: Track) => void;
  onToggleFavorite: (trackId: string) => void;
  isFavorite: boolean;
}

export default function TrackCard({ track, onPlay, onToggleFavorite, isFavorite }: TrackCardProps) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-4 shadow-skeuo hover:border-accent transition group flex flex-col justify-between">
      <div>
        <div className="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-skeuo-inset bg-dark">
          <img
            src={track.thumbnailUrl || "https://picsum.photos/400"}
            alt={track.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          {track.accessType === "PREMIUM" && (
            <span className="absolute top-2 right-2 bg-accent text-dark p-1.5 rounded-lg shadow-skeuo flex items-center gap-1 text-xs font-bold">
              <Crown className="w-3.5 h-3.5 fill-current" />
            </span>
          )}
          <button
            onClick={() => onPlay(track)}
            className="absolute bottom-3 right-3 w-12 h-12 bg-accent text-dark rounded-full flex items-center justify-center shadow-skeuo-btn opacity-0 group-hover:opacity-105 transition transform translate-y-2 group-hover:translate-y-0 hover:scale-105"
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>
        </div>
        <h3 className="font-semibold text-white truncate text-base">{track.title}</h3>
        <p className="text-xs text-dark-muted truncate mt-1">{track.description}</p>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-dark-border">
        <span className="text-[10px] uppercase tracking-wider text-accent font-bold bg-dark px-2 py-1 rounded-md">
          {track.categoryId || "Music"}
        </span>
        <button
          onClick={() => onToggleFavorite(track.id)}
          className={`p-2 rounded-lg ${isFavorite ? "text-red-500" : "text-dark-muted hover:text-white"}`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>
    </div>
  );
}
