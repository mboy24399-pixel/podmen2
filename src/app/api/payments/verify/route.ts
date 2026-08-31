import { NextResponse } from "next/server";
import crypto from "crypto";
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

    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = await request.json();

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment verification parameters" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_payment_id + "|" + razorpay_subscription_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Prevent replay attacks: Check if payment already exists
    const paymentCheck = await adminDb.collection("payments")
      .where("razorpayPaymentId", "==", razorpay_payment_id)
      .limit(1)
      .get();
    
    if (!paymentCheck.empty) {
      return NextResponse.json({ error: "Payment already processed" }, { status: 400 });
    }

    // Ownership verification
    const subRef = adminDb.collection("subscriptions").doc(razorpay_subscription_id);
    const subDoc = await subRef.get();
    
    if (!subDoc.exists || subDoc.data()?.userId !== userId) {
      return NextResponse.json({ error: "Invalid subscription identity" }, { status: 403 });
    }

    const subData = subDoc.data() || {};
    const expiry = subData.currentPeriodEnd || (Date.now() + 30 * 24 * 60 * 60 * 1000); // Fallback to 30 days if not set

    const db = adminDb;
    // Run transaction for safety
    await db.runTransaction(async (transaction) => {
      transaction.update(subRef, {
        status: "ACTIVE",
        updatedAt: Date.now(),
      });

      const userRef = db.collection("users").doc(userId);
      transaction.update(userRef, {
        isSubscribed: true,
        subscriptionExpiry: expiry,
        updatedAt: Date.now(),
      });

      const paymentRef = db.collection("payments").doc(razorpay_payment_id);
      transaction.set(paymentRef, {
        userId,
        subscriptionId: razorpay_subscription_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: "",
        amount: 0, // updated via webhook if needed
        currency: "INR",
        status: "captured",
        method: "razorpay",
        capturedAt: Date.now(),
        createdAt: Date.now(),
      });
    });

    return NextResponse.json({ success: true, message: "Payment verified and subscription activated." });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
