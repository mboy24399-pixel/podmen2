"use client";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Play, Plus, Sparkles } from "lucide-react";
import { catalogTracks, formatDuration } from "@/lib/catalog";
import CatalogCard from "@/components/tracks/CatalogCard";
import { Track } from "@/types";

export default function CatalogPage({title,subtitle,filter}:{title:string;subtitle:string;filter?:"all"|"free"|"premium"|"podcast"}){
 const [query,setQuery]=useState(""); const [favorites,setFavorites]=useState<string[]>([]); const [current,setCurrent]=useState<Track|null>(null);
 const tracks=useMemo(()=>catalogTracks.filter(t=>filter==="premium"?t.accessType==="PREMIUM":filter==="free"?t.accessType==="FREE":filter==="podcast"?t.categoryId==="podcast":true).filter(t=>`${t.title} ${t.description} ${t.categoryId}`.toLowerCase().includes(query.toLowerCase())),[filter,query]);
 return <div className="mx-auto max-w-7xl space-y-8 p-5 md:p-10">
  <section className="rounded-3xl border border-dark-border bg-gradient-to-br from-dark-card to-dark-surface p-6 md:p-10 shadow-skeuo"><div className="max-w-3xl"><span className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent"><Sparkles size={14}/> PODMEN X</span><h1 className="text-3xl font-black tracking-tight md:text-5xl">{title}</h1><p className="mt-3 text-dark-muted">{subtitle}</p></div><div className="mt-7 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-4 top-3.5 text-dark-muted" size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search this library..." className="w-full rounded-xl border border-dark-border bg-dark p-3 pl-11 text-sm text-white outline-none focus:border-accent"/></div><button className="inline-flex items-center justify-center gap-2 rounded-xl border border-dark-border bg-dark-card px-5 py-3 text-sm font-semibold"><SlidersHorizontal size={17}/> Filters</button></div></section>
  <div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">{tracks.length} results</h2><p className="text-xs text-dark-muted">Curated and ready to play</p></div><button onClick={()=>setCurrent(tracks[0]??null)} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-dark"><Play size={16} fill="currentColor"/> Play all</button></div>
  {tracks.length?<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{tracks.map(t=><CatalogCard key={t.id} track={t} onPlay={setCurrent} isFavorite={favorites.includes(t.id)} onFavorite={()=>setFavorites(v=>v.includes(t.id)?v.filter(x=>x!==t.id):[...v,t.id])}/>)}</div>:<div className="rounded-2xl border border-dashed border-dark-border p-16 text-center text-dark-muted">No matching audio found.</div>}
  {current&&<div className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-dark-border bg-dark-surface/95 p-4 shadow-2xl backdrop-blur md:left-72"><div className="flex items-center gap-4"><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-white">{current.title}</p><p className="text-xs text-dark-muted">{current.categoryId} · {formatDuration(current.duration)}</p></div><audio controls autoPlay src={current.audioUrl} className="h-9 w-full max-w-xl"/></div></div>}
 </div>
}
