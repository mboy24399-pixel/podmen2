"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Heart, Maximize2, Minimize2, Music2, Pause, Play, Repeat, RotateCcw, RotateCw, Share2, Shuffle, SkipBack, SkipForward, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "./PlayerProvider";

const fmt = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

export default function GlobalPlayer() {
  const pathname = usePathname();
  const { idToken } = useAuth();
  const { currentTrack, queue, loading, error, next, prev, stop, expanded, setExpanded } = usePlayer();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    if (!currentTrack || !audioRef.current) return;
    const audio = audioRef.current;
    audio.src = currentTrack.audioUrl;
    audio.playbackRate = speed;
    audio.load();
    const saved = Number(localStorage.getItem(`podmen:position:${currentTrack.id}`) || 0);
    const onMeta = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : Number(currentTrack.duration || 0));
      if (saved > 0 && saved < (audio.duration || Infinity)) audio.currentTime = saved;
      void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    };
    audio.addEventListener("loadedmetadata", onMeta, { once: true });
    return () => audio.removeEventListener("loadedmetadata", onMeta);
  }, [currentTrack]);

  useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = speed; }, [speed]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    const timer = window.setInterval(() => {
      if (!audio.paused) {
        setTime(audio.currentTime);
        localStorage.setItem(`podmen:position:${currentTrack.id}`, String(Math.floor(audio.currentTime)));
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [currentTrack]);

  useEffect(() => {
    if (!("mediaSession" in navigator) || !currentTrack) return;
    const media = navigator.mediaSession;
    media.metadata = new MediaMetadata({ title: currentTrack.title, artist: "Podmen X", album: "Podmen X", artwork: currentTrack.thumbnailUrl ? [{ src: currentTrack.thumbnailUrl }] : [] });
    try {
      media.setActionHandler("play", () => void audioRef.current?.play());
      media.setActionHandler("pause", () => audioRef.current?.pause());
      media.setActionHandler("previoustrack", prev);
      media.setActionHandler("nexttrack", next);
      media.setActionHandler("seekbackward", () => skip(-10));
      media.setActionHandler("seekforward", () => skip(10));
    } catch {}
  }, [currentTrack, next, prev]);

  useEffect(() => {
    if (!idToken || !currentTrack) { setFavorite(false); return; }
    fetch("/api/me/favorites", { headers: { Authorization: `Bearer ${idToken}` }, cache: "no-store" })
      .then(response => response.json())
      .then(payload => setFavorite((payload.data?.items || []).some((item: any) => item.id === currentTrack.id || item.trackId === currentTrack.id)))
      .catch(() => setFavorite(false));
  }, [idToken, currentTrack]);

  const event = async (name: string) => {
    if (!currentTrack) return;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
    try { await fetch(`/api/playback/${encodeURIComponent(currentTrack.id)}`, { method: "POST", headers, body: JSON.stringify({ event: name, position: audioRef.current?.currentTime || 0 }) }); } catch {}
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play().then(() => { setPlaying(true); void event("play"); }).catch(() => {});
    else { audio.pause(); setPlaying(false); void event("pause"); }
  };

  const seek = (value: number) => { if (audioRef.current) { audioRef.current.currentTime = value; setTime(value); } };
  const skip = (value: number) => { if (audioRef.current) seek(Math.max(0, Math.min(audioRef.current.duration || duration, audioRef.current.currentTime + value))); };

  const share = async () => {
    if (!currentTrack) return;
    const url = `${window.location.origin}/track/${encodeURIComponent(currentTrack.id)}`;
    try {
      if (navigator.share) await navigator.share({ title: currentTrack.title, text: `Listen to ${currentTrack.title} on Podmen X`, url });
      else if (navigator.clipboard) await navigator.clipboard.writeText(url);
    } catch {}
  };

  const toggleFavorite = async () => {
    if (!idToken || !currentTrack) return;
    try {
      const response = await fetch("/api/me/favorites", { method: "POST", headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ trackId: currentTrack.id }) });
      const payload = await response.json();
      if (response.ok) setFavorite(Boolean(payload.data?.favorite));
    } catch {}
  };

  if (pathname?.startsWith("/admin") || !currentTrack) return null;

  const controls = <>
    <button onClick={() => setShuffle(value => !value)} className={`rounded-xl p-3 ${shuffle ? "text-accent" : "text-dark-muted hover:text-white"}`} aria-label="Shuffle"><Shuffle size={19}/></button>
    <button onClick={prev} className="rounded-xl p-3 text-dark-muted hover:text-white" aria-label="Previous"><SkipBack size={21}/></button>
    <button onClick={() => skip(-10)} className="rounded-xl p-3 text-dark-muted hover:text-white" aria-label="Back 10 seconds"><RotateCcw size={19}/></button>
    <button onClick={toggle} className="grid h-14 w-14 place-items-center rounded-full bg-accent text-dark shadow-skeuo-btn" aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause size={22} fill="currentColor"/> : <Play size={22} fill="currentColor"/>}</button>
    <button onClick={() => skip(10)} className="rounded-xl p-3 text-dark-muted hover:text-white" aria-label="Forward 10 seconds"><RotateCw size={19}/></button>
    <button onClick={next} className="rounded-xl p-3 text-dark-muted hover:text-white" aria-label="Next"><SkipForward size={21}/></button>
    <button onClick={() => setRepeat(value => !value)} className={`rounded-xl p-3 ${repeat ? "text-accent" : "text-dark-muted hover:text-white"}`} aria-label="Repeat"><Repeat size={19}/></button>
  </>;

  return <>
    <audio ref={audioRef} preload="auto" onTimeUpdate={event => setTime(event.currentTarget.currentTime)} onLoadedMetadata={event => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : Number(currentTrack.duration || 0))} onPlay={() => { setPlaying(true); if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing"; }} onPause={() => { setPlaying(false); if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused"; }} onEnded={() => { localStorage.removeItem(`podmen:position:${currentTrack.id}`); void event("ended"); if (repeat) { seek(0); void audioRef.current?.play(); return; } if (shuffle && queue.length > 1) { const choices = queue.filter(item => item.id !== currentTrack.id); const target = choices[Math.floor(Math.random() * choices.length)]; if (target) window.dispatchEvent(new CustomEvent("podmen:play", { detail: { track: target, queue } })); else next(); } else next(); }} />
    {!expanded && <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-dark-border bg-dark-surface/95 px-3 py-3 shadow-skeuo backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center gap-3"><div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-dark-card shadow-skeuo-inset">{currentTrack.thumbnailUrl ? <img src={currentTrack.thumbnailUrl} alt="" className="h-full w-full object-cover"/> : <Music2 className="text-accent" size={22}/>}</div><div className="min-w-0 w-32 sm:w-56"><p className="truncate text-base font-black">{currentTrack.title}</p><p className="truncate text-sm text-dark-muted">{currentTrack.accessType}</p></div><div className="hidden flex-1 items-center justify-center gap-1 sm:flex">{controls}</div><div className="ml-auto flex items-center gap-1"><button onClick={share} className="rounded-xl p-3 text-dark-muted hover:text-accent" aria-label="Share"><Share2 size={19}/></button>{idToken && <button onClick={toggleFavorite} className={`rounded-xl p-3 ${favorite ? "text-accent" : "text-dark-muted hover:text-accent"}`} aria-label="Favorite"><Heart size={19} fill={favorite ? "currentColor" : "none"}/></button>}<button onClick={() => setExpanded(true)} className="rounded-xl p-3 text-dark-muted hover:text-accent" aria-label="Open full player"><Maximize2 size={19}/></button><button onClick={stop} className="rounded-xl p-3 text-dark-muted hover:text-white" aria-label="Close player"><X size={19}/></button></div></div><div className="mx-auto mt-2 flex max-w-7xl items-center gap-3"><span className="text-sm text-dark-muted">{fmt(time)}</span><input aria-label="Playback progress" type="range" min={0} max={duration || 1} value={Math.min(time, duration || 1)} onChange={event => seek(Number(event.target.value))} className="w-full accent-accent"/><span className="text-sm text-dark-muted">{fmt(duration)}</span></div></div>}
    {expanded && <div className="fixed inset-0 z-[100] overflow-auto bg-[#07090d] text-white"><div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-5 py-6 sm:px-8"><header className="flex items-center justify-between"><span className="text-base font-black tracking-[.22em] text-accent">PODMEN X / FULL PLAYER</span><button onClick={() => setExpanded(false)} className="rounded-xl border border-white/10 p-3 text-dark-muted hover:text-white" aria-label="Close full player"><Minimize2 size={20}/></button></header><div className="flex flex-1 flex-col items-center justify-center py-8"><div className="w-full max-w-xl"><div className="aspect-square overflow-hidden rounded-[2rem] border border-white/10 bg-dark-card shadow-2xl">{currentTrack.thumbnailUrl ? <img src={currentTrack.thumbnailUrl} alt={currentTrack.title} className="h-full w-full object-cover"/> : <div className="grid h-full place-items-center text-accent"><Music2 size={90}/></div>}</div><div className="mt-8 text-center"><span className="rounded-full bg-accent/10 px-4 py-2 text-sm font-black text-accent">{currentTrack.accessType}</span><h1 className="mt-5 text-4xl font-black sm:text-6xl">{currentTrack.title}</h1><p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-dark-muted">{currentTrack.description || "Podmen X audio"}</p></div><div className="mt-8"><input aria-label="Playback progress" type="range" min={0} max={duration || 1} value={Math.min(time, duration || 1)} onChange={event => seek(Number(event.target.value))} className="w-full accent-accent"/><div className="mt-2 flex justify-between text-sm text-dark-muted"><span>{fmt(time)}</span><span>{fmt(duration)}</span></div></div><div className="mt-7 flex flex-wrap items-center justify-center gap-1 sm:gap-3">{controls}</div><div className="mt-7 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.03] p-4"><div className="flex items-center gap-2">{idToken && <button onClick={toggleFavorite} className={`rounded-xl p-3 ${favorite ? "text-accent" : "text-dark-muted hover:text-white"}`} aria-label="Favorite"><Heart size={21} fill={favorite ? "currentColor" : "none"}/></button>}<button onClick={share} className="rounded-xl p-3 text-dark-muted hover:text-accent" aria-label="Share"><Share2 size={21}/></button></div><button onClick={() => setSpeed(value => value >= 2 ? 0.75 : Number((value + 0.25).toFixed(2)))} className="rounded-xl border border-white/10 px-4 py-3 text-sm font-black text-accent">Speed {speed}x</button></div>{(loading || error) && <p className="mt-4 text-center text-sm text-dark-muted">{loading ? "Loading audio…" : error}</p>}</div></div></div></div>}
  </>;
}
