"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Crown, Loader2, Play, RefreshCw, Music2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { usePlayer } from "@/components/player/PlayerProvider";
import { useAuth } from "@/context/AuthContext";
import { Track } from "@/types";

export default function TrackPage() {
  const params = useParams<{ id: string }>();
  const { idToken } = useAuth();
  const { play } = usePlayer();
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    if (!params?.id) return;
    setLoading(true);
    setError("");
    try {
      const headers: Record<string, string> = idToken ? { Authorization: `Bearer ${idToken}` } : {};
      const response = await fetch(`/api/playback/${encodeURIComponent(String(params.id))}`, { headers, cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Track unavailable");
      setTrack(payload.data as Track);
    } catch (err: any) {
      setError(err?.message || "Track unavailable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [params?.id, idToken]);

  if (loading) return <div className="grid min-h-[70vh] place-items-center"><Loader2 className="animate-spin text-accent" size={32}/></div>;

  if (error || !track) return <main className="mx-auto grid min-h-[70vh] max-w-2xl place-items-center p-6 text-center"><section className="skeuo-card p-8"><Music2 className="mx-auto text-accent" size={42}/><h1 className="mt-4 text-2xl font-black">Track unavailable</h1><p className="mt-2 text-sm text-dark-muted">{error || "This audio record does not exist or is no longer published."}</p><div className="mt-6 flex justify-center gap-2"><button onClick={() => void load()} className="skeuo-button inline-flex items-center gap-2"><RefreshCw size={15}/> Retry</button><Link href="/explore" className="skeuo-button-primary inline-flex items-center gap-2"><ArrowLeft size={15}/> Explore</Link></div></section></main>;

  return <main className="mx-auto max-w-5xl p-5 pb-32 md:p-10"><Link href="/explore" className="inline-flex items-center gap-2 text-sm font-bold text-dark-muted hover:text-accent"><ArrowLeft size={16}/> Back to Explore</Link><section className="skeuo-panel mt-5 overflow-hidden p-5 md:p-8"><div className="grid gap-8 md:grid-cols-[minmax(280px,420px)_1fr] md:items-center"><div className="relative aspect-square overflow-hidden rounded-[2rem] bg-dark shadow-skeuo-inset">{track.thumbnailUrl?<Image src={track.thumbnailUrl} alt={track.title} fill sizes="(max-width: 768px) 90vw, 420px" className="object-cover" unoptimized/>:<div className="grid h-full place-items-center text-accent"><Music2 size={90}/></div>}{track.accessType === "PREMIUM" && <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-xl bg-accent px-3 py-2 text-xs font-black text-dark shadow-skeuo"><Crown size={14} fill="currentColor"/> PREMIUM</span>}</div><div><p className="eyebrow">{track.accessType === "PREMIUM" ? "PREMIUM AUDIO" : "FREE AUDIO"}</p><h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">{track.title}</h1><p className="mt-5 text-sm leading-7 text-dark-muted">{track.description || "Podmen X audio"}</p><button onClick={() => void play(track, [track])} className="skeuo-button-primary mt-7 inline-flex items-center gap-2 px-6"><Play size={18} fill="currentColor"/> Play now</button></div></div></section></main>;
}
