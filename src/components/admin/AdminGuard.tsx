"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN", "EDITOR", "MODERATOR"]);

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;
    async function check() {
      if (loading) return;
      if (!user) {
        router.replace("/login?next=/admin");
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const role = String(snap.data()?.role || "USER");
        if (!ADMIN_ROLES.has(role)) {
          router.replace("/");
          return;
        }
        if (active) setAllowed(true);
      } catch (error) {
        console.error("Admin authorization check failed", error);
        router.replace("/");
      } finally {
        if (active) setChecking(false);
      }
    }
    check();
    return () => { active = false; };
  }, [loading, user, router]);

  if (loading || checking) {
    return <div className="grid min-h-screen place-items-center bg-dark text-dark-muted">Verifying admin session…</div>;
  }
  if (!allowed) return null;
  return <>{children}</>;
}
