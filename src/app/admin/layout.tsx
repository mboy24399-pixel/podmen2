"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CreditCard, FileAudio, LayoutDashboard, ListMusic, Settings, Users, WalletCards } from "lucide-react";

const items=[
 ["Dashboard","/admin",LayoutDashboard],
 ["Content","/admin/content",ListMusic],
 ["Audio Sources","/admin/audio",FileAudio],
 ["Users","/admin/users",Users],
 ["Payments","/admin/payments",CreditCard],
 ["Plans","/admin/plans",WalletCards],
 ["Analytics","/admin/analytics",BarChart3],
 ["Settings","/admin/settings",Settings],
] as const;
export default function AdminLayout({children}:{children:React.ReactNode}){const path=usePathname();return <div className="min-h-full"><div className="mx-auto flex max-w-[1500px] gap-5 p-3 pb-28 md:p-6"><aside className="hidden w-60 shrink-0 md:block"><div className="skeuo-panel sticky top-5 p-3"><p className="px-3 pb-3 text-[10px] font-black tracking-[.2em] text-accent">PODMEN X ADMIN</p>{items.map(([label,href,Icon])=>{const active=path===href||path.startsWith(href+"/");return <Link key={href} href={href} className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${active?"bg-accent text-dark shadow-skeuo-btn":"text-dark-muted hover:bg-dark-card hover:text-white"}`}><Icon size={17}/>{label}</Link>})}</div></aside><section className="min-w-0 flex-1">{children}</section></div></div>}
