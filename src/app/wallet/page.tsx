"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Coins, Trophy, WalletCards } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function WalletPage() {
  const { idToken, loading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  useEffect(() => { if (!idToken) return; fetch("/api/wallet", { headers: { Authorization: `Bearer ${idToken}` }, cache: "no-store" }).then(r => r.json()).then(j => setData(j.data)).catch(() => setData(null)); }, [idToken]);
  if (authLoading) return null;
  if (!idToken) return <div className="mx-auto max-w-xl p-6 pb-28 md:p-10"><div className="rounded-2xl border border-dark-border bg-dark-card p-8 text-center"><WalletCards className="mx-auto text-accent" size={32}/><h1 className="mt-4 text-2xl font-black">Your tournament wallet</h1><p className="mt-2 text-dark-muted">Sign in to see your coins and ledger.</p><Link href="/login" className="mt-6 inline-flex rounded-xl bg-accent px-5 py-3 font-black text-dark">Sign in</Link></div></div>;
  return <div className="mx-auto max-w-4xl space-y-6 p-4 pb-28 sm:p-6 md:p-10"><header className="rounded-3xl border border-accent/20 bg-accent/5 p-6 md:p-8"><p className="text-sm font-black uppercase tracking-widest text-accent">Player wallet</p><h1 className="mt-2 text-3xl font-black md:text-5xl">{data?.coinBalance ?? 0} coins</h1><p className="mt-2 text-dark-muted">Use coins for tournament entry fees and receive rewards from completed events.</p></header><section className="rounded-2xl border border-dark-border bg-dark-card p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-black">Recent activity</h2><Coins className="text-accent"/></div><div className="mt-4 space-y-2">{data?.ledger?.map((item: any) => <div key={item.id} className="flex items-center justify-between rounded-xl bg-dark-surface p-4"><div><p className="font-bold">{String(item.reason || "COIN ACTIVITY").replaceAll("_", " ")}</p><p className="text-xs text-dark-muted">{item.sourceId || "System"}</p></div><span className={`font-black ${item.direction === "CREDIT" ? "text-accent" : "text-red-300"}`}>{item.direction === "CREDIT" ? "+" : "-"}{item.amount}</span></div>)}{!data?.ledger?.length && <p className="py-8 text-center text-dark-muted">No coin activity yet.</p>}</div></section><Link href="/tournaments" className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-black text-dark"><Trophy size={18}/> Enter a tournament</Link></div>;
}
