"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Coins, Loader2, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Task { id:string; title:string; description:string; type:string; rewardCoins:number; target:number; }

export default function RewardsPanel(){
  const { idToken } = useAuth();
  const [tasks,setTasks]=useState<Task[]>([]); const [balance,setBalance]=useState<number|null>(null); const [busy,setBusy]=useState<string|null>(null); const [error,setError]=useState("");
  const load=async()=>{if(!idToken)return; try{const [t,u]=await Promise.all([fetch('/api/tasks',{cache:'no-store'}),fetch('/api/profile',{headers:{Authorization:`Bearer ${idToken}`},cache:'no-store'})]); const tj=await t.json(); if(t.ok)setTasks(tj.data?.items||[]); if(u.ok){const uj=await u.json(); setBalance(Number(uj.data?.coinBalance||0));}}catch(e){console.error(e)}};
  useEffect(()=>{void load()},[idToken]);
  const complete=async(id:string)=>{if(!idToken)return; setBusy(id);setError("");try{const r=await fetch(`/api/tasks/${id}/complete`,{method:'POST',headers:{Authorization:`Bearer ${idToken}`}});const j=await r.json();if(!r.ok)throw new Error(j?.error||'Unable to claim reward');setBalance(Number(j.data?.coinBalance||0));setTasks(prev=>prev.filter(t=>t.id!==id))}catch(e:any){setError(e?.message||'Unable to claim reward')}finally{setBusy(null)}};
  return <section className="space-y-4"><div className="flex items-center justify-between rounded-2xl border border-accent/20 bg-accent/5 p-5"><div><p className="text-xs font-black uppercase tracking-widest text-accent">Rewards</p><h2 className="mt-1 text-2xl font-black">Earn coins</h2></div><div className="inline-flex items-center gap-2 rounded-xl bg-dark px-4 py-2 font-black text-accent"><Coins size={18}/>{balance===null?'—':balance}</div></div>{error&&<div className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-200">{error}</div>}{tasks.length===0?<div className="rounded-2xl border border-white/10 bg-dark-card p-6 text-sm text-dark-muted">No active tasks right now.</div>:tasks.map(task=><article key={task.id} className="rounded-2xl border border-white/10 bg-dark-card p-5"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-accent"><Trophy size={17}/><span className="text-xs font-black uppercase tracking-wider">{task.type}</span></div><h3 className="mt-2 font-black">{task.title}</h3><p className="mt-1 text-sm leading-6 text-dark-muted">{task.description}</p></div><span className="shrink-0 rounded-lg bg-accent/10 px-3 py-1.5 text-sm font-black text-accent">+{task.rewardCoins}</span></div><button disabled={busy===task.id} onClick={()=>void complete(task.id)} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-black text-dark disabled:opacity-60">{busy===task.id?<Loader2 size={16} className="animate-spin"/>:<CheckCircle2 size={16}/>} Claim task</button></article>)}</section>
}
