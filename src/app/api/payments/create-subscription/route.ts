import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { planId } = await request.json();
    if (!planId) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
    }

    // Fetch plan from Firestore
    const planDoc = await adminDb.collection("plans").doc(planId).get();
    if (!planDoc.exists) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    const planData = planDoc.data();
    const razorpayPlanId = planData?.razorpayPlanId;

    if (!razorpayPlanId) {
      return NextResponse.json({ error: "Invalid plan configuration" }, { status: 400 });
    }

    // Create Razorpay Subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: razorpayPlanId,
      customer_notify: 1,
      total_count: 12,
      notes: {
        userId: userId,
        planId: planId,
      },
    });

    // Save initial subscription record in Firestore
    await adminDb.collection("subscriptions").doc(subscription.id).set({
      id: subscription.id,
      userId: userId,
      planId: planId,
      razorpaySubscriptionId: subscription.id,
      status: subscription.status.toUpperCase(),
      currentPeriodStart: subscription.current_start || Date.now(),
      currentPeriodEnd: subscription.current_end || (Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      shortUrl: subscription.short_url,
      status: subscription.status,
    });
  } catch (error: any) {
    console.error("Create subscription error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
