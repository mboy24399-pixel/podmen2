import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay-verify";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const eventId = request.headers.get("x-razorpay-event-id");
    if (!signature || !eventId) return NextResponse.json({ error: "Missing webhook headers" }, { status: 400 });
    if (!verifyRazorpayWebhookSignature(rawBody, signature)) return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    if (!adminDb) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

    const event = JSON.parse(rawBody);
    const eventRef = adminDb.collection("webhookEvents").doc(eventId);
    const existing = await eventRef.get();
    if (existing.exists && existing.data()?.processed === true) return NextResponse.json({ status: "already_processed" });

    const now = Date.now();
    await eventRef.set({ provider: "razorpay", eventId, eventType: event.event, payload: event, processed: false, receivedAt: now, updatedAt: now }, { merge: true });

    const subscription = event.payload?.subscription?.entity;
    const subscriptionId = subscription?.id ? String(subscription.id) : "";
    let subscriptionUserId = subscription?.notes?.userId ? String(subscription.notes.userId) : "";

    if (subscriptionId) {
      const subRef = adminDb.collection("subscriptions").doc(subscriptionId);
      const subSnap = await subRef.get();
      subscriptionUserId = subscriptionUserId || String(subSnap.data()?.userId || "");
      const subStatus = String(subscription.status || "").toUpperCase();
      const currentStart = subscription.current_start ? subscription.current_start * 1000 : null;
      const currentEnd = subscription.current_end ? subscription.current_end * 1000 : null;

      await subRef.set({
        id: subscriptionId,
        razorpaySubscriptionId: subscriptionId,
        razorpayPlanId: subscription.plan_id || subSnap.data()?.razorpayPlanId || null,
        status: subStatus,
        ...(subscriptionUserId ? { userId: subscriptionUserId } : {}),
        currentPeriodStart: currentStart,
        currentPeriodEnd: currentEnd,
        cancelAtPeriodEnd: Boolean(subscription.cancel_at_cycle_end),
        updatedAt: now,
      }, { merge: true });

      if (subscriptionUserId) {
        const active = ["ACTIVE", "AUTHENTICATED"].includes(subStatus);
        await adminDb.collection("users").doc(subscriptionUserId).set({
          isSubscribed: active,
          subscriptionStatus: subStatus,
          subscriptionId,
          subscriptionExpiry: subStatus === "ACTIVE" ? currentEnd : null,
          updatedAt: now,
        }, { merge: true });
      }
    }

    const payment = event.payload?.payment?.entity;
    if (payment?.id) {
      const paymentSubscriptionId = String(payment.subscription_id || subscriptionId || "");
      let paymentUserId = subscriptionUserId;
      if (!paymentUserId && paymentSubscriptionId) {
        const subSnap = await adminDb.collection("subscriptions").doc(paymentSubscriptionId).get();
        paymentUserId = String(subSnap.data()?.userId || "");
      }

      await adminDb.collection("payments").doc(payment.id).set({
        id: payment.id,
        ...(paymentUserId ? { userId: paymentUserId } : {}),
        razorpayPaymentId: payment.id,
        razorpayOrderId: payment.order_id || "",
        razorpaySubscriptionId: paymentSubscriptionId || null,
        amount: payment.amount ?? 0,
        currency: payment.currency || "INR",
        status: String(payment.status || event.event).toUpperCase(),
        method: payment.method || "unknown",
        capturedAt: payment.captured_at ? payment.captured_at * 1000 : 0,
        createdAt: payment.created_at ? payment.created_at * 1000 : now,
        updatedAt: now,
      }, { merge: true });

      if (payment.order_id) {
        await adminDb.collection("orders").doc(payment.order_id).set({
          status: payment.status === "captured" ? "PAID" : String(payment.status || event.event).toUpperCase(),
          razorpayPaymentId: payment.id,
          updatedAt: now,
        }, { merge: true });
      }
    }

    const order = event.payload?.order?.entity;
    if (order?.id) await adminDb.collection("orders").doc(order.id).set({ status: String(order.status || "PAID").toUpperCase(), updatedAt: now }, { merge: true });

    await eventRef.set({ processed: true, processedAt: Date.now(), updatedAt: Date.now() }, { merge: true });
    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Razorpay webhook processing failed", { name: error?.name, message: error?.message });
    if (error?.message === "RAZORPAY_WEBHOOK_SECRET_NOT_CONFIGURED") return NextResponse.json({ error: "Webhook secret is not configured" }, { status: 503 });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
