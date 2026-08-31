"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, Heart, ListPlus, Loader2, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume2, VolumeX, Maximize2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function PlayerContent() {
  const q = useSearchParams();
  const router = useRouter();
  const id = q.get("id");
  const { idToken } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) { setError("Missing audio id"); setLoading(false); return; }
      setLoading(true); setError("");
      try {
        const headers: Record<string, string> = idToken ? { Authorization: `Bearer ${idToken}` } : {};
        const r = await fetch(`/api/playback/${encodeURIComponent(id)}`, { headers, cache: "no-store" });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || "Playback unavailable");
        if (!cancelled) setItem(j.data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Playback unavailable");
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [id, idToken]);

  useEffect(() => {
    if (item && audioRef.current) {
      audioRef.current.src = item.audioUrl;
      audioRef.current.load();
      audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [item]);

  const record = async (event: string) => {
    if (!idToken || !id) return;
    try { await fetch(`/api/playback/${encodeURIComponent(id)}`, { method: "POST", headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ event, position: audioRef.current?.currentTime || 0 }) }); }
    catch (e) { console.error("Playback event logging failed", e); }
  };
  const toggle = () => { const a = audioRef.current; if (!a) return; if (a.paused) a.play().then(() => { setPlaying(true); record("play"); }).catch(() => setError("Audio could not start. Check the audio source.")); else { a.pause(); setPlaying(false); record("pause"); } };
  const seek = (v: number) => { const a = audioRef.current; if (!a) return; a.currentTime = v; setTime(v); };
  const skip = (v: number) => { const a = audioRef.current; if (a) seek(Math.max(0, Math.min(a.duration || 0, a.currentTime + v))); };

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#07090d]"><Loader2 className="animate-spin text-accent"/></main>;
  if (error || !item) return <main className="grid min-h-screen place-items-center bg-[#07090d] px-6 text-center text-white"><div><h1 className="text-2xl font-black">Playback unavailable</h1><p className="mt-2 text-sm text-dark-muted">{error || "This audio is not available."}</p><button onClick={() => router.back()} className="mt-6 rounded-xl bg-accent px-4 py-2 text-sm font-black text-dark">Go back</button></div></main>;

  return <main className="min-h-screen bg-[#07090d] text-white"><div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-5 sm:px-8 sm:py-8">
    <header className="flex items-center justify-between"><button onClick={() => router.back()} className="rounded-full border border-white/10 p-3 text-dark-muted hover:text-white" aria-label="Back"><ChevronLeft/></button><span className="text-[10px] font-black tracking-[.25em] text-accent">PODMEN X / PLAYER</span><button onClick={() => document.documentElement.requestFullscreen?.()} className="rounded-full border border-white/10 p-3 text-dark-muted hover:text-white" aria-label="Fullscreen"><Maximize2 size={18}/></button></header>
    <div className="flex flex-1 flex-col items-center justify-center py-8"><div className="w-full max-w-xl">
      <div className="aspect-square overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1b1f29] to-[#0c0f14] shadow-2xl">{item.thumbnailUrl ? <img src={item.thumbnailUrl} alt={item.title} className="h-full w-full object-cover"/> : <div className="grid h-full place-items-center"><Volume2 size={72} className="text-accent"/></div>}</div>
      <div className="mt-8 text-center"><span className="rounded-full bg-accent/10 px-3 py-1 text-[10px] font-black tracking-wider text-accent">{item.accessType}</span><h1 className="mt-4 text-3xl font-black sm:text-5xl">{item.title}</h1><p className="mx-auto mt-3 max-w-2xl text-sm text-dark-muted">{item.description || "Podmen X audio"}</p></div>
      <div className="mt-8"><input aria-label="Seek" type="range" min={0} max={duration || 1} value={Math.min(time, duration || 1)} onChange={e => seek(Number(e.target.value))} className="w-full accent-accent"/><div className="mt-2 flex justify-between text-xs text-dark-muted"><span>{fmt(time)}</span><span>{fmt(duration)}</span></div></div>
      <div className="mt-7 flex items-center justify-center gap-2 sm:gap-4"><button onClick={() => setShuffle(v => !v)} className={`rounded-full p-3 ${shuffle ? "text-accent" : "text-dark-muted"}`}><Shuffle size={18}/></button><button onClick={() => skip(-10)} className="rounded-full p-3 text-dark-muted hover:text-white"><SkipBack size={20}/></button><button onClick={() => skip(-10)} className="rounded-full p-3 text-xs font-black text-dark-muted hover:text-white">−10</button><button onClick={toggle} className="grid h-16 w-16 place-items-center rounded-full bg-accent text-dark shadow-skeuo-btn">{playing ? <Pause size={25} fill="currentColor"/> : <Play size={25} fill="currentColor"/>}</button><button onClick={() => skip(10)} className="rounded-full p-3 text-xs font-black text-dark-muted hover:text-white">+10</button><button onClick={() => skip(10)} className="rounded-full p-3 text-dark-muted hover:text-white"><SkipForward size={20}/></button><button onClick={() => setRepeat(v => !v)} className={`rounded-full p-3 ${repeat ? "text-accent" : "text-dark-muted"}`}><Repeat size={18}/></button></div>
      <div className="mt-7 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.03] p-4"><div className="flex gap-2"><button className="rounded-xl border border-white/10 p-2 text-dark-muted hover:text-white"><Heart size={18}/></button><button className="rounded-xl border border-white/10 p-2 text-dark-muted hover:text-white"><ListPlus size={18}/></button></div><div className="flex items-center gap-3"><button onClick={() => setMuted(v => !v)} className="text-dark-muted hover:text-white">{muted ? <VolumeX size={18}/> : <Volume2 size={18}/>}</button><input aria-label="Volume" type="range" min={0} max={1} step={.05} value={muted ? 0 : volume} onChange={e => { const v = Number(e.target.value); setVolume(v); setMuted(false); if (audioRef.current) audioRef.current.volume = v; }} className="w-24 accent-accent"/></div></div>
      <audio ref={audioRef} onTimeUpdate={e => setTime(e.currentTarget.currentTime)} onLoadedMetadata={e => setDuration(e.currentTarget.duration)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => { if (repeat) { seek(0); audioRef.current?.play(); } else record("ended"); }} onError={() => setError("The audio source failed to load. Replace the source from Admin → Audio Sources.")} />
    </div></div></div></main>;
}
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
export default function PlayerPage(){ return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#07090d]"><Loader2 className="animate-spin text-accent"/></main>}><PlayerContent/></Suspense>; }
