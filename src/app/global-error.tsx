"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("PODMEN_X_GLOBAL_CLIENT_ERROR", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", background: "#0d0e12", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, boxSizing: "border-box" }}>
          <section style={{ width: "100%", maxWidth: 520, padding: 28, borderRadius: 20, background: "#171922", border: "1px solid #343746", boxShadow: "0 20px 60px rgba(0,0,0,.45)" }}>
            <div style={{ color: "#f4b72b", fontWeight: 900, letterSpacing: 1 }}>PODMEN X</div>
            <h1 style={{ margin: "12px 0 8px", fontSize: 28 }}>Application error</h1>
            <p style={{ margin: "0 0 18px", color: "#a8adbd", lineHeight: 1.6 }}>
              The browser hit a client-side error. The exact error is shown below so it can be fixed instead of hiding behind a blank screen.
            </p>
            <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", padding: 14, borderRadius: 12, background: "#0d0e12", color: "#ffb4b4", fontSize: 12, lineHeight: 1.5 }}>
              {error?.message || "Unknown client-side error"}
              {error?.digest ? `\nDigest: ${error.digest}` : ""}
            </pre>
            <button onClick={() => reset()} style={{ marginTop: 18, width: "100%", border: 0, borderRadius: 12, padding: "13px 16px", background: "#f4b72b", color: "#111", fontWeight: 900, cursor: "pointer" }}>
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
