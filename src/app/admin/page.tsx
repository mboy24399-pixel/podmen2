"use client";

import { useState } from "react";
import { BarChart3, Headphones, Music2, Podcast, ShieldCheck, CreditCard, Link2, Users, Plus } from "lucide-react";

const modules = [
  ["Music", "Manage tracks, albums and artists", Music2],
  ["Podcasts", "Manage shows and episodes", Podcast],
  ["Audio Sources", "Secure HTTPS audio URL management", Link2],
  ["Users", "Accounts, roles and moderation", Users],
  ["Payments", "Orders, payments and refunds", CreditCard],
  ["Analytics", "Plays, subscriptions and revenue", BarChart3],
];

export default function AdminPage() {
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState("");

  async function createContent(formData: FormData) {
    setStatus("Saving...");
    // Authentication token must be supplied by the app's Firebase auth context.
    // This UI intentionally does not invent credentials or bypass authorization.
    const token = window.localStorage.getItem("firebaseIdToken");
    if (!token) { setStatus("Sign in as an authorized admin/editor first."); return; }
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        type: formData.get("type"), title: formData.get("title"), description: formData.get("description"),
        audioUrl: formData.get("audioUrl"), accessType: formData.get("accessType"), status: formData.get("status"),
      }),
    });
    const json = await response.json();
    setStatus(json.ok ? `Created: ${json.data.id}` : (json.error || "Failed"));
  }

  return (
    <main className="min-h-screen p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-accent font-bold text-sm flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> CONTROL CENTER</p>
          <h1 className="text-3xl md:text-4xl font-black text-white mt-2">Admin Dashboard</h1>
          <p className="text-dark-muted mt-2">Content, audio, users, payments and platform operations.</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent text-dark px-5 py-3 font-bold">
          <Plus className="w-5 h-5" /> Add Audio Content
        </button>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map(([name, description, Icon]) => (
          <article key={name} className="rounded-2xl border border-dark-border bg-dark-card p-6">
            <Icon className="w-7 h-7 text-accent" />
            <h2 className="text-xl font-bold text-white mt-4">{name}</h2>
            <p className="text-dark-muted text-sm mt-2">{description}</p>
          </article>
        ))}
      </section>

      {showForm && (
        <form action={createContent} className="rounded-2xl border border-dark-border bg-dark-card p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">Create audio record</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <select name="type" className="input" defaultValue="tracks"><option value="tracks">Track</option><option value="podcasts">Podcast</option><option value="episodes">Episode</option></select>
            <input name="title" required maxLength={200} placeholder="Title" className="input" />
            <input name="audioUrl" required type="url" placeholder="https://... audio URL" className="input md:col-span-2" />
            <select name="accessType" className="input"><option>FREE</option><option>PREMIUM</option></select>
            <select name="status" className="input"><option>DRAFT</option><option>PUBLISHED</option><option>SCHEDULED</option></select>
            <textarea name="description" maxLength={5000} placeholder="Description" className="input md:col-span-2 min-h-28" />
          </div>
          <button className="rounded-xl bg-accent text-dark px-5 py-3 font-bold">Save</button>
          {status && <p className="text-sm text-dark-muted">{status}</p>}
        </form>
      )}
    </main>
  );
}
