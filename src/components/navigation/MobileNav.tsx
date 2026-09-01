"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library, Heart, Mic2, Coins } from "lucide-react";
const items=[["Home","/",Home],["Search","/search",Search],["Library","/library",Library],["Rewards","/rewards",Coins],["Podcasts","/podcasts",Mic2]] as const;
export default function MobileNav(){const path=usePathname();return <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-dark-border bg-dark-surface/95 px-2 py-2 backdrop-blur md:hidden"><div className="mx-auto flex max-w-lg items-center justify-around">{items.map(([label,href,Icon])=><Link key={href} href={href} className={`flex min-w-16 flex-col items-center gap-1 rounded-xl px-2 py-2 text-sm font-semibold ${path===href?"bg-accent text-dark":"text-dark-muted"}`}><Icon size={19}/>{label}</Link>)}</div></nav>}
