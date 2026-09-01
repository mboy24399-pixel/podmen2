"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Gamepad2, Search, Trophy, Users } from "lucide-react";
import type { Tournament } from "@/types";

export default function TournamentsPage() {
  const [items, setItems] = useState<Tournament[]>([]);
  const [query, setQuery] = useState("");
  useEffect(() => { fetch("/api/tournaments", { cache: "no-store" }).then(r => r.json()).then(j => setItems(j.data?.tournaments || [])).catch(() => setItems([])); }, []);
  const filtered = useMemo(() => items.filter(t => `${t.title} ${t.game}`.toLowerCase().includes(query.toLowerCase())), [items, query]);
  return <div className="mx-auto max-w-7xl space-y-7 p-4 pb-28 sm:p-6 md:p-10">
    <header className="flex flex-col gap-5 rounded-3xl border border-dark-border bg-dark-card p-6 shadow-skeuo md:flex-row md:items-end md:justify-between"><div><p className="text-sm font-black uppercase tracking-widest text-accent">Competition hub</p><h1 className="mt-2 text-3xl font-black md:text-5xl">Tournaments</h1><p className="mt-2 text-dark-muted">Register, compete and climb the rankings.</p></div><label className="relative w-full md:max-w-sm"><Search className="absolute left-3 top-3 text-dark-muted" size={18} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search game or tournament" className="w-full rounded-xl border border-dark-border bg-dark-surface py-2.5 pl-10 pr-4 text-sm outline-none focus:border-accent" /></label></header>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.map(t => <TournamentCard key={t.id} tournament={t} />)}</div>
    {!filtered.length && <div className="rounded-2xl border border-dark-border bg-dark-card p-10 text-center text-dark-muted">No tournaments match your search.</div>}
  </div>;
}
function TournamentCard({ tournament }: { tournament: Tournament }) { const date = new Date(tournament.startsAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }); return <Link href={`/tournaments/${tournament.id}`} className="group rounded-2xl border border-dark-border bg-dark-card p-5 shadow-skeuo transition hover:-translate-y-0.5 hover:border-accent/50"><div className="flex items-center justify-between"><span className={`rounded-full px-3 py-1 text-xs font-black ${tournament.status === "LIVE" ? "bg-red-400/10 text-red-300" : "bg-accent/10 text-accent"}`}>{tournament.status.replaceAll("_", " ")}</span><span className="text-xs text-dark-muted">{tournament.format.replaceAll("_", " ")}</span></div><h2 className="mt-4 text-xl font-black group-hover:text-accent">{tournament.title}</h2><p className="mt-1 text-sm font-bold text-accent"><Gamepad2 className="mr-1 inline" size={15}/>{tournament.game}</p><p className="mt-3 line-clamp-2 text-sm leading-6 text-dark-muted">{tournament.description}</p><div className="mt-5 grid grid-cols-3 gap-2 text-xs"><Info icon={Users} label="Players" value={`${tournament.joinedPlayers}/${tournament.maxPlayers}`} /><Info icon={Trophy} label="Prize" value={`${tournament.prizeCoins} coins`} /><Info icon={CalendarDays} label="Starts" value={date} /></div></Link> }
function Info({ icon: Icon, label, value }: any) { return <div className="rounded-xl bg-dark-surface p-3"><Icon size={15} className="text-accent"/><p className="mt-1 text-dark-muted">{label}</p><p className="mt-0.5 font-black">{value}</p></div>; }
