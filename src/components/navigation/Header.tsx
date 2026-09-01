"use client";

import Link from "next/link";
import { Search, Bell, Crown, Palette } from "lucide-react";

export default function Header() {
  return <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-dark-border bg-dark-surface px-4 sm:px-6">
    <div className="flex w-full max-w-2xl items-center gap-3"><div className="relative hidden w-full sm:block"><Search className="absolute left-3 top-3 h-5 w-5 text-dark-muted"/><input type="search" placeholder="Search tracks, podcasts, creators" className="w-full rounded-xl border border-dark-border bg-dark-card py-2.5 pl-11 pr-4 text-base text-white shadow-skeuo-inset focus:border-accent focus:outline-none"/></div></div>
    <div className="ml-3 flex items-center gap-2 sm:gap-3"><button onClick={()=>document.querySelector<HTMLButtonElement>('button[aria-label="Customize colors and design"]')?.click()} className="grid h-11 w-11 place-items-center rounded-xl border border-dark-border bg-dark-card text-accent shadow-skeuo" aria-label="Open design studio" title="Customize design"><Palette size={19}/></button><Link href="/pricing" className="hidden items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-black text-dark shadow-skeuo-btn sm:flex"><Crown className="h-4 w-4" fill="currentColor"/> Premium</Link><Link href="/notifications" className="grid h-11 w-11 place-items-center rounded-xl border border-dark-border bg-dark-card text-dark-muted shadow-skeuo hover:text-accent" aria-label="Notifications"><Bell className="h-5 w-5"/></Link><Link href="/account" className="grid h-11 w-11 place-items-center rounded-full border border-dark-border bg-dark-card font-black text-accent shadow-skeuo" title="Account">U</Link></div>
  </header>;
}
