"use client";
import { Heart, Play, Crown, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { Track } from "@/types";
import { formatDuration } from "@/lib/catalog";

export default function CatalogCard({track,onPlay,isFavorite,onFavorite}:{track:Track;onPlay?:(t:Track)=>void;isFavorite?:boolean;onFavorite?:()=>void}){
 return <article className="group rounded-2xl border border-dark-border bg-dark-card/80 p-3 shadow-skeuo hover:-translate-y-1 transition-all duration-200">
  <div className="relative aspect-square overflow-hidden rounded-xl bg-dark-surface">
   <Image src={track.thumbnailUrl} alt={track.title} fill sizes="(max-width:640px) 50vw, (max-width:1024px) 25vw, 220px" className="object-cover transition duration-500 group-hover:scale-105" unoptimized />
   {track.accessType === "PREMIUM" && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-1 text-[10px] font-black text-dark"><Crown size={11}/> PRO</span>}
   <button aria-label={`Play ${track.title}`} onClick={()=>onPlay?.(track)} className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full bg-accent text-dark shadow-skeuo-btn opacity-0 group-hover:opacity-100 transition"><Play size={18} fill="currentColor"/></button>
  </div>
  <div className="min-w-0 px-1 pt-3"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="truncate font-bold text-white">{track.title}</h3><p className="mt-1 truncate text-xs text-dark-muted">{track.categoryId} · {formatDuration(track.duration)}</p></div><div className="flex shrink-0 gap-1"><button onClick={onFavorite} aria-label="Favorite" className={`rounded-lg p-2 ${isFavorite?"text-accent":"text-dark-muted hover:text-white"}`}><Heart size={16} fill={isFavorite?"currentColor":"none"}/></button><button aria-label="More options" className="rounded-lg p-2 text-dark-muted hover:text-white"><MoreHorizontal size={16}/></button></div></div></div>
 </article>
}
