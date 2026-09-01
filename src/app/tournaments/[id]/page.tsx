"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, Loader2, LogIn, Shield, Trophy, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function TournamentDetailPage({ params }: { params: { id: string } }) {
  const { user, idToken } = useAuth();
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const load = () => fetch(`/api/tournaments/${params.id}`, { cache: "no-store" }).then(r => r.json()).then(j => setData(j.data)).catch(() => setData(null));
  useEffect(() => { void load(); }, [params.id]);
  if (!data) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="animate-spin text-accent" /></div>;
  const t = data.tournament;
  const joined = Boolean(user && data.entries?.some((entry: any) => entry.userId === user.uid));
  async function join() {
    if (!idToken) { setMessage("Sign in first to join this tournament."); return; }
    setBusy(true); setMessage("");
    try { const r = await fetch(`/api/tournaments/${params.id}/join`, { method: "POST", headers: { Authorization: `Bearer ${idToken}` } }); const j = await r.json(); if (!r.ok) throw new Error(j?.error || "Unable to join"); setMessage(`Joined successfully. Balance: ${j.data.coinBalance} coins.`); await load(); } catch (e: any) { setMessage(e.message || "Unable to join"); } finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-6xl space-y-7 p-4 pb-28 sm:p-6 md:p-10">
    <Link href="/tournaments" className="text-sm font-bold text-dark-muted hover:text-accent">← All tournaments</Link>
    <section className="rounded-3xl border border-accent/20 bg-gradient-to-br from-dark-card to-dark-surface p-6 shadow-skeuo md:p-9"><div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-black text-accent">{t.status.replaceAll("_", " ")}</span><span className="rounded-full border border-dark-border px-3 py-1 text-xs font-bold text-dark-muted">{t.game}</span></div><h1 className="mt-4 text-3xl font-black md:text-5xl">{t.title}</h1><p className="mt-3 max-w-3xl text-dark-muted">{t.description}</p></div><button disabled={busy || joined || !["OPEN", "REGISTRATION_OPEN"].includes(t.status)} onClick={join} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-black text-dark disabled:cursor-not-allowed disabled:opacity-50">{busy ? <Loader2 className="animate-spin" size={18}/> : joined ? <CheckCircle2 size={18}/> : <LogIn size={18}/>} {joined ? "Joined" : "Join tournament"}</button></div>{message && <p className="mt-4 rounded-xl border border-accent/20 bg-accent/5 p-3 text-sm font-bold text-accent">{message}</p>}</section>
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat icon={Users} label="Players" value={`${t.joinedPlayers}/${t.maxPlayers}`} /><Stat icon={Trophy} label="Prize pool" value={`${t.prizeCoins} coins`} /><Stat icon={Shield} label="Entry" value={`${t.entryCoins} coins`} /><Stat icon={CalendarDays} label="Starts" value={new Date(t.startsAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} /></section>
    <section className="grid gap-6 lg:grid-cols-[1fr_360px]"><article className="rounded-2xl border border-dark-border bg-dark-card p-6"><h2 className="text-xl font-black">Players</h2><div className="mt-4 space-y-2">{(data.entries || []).map((entry: any, i: number) => <div key={entry.userId} className="flex items-center justify-between rounded-xl bg-dark-surface p-3"><div><span className="mr-3 text-xs font-black text-accent">#{entry.seed || i + 1}</span><span className="font-bold">{entry.displayName || "Player"}</span></div><span className="text-xs text-dark-muted">{entry.status}</span></div>)}{!data.entries?.length && <p className="py-8 text-center text-dark-muted">No players yet. Be the first to join.</p>}</div></article><aside className="rounded-2xl border border-dark-border bg-dark-card p-6"><h2 className="text-xl font-black">Rules</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-dark-muted">{t.rules || "Follow fair-play rules. No cheating, collusion or abusive behavior."}</p><div className="mt-5 rounded-xl bg-dark-surface p-4"><p className="text-xs uppercase tracking-wider text-dark-muted">Format</p><p className="mt-1 font-black">{t.format.replaceAll("_", " ")}</p></div></aside></section>
  </div>;
}
function Stat({ icon: Icon, label, value }: any) { return <div className="rounded-2xl border border-dark-border bg-dark-card p-5"><Icon className="text-accent" size={20}/><p className="mt-3 text-sm text-dark-muted">{label}</p><p className="mt-1 font-black">{value}</p></div>; }
