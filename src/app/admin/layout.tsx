"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BarChart3, Bell, CreditCard, Database, FileAudio, FileText, Flag, Gauge, LayoutDashboard, ListMusic, LockKeyhole, Search, Settings, Shield, Tags, UserCog, Users, WalletCards, Wrench, RotateCcw, BookOpen } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";

const groups = [
  { title: "CONTROL CENTER", items: [["Dashboard", "/admin", LayoutDashboard]] },
  { title: "CONTENT", items: [["Content", "/admin/content", ListMusic], ["Audio Sources", "/admin/audio-sources", FileAudio], ["Moderation", "/admin/moderation", Flag]] },
  { title: "USERS & ACCESS", items: [["Users", "/admin/users", Users], ["Roles & Permissions", "/admin/roles", UserCog], ["Security", "/admin/security", Shield], ["Login & Sessions", "/admin/sessions", LockKeyhole]] },
  { title: "COMMERCE", items: [["Payments", "/admin/payments", CreditCard], ["Subscriptions", "/admin/subscriptions", WalletCards], ["Plans & Coupons", "/admin/plans", Tags]] },
  { title: "INSIGHTS", items: [["Analytics", "/admin/analytics", BarChart3], ["Reports", "/admin/reports", FileText], ["Audit Logs", "/admin/logs", RotateCcw]] },
  { title: "PLATFORM", items: [["System", "/admin/system", Activity], ["Database", "/admin/database", Database], ["Service Health", "/admin/health", Gauge], ["Site Content", "/admin/site-content", BookOpen], ["Settings", "/admin/settings", Settings], ["Notifications", "/admin/notifications", Bell], ["Maintenance", "/admin/maintenance", Wrench]] },
] as const;
const mobileItems = [["Home", "/admin", LayoutDashboard], ["Content", "/admin/content", ListMusic], ["Users", "/admin/users", Users], ["Policies", "/admin/site-content", BookOpen], ["Alerts", "/admin/notifications", Bell]] as const;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const path = usePathname();
  if (path === "/admin/login") return <AdminGuard>{children}</AdminGuard>;
  return <AdminGuard><div className="min-h-screen bg-[#090b10] text-white"><header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0e14]/95 backdrop-blur-xl"><div className="flex h-16 items-center gap-4 px-4 md:px-6"><div className="flex min-w-0 items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-accent font-black text-dark">X</div><div><p className="text-sm font-black tracking-[.22em] text-accent">PODMEN X</p><p className="text-sm font-bold text-white">ADMIN CONTROL CENTER</p></div></div><div className="ml-auto hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[.03] px-3 py-2 text-sm text-dark-muted md:flex"><Search size={15}/> Global admin search</div><Link href="/" className="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold text-dark-muted hover:text-white">User App</Link></div></header><div className="mx-auto flex max-w-[1800px]"><aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#0d1017] md:block"><div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto p-4">{groups.map(group=><div key={group.title} className="mb-5"><p className="px-3 pb-2 text-sm font-black tracking-[.18em] text-dark-muted">{group.title}</p>{group.items.map(([label,href,Icon])=>{const active=path===href||(href!=="/admin"&&path.startsWith(`${href}/`));return <Link key={href} href={href} className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-base font-bold transition ${active?"bg-accent text-dark shadow-skeuo-btn":"text-dark-muted hover:bg-white/[.05] hover:text-white"}`}><Icon size={18}/><span>{label}</span></Link>})}</div>)}<div className="mt-8 border-t border-white/10 pt-4"><Link href="/admin/settings" className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-bold text-dark-muted hover:bg-white/[.05] hover:text-white"><Settings size={18}/> Admin Profile &amp; Settings</Link></div></div></aside><main className="min-w-0 flex-1 p-4 pb-24 md:p-7">{children}</main></div><nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl border border-white/10 bg-[#11151e]/95 p-2 shadow-2xl backdrop-blur-xl md:hidden">{mobileItems.map(([label,href,Icon])=>{const active=path===href;return <Link key={`${href}-${label}`} href={href} className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-sm font-bold ${active?"bg-accent text-dark":"text-dark-muted"}`}><Icon size={18}/>{label}</Link>})}</nav></div></AdminGuard>;
}
