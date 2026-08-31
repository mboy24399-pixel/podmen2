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

    const payment = event.payload?.payment?.entity;
    if (payment?.id) {
      await adminDb.collection("payments").doc(payment.id).set({
        id: payment.id, razorpayPaymentId: payment.id, razorpayOrderId: payment.order_id || "",
        amount: payment.amount ?? 0, currency: payment.currency || "INR", status: payment.status || event.event,
        method: payment.method || "unknown", capturedAt: payment.captured_at ? payment.captured_at * 1000 : 0,
        createdAt: payment.created_at ? payment.created_at * 1000 : now, updatedAt: now,
      }, { merge: true });
      if (payment.order_id) await adminDb.collection("orders").doc(payment.order_id).set({ status: payment.status === "captured" ? "PAID" : String(payment.status || event.event).toUpperCase(), razorpayPaymentId: payment.id, updatedAt: now }, { merge: true });
    }

    const order = event.payload?.order?.entity;
    if (order?.id) await adminDb.collection("orders").doc(order.id).set({ status: String(order.status || "PAID").toUpperCase(), updatedAt: now }, { merge: true });

    const subscription = event.payload?.subscription?.entity;
    if (subscription?.id) {
      const subStatus = String(subscription.status || "").toUpperCase();
      const subRef = adminDb.collection("subscriptions").doc(subscription.id);
      const subSnap = await subRef.get();
      const userId = subscription.notes?.userId || subSnap.data()?.userId;
      await subRef.set({ razorpaySubscriptionId: subscription.id, status: subStatus, ...(userId ? { userId } : {}), currentPeriodStart: subscription.current_start ? subscription.current_start * 1000 : now, currentPeriodEnd: subscription.current_end ? subscription.current_end * 1000 : now, cancelAtPeriodEnd: Boolean(subscription.cancel_at_cycle_end), updatedAt: now }, { merge: true });
      if (userId) await adminDb.collection("users").doc(userId).set({ isSubscribed: ["ACTIVE", "AUTHENTICATED"].includes(subStatus), subscriptionExpiry: subscription.current_end ? subscription.current_end * 1000 : null, updatedAt: now }, { merge: true });
    }

    await eventRef.set({ processed: true, processedAt: Date.now(), updatedAt: Date.now() }, { merge: true });
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Razorpay webhook processing failed", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
