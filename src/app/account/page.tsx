"use client";

export const dynamic = 'force-dynamic';

import React, { useEffect } from "react";
import { User, Crown, LogOut, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await auth.signOut();
    router.push("/");
  };

  if (loading) {
    return <div className="p-12 text-center text-white">Loading account...</div>;
  }

  if (!user) return null;

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <User className="w-8 h-8 text-accent" /> Account & Subscription
        </h1>
        <p className="text-dark-muted text-sm mt-1">Manage your profile, subscription tier, and security settings.</p>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-3xl p-8 shadow-skeuo space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-dark-border">
          <div className="w-16 h-16 rounded-full bg-dark border border-dark-border flex items-center justify-center text-accent text-2xl font-black shadow-skeuo-inset">
            {user.email?.[0].toUpperCase() || "U"}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Listener Account</h3>
            <p className="text-sm text-dark-muted">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-dark border border-dark-border rounded-2xl p-6 shadow-skeuo-inset space-y-2">
            <span className="text-xs font-bold text-accent uppercase tracking-wider">Subscription Tier</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-accent" /> Listener
              </span>
              <Link
                href="/pricing"
                className="px-4 py-2 bg-accent text-dark font-bold text-xs rounded-xl shadow-skeuo-btn hover:scale-105 transition"
              >
                Manage
              </Link>
            </div>
          </div>

          <div className="bg-dark border border-dark-border rounded-2xl p-6 shadow-skeuo-inset space-y-2">
            <span className="text-xs font-bold text-dark-muted uppercase tracking-wider">Security</span>
            <div className="flex items-center gap-2 text-sm text-white">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Firebase Auth Secure Session
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-bold rounded-xl hover:bg-red-500/20 transition text-sm"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
