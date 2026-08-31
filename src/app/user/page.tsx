"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Headphones, Heart, History, ListMusic, Crown, Search, UserRound, Settings, ArrowRight, Play } from "lucide-react";

const actions = [
  ["Library", "Your saved music, albums and shows", "/library", ListMusic],
  ["Favorites", "Everything you marked for later", "/favorites", Heart],
  ["History", "Pick up exactly where you stopped", "/history", History],
  ["Playlists", "Build and manage your own queues", "/library", ListMusic],
  ["Account", "Profile, security and preferences", "/account", UserRound],
  ["Premium", "Manage your 7-day trial and subscription", "/pricing", Crown],
] as const;

export default function UserControlCenter() {
  const { user, loading } = useAuth();
  if (loading) return <main className="mx-auto max-w-7xl p-6 md:p-10"><div className="skeuo-panel h-44 animate-pulse" /></main>;
  return <main className="mx-auto max-w-7xl space-y-8 p-4 pb-32 sm:p-6 md:p-10">
    <section className="skeuo-panel overflow-hidden p-6 md:p-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="eyebrow">USER CONTROL CENTER</p><h1 className="mt-2 text-3xl font-black md:text-5xl">{user ? `Welcome back${user.displayName ? `, ${user.displayName}` : ""}.` : "Your listening hub."}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-dark-muted">One place for your library, playlists, listening history, account security and premium access.</p></div>
        <div className="flex flex-wrap gap-3"><Link className="skeuo-button inline-flex items-center gap-2" href="/explore"><Search size={17}/> Explore</Link><Link className="skeuo-button-primary inline-flex items-center gap-2" href="/pricing"><Crown size={17}/> Premium</Link></div>
      </div>
    </section>
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {actions.map(([title, desc, href, Icon]) => <Link key={title} href={href} className="skeuo-card group p-5 transition-transform hover:-translate-y-1"><Icon className="h-6 w-6 text-accent"/><h2 className="mt-4 text-xl font-black">{title}</h2><p className="mt-1 text-sm text-dark-muted">{desc}</p><span className="mt-5 inline-flex items-center gap-2 text-xs font-black text-accent">OPEN <ArrowRight size={14}/></span></Link>)}
    </section>
    <section className="grid gap-4 md:grid-cols-3">
      <div className="skeuo-card p-6 md:col-span-2"><div className="flex items-center gap-3"><Headphones className="text-accent"/><h2 className="text-xl font-black">Continue listening</h2></div><p className="mt-3 text-sm text-dark-muted">Your real playback history will appear here as you listen.</p><Link href="/history" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-accent"><Play size={15} fill="currentColor"/> Open history</Link></div>
      <div className="skeuo-card p-6"><Settings className="text-accent"/><h2 className="mt-4 text-xl font-black">Account security</h2><p className="mt-2 text-sm text-dark-muted">Firebase authentication protects your account.</p><Link href="/account" className="mt-5 inline-flex text-sm font-black text-accent">Manage account →</Link></div>
    </section>
  </main>;
}
