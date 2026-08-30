"use client";

export const dynamic = 'force-dynamic';

import React from "react";
import { History } from "lucide-react";

export default function HistoryPage() {
  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <History className="w-8 h-8 text-accent" /> Listening History
        </h1>
        <p className="text-dark-muted text-sm mt-1">Recently played tracks and podcasts with saved progress.</p>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-2xl p-8 shadow-skeuo text-center space-y-2">
        <p className="text-dark-muted text-sm">Your listening history is automatically synced across your devices.</p>
      </div>
    </div>
  );
}
