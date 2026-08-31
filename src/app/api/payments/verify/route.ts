import { NextRequest } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/server-auth";
import { verifyRazorpayPaymentSignature } from "@/lib/razorpay-verify";
import { fail, ok } from "@/lib/api-response";

const schema = z.object({
  razorpay_order_id: z.string().min(1).max(120),
  razorpay_payment_id: z.string().min(1).max(120),
  razorpay_signature: z.string().min(1).max(256),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!adminDb) return fail("Server is not configured", 503);
    const input = schema.parse(await request.json());
    const orderRef = adminDb.collection("orders").doc(input.razorpay_order_id);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) return fail("Order not found", 404);
    const order = orderSnap.data()!;
    if (order.userId !== user.uid) return fail("Forbidden", 403);
    if (order.status === "PAID") return ok({ status: "already_verified" });
    if (!verifyRazorpayPaymentSignature(input.razorpay_order_id, input.razorpay_payment_id, input.razorpay_signature)) return fail("Invalid payment signature", 400);

    const paymentRef = adminDb.collection("payments").doc(input.razorpay_payment_id);
    await adminDb.runTransaction(async (tx) => {
      const existing = await tx.get(paymentRef);
      if (existing.exists) return;
      tx.set(paymentRef, {
        id: input.razorpay_payment_id,
        userId: user.uid,
        razorpayPaymentId: input.razorpay_payment_id,
        razorpayOrderId: input.razorpay_order_id,
        amount: order.amount,
        currency: order.currency,
        status: "SIGNATURE_VERIFIED",
        method: "unknown",
        capturedAt: 0,
        createdAt: Date.now(),
      });
      tx.update(orderRef, { status: "PAYMENT_VERIFIED", razorpayPaymentId: input.razorpay_payment_id, updatedAt: Date.now() });
    });
    return ok({ status: "verified_pending_webhook" });
  } catch (error: any) {
    if (error?.name === "ZodError") return fail("Invalid payment payload", 400);
    if (error?.message === "UNAUTHORIZED") return fail("Authentication required", 401);
    return fail("Payment verification failed", 500);
  }
}
