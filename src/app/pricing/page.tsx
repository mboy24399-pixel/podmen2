"use client";
import { useEffect, useState } from "react";
import { Check, Crown, Loader2, ShieldCheck, Zap, Gift, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";

declare global { interface Window { Razorpay?: any } }

type Plan = { id: string; name: string; price: number; currency: string; interval: string; trialDays?: number; features?: string[]; paymentReady?: boolean };

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [trialLoading, setTrialLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(true);
  const [error, setError] = useState("");
  const { idToken, user } = useAuth();
  const { showToast } = useToast();

  const loadPlans = async () => {
    setPlanLoading(true);
    setError("");
    try {
      const r = await fetch("/api/plans", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Unable to load plans");
      setPlans(Array.isArray(j.data?.items) ? j.data.items : []);
    } catch (e: any) {
      console.error("Pricing plans load failed", e);
      setError(e?.message || "Unable to load plans");
    } finally {
      setPlanLoading(false);
    }
  };

  useEffect(() => { loadPlans(); }, []);

  const startTrial = async () => {
    if (!user || !idToken) {
      showToast("Please sign in to start your trial");
      return;
    }
    setTrialLoading(true);
    try {
      const r = await fetch("/api/subscriptions/trial", { method: "POST", headers: { Authorization: `Bearer ${idToken}` } });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.error || "Trial unavailable");
      showToast("Premium trial activated");
    } catch (e: any) {
      console.error("Trial activation failed", e);
      showToast(e?.message || "Unable to start trial");
    } finally {
      setTrialLoading(false);
    }
  };

  const subscribe = async (plan: Plan) => {
    if (!user || !idToken) {
      showToast("Please sign in before subscribing");
      return;
    }

    setLoadingPlan(plan.id);
    try {
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.querySelector<HTMLScriptElement>('script[data-razorpay-checkout="true"]');
          if (existing) {
            existing.addEventListener("load", () => resolve(), { once: true });
            existing.addEventListener("error", () => reject(new Error("Unable to load Razorpay checkout")), { once: true });
            return;
          }
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.async = true;
          script.dataset.razorpayCheckout = "true";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Unable to load Razorpay checkout"));
          document.body.appendChild(script);
        });
      }

      const r = await fetch("/api/payments/create-subscription", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Unable to start subscription");

      await new Promise<void>((resolve, reject) => {
        const checkout = new window.Razorpay({
          key: j.keyId,
          subscription_id: j.subscriptionId,
          name: "Podmen X",
          description: `${plan.name} — ${plan.interval}`,
          prefill: { email: user.email || "" },
          theme: { color: "#E5A93B" },
          handler: async (response: any) => {
            try {
              const vr = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
                body: JSON.stringify(response),
              });
              const vj = await vr.json();
              if (!vr.ok || !vj.ok) throw new Error(vj?.error || "Subscription verification failed");
              showToast("Payment verified. Premium access is now being activated.");
              resolve();
            } catch (e) {
              reject(e);
            }
          },
        });
        checkout.on("payment.failed", (e: any) => reject(new Error(e?.error?.description || "Payment failed")));
        checkout.open();
      });
    } catch (e: any) {
      console.error("Razorpay subscription checkout failed", e);
      showToast(e?.message || "Checkout failed");
    } finally {
      setLoadingPlan(null);
    }
  };

  return <div className="mx-auto max-w-6xl space-y-10 p-5 pb-32 md:p-10">
    <header className="mx-auto max-w-3xl text-center">
      <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-black text-dark"><Crown size={14} fill="currentColor"/> PREMIUM</span>
      <h1 className="mt-5 text-4xl font-black md:text-6xl">Your sound, unlocked.</h1>
      <p className="mt-3 text-sm leading-6 text-dark-muted">Secure recurring billing is handled by Razorpay. Payment verification and subscription status are confirmed server-side.</p>
    </header>

    {error && <div className="mx-auto flex max-w-3xl items-center justify-between rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200"><span>{error}</span><button onClick={loadPlans} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 font-bold"><RefreshCw size={14}/> Retry</button></div>}

    <section className="grid gap-5 md:grid-cols-2">
      <article className="skeuo-card border-accent/30 p-7">
        <div className="flex items-center gap-2 text-accent"><Gift size={20}/><b>FREE TRIAL</b></div>
        <h2 className="mt-3 text-3xl font-black">Try Premium free</h2>
        <p className="mt-2 text-sm text-dark-muted">Trial eligibility is checked and recorded by the server.</p>
        <button onClick={startTrial} disabled={trialLoading} className="skeuo-button-primary mt-8 flex w-full items-center justify-center gap-2">{trialLoading ? <Loader2 className="animate-spin"/> : <Gift size={18}/>} {trialLoading ? "Activating…" : "Start free trial"}</button>
      </article>

      {planLoading ? <article className="skeuo-card p-7"><Loader2 className="animate-spin text-accent"/></article> : plans.length ? plans.map(plan => <article key={plan.id} className="skeuo-card border-2 border-accent p-7">
        <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-xl font-black"><Zap className="text-accent"/> {plan.name}</h2><span className="rounded-full bg-accent px-2 py-1 text-[10px] font-black text-dark">{String(plan.interval).toUpperCase()}</span></div>
        <div className="mt-7 text-5xl font-black">₹{Number(plan.price).toLocaleString("en-IN")}<span className="text-sm font-normal text-dark-muted"> / {plan.interval}</span></div>
        <ul className="mt-7 space-y-3 text-sm">{(plan.features || []).map(x => <li key={x} className="flex items-center gap-3"><Check size={17} className="text-accent"/>{x}</li>)}</ul>
        <button onClick={() => subscribe(plan)} disabled={loadingPlan !== null} className="skeuo-button-primary mt-8 flex w-full items-center justify-center gap-2">{loadingPlan === plan.id ? <Loader2 className="animate-spin"/> : <Crown size={18}/>} {loadingPlan === plan.id ? "Opening secure checkout…" : "Subscribe securely"}</button>
        <p className="mt-4 flex items-center justify-center gap-2 text-center text-[11px] text-dark-muted"><ShieldCheck size={13}/> Signature verification + webhook reconciliation.</p>
      </article>) : <article className="skeuo-card p-7"><h2 className="font-black">No active plans</h2><p className="mt-2 text-sm text-dark-muted">Create an active plan from Admin → Plans & Coupons.</p></article>}
    </section>
  </div>;
}
