"use client";

import { useEffect, useMemo, useState } from 'react';
import { Check, RefreshCw, Save, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type Key = 'privacy' | 'terms' | 'refund' | 'cancellation' | 'contact' | 'subscription' | 'help';
type Item = { id: string; key: Key; title: string; body: string; updatedAt?: number };

type DefaultItem = { key: Key; title: string; description: string; body: string };

const defaults: DefaultItem[] = [
  { key: 'privacy', title: 'Privacy Policy', description: 'How Podmen X collects, uses and protects information.', body: 'Paste your final Privacy Policy here. Include the business/contact details that are actually used by Podmen X.' },
  { key: 'terms', title: 'Terms & Conditions', description: 'Rules for using Podmen X and its digital services.', body: 'Paste your final Terms & Conditions here. Make sure the subscription, acceptable use and account terms match the real service.' },
  { key: 'refund', title: 'Refund Policy', description: 'When a customer can request a refund and how it is handled.', body: 'Paste your final Refund Policy here. Clearly state eligibility, exclusions, processing time and the support contact.' },
  { key: 'cancellation', title: 'Cancellation Policy', description: 'Subscription cancellation and renewal rules.', body: 'Paste your final Cancellation Policy here. Clearly explain how users cancel, when cancellation takes effect and whether access continues until the paid period ends.' },
  { key: 'contact', title: 'Contact Us', description: 'Public customer-support and business contact information.', body: 'Paste your contact details here, including support email, response time and any other genuine support channels.' },
  { key: 'subscription', title: 'Subscription & Billing', description: 'Customer-facing wording for plans, recurring billing and digital delivery.', body: 'Paste your final Subscription & Billing wording here. Explain plan price, billing frequency, recurring renewal, cancellation and digital access in plain language.' },
  { key: 'help', title: 'Help Center', description: 'FAQs and support instructions for customers.', body: 'Paste your final Help Center content here, including payment issues, playback help, account help and how to contact support.' },
];

export default function SiteContentAdmin() {
  const { idToken } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState<Key>('privacy');
  const [form, setForm] = useState<DefaultItem>(defaults[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const activeDefault = useMemo(() => defaults.find(x => x.key === active) || defaults[0], [active]);

  const load = async () => {
    if (!idToken) return;
    setLoading(true);
    try {
      const r = await fetch('/api/admin/site-content', { headers: { Authorization: `Bearer ${idToken}` }, cache: 'no-store' });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Unable to load site content');
      setItems(j.data?.items || []);
    } catch (e: any) {
      setStatus(e.message || 'Unable to load site content');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [idToken]);
  useEffect(() => {
    const existing = items.find(x => x.key === active);
    setForm(existing ? { key: existing.key, title: existing.title, body: existing.body, description: activeDefault.description } : activeDefault);
  }, [active, items, activeDefault]);

  const save = async () => {
    if (!idToken) return;
    setSaving(true); setStatus('');
    try {
      const r = await fetch('/api/admin/site-content', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: form.key, title: form.title, body: form.body }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Save failed');
      setStatus('Saved & published live');
      await load();
    } catch (e: any) { setStatus(e.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return <main className="space-y-6">
    <header className="skeuo-panel flex flex-wrap items-center justify-between gap-4 p-6">
      <div>
        <p className="eyebrow">LEGAL • BILLING • SUPPORT</p>
        <h1 className="mt-2 text-3xl font-black">Public Website Content</h1>
        <p className="mt-1 max-w-3xl text-base text-dark-muted">Edit every customer-facing policy from one place. Saving here writes to Firebase and publishes the same content to the user panel.</p>
      </div>
      <button onClick={() => void load()} className="skeuo-button inline-flex items-center gap-2"><RefreshCw size={16} className={loading ? 'animate-spin' : ''}/> Refresh</button>
    </header>

    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {defaults.map(item => <button key={item.key} onClick={() => setActive(item.key)} className={`rounded-2xl border p-4 text-left transition ${active === item.key ? 'border-accent bg-accent/15 shadow-skeuo-btn' : 'border-dark-border bg-dark-card hover:border-accent/40'}`}>
        <div className="flex items-start justify-between gap-3"><span className="text-lg font-black">{item.title}</span><ShieldCheck size={19} className={active === item.key ? 'text-accent' : 'text-dark-muted'} /></div>
        <p className="mt-1 text-sm leading-6 text-dark-muted">{item.description}</p>
      </button>)}
    </div>

    <section className="skeuo-card space-y-4 p-6">
      <div><p className="text-sm font-black uppercase tracking-widest text-accent">Editing: {activeDefault.title}</p><p className="mt-1 text-sm text-dark-muted">This exact page is public. Do not use placeholders in the final version.</p></div>
      <input className="input text-lg font-bold" value={form.title} onChange={e => setForm(v => ({ ...v, title: e.target.value }))} placeholder="Public page title" />
      <textarea className="input min-h-[500px] resize-y text-base leading-7" value={form.body} onChange={e => setForm(v => ({ ...v, body: e.target.value }))} placeholder="Paste the complete customer-facing content here…" />
      <div className="flex flex-wrap items-center gap-3"><button onClick={() => void save()} disabled={saving} className="skeuo-button-primary inline-flex items-center gap-2 disabled:opacity-60"><Save size={17}/>{saving ? 'Saving…' : 'Save & Publish'}</button>{status && <span className="inline-flex items-center gap-2 text-base text-accent"><Check size={17}/>{status}</span>}</div>
    </section>
  </main>;
}
