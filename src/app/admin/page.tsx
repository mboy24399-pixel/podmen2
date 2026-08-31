"use client";

import { useState } from "react";
import { BarChart3, Music2, Podcast, ShieldCheck, CreditCard, Link2, Users, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const modules = [
  ["Music", "Manage tracks, albums and artists", Music2],
  ["Podcasts", "Manage shows and episodes", Podcast],
  ["Audio Sources", "Secure HTTPS audio URL management", Link2],
  ["Users", "Accounts, roles and moderation", Users],
  ["Payments", "Orders, payments and refunds", CreditCard],
  ["Analytics", "Plays, subscriptions and revenue", BarChart3],
] as const;

export default function AdminPage() {
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState("");
  const { idToken, loading, user } = useAuth();

  async function createContent(formData: FormData) {
    if (!idToken) {
      setStatus("Sign in as an authorized administrator first.");
      return;
    }

    setStatus("Saving...");
    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: formData.get("type"),
          title: formData.get("title"),
          description: formData.get("description"),
          audioUrl: formData.get("audioUrl"),
          accessType: formData.get("accessType"),
          status: formData.get("status"),
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.ok) {
        setStatus(json.error || "Unable to save content.");
        return;
      }
      setStatus(`Created successfully: ${json.data.id}`);
    } catch {
      setStatus("Network error. Please try again.");
    }
  }

  if (loading) {
    return <main className="min-h-screen grid place-items-center p-6 text-dark-muted">Loading admin session…</main>;
  }

  if (!user) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <section className="w-full max-w-md rounded-3xl border border-dark-border bg-dark-card p-8 text-center shadow-skeuo">
          <ShieldCheck className="mx-auto h-10 w-10 text-accent" />
          <h1 className="mt-4 text-2xl font-black text-white">Admin sign-in required</h1>
          <p className="mt-2 text-sm text-dark-muted">Sign in with an authorized account to access the control center.</p>
          <a href="/login" className="mt-6 inline-flex rounded-xl bg-accent px-5 py-3 font-bold text-dark shadow-skeuo-btn">Go to sign in</a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-accent font-bold text-sm flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> CONTROL CENTER</p>
          <h1 className="text-3xl md:text-4xl font-black text-white mt-2">Admin Dashboard</h1>
          <p className="text-dark-muted mt-2">Content, audio, users, payments and platform operations.</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent text-dark px-5 py-3 font-bold shadow-skeuo-btn">
          <Plus className="w-5 h-5" /> Add Audio Content
        </button>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map(([name, description, Icon]) => (
          <article key={name} className="rounded-2xl border border-dark-border bg-dark-card p-6 shadow-skeuo">
            <Icon className="w-7 h-7 text-accent" />
            <h2 className="text-xl font-bold text-white mt-4">{name}</h2>
            <p className="text-dark-muted text-sm mt-2">{description}</p>
          </article>
        ))}
      </section>

      {showForm && (
        <form action={createContent} className="rounded-2xl border border-dark-border bg-dark-card p-6 space-y-4 shadow-skeuo">
          <h2 className="text-xl font-bold text-white">Create audio record</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <select name="type" className="input" defaultValue="tracks"><option value="tracks">Track</option><option value="podcasts">Podcast</option><option value="episodes">Episode</option></select>
            <input name="title" required maxLength={200} placeholder="Title" className="input" />
            <input name="audioUrl" required type="url" placeholder="https://… audio URL" className="input md:col-span-2" />
            <select name="accessType" className="input"><option>FREE</option><option>PREMIUM</option></select>
            <select name="status" className="input"><option>DRAFT</option><option>PUBLISHED</option><option>SCHEDULED</option></select>
            <textarea name="description" maxLength={5000} placeholder="Description" className="input md:col-span-2 min-h-28" />
          </div>
          <button className="rounded-xl bg-accent text-dark px-5 py-3 font-bold shadow-skeuo-btn">Save</button>
          {status && <p className="text-sm text-dark-muted" role="status">{status}</p>}
        </form>
      )}
    </main>
  );
}
