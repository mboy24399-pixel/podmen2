"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert, RefreshCw, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type GuardState = "checking" | "allowed" | "unauthenticated" | "forbidden" | "error";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, idToken, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<GuardState>("checking");
  const [message, setMessage] = useState("Verifying administrator session…");
  const [attempt, setAttempt] = useState(0);

  const verify = useCallback(async () => {
    if (pathname === "/admin/login") return;
    if (loading) return;
    if (!user) {
      setState("unauthenticated");
      setMessage("Administrator sign-in is required.");
      return;
    }

    try {
      let token = idToken || await user.getIdToken();
      if (!token) throw new Error("AUTH_TOKEN_UNAVAILABLE");
      let response = await fetch("/api/admin/me", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (response.status === 401) {
        token = await user.getIdToken(true);
        response = await fetch("/api/admin/me", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      }
      if (response.status === 401) { setState("unauthenticated"); setMessage("Your administrator session has expired. Sign in again."); return; }
      if (response.status === 403) { setState("forbidden"); setMessage("This Google account is authenticated but is not provisioned as an administrator."); return; }
      if (!response.ok) throw new Error(`ADMIN_AUTH_${response.status}`);
      const payload = await response.json();
      if (!payload?.data?.role) throw new Error("ADMIN_ROLE_MISSING");
      setState("allowed");
    } catch (error) {
      console.error("Admin authorization check failed", error);
      setState("error");
      setMessage("Unable to verify the administrator service. Retry after checking the server configuration.");
    }
  }, [idToken, loading, pathname, user]);

  useEffect(() => { setState("checking"); verify(); }, [verify, attempt]);

  useEffect(() => {
    if (state === "unauthenticated") router.replace("/admin/login");
  }, [router, state]);

  if (pathname === "/admin/login") return <>{children}</>;
  if (loading || state === "checking") return <div className="grid min-h-screen place-items-center bg-[#090b10] px-6 text-sm text-dark-muted">Verifying admin session…</div>;
  if (state === "allowed") return <>{children}</>;
  if (state === "unauthenticated") return <div className="grid min-h-screen place-items-center bg-[#090b10] px-6 text-center text-white"><div><LogIn className="mx-auto mb-4 text-accent"/><p className="font-bold">Redirecting to administrator sign-in…</p></div></div>;
  if (state === "forbidden") return <div className="grid min-h-screen place-items-center bg-[#090b10] px-6 text-center text-white"><div className="max-w-md"><ShieldAlert className="mx-auto mb-4 text-red-400" size={38}/><h1 className="text-2xl font-black">Admin Access Denied</h1><p className="mt-2 text-sm text-dark-muted">{message}</p><button onClick={() => router.replace("/admin/login")} className="mt-6 rounded-xl bg-accent px-4 py-2 text-sm font-black text-dark">Administrator Sign In</button></div></div>;
  return <div className="grid min-h-screen place-items-center bg-[#090b10] px-6 text-center text-white"><div className="max-w-md"><ShieldAlert className="mx-auto mb-4 text-accent" size={38}/><h1 className="text-2xl font-black">Admin Session Check Failed</h1><p className="mt-2 text-sm text-dark-muted">{message}</p><button onClick={() => setAttempt((value) => value + 1)} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-black text-dark"><RefreshCw size={15}/> Retry verification</button></div></div>;
}
