"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Search, Library, Heart, Mic, History, CreditCard, User, HelpCircle, ShieldCheck, FileText } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Explore", href: "/explore", icon: Compass },
    { label: "Search", href: "/search", icon: Search },
    { label: "Library", href: "/library", icon: Library },
    { label: "Favorites", href: "/favorites", icon: Heart },
    { label: "Podcasts", href: "/podcasts", icon: Mic },
    { label: "History", href: "/history", icon: History },
    { label: "Pricing", href: "/pricing", icon: CreditCard },
    { label: "Account", href: "/account", icon: User },
  ];
  const legal=[['Help','/help',HelpCircle],['Privacy','/privacy-policy',ShieldCheck],['Terms','/terms',FileText]] as const;
  return <aside className="hidden h-screen w-64 shrink-0 border-r border-dark-border bg-dark-surface md:sticky md:top-0 md:flex md:flex-col md:z-30"><div className="border-b border-dark-border p-6"><h1 className="text-2xl font-black tracking-wider text-accent">PODMEN X</h1><p className="mt-1 text-sm font-medium text-dark-muted">Music & podcasts</p></div><nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">{navItems.map(item=>{const Icon=item.icon;const active=pathname===item.href;return <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition ${active?"bg-accent text-dark shadow-skeuo-btn":"text-dark-muted hover:bg-dark-card hover:text-white"}`}><Icon className="h-5 w-5"/>{item.label}</Link>})}</nav><div className="border-t border-dark-border px-4 py-4"><div className="mb-2 px-2 text-sm font-bold text-dark-muted">Support</div>{legal.map(([label,href,Icon])=><Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-dark-muted hover:bg-dark-card hover:text-white"><Icon size={17}/>{label}</Link>)}</div></aside>;
}
