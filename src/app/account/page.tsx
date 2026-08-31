"use client";

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from "react";
import { User, Crown, LogOut, ShieldCheck, Clock3, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

type Profile = {
  subscriptionStatus?: string;
  isSubscribed?: boolean;
  subscriptionExpiry?: number;
  trialEndsAt?: number;
  subscriptionPlanName?: string;
  subscriptionPlanId?: string;
  subscriptionPlanInterval?: string;
};

const formatRemaining = (expiry: number) => {
  const ms = expiry - Date.now();
  if (ms <= 0) return "Expired";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days) return `${days}d ${hours}h remaining`;
  if (hours) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
};

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({});
  const [profileLoading, setProfileLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  const loadProfile = async () => {
    if (!user) return;
    setProfileLoading(true);
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      setProfile((snap.data() || {}) as Profile);
    } catch (error) {
      console.error("Account profile load failed", error);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => { void loadProfile(); }, [user]);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 30000); return () => window.clearInterval(timer); }, []);

  const handleSignOut = async () => { await auth.signOut(); router.push("/"); };
  if (loading) return <div className="p-12 text-center text-white">Loading account...</div>;
  if (!user) return null;

  const expiry = Number(profile.subscriptionExpiry || profile.trialEndsAt || 0);
  const active = Boolean(profile.isSubscribed) && expiry > now;
  const status = active ? String(profile.subscriptionStatus || 'ACTIVE').toUpperCase() : 'FREE';
  const planName = active ? (profile.subscriptionPlanName || (status === 'TRIAL' ? 'Premium Trial' : 'Premium')) : 'Free Listener';

  return <div className="mx-auto max-w-5xl space-y-7 p-5 pb-32 md:p-10">
    <header className="skeuo-panel p-6 md:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="eyebrow flex items-center gap-2"><Sparkles size={14}/> ACCOUNT</p><h1 className="mt-2 flex items-center gap-2 text-3xl font-black"><User className="text-accent"/> Account & Subscription</h1><p className="mt-2 text-sm text-dark-muted">Your entitlement is read from the live Firebase profile.</p></div><button onClick={() => void loadProfile()} className="skeuo-button inline-flex items-center gap-2"><RefreshCw size={15} className={profileLoading ? 'animate-spin' : ''}/> Refresh</button></div></header>

    <section className="grid gap-5 md:grid-cols-3">
      <article className="skeuo-card p-6 md:col-span-2"><div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-dark text-accent shadow-skeuo-inset text-2xl font-black">{user.email?.[0]?.toUpperCase() || 'U'}</div><div className="min-w-0"><h2 className="text-xl font-black">{user.displayName || 'Listener Account'}</h2><p className="truncate text-sm text-dark-muted">{user.email}</p></div></div></article>
      <article className="skeuo-card border-accent/30 p-6"><span className="text-xs font-black uppercase tracking-wider text-accent">Current access</span><div className="mt-3 flex items-center gap-2 text-xl font-black"><Crown className="text-accent" fill={active ? 'currentColor' : 'none'}/>{planName}</div><p className="mt-1 text-xs text-dark-muted">{status}</p></article>
    </section>

    <section className="skeuo-panel p-6 md:p-8"><div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-accent">Live entitlement</p><h2 className="mt-2 text-2xl font-black">{active ? 'Premium is fully unlocked' : 'Free listener access'}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-dark-muted">{active ? 'Premium tracks, podcasts and player features are available until the server-side expiry time.' : 'Upgrade or use your new-account trial to unlock Premium access.'}</p></div><Link href="/pricing" className="skeuo-button-primary inline-flex shrink-0 items-center justify-center gap-2"><Crown size={17}/> {active ? 'Manage Premium' : 'View Premium'}</Link></div>
      {active && <div className="mt-7 grid gap-4 sm:grid-cols-2"><div className="skeuo-card p-5"><div className="flex items-center gap-2 text-accent"><Clock3 size={18}/><span className="text-xs font-black uppercase">Time remaining</span></div><p className="mt-3 text-2xl font-black">{formatRemaining(expiry)}</p><p className="mt-1 text-xs text-dark-muted">Live countdown updates every 30 seconds.</p></div><div className="skeuo-card p-5"><div className="text-xs font-black uppercase tracking-wider text-dark-muted">Expires</div><p className="mt-3 text-lg font-black">{new Date(expiry).toLocaleString()}</p><p className="mt-1 text-xs text-dark-muted">Plan: {profile.subscriptionPlanName || 'Premium'}{profile.subscriptionPlanInterval ? ` · ${profile.subscriptionPlanInterval}` : ''}</p></div></div>}
    </section>

    <section className="skeuo-card p-6"><div className="flex items-center gap-2 text-sm font-bold"><ShieldCheck className="text-accent" size={18}/> Firebase Auth Secure Session</div><div className="mt-5 flex justify-end"><button onClick={handleSignOut} className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-400 hover:bg-red-500/20"><LogOut size={16}/> Sign Out</button></div></section>
  </div>;
}
