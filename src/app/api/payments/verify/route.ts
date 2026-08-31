import { NextRequest } from "next/server";
import Razorpay from "razorpay";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/server-auth";
import { verifyRazorpayPaymentSignature } from "@/lib/razorpay-verify";
import { fail, ok } from "@/lib/api-response";

const schema = z.object({ razorpay_order_id: z.string().min(1).max(120), razorpay_payment_id: z.string().min(1).max(120), razorpay_signature: z.string().min(1).max(256) });

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!adminDb) return fail("Payment service is not configured", 503);
    const input = schema.parse(await request.json());
    const orderRef = adminDb.collection("orders").doc(input.razorpay_order_id);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) return fail("Order not found", 404);
    const order = orderSnap.data()!;
    if (order.userId !== user.uid) return fail("Forbidden", 403);
    if (order.status === "PAID") return ok({ status: "already_verified" });
    if (!verifyRazorpayPaymentSignature(input.razorpay_order_id, input.razorpay_payment_id, input.razorpay_signature)) return fail("Invalid payment signature", 400);

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) return fail("Payment gateway is not configured", 503);
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const payment = await razorpay.payments.fetch(input.razorpay_payment_id);
    if (String(payment.order_id) !== input.razorpay_order_id) return fail("Payment/order mismatch", 400);
    if (Number(payment.amount) !== Number(order.amount) || String(payment.currency).toUpperCase() !== String(order.currency || "INR").toUpperCase()) return fail("Payment amount mismatch", 400);
    if (String(payment.status).toLowerCase() !== "captured") return fail("Payment is not captured yet", 409);

    const paymentRef = adminDb.collection("payments").doc(input.razorpay_payment_id);
    const planSnap = await adminDb.collection("plans").doc(String(order.planId || "")).get();
    const plan = planSnap.data() || {};
    const interval = String(plan.interval || "monthly").toLowerCase();
    const days = interval === "yearly" ? 365 : 30;
    const expiry = Date.now() + days * 24 * 60 * 60 * 1000;
    await adminDb.runTransaction(async (tx) => {
      const existing = await tx.get(paymentRef);
      if (!existing.exists) tx.set(paymentRef, { id: input.razorpay_payment_id, userId: user.uid, razorpayPaymentId: input.razorpay_payment_id, razorpayOrderId: input.razorpay_order_id, amount: order.amount, currency: order.currency, status: "CAPTURED", method: payment.method || "unknown", capturedAt: Date.now(), createdAt: Date.now() });
      tx.update(orderRef, { status: "PAID", razorpayPaymentId: input.razorpay_payment_id, updatedAt: Date.now() });
      tx.set(adminDb!.collection("subscriptions").doc(input.razorpay_payment_id), { id: input.razorpay_payment_id, userId: user.uid, planId: order.planId, status: "ACTIVE", source: "razorpay", currentPeriodStart: Date.now(), currentPeriodEnd: expiry, createdAt: Date.now(), updatedAt: Date.now() }, { merge: true });
      tx.set(adminDb!.collection("users").doc(user.uid), { isSubscribed: true, subscriptionStatus: "ACTIVE", subscriptionExpiry: expiry, updatedAt: Date.now() }, { merge: true });
    });
    await adminDb.collection("auditLogs").add({ actorId: user.uid, action: "PAYMENT_VERIFIED", targetId: input.razorpay_payment_id, orderId: input.razorpay_order_id, createdAt: Date.now() });
    return ok({ status: "verified", entitlement: "ACTIVE", expiresAt: expiry });
  } catch (error: any) {
    console.error("Payment verification failed", { name: error?.name, message: error?.message });
    if (error?.name === "ZodError") return fail("Invalid payment payload", 400);
    if (error?.message === "UNAUTHORIZED") return fail("Authentication required", 401);
    if (error?.message === "FORBIDDEN") return fail("Forbidden", 403);
    return fail("Payment verification failed", 500);
  }
}
