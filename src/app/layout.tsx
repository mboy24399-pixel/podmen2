import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/navigation/Sidebar";
import Header from "@/components/navigation/Header";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/context/AuthContext";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Podmen X — Professional Audio & Podcast Platform",
  description: "Production-grade music streaming and podcast subscription platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-dark text-white min-h-screen flex selection:bg-accent selection:text-dark`}>
        <AuthProvider>
          <ToastProvider>
            <Suspense fallback={<div className="w-64 bg-dark-surface" />}>
              <Sidebar />
            </Suspense>
            <div className="flex-1 flex flex-col min-w-0">
              <Header />
              <main className="flex-1 overflow-y-auto pb-28">{children}</main>
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
