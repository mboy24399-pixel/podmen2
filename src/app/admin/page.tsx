"use client";

import Link from "next/link";
import { Activity, AlertTriangle, BarChart3, CreditCard, Database, FileAudio, Flag, Gauge, Layers3, ListMusic, LockKeyhole, Shield, ShieldCheck, Tags, Users, WalletCards, Wrench } from "lucide-react";

const cards = [
  ["Content CMS", "Tracks, albums, artists, podcasts & episodes", "/admin/content", ListMusic],
  ["Audio Sources", "Licensed HTTPS source management", "/admin/audio-sources", FileAudio],
  ["Users", "Accounts, roles, bans & suspensions", "/admin/users", Users],
  ["Payments", "Orders, refunds & failed payments", "/admin/payments", CreditCard],
  ["Subscriptions", "Trials, renewals & entitlements", "/admin/subscriptions", WalletCards],
  ["Plans & Coupons", "Pricing, trials and offers", "/admin/plans", Tags],
  ["Analytics", "Revenue, users, streams & retention", "/admin/analytics", BarChart3],
  ["Moderation", "Review, publish, reject & restore", "/admin/moderation", Flag],
  ["Security", "2FA, suspicious activity & access", "/admin/security", Shield],
  ["Audit Logs", "Privileged activity and change history", "/admin/logs", Layers3],
  ["System", "Configuration & maintenance controls", "/admin/system", Wrench],
  ["Service Health", "API, Firebase and gateway status", "/admin/health", Gauge],
] as const;

const stats = [
  ["Revenue", "Server-backed", CreditCard],
  ["Users", "Server-backed", Users],
  ["Streams", "Server-backed", Activity],
  ["Subscriptions", "Server-backed", WalletCards],
] as const;

export default function AdminPage() {
  return <section className="space-y-7">
    <header className="rounded-3xl border border-accent/20 bg-gradient-to-br from-dark-card to-[#111722] p-6 shadow-skeuo md:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="flex items-center gap-2 text-xs font-black tracking-[.2em] text-accent"><ShieldCheck size={15}/> PODMEN X ADMIN</p><h1 className="mt-3 text-3xl font-black md:text-5xl">God-Level Control Center</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-dark-muted">One privileged surface for platform operations. User navigation is completely isolated from this control plane.</p></div><div className="flex gap-2"><Link href="/admin/security" className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-dark-muted hover:text-white"><LockKeyhole className="mr-2 inline" size={15}/>Security</Link><Link href="/admin/health" className="rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-dark"><Gauge className="mr-2 inline" size={15}/>Health</Link></div></div>
    </header>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label,value,Icon])=><article key={label} className="rounded-2xl border border-white/10 bg-dark-card p-5 shadow-skeuo"><div className="flex items-center justify-between"><span className="text-sm font-bold text-dark-muted">{label}</span><Icon size={19} className="text-accent"/></div><p className="mt-4 text-xl font-black">{value}</p><p className="mt-1 text-xs text-dark-muted">Use the dedicated module for live server data.</p></article>)}</section>

    <section><div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-black">Operations</h2><p className="text-sm text-dark-muted">Every major platform surface has its own protected module.</p></div><AlertTriangle className="text-accent" size={21}/></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([title,description,href,Icon])=><Link key={href} href={href} className="group rounded-2xl border border-white/10 bg-dark-card p-5 shadow-skeuo transition hover:-translate-y-0.5 hover:border-accent/50"><Icon size={22} className="text-accent"/><h3 className="mt-4 font-black group-hover:text-accent">{title}</h3><p className="mt-2 text-xs leading-5 text-dark-muted">{description}</p><p className="mt-4 text-[10px] font-black tracking-wider text-accent">OPEN MODULE →</p></Link>)}</div></section>

    <section className="grid gap-4 md:grid-cols-3"><article className="rounded-2xl border border-white/10 bg-dark-card p-5"><Database className="text-accent" size={20}/><h3 className="mt-3 font-black">Database health</h3><p className="mt-1 text-xs text-dark-muted">Firestore access is server-authorized for privileged operations.</p></article><article className="rounded-2xl border border-white/10 bg-dark-card p-5"><Shield className="text-accent" size={20}/><h3 className="mt-3 font-black">RBAC enforced</h3><p className="mt-1 text-xs text-dark-muted">Admin APIs verify Firebase ID tokens and server-side roles.</p></article><article className="rounded-2xl border border-white/10 bg-dark-card p-5"><Activity className="text-accent" size={20}/><h3 className="mt-3 font-black">Operational visibility</h3><p className="mt-1 text-xs text-dark-muted">Failures are logged instead of being silently hidden behind generic UI toasts.</p></article></section>
  </section>;
}
