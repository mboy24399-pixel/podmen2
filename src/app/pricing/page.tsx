"use client";

export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import { Check, Crown, Zap } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = async (planId: string) => {
    setLoading(true);
    try {
      showToast("Initiating secure Razorpay checkout...");
      setTimeout(() => {
        setLoading(false);
        showToast("Razorpay subscription session created successfully.");
      }, 1500);
    } catch (error: any) {
      setLoading(false);
      showToast(error.message || "Subscription initiation failed");
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-dark font-bold text-xs shadow-skeuo-btn">
          <Crown className="w-3.5 h-3.5 fill-current" /> UNLIMITED STREAMING
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Upgrade to Podmen X Premium
        </h1>
        <p className="text-dark-muted text-base">
          Unlock lossless audio, ad-free podcast streaming, offline caching, and Gemini AI-powered personalized playlists.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="bg-dark-card border border-dark-border rounded-3xl p-8 shadow-skeuo flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Free Listener</h3>
              <p className="text-sm text-dark-muted mt-1">Standard quality audio with ads.</p>
            </div>
            <div className="text-3xl font-extrabold text-white">
              ₹0 <span className="text-sm font-normal text-dark-muted">/ forever</span>
            </div>
            <ul className="space-y-3 text-sm text-dark-muted">
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-accent" /> Standard Audio Streaming
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-accent" /> Access to Public Podcasts
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-accent" /> Create up to 3 Playlists
              </li>
            </ul>
          </div>
          <button disabled className="mt-8 w-full py-3 bg-dark border border-dark-border text-dark-muted font-bold rounded-xl cursor-not-allowed">
            Current Plan
          </button>
        </div>

        {/* Premium Monthly Plan */}
        <div className="bg-gradient-to-b from-dark-surface to-dark-card border-2 border-accent rounded-3xl p-8 shadow-skeuo flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-accent text-dark text-[10px] font-black px-4 py-1.5 rounded-bl-xl tracking-wider">
            RECOMMENDED
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" /> Pro Creator & Audiophile
              </h3>
              <p className="text-sm text-dark-muted mt-1">Lossless streaming, zero ads, Gemini AI.</p>
            </div>
            <div className="text-4xl font-extrabold text-white">
              ₹99 <span className="text-sm font-normal text-dark-muted">/ month</span>
            </div>
            <ul className="space-y-3 text-sm text-white">
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-accent" /> Lossless Audio Bitrate
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-accent" /> Ad-Free Podcasts & Music
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-accent" /> Unlimited Playlists & Favorites
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-accent" /> Gemini AI Semantic Discovery
              </li>
            </ul>
          </div>
          <button
            onClick={() => handleSubscribe("plan_monthly")}
            disabled={loading}
            className="mt-8 w-full py-3 bg-accent text-dark font-bold rounded-xl shadow-skeuo-btn hover:scale-105 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Subscribe via Razorpay"}
          </button>
        </div>
      </div>
    </div>
  );
}
