"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-20 h-20 bg-dark-card border border-red-500/30 rounded-3xl flex items-center justify-center text-red-400 shadow-skeuo">
        <AlertCircle className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white">Something went wrong</h1>
        <p className="text-dark-muted text-sm max-w-md">
          {error.message || "An unexpected error occurred while loading this audio stream."}
        </p>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-dark border border-dark-border text-accent font-bold rounded-xl hover:bg-dark-border transition text-sm"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-3 bg-accent text-dark font-bold rounded-xl shadow-skeuo-btn hover:scale-105 transition text-sm"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
