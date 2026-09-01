"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Gamepad2, Loader2, Trophy, Users, WalletCards } from "lucide-react";
import type { Tournament } from "@/types";

export default function HomePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tournaments?status=OPEN,LIVE,REGISTRATION_OPEN", { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || "Unable to load tournaments");
        setTournaments(data.data?.tournaments || []);
      })
      .catch(() => setTournaments([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-10 p-4 pb-28 sm:p-6 md:p-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-dark-border bg-gradient-to-br from-[#25261b] via-dark-surface to-dark p-7 shadow-skeuo md:p-12">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-black text-dark"><Trophy size={16} /> PODMEN X TOURNAMENTS</span>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl">Play hard.<br /><span className="text-accent">Climb the board.</span></h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-dark-muted">Discover competitive events, join with coins, track your matches and build a tournament record.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/tournaments" className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-base font-black text-dark shadow-skeuo-btn">Browse tournaments <ArrowRight size={17} /></Link>
            <Link href="/leaderboard" className="inline-flex items-center gap-2 rounded-xl border border-dark-border bg-dark-card px-5 py-3 text-base font-bold text-white">Leaderboard</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[[Gamepad2, "Competitive games", "Multiple tournament formats"], [Users, "Fair registration", "Capacity and entry rules enforced"], [WalletCards, "Coin economy", "Earn, enter and win rewards"]].map(([Icon, title, text]) => (
          <article key={title as string} className="rounded-2xl border border-dark-border bg-dark-card p-5 shadow-skeuo">
            <Icon className="text-accent" size={23} />
            <h2 className="mt-4 font-black">{title as string}</h2>
            <p className="mt-1 text-sm leading-6 text-dark-muted">{text as string}</p>
          </article>
        ))}
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between"><div><p className="text-sm font-bold uppercase tracking-widest text-accent">Live arena</p><h2 className="mt-1 text-2xl font-black">Open & live tournaments</h2></div><Link href="/tournaments" className="text-sm font-bold text-dark-muted hover:text-accent">See all →</Link></div>
        {loading ? <div className="grid min-h-40 place-items-center"><Loader2 className="animate-spin text-accent" /></div> : tournaments.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{tournaments.slice(0, 6).map(t => <TournamentCard key={t.id} tournament={t} />)}</div> : <div className="rounded-2xl border border-dark-border bg-dark-card p-8 text-center text-dark-muted">No tournaments are open right now. Check back soon.</div>}
      </section>
    </div>
  );
}

function TournamentCard({ tournament }: { tournament: Tournament }) {
  const status = tournament.status === "LIVE" ? "LIVE NOW" : "REGISTRATION OPEN";
  return <Link href={`/tournaments/${tournament.id}`} className="group rounded-2xl border border-dark-border bg-dark-card p-5 shadow-skeuo transition hover:-translate-y-0.5 hover:border-accent/50">
    <div className="flex items-center justify-between gap-3"><span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-black text-accent">{status}</span><span className="text-xs font-bold text-dark-muted">{tournament.game}</span></div>
    <h3 className="mt-4 text-xl font-black group-hover:text-accent">{tournament.title}</h3>
    <p className="mt-2 line-clamp-2 text-sm leading-6 text-dark-muted">{tournament.description}</p>
    <div className="mt-5 grid grid-cols-3 gap-2 text-xs"><Stat label="Players" value={`${tournament.joinedPlayers}/${tournament.maxPlayers}`} /><Stat label="Entry" value={`${tournament.entryCoins} coins`} /><Stat label="Prize" value={`${tournament.prizeCoins} coins`} /></div>
  </Link>;
}
function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-dark-surface p-3"><p className="text-dark-muted">{label}</p><p className="mt-1 font-black">{value}</p></div>; }
