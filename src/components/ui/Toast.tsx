"use client";

import React, { useState, useEffect, ReactNode } from "react";

let globalSetToast: ((msg: string | null) => void) | null = null;

export function showToast(msg: string) {
  if (globalSetToast) {
    globalSetToast(msg);
    setTimeout(() => {
      globalSetToast?.(null);
    }, 3000);
  } else {
    console.log("Toast:", msg);
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    globalSetToast = setMessage;
    return () => {
      globalSetToast = null;
    };
  }, []);

  return (
    <>
      {children}
      {message && (
        <div className="fixed bottom-24 right-6 z-50 bg-accent text-dark px-4 py-2 rounded-xl shadow-skeuo font-medium text-sm animate-bounce">
          {message}
        </div>
      )}
    </>
  );
}

export function useToast() {
  return { showToast };
}
