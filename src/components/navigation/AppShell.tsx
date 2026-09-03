"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/navigation/Sidebar";
import Header from "@/components/navigation/Header";
import MobileNav from "@/components/navigation/MobileNav";

const publicLinks = [
  ["Help", "/help"],
  ["Contact", "/contact"],
  ["Privacy", "/privacy-policy"],
  ["Terms", "/terms"],
  ["Refund Policy", "/refund-policy"],
  ["Cancellation", "/cancellation-policy"],
  ["Subscription & Billing", "/subscription-terms"],
] as const;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  if (isAdmin) return <main className="min-h-screen bg-dark text-white">{children}</main>;
  return <div className="user-skeuo-theme flex min-h-screen">
    <Sidebar />
    <div className="flex min-w-0 flex-1 flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto pb-24 md:pb-8">{children}</main>
      <footer className="border-t border-dark-border bg-dark-surface/90 px-5 py-6 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-dark-muted">
          <span className="font-black text-accent">PODMEN X</span>
          {publicLinks.map(([label, href]) => <Link key={href} href={href} className="hover:text-white">{label}</Link>)}
        </div>
      </footer>
    </div>
    <MobileNav />
  </div>;
}
