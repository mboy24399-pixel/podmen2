"use client";

import React from "react";
import { Search, Bell, Crown } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="h-16 border-b border-dark-border bg-dark-surface px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4 w-1/3">
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-dark-muted" />
          <input
            type="text"
            placeholder="Search tracks, podcasts, creators..."
            className="w-full bg-dark-card border border-dark-border rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent shadow-skeuo-inset"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/pricing"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent to-yellow-600 text-dark font-bold text-xs rounded-xl shadow-skeuo-btn hover:scale-105 transition"
        >
          <Crown className="w-4 h-4 fill-current" />
          GO PREMIUM
        </Link>
        <button className="p-2 text-dark-muted hover:text-white rounded-xl bg-dark-card border border-dark-border shadow-skeuo">
          <Bell className="w-5 h-5" />
        </button>
        <Link
          href="/account"
          className="w-9 h-9 rounded-full bg-dark-card border border-dark-border flex items-center justify-center text-accent font-bold shadow-skeuo"
        >
          U
        </Link>
      </div>
    </header>
  );
}
