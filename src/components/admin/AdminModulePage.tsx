import Link from "next/link";
import { ArrowLeft, Construction, ShieldCheck } from "lucide-react";

export default function AdminModulePage({ title, description, features }: { title: string; description: string; features: string[] }) {
  return <section className="space-y-6">
    <div><p className="text-[10px] font-black tracking-[.2em] text-accent">PODMEN X ADMIN / OPERATIONS</p><div className="mt-2 flex items-start justify-between gap-4"><div><h1 className="text-3xl font-black">{title}</h1><p className="mt-2 max-w-2xl text-sm text-dark-muted">{description}</p></div><ShieldCheck className="hidden h-8 w-8 text-accent md:block"/></div></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{features.map((feature)=><article key={feature} className="rounded-2xl border border-white/10 bg-dark-card p-5 shadow-skeuo"><Construction className="h-5 w-5 text-accent"/><h2 className="mt-3 font-bold">{feature}</h2><p className="mt-2 text-xs leading-5 text-dark-muted">Controlled from the admin backend with role checks, auditability and safe failure handling.</p></article>)}</div>
    <Link href="/admin" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-dark-muted hover:text-white"><ArrowLeft size={15}/> Back to control center</Link>
  </section>;
}
