import { NextRequest } from "next/server";
import Razorpay from "razorpay";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/server-auth";
import { fail, ok } from "@/lib/api-response";

const schema = z.object({ planId: z.string().trim().min(1).max(120) });

export async function POST(request: NextRequest) {
  let uid = "unknown";
  try {
    const user = await requireUser(request);
    uid = user.uid;
    if (!adminDb) return fail("Payment service is not configured", 503);

    const body = schema.parse(await request.json());
    const planSnap = await adminDb.collection("plans").doc(body.planId).get();
    if (!planSnap.exists) return fail("Plan not found", 404);
    const plan = planSnap.data()!;
    if (plan.active !== true) return fail("Plan is unavailable", 409);

    // Plans store INR in rupees; Razorpay expects the smallest currency unit (paise).
    const rupeePrice = Number(plan.price);
    if (!Number.isSafeInteger(rupeePrice) || rupeePrice <= 0 || rupeePrice > 10000000) {
      return fail("Invalid plan price", 422);
    }
    const amount = rupeePrice * 100;
    if (!Number.isSafeInteger(amount)) return fail("Plan price is too large", 422);

    const currency = String(plan.currency || "INR").toUpperCase();
    if (currency !== "INR") return fail("Only INR is currently configured", 400);

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) return fail("Payment gateway is not configured", 503);

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const receipt = `podmen_${uid.slice(0, 12)}_${Date.now()}`;
    const order = await razorpay.orders.create({ amount, currency, receipt, notes: { userId: uid, planId: body.planId } });

    await adminDb.collection("orders").doc(order.id).set({
      id: order.id,
      userId: uid,
      planId: body.planId,
      amount,
      amountRupees: rupeePrice,
      currency,
      status: "CREATED",
      razorpayOrderId: order.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return ok({ orderId: order.id, amount, currency, keyId });
  } catch (error: any) {
    console.error("[payments/create-order] failed", { uid, name: error?.name, message: error?.message });
    if (error?.name === "ZodError") return fail("Invalid payment request", 400);
    if (error?.message === "UNAUTHORIZED") return fail("Authentication required", 401);
    if (error?.message === "FORBIDDEN") return fail("Payment access denied", 403);
    if (error?.statusCode === 400) return fail("Payment gateway rejected the order", 502);
    return fail("Unable to create payment order. Check the plan and payment configuration, then retry.", 500);
  }
}
