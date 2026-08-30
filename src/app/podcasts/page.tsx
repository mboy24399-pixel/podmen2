"use client";

export const dynamic = 'force-dynamic';

import React from "react";
import { Mic } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function PodcastsPage() {
  const { showToast } = useToast();
  const podcasts = [
    { id: "pod_1", title: "Future of AI Podcast", episodes: 42, cover: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&auto=format&fit=crop&q=80" },
    { id: "pod_2", title: "Tech Founders Unplugged", episodes: 28, cover: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80" },
  ];

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <Mic className="w-8 h-8 text-accent" /> Podcasts & Shows
        </h1>
        <p className="text-dark-muted text-sm mt-1">Follow your favorite creators and series.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {podcasts.map((pod) => (
          <div key={pod.id} className="bg-dark-card border border-dark-border rounded-2xl p-4 shadow-skeuo flex gap-4 items-center">
            <img src={pod.cover} alt={pod.title} className="w-20 h-20 rounded-xl object-cover shadow-skeuo-inset" />
            <div>
              <h3 className="font-bold text-white text-base">{pod.title}</h3>
              <p className="text-xs text-dark-muted mt-1">{pod.episodes} episodes</p>
              <button
                onClick={() => showToast(`Following ${pod.title}`)}
                className="mt-3 px-3 py-1.5 bg-dark border border-dark-border text-accent font-semibold text-xs rounded-lg hover:bg-dark-border transition"
              >
                Follow Show
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
