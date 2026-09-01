"use client";

import { useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

export default function LiveContentPage({ contentKey, fallbackTitle }: { contentKey:'privacy'|'terms'|'help'; fallbackTitle:string }) {
  const [data,setData]=useState<{title?:string;body?:string;updatedAt?:number}|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const load=async(silent=false)=>{if(!silent)setLoading(true);try{const response=await fetch(`/api/site-content?key=${contentKey}`,{cache:'no-store'});const payload=await response.json();if(!response.ok)throw new Error(payload.error||'Unable to load page');setData(payload.data||null);setError('')}catch(e:any){setError(e.message||'Unable to load page')}finally{if(!silent)setLoading(false)}};
  useEffect(()=>{void load();const timer=window.setInterval(()=>void load(true),10000);return()=>window.clearInterval(timer)},[contentKey]);
  if(loading)return <main className="mx-auto max-w-4xl p-6 md:p-10"><div className="skeuo-panel grid min-h-64 place-items-center"><Loader2 className="animate-spin text-accent" size={28}/></div></main>;
  return <main className="mx-auto max-w-4xl space-y-5 p-5 pb-32 md:p-10"><header className="skeuo-panel p-7"><h1 className="text-3xl font-black md:text-4xl">{data?.title||fallbackTitle}</h1><p className="mt-2 text-base text-dark-muted">Live content maintained from the admin control center.</p></header>{error&&<div className="skeuo-card flex items-center justify-between gap-3 p-4 text-base text-red-300"><span>{error}</span><button onClick={()=>void load()} className="skeuo-button inline-flex items-center gap-2"><RefreshCw size={16}/> Retry</button></div>}<article className="skeuo-card whitespace-pre-wrap p-7 text-base leading-8">{data?.body||'This page has not been published by the administrator yet.'}</article></main>;
}
