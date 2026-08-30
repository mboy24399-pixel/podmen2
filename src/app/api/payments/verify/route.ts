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

    // Update subscription and user status securely
    const subRef = adminDb.collection("subscriptions").doc(razorpay_subscription_id);
    await subRef.update({
      status: "ACTIVE",
      updatedAt: Date.now(),
    });

    const userRef = adminDb.collection("users").doc(userId);
    await userRef.update({
      isSubscribed: true,
      subscriptionExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now(),
    });

    // Record payment
    await adminDb.collection("payments").add({
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

    return NextResponse.json({ success: true, message: "Payment verified and subscription activated." });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
