"use client";

import { usePathname } from "next/navigation";
import { Palette, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { PRESETS, useTheme } from "./ThemeProvider";

export default function ThemeControls() {
  const pathname = usePathname();
  const { theme, setTheme, applyPreset, reset } = useTheme();
  const [open, setOpen] = useState(false);
  if (pathname?.startsWith("/admin")) return null;

  return <div className="fixed right-4 top-20 z-40">
    <button onClick={() => setOpen(value => !value)} className="grid h-11 w-11 place-items-center rounded-2xl border border-[var(--user-border)] bg-[var(--user-card)] text-[var(--user-accent)] shadow-skeuo" aria-label="Customize colors and design">
      {open ? <X size={20}/> : <Palette size={20}/>} 
    </button>
    {open && <section className="absolute right-0 mt-3 w-[min(92vw,360px)] rounded-3xl border border-[var(--user-border)] bg-[var(--user-card)] p-5 text-[var(--user-text)] shadow-2xl">
      <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-black">Design Studio</h2><p className="mt-1 text-sm text-[var(--user-muted)]">Change the whole listener interface. Saved on this device.</p></div><button onClick={reset} className="rounded-xl border border-[var(--user-border)] p-2 text-[var(--user-muted)]" title="Reset design"><RotateCcw size={16}/></button></div>
      <div className="mt-5"><p className="font-bold">Presets</p><div className="mt-3 grid grid-cols-5 gap-2">{Object.keys(PRESETS).map(name=><button key={name} onClick={() => applyPreset(name)} className="rounded-xl border border-[var(--user-border)] px-2 py-2 text-xs font-bold" title={name}><span className="mx-auto mb-1 block h-5 w-5 rounded-full" style={{ background: PRESETS[name].accent }}/>{name}</button>)}</div></div>
      <div className="mt-5 grid grid-cols-2 gap-4">{([['accent','Accent'],['surface','Background'],['card','Cards'],['text','Text'],['muted','Secondary text'],['border','Borders']] as const).map(([key,label])=><label key={key} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--user-border)] p-3"><span className="text-sm font-bold">{label}</span><input type="color" value={theme[key]} onChange={e => setTheme({ [key]: e.target.value })} className="h-9 w-12 cursor-pointer rounded-lg border-0 bg-transparent p-0"/></label>)}</div>
      <div className="mt-5"><p className="font-bold">Depth</p><div className="mt-2 grid grid-cols-3 gap-2">{(['soft','deep','flat'] as const).map(value=><button key={value} onClick={() => setTheme({ shadow: value })} className={`rounded-xl border px-3 py-2 text-sm font-bold ${theme.shadow===value?'border-[var(--user-accent)] text-[var(--user-accent)]':'border-[var(--user-border)] text-[var(--user-muted)]'}`}>{value[0].toUpperCase()+value.slice(1)}</button>)}</div></div>
    </section>}
  </div>;
}
