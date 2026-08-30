import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventId = event.payload?.subscription?.entity?.id || event.event + "_" + Date.e_now?.() || Math.random();

    if (!adminDb) {
      return NextResponse.json({ error: "Database not available" }, { status: 500 });
    }

    // Idempotency check via webhookEvents collection
    const eventRef = adminDb.collection("webhookEvents").doc(event.event_id || eventId);
    const eventSnap = await eventRef.get();

    if (eventSnap.exists && eventSnap.data()?.processed) {
      return NextResponse.json({ status: "already_processed" });
    }

    await eventRef.set({
      provider: "razorpay",
      eventId: event.event_id || eventId,
      eventType: event.event,
      payload: event,
      processed: true,
      processedAt: Date.now(),
      createdAt: Date.now(),
    });

    const eventType = event.event;
    const subscriptionEntity = event.payload?.subscription?.entity;

    if (subscriptionEntity) {
      const subId = subscriptionEntity.id;
      const subStatus = subscriptionEntity.status.toUpperCase();
      const userId = subscriptionEntity.notes?.userId;

      const subRef = adminDb.collection("subscriptions").doc(subId);
      await subRef.set(
        {
          status: subStatus,
          currentPeriodStart: subscriptionEntity.current_start || Date.now(),
          currentPeriodEnd: subscriptionEntity.current_end || (Date.now() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      if (userId) {
        const userRef = adminDb.collection("users").doc(userId);
        const isActive = ["ACTIVE", "AUTHENTICATED"].includes(subStatus);
        await userRef.update({
          isSubscribed: isActive,
          updatedAt: Date.now(),
        });
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message || "Webhook error" }, { status: 500 });
  }
}
