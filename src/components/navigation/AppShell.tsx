"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/navigation/Sidebar";
import Header from "@/components/navigation/Header";
import MobileNav from "@/components/navigation/MobileNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    return <main className="min-h-screen bg-dark text-white">{children}</main>;
  }

  return (
    <div className="user-skeuo-theme flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
