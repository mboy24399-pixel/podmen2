"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  idToken: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  idToken: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          setIdToken(token);
        } catch (error) {
          console.error("Error getting ID token:", error);
          setIdToken(null);
        }
      } else {
        setIdToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update token periodically if needed, or rely on firebase SDK
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      try {
        const token = await user.getIdToken(true);
        setIdToken(token);
      } catch (error) {
        console.error("Error refreshing token:", error);
      }
    }, 10 * 60 * 1000); // refresh every 10 mins

    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, idToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
