"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, Loader2, RefreshCw, ServerCog, ShieldCheck } from "lucide-react";

export default function AdminSettingsPage() {
  const { idToken } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState("");
  const load = async () => {
    if (!idToken) return;
    setError("");
    try {
      const r = await fetch("/api/admin/me", { headers: { Authorization: `Bearer ${idToken}` }, cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Unable to load administrator settings");
      setProfile(j.data);
    } catch (e: any) { console.error("Admin settings load failed", e); setError(e?.message || "Unable to load administrator settings"); }
  };
  useEffect(() => { load(); }, [idToken]);
  return <section className="space-y-6"><header className="rounded-3xl border border-white/10 bg-dark-card p-6 shadow-skeuo"><p className="text-[10px] font-black tracking-[.2em] text-accent">PLATFORM / SETTINGS</p><h1 className="mt-2 text-3xl font-black">Admin Settings</h1><p className="mt-2 text-sm text-dark-muted">Protected administrator configuration and service identity.</p></header><div className="grid gap-4 md:grid-cols-2"><article className="rounded-2xl border border-white/10 bg-dark-card p-5"><ShieldCheck className="text-accent"/><h2 className="mt-3 font-black">Administrator identity</h2>{profile?<div className="mt-4 space-y-2 text-sm"><p><span className="text-dark-muted">Email:</span> {profile.email||"—"}</p><p><span className="text-dark-muted">Role:</span> {profile.role}</p><p><span className="text-dark-muted">UID:</span> <code className="text-xs">{profile.uid}</code></p></div>:<Loader2 className="mt-4 animate-spin text-accent" size={18}/>}</article><article className="rounded-2xl border border-white/10 bg-dark-card p-5"><ServerCog className="text-accent"/><h2 className="mt-3 font-black">Production checks</h2><div className="mt-4 space-y-3 text-sm"><p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-accent"/> Server-side admin authorization</p><p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-accent"/> Firebase Admin SDK</p><p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-accent"/> Razorpay server verification</p></div></article></div>{error&&<div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200">{error}<button onClick={load} className="ml-4 inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 font-bold"><RefreshCw size={14}/> Retry</button></div>}</section>;
}
