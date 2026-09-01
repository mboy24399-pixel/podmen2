import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/server-auth";
import { getRazorpay, getRazorpayKeyId } from "@/lib/razorpay";

const schema = z.object({ planId: z.string().trim().min(1).max(120) });

function toPaise(price: unknown) {
  const rupees = Number(price);
  if (!Number.isSafeInteger(rupees) || rupees <= 0 || rupees > 10_000_000) {
    throw new Error("INVALID_PLAN_PRICE");
  }
  const amount = rupees * 100;
  if (!Number.isSafeInteger(amount)) throw new Error("INVALID_PLAN_PRICE");
  return { rupees, amount };
}

async function ensureRazorpayPlan(planId: string, plan: FirebaseFirestore.DocumentData) {
  const existing = String(plan.razorpayPlanId || "").trim();
  if (existing) return existing;

  const gateway = getRazorpay();
  const { amount } = toPaise(plan.price);
  const period = String(plan.interval || "monthly").toLowerCase();
  if (period !== "monthly" && period !== "yearly") throw new Error("INVALID_PLAN_INTERVAL");

  const created = await gateway.plans.create({
    period,
    interval: 1,
    item: {
      name: String(plan.name || planId).slice(0, 120),
      amount,
      currency: "INR",
      description: `Podmen X ${String(plan.name || planId).slice(0, 100)}`,
    },
    notes: { podmenPlanId: planId },
  });

  if (!created?.id) throw new Error("RAZORPAY_PLAN_CREATE_FAILED");
  await adminDb!.collection("plans").doc(planId).set({ razorpayPlanId: created.id, paymentReady: true, updatedAt: Date.now() }, { merge: true });
  return created.id;
}

export async function POST(request: Request) {
  let uid = "unknown";
  try {
    const user = await requireUser(request);
    uid = user.uid;
    if (!adminDb) return NextResponse.json({ error: "Payment service is not configured" }, { status: 503 });

    const { planId } = schema.parse(await request.json());
    const planRef = adminDb.collection("plans").doc(planId);
    const planSnap = await planRef.get();
    if (!planSnap.exists) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    const plan = planSnap.data()!;
    if (plan.active !== true) return NextResponse.json({ error: "Plan is unavailable" }, { status: 409 });
    toPaise(plan.price);
    const interval = String(plan.interval || "monthly").toLowerCase();
    if (interval !== "monthly" && interval !== "yearly") return NextResponse.json({ error: "Invalid plan interval" }, { status: 422 });

    const existing = await adminDb.collection("subscriptions").where("userId", "==", uid).limit(50).get();
    const reusable = existing.docs
      .map((doc) => doc.data())
      .find((item) => item.planId === planId && ["CREATED", "AUTHENTICATED", "ACTIVE"].includes(String(item.status || "").toUpperCase()));
    if (reusable?.razorpaySubscriptionId) {
      return NextResponse.json({ subscriptionId: reusable.razorpaySubscriptionId, keyId: getRazorpayKeyId(), status: reusable.status, reused: true });
    }

    const razorpayPlanId = await ensureRazorpayPlan(planId, plan);
    const gateway = getRazorpay();
    const subscription = await gateway.subscriptions.create({
      plan_id: razorpayPlanId,
      customer_notify: 1,
      total_count: 120,
      notes: { userId: uid, planId },
    });

    const now = Date.now();
    await adminDb.collection("subscriptions").doc(subscription.id).set({
      id: subscription.id,
      userId: uid,
      planId,
      razorpaySubscriptionId: subscription.id,
      razorpayPlanId,
      status: String(subscription.status || "created").toUpperCase(),
      currentPeriodStart: subscription.current_start ? subscription.current_start * 1000 : null,
      currentPeriodEnd: subscription.current_end ? subscription.current_end * 1000 : null,
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now,
    }, { merge: true });

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: getRazorpayKeyId(),
      status: subscription.status,
    });
  } catch (error: any) {
    console.error("[payments/create-subscription] failed", { uid, name: error?.name, message: error?.message });
    if (error?.message === "UNAUTHORIZED") return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    if (error?.message === "FORBIDDEN") return NextResponse.json({ error: "Payment access denied" }, { status: 403 });
    if (error?.name === "ZodError") return NextResponse.json({ error: "Invalid payment request" }, { status: 400 });
    if (error?.message === "RAZORPAY_NOT_CONFIGURED") return NextResponse.json({ error: "Payment gateway is not configured" }, { status: 503 });
    if (error?.message === "INVALID_PLAN_PRICE" || error?.message === "INVALID_PLAN_INTERVAL") return NextResponse.json({ error: "Invalid plan configuration" }, { status: 422 });
    return NextResponse.json({ error: "Unable to start secure subscription checkout" }, { status: 500 });
  }
}
