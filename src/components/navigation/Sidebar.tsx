"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Search, Library, Heart, ListMusic, Mic, History, CreditCard, User, LogOut } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Explore", href: "/explore", icon: Compass },
    { label: "Search", href: "/search", icon: Search },
    { label: "Library", href: "/library", icon: Library },
    { label: "Favorites", href: "/favorites", icon: Heart },
    { label: "Playlists", href: "/playlists", icon: ListMusic },
    { label: "Podcasts", href: "/podcasts", icon: Mic },
    { label: "History", href: "/history", icon: History },
    { label: "Pricing", href: "/pricing", icon: CreditCard },
    { label: "Account", href: "/account", icon: User },
  ];

  return (
    <aside className="w-64 bg-dark-surface border-r border-dark-border flex flex-col h-screen sticky top-0 z-30 hidden md:flex">
      <div className="p-6 border-b border-dark-border">
        <h1 className="text-2xl font-black text-accent tracking-wider">PODMEN X</h1>
        <p className="text-xs text-dark-muted mt-1">Production Audio Platform</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition text-sm ${
                isActive
                  ? "bg-accent text-dark shadow-skeuo-btn font-semibold"
                  : "text-dark-muted hover:text-white hover:bg-dark-card"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-dark-border">
        <Link
          href="/login"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-dark-muted hover:text-white hover:bg-dark-card transition text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          Sign In / Register
        </Link>
      </div>
    </aside>
  );
}
