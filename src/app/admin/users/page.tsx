"use client";
import { useEffect, useState } from 'react';
import { RefreshCw, ShieldAlert, UserRound, Ban, Pencil, Check, X, Crown, Clock3 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type Plan = { id: string; name: string; interval: 'monthly' | 'yearly'; active: boolean };

export default function AdminUsers() {
  const { idToken } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ displayName: '', role: 'USER', email: '' });
  const [busy, setBusy] = useState<string | null>(null);
  const [premiumPlan, setPremiumPlan] = useState('');
  const [premiumDays, setPremiumDays] = useState('30');

  const load = async () => {
    if (!idToken) return;
    setLoading(true);
    setError('');
    try {
      const [usersResponse, plansResponse] = await Promise.all([
        fetch('/api/admin/users?limit=100', { headers: { Authorization: `Bearer ${idToken}` }, cache: 'no-store' }),
        fetch('/api/admin/plans', { headers: { Authorization: `Bearer ${idToken}` }, cache: 'no-store' }),
      ]);
      const usersPayload = await usersResponse.json();
      const plansPayload = await plansResponse.json();
      if (!usersResponse.ok) throw new Error(usersPayload.error || 'Unable to load users');
      setRows(usersPayload.data.items || []);
      if (plansResponse.ok) {
        const activePlans = (plansPayload.data.items || []).filter((p: Plan) => p.active);
        setPlans(activePlans);
        setPremiumPlan(current => current || activePlans[0]?.id || '');
      }
    } catch (e: any) {
      setError(e.message || 'Unable to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [idToken]);

  const mutate = async (payload: any) => {
    if (!idToken) return;
    setBusy(payload.userId + payload.action);
    setError('');
    try {
      const r = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Update failed');
      setEditing(null);
      await load();
    } catch (e: any) {
      setError(e.message || 'Update failed');
    } finally {
      setBusy(null);
    }
  };

  const startEdit = (row: any) => {
    setEditing(row.id);
    setDraft({ displayName: row.displayName || '', role: row.role || 'USER', email: row.email || '' });
  };

  const grantPremium = (row: any) => {
    if (!confirm(`Grant Premium access to ${row.displayName || row.email || row.id} for ${premiumDays} days?`)) return;
    void mutate({ userId: row.id, action: 'grantPremium', planId: premiumPlan || undefined, days: Number(premiumDays) || 30 });
  };

  const revokePremium = (row: any) => {
    if (!confirm(`Revoke Premium access from ${row.displayName || row.email || row.id}?`)) return;
    void mutate({ userId: row.id, action: 'revokePremium' });
  };

  const expiryText = (value: any) => {
    const expiry = Number(value || 0);
    return expiry > Date.now() ? new Date(expiry).toLocaleString() : 'Expired';
  };

  return <main className="space-y-6">
    <header className="skeuo-panel p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="eyebrow">USER OPERATIONS</p><h1 className="mt-2 text-3xl font-black">Users</h1><p className="mt-1 text-sm text-dark-muted">Live accounts, roles, Premium entitlements, expiry and access controls.</p></div>
        <div className="flex flex-wrap gap-2">
          <select value={premiumPlan} onChange={e => setPremiumPlan(e.target.value)} className="input min-w-48 py-2.5">
            <option value="">Admin Premium</option>{plans.map(p => <option key={p.id} value={p.id}>{p.name} · {p.interval}</option>)}
          </select>
          <select value={premiumDays} onChange={e => setPremiumDays(e.target.value)} className="input w-32 py-2.5"><option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option><option value="365">365 days</option></select>
          <button onClick={() => void load()} className="skeuo-button inline-flex items-center gap-2"><RefreshCw size={16} className={loading ? 'animate-spin' : ''}/> Refresh</button>
        </div>
      </div>
    </header>

    {error && <div className="skeuo-card flex gap-3 p-4 text-sm text-red-300"><ShieldAlert size={18} />{error}</div>}

    <div className="skeuo-panel overflow-x-auto"><table className="w-full min-w-[1200px] text-left text-sm"><thead className="border-b border-dark-border text-xs uppercase text-dark-muted"><tr><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4">Plan</th><th className="p-4">Expiry</th><th className="p-4">Status</th><th className="p-4">Joined</th><th className="p-4 text-right">Actions</th></tr></thead><tbody>
      {rows.map(x => <>
        <tr key={x.id} className="border-b border-dark-border/60 align-top">
          <td className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-dark-surface text-accent shadow-skeuo-inset"><UserRound size={17}/></div><div className="min-w-0"><b className="block truncate">{x.displayName || x.email || x.id}</b><span className="text-xs text-dark-muted">{x.email || x.id}</span></div></div></td>
          <td className="p-4 font-bold">{x.role || 'USER'}</td>
          <td className="p-4"><span className="inline-flex items-center gap-1 font-bold text-accent"><Crown size={14}/>{x.subscriptionPlanName || (x.isSubscribed ? 'Premium' : 'Free')}</span><div className="mt-1 text-[11px] text-dark-muted">{x.subscriptionStatus || (x.isSubscribed ? 'ACTIVE' : 'FREE')}</div></td>
          <td className="p-4"><span className="inline-flex items-center gap-1 text-xs text-dark-muted"><Clock3 size={13}/>{x.subscriptionExpiry ? expiryText(x.subscriptionExpiry) : '—'}</span></td>
          <td className="p-4"><span className={`rounded-full px-2 py-1 text-[10px] font-black ${x.banned || x.suspended ? 'bg-red-500/10 text-red-300' : 'bg-emerald-500/10 text-emerald-300'}`}>{x.banned ? 'BLOCKED' : x.suspended ? 'SUSPENDED' : 'ACTIVE'}</span></td>
          <td className="p-4 text-dark-muted">{x.createdAt ? new Date(x.createdAt).toLocaleDateString() : '—'}</td>
          <td className="p-4"><div className="flex flex-wrap justify-end gap-2"><button onClick={() => startEdit(x)} className="skeuo-button inline-flex items-center gap-2 px-3 py-2 text-xs"><Pencil size={14}/> Edit</button><button disabled={!!busy} onClick={() => mutate({ userId: x.id, action: x.banned ? 'unblock' : 'block' })} className="skeuo-button inline-flex items-center gap-2 px-3 py-2 text-xs disabled:opacity-50"><Ban size={14}/>{x.banned ? 'Unblock' : 'Block'}</button>{x.isSubscribed && Number(x.subscriptionExpiry || 0) > Date.now() ? <button disabled={!!busy} onClick={() => revokePremium(x)} className="skeuo-button inline-flex items-center gap-2 px-3 py-2 text-xs disabled:opacity-50"><X size={14}/> Revoke</button> : <button disabled={!!busy} onClick={() => grantPremium(x)} className="skeuo-button-primary inline-flex items-center gap-2 px-3 py-2 text-xs disabled:opacity-50"><Crown size={14}/> Premium</button>}</div></td>
        </tr>
        {editing === x.id && <tr key={`${x.id}-edit`}><td colSpan={7} className="p-4 pt-0"><div className="skeuo-card grid gap-3 p-4 md:grid-cols-3"><input className="input" value={draft.displayName} onChange={e => setDraft(v => ({ ...v, displayName: e.target.value }))} placeholder="Display name"/><input className="input" value={draft.email} onChange={e => setDraft(v => ({ ...v, email: e.target.value }))} placeholder="Email" type="email"/><select className="input" value={draft.role} onChange={e => setDraft(v => ({ ...v, role: e.target.value }))}>{['USER','PREMIUM_USER','EDITOR','MODERATOR','ADMIN','SUPER_ADMIN'].map(r => <option key={r}>{r}</option>)}</select><div className="flex gap-2 md:col-span-3"><button onClick={() => mutate({ userId: x.id, action: 'edit', ...draft })} className="skeuo-button-primary inline-flex items-center gap-2"><Check size={15}/> Save changes</button><button onClick={() => setEditing(null)} className="skeuo-button inline-flex items-center gap-2"><X size={15}/> Cancel</button></div></div></td></tr>}
      </>)}
      {!loading && !rows.length && <tr><td colSpan={7} className="p-10 text-center text-dark-muted">No users found.</td></tr>}
    </tbody></table></div>
  </main>;
}
