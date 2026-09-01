import { NextRequest } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/server-auth";
import { verifyRazorpayPaymentSignature, verifyRazorpaySubscriptionSignature } from "@/lib/razorpay-verify";
import { getRazorpay } from "@/lib/razorpay";
import { fail, ok } from "@/lib/api-response";

const schema = z.object({
  razorpay_order_id: z.string().min(1).max(120).optional(),
  razorpay_subscription_id: z.string().min(1).max(120).optional(),
  razorpay_payment_id: z.string().min(1).max(120),
  razorpay_signature: z.string().min(1).max(256),
}).refine((value) => Boolean(value.razorpay_order_id || value.razorpay_subscription_id), {
  message: "Order or subscription id is required",
});

async function verifySubscriptionPayment(input: z.infer<typeof schema>, uid: string) {
  if (!adminDb || !input.razorpay_subscription_id) return fail("Invalid subscription request", 400);

  const subscriptionRef = adminDb.collection("subscriptions").doc(input.razorpay_subscription_id);
  const subscriptionSnap = await subscriptionRef.get();
  if (!subscriptionSnap.exists) return fail("Subscription not found", 404);
  const localSubscription = subscriptionSnap.data()!;
  if (localSubscription.userId !== uid) return fail("Forbidden", 403);

  if (!verifyRazorpaySubscriptionSignature(input.razorpay_subscription_id, input.razorpay_payment_id, input.razorpay_signature)) {
    return fail("Invalid payment signature", 400);
  }

  const gateway = getRazorpay();
  const payment = await gateway.payments.fetch(input.razorpay_payment_id);
  if (String(payment.subscription_id || "") !== input.razorpay_subscription_id) return fail("Payment/subscription mismatch", 400);

  const remoteSubscription = await gateway.subscriptions.fetch(input.razorpay_subscription_id);
  if (String(remoteSubscription.id) !== input.razorpay_subscription_id) return fail("Subscription mismatch", 400);
  if (String(remoteSubscription.plan_id || "") !== String(localSubscription.razorpayPlanId || "")) return fail("Subscription plan mismatch", 400);

  const remoteStatus = String(remoteSubscription.status || "created").toUpperCase();
  const now = Date.now();
  const currentStart = remoteSubscription.current_start ? remoteSubscription.current_start * 1000 : null;
  const currentEnd = remoteSubscription.current_end ? remoteSubscription.current_end * 1000 : null;

  await adminDb.runTransaction(async (tx) => {
    tx.set(subscriptionRef, {
      id: input.razorpay_subscription_id,
      userId: uid,
      planId: localSubscription.planId,
      razorpaySubscriptionId: input.razorpay_subscription_id,
      razorpayPaymentId: input.razorpay_payment_id,
      status: remoteStatus,
      currentPeriodStart: currentStart,
      currentPeriodEnd: currentEnd,
      cancelAtPeriodEnd: Boolean(remoteSubscription.cancel_at_cycle_end),
      updatedAt: now,
    }, { merge: true });

    tx.set(adminDb!.collection("payments").doc(input.razorpay_payment_id), {
      id: input.razorpay_payment_id,
      userId: uid,
      razorpayPaymentId: input.razorpay_payment_id,
      razorpaySubscriptionId: input.razorpay_subscription_id,
      amount: Number(payment.amount || 0),
      currency: String(payment.currency || "INR"),
      status: String(payment.status || remoteStatus).toUpperCase(),
      method: payment.method || "unknown",
      createdAt: payment.created_at ? payment.created_at * 1000 : now,
      updatedAt: now,
    }, { merge: true });

    if (remoteStatus === "ACTIVE" && currentEnd) {
      tx.set(adminDb!.collection("users").doc(uid), {
        isSubscribed: true,
        subscriptionStatus: "ACTIVE",
        subscriptionId: input.razorpay_subscription_id,
        subscriptionExpiry: currentEnd,
        updatedAt: now,
      }, { merge: true });
    }
  });

  await adminDb.collection("auditLogs").add({
    actorId: uid,
    action: "SUBSCRIPTION_PAYMENT_VERIFIED",
    targetId: input.razorpay_subscription_id,
    paymentId: input.razorpay_payment_id,
    status: remoteStatus,
    createdAt: now,
  });

  if (remoteStatus !== "ACTIVE") {
    return ok({ status: "verified_pending_activation", subscriptionStatus: remoteStatus });
  }
  return ok({ status: "verified", entitlement: "ACTIVE", expiresAt: currentEnd });
}

async function verifyOrderPayment(input: z.infer<typeof schema>, uid: string) {
  if (!adminDb || !input.razorpay_order_id) return fail("Invalid order request", 400);

  const orderRef = adminDb.collection("orders").doc(input.razorpay_order_id);
  const orderSnap = await orderRef.get();
  if (!orderSnap.exists) return fail("Order not found", 404);
  const order = orderSnap.data()!;
  if (order.userId !== uid) return fail("Forbidden", 403);
  if (order.status === "PAID") return ok({ status: "already_verified" });

  if (!verifyRazorpayPaymentSignature(input.razorpay_order_id, input.razorpay_payment_id, input.razorpay_signature)) {
    return fail("Invalid payment signature", 400);
  }

  const gateway = getRazorpay();
  const payment = await gateway.payments.fetch(input.razorpay_payment_id);
  if (String(payment.order_id) !== input.razorpay_order_id) return fail("Payment/order mismatch", 400);
  if (Number(payment.amount) !== Number(order.amount) || String(payment.currency).toUpperCase() !== String(order.currency || "INR").toUpperCase()) return fail("Payment amount mismatch", 400);
  if (String(payment.status).toLowerCase() !== "captured") return fail("Payment is not captured yet", 409);

  const paymentRef = adminDb.collection("payments").doc(input.razorpay_payment_id);
  const planSnap = await adminDb.collection("plans").doc(String(order.planId || "")).get();
  const plan = planSnap.data() || {};
  const interval = String(plan.interval || "monthly").toLowerCase();
  const days = interval === "yearly" ? 365 : 30;
  const expiry = Date.now() + days * 24 * 60 * 60 * 1000;
  const now = Date.now();

  await adminDb.runTransaction(async (tx) => {
    const existing = await tx.get(paymentRef);
    if (!existing.exists) tx.set(paymentRef, { id: input.razorpay_payment_id, userId: uid, razorpayPaymentId: input.razorpay_payment_id, razorpayOrderId: input.razorpay_order_id, amount: order.amount, currency: order.currency, status: "CAPTURED", method: payment.method || "unknown", capturedAt: now, createdAt: now });
    tx.update(orderRef, { status: "PAID", razorpayPaymentId: input.razorpay_payment_id, updatedAt: now });
    tx.set(adminDb!.collection("users").doc(uid), { isSubscribed: true, subscriptionStatus: "ACTIVE", subscriptionExpiry: expiry, updatedAt: now }, { merge: true });
  });

  await adminDb.collection("auditLogs").add({ actorId: uid, action: "PAYMENT_VERIFIED", targetId: input.razorpay_payment_id, orderId: input.razorpay_order_id, createdAt: now });
  return ok({ status: "verified", entitlement: "ACTIVE", expiresAt: expiry });
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!adminDb) return fail("Payment service is not configured", 503);
    const input = schema.parse(await request.json());

    if (input.razorpay_subscription_id) {
      return await verifySubscriptionPayment(input, user.uid);
    }
    return await verifyOrderPayment(input, user.uid);
  } catch (error: any) {
    console.error("Payment verification failed", { name: error?.name, message: error?.message });
    if (error?.name === "ZodError") return fail("Invalid payment payload", 400);
    if (error?.message === "UNAUTHORIZED") return fail("Authentication required", 401);
    if (error?.message === "FORBIDDEN") return fail("Forbidden", 403);
    if (error?.message === "RAZORPAY_NOT_CONFIGURED" || error?.message === "RAZORPAY_KEY_SECRET_NOT_CONFIGURED") return fail("Payment gateway is not configured", 503);
    return fail("Payment verification failed", 500);
  }
}
