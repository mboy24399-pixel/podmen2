"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Crown, Medal, Trophy } from "lucide-react";

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<any[]>([]);
  useEffect(() => { fetch("/api/leaderboard", { cache: "no-store" }).then(r => r.json()).then(j => setPlayers(j.data?.players || [])).catch(() => setPlayers([])); }, []);
  return <div className="mx-auto max-w-5xl space-y-7 p-4 pb-28 sm:p-6 md:p-10">
    <header className="rounded-3xl border border-accent/20 bg-accent/5 p-6 md:p-8"><div className="flex items-center gap-3 text-accent"><Trophy /><span className="font-black uppercase tracking-widest">Global ranking</span></div><h1 className="mt-3 text-3xl font-black md:text-5xl">Leaderboard</h1><p className="mt-3 text-dark-muted">Wins first. Tournament activity breaks ties. No paid shortcuts.</p></header>
    <section className="overflow-hidden rounded-2xl border border-dark-border bg-dark-card shadow-skeuo"><div className="grid grid-cols-[56px_1fr_90px_100px] gap-3 border-b border-dark-border p-4 text-xs font-black uppercase tracking-wider text-dark-muted"><span>#</span><span>Player</span><span>Wins</span><span>Events</span></div>{players.map((player, index) => <div key={player.uid} className="grid grid-cols-[56px_1fr_90px_100px] items-center gap-3 border-b border-dark-border p-4 last:border-0"><div className="font-black text-accent">{index < 3 ? <Medal size={18} /> : index + 1}</div><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-dark-surface font-black text-accent">{String(player.displayName).slice(0,1).toUpperCase()}</div><div><p className="font-black">{player.displayName}</p><p className="text-xs text-dark-muted">{player.coinBalance} coins</p></div>{index === 0 && <Crown size={17} className="text-accent" />}</div><strong>{player.totalWins}</strong><span className="text-dark-muted">{player.totalTournaments}</span></div>)}{!players.length && <div className="p-10 text-center text-dark-muted">No ranked players yet.</div>}</section><Link href="/tournaments" className="inline-flex rounded-xl bg-accent px-5 py-3 font-black text-dark">Find a tournament</Link>
  </div>;
}
