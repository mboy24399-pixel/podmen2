"use client";

export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import { Mail, Lock, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please enter email and password");
      return;
    }
    
    setLoading(true);
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        showToast("Successfully signed in!");
        router.push("/account");
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Create initial user document
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: userCredential.user.email,
          createdAt: Date.now(),
          isSubscribed: false,
          role: "listener",
        });
        showToast("Account created successfully!");
        router.push("/account");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      showToast(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-dark-card border border-dark-border rounded-3xl p-8 shadow-skeuo space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-white tracking-wider">PODMEN X</h1>
          <p className="text-xs text-dark-muted">
            {isLogin ? "Welcome back! Access your library." : "Create your professional account."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-dark-muted">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-dark-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-dark border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent shadow-skeuo-inset"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-dark-muted">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-dark-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-dark border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent shadow-skeuo-inset"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent text-dark font-bold rounded-xl shadow-skeuo-btn hover:scale-[1.02] transition disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-dark-muted hover:text-accent transition font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
