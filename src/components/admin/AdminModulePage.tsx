"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Database, RefreshCw, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function moduleKey(title: string) {
  const value = title.toLowerCase();
  if (value.includes("content")) return "content";
  if (value.includes("audio source")) return "audio-sources";
  if (value.includes("user")) return "users";
  if (value.includes("role")) return "roles";
  if (value.includes("payment")) return "payments";
  if (value.includes("subscription")) return "subscriptions";
  if (value.includes("plan")) return "plans";
  if (value.includes("moderation")) return "moderation";
  if (value.includes("report")) return "reports";
  if (value.includes("security")) return "security";
  if (value.includes("audit") || value.includes("log")) return "logs";
  if (value.includes("database")) return "database";
  if (value.includes("health")) return "health";
  if (value.includes("notification")) return "notifications";
  if (value.includes("maintenance")) return "maintenance";
  return "system";
}

export default function AdminModulePage({ title, description, features }: { title: string; description: string; features: string[] }) {
  const { idToken } = useAuth();
  const module = useMemo(() => moduleKey(title), [title]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    if (!idToken) return;
    setLoading(true); setError("");
    try {
      const r = await fetch(`/api/admin/module?module=${encodeURIComponent(module)}`, { headers: { Authorization: `Bearer ${idToken}` }, cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Unable to load module");
      setCollections(j.data?.collections || []);
    } catch (e: any) { console.error(`Admin ${module} module failed`, e); setError(e?.message || "Unable to load module"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [idToken, module]);
  const total = collections.reduce((sum, x) => sum + Number(x.count || 0), 0);
  return <section className="space-y-6">
    <header className="rounded-3xl border border-white/10 bg-dark-card p-6 shadow-skeuo"><p className="text-[10px] font-black tracking-[.2em] text-accent">PODMEN X ADMIN / OPERATIONS</p><div className="mt-2 flex items-start justify-between gap-4"><div><h1 className="text-3xl font-black">{title}</h1><p className="mt-2 max-w-3xl text-sm text-dark-muted">{description}</p></div><ShieldCheck className="hidden h-8 w-8 text-accent md:block"/></div></header>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{features.map(feature => <article key={feature} className="rounded-2xl border border-white/10 bg-dark-card p-5"><h2 className="font-bold">{feature}</h2><p className="mt-2 text-xs leading-5 text-dark-muted">Protected server-backed operation.</p></article>)}</div>
    <section className="rounded-2xl border border-white/10 bg-dark-card p-5 shadow-skeuo"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-accent">Live data</p><h2 className="mt-1 text-xl font-black">{total.toLocaleString()} records available</h2></div><button onClick={load} className="rounded-xl border border-white/10 p-2 text-dark-muted hover:text-white" aria-label="Refresh"><RefreshCw size={17} className={loading ? "animate-spin" : ""}/></button></div>{error&&<p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-200">{error}</p>}{loading?<div className="mt-6 h-24 animate-pulse rounded-xl bg-white/5"/>:<div className="mt-5 space-y-4">{collections.map((group)=><div key={group.collection} className="rounded-xl border border-white/10 bg-white/[.02] p-4"><div className="flex items-center gap-2"><Database size={16} className="text-accent"/><b>{group.collection}</b><span className="ml-auto text-xs text-dark-muted">{group.count} records</span></div>{group.items?.length?<div className="mt-3 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-xs"><thead className="border-b border-white/10 text-dark-muted"><tr><th className="py-2 pr-3">ID</th><th className="py-2 pr-3">Name / Email</th><th className="py-2 pr-3">Status</th><th className="py-2">Updated</th></tr></thead><tbody>{group.items.map((item:any)=><tr key={item.id} className="border-b border-white/5"><td className="max-w-48 truncate py-2 pr-3 font-mono">{item.id}</td><td className="max-w-64 truncate py-2 pr-3">{item.title||item.displayName||item.email||item.action||item.name||"—"}</td><td className="py-2 pr-3">{item.status||item.role||item.subscriptionStatus||item.eventType||"—"}</td><td className="py-2 text-dark-muted">{item.updatedAt||item.createdAt?new Date(Number(item.updatedAt||item.createdAt)).toLocaleString():"—"}</td></tr>)}</tbody></table></div>:<p className="mt-3 text-xs text-dark-muted">No records yet.</p>}</div>)}</div>}</section>
    <Link href="/admin" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-dark-muted hover:text-white"><ArrowLeft size={15}/> Back to control center</Link>
  </section>;
}
