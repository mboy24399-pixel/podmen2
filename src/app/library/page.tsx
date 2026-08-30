"use client";

export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import { Library, Plus, ListMusic } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function LibraryPage() {
  const [playlists, setPlaylists] = useState([
    { id: "pl_1", name: "Late Night Coding", count: 12 },
    { id: "pl_2", name: "Deep Focus Ambient", count: 8 },
  ]);
  const { showToast } = useToast();

  const createPlaylist = () => {
    const name = prompt("Enter playlist name:");
    if (!name) return;
    setPlaylists([...playlists, { id: Date.now().toString(), name, count: 0 }]);
    showToast(`Playlist "${name}" created`);
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Library className="w-8 h-8 text-accent" /> Your Library & Playlists
          </h1>
          <p className="text-dark-muted text-sm mt-1">Manage your custom playlists and saved albums.</p>
        </div>
        <button
          onClick={createPlaylist}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent text-dark font-bold text-xs rounded-xl shadow-skeuo-btn hover:scale-105 transition"
        >
          <Plus className="w-4 h-4" /> New Playlist
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {playlists.map((pl) => (
          <div key={pl.id} className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-skeuo space-y-4">
            <div className="w-12 h-12 rounded-xl bg-dark border border-dark-border flex items-center justify-center text-accent shadow-skeuo-inset">
              <ListMusic className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{pl.name}</h3>
              <p className="text-xs text-dark-muted mt-1">{pl.count} tracks</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
