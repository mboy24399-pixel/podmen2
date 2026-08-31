"use client";

import { useEffect, useState } from "react";
import { signInWithPopup, getRedirectResult, signInWithRedirect, signOut } from "firebase/auth";
import { Chrome, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getRedirectResult(auth).then(async (result) => {
      if (!active || !result?.user) return;
      await authorize(result.user);
    }).catch((e: any) => {
      if (active && e?.code !== "auth/popup-closed-by-user") setError(e?.message || "Google sign-in failed");
    });
    return () => { active = false; };
  }, []);

  const authorize = async (signedInUser: typeof user) => {
    if (!signedInUser) return;
    setBusy(true);
    setError("");
    try {
      const token = await signedInUser.getIdToken(true);
      const response = await fetch("/api/admin/bootstrap", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok) {
        await signOut(auth);
        throw new Error(payload?.error || "This Google account is not authorized for Podmen X Admin.");
      }
      router.replace("/admin");
    } catch (e: any) {
      setError(e?.message || "Administrator sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  const login = async () => {
    setBusy(true);
    setError("");
    try {
      if (typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      const result = await signInWithPopup(auth, googleProvider);
      await authorize(result.user);
    } catch (e: any) {
      setError(e?.message || "Google sign-in failed");
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!loading && user) authorize(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#07090d] px-5 text-white">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d1017] p-7 shadow-2xl sm:p-9">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent text-dark shadow-skeuo-btn"><ShieldCheck size={30} /></div>
        <p className="mt-6 text-center text-[10px] font-black tracking-[.24em] text-accent">PODMEN X ADMIN</p>
        <h1 className="mt-2 text-center text-3xl font-black">Administrator Sign In</h1>
        <p className="mt-3 text-center text-sm leading-6 text-dark-muted">Use the authorized Google account. Administrator access is verified on the server before the control center opens.</p>
        <button onClick={login} disabled={busy} className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3.5 text-sm font-black text-slate-900 disabled:opacity-60">
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Chrome size={18} />}
          {busy ? "Verifying…" : "Continue with Google"}
        </button>
        {error && <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs leading-5 text-red-200">{error}</div>}
        <p className="mt-6 text-center text-[11px] text-dark-muted">No email/password admin login. No user-panel navigation.</p>
      </section>
    </main>
  );
}
