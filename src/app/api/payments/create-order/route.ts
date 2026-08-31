import { NextRequest } from "next/server";
import Razorpay from "razorpay";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/server-auth";
import { fail, ok } from "@/lib/api-response";

const schema = z.object({ planId: z.string().min(1).max(120) });

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!adminDb) return fail("Server is not configured", 503);
    const body = schema.parse(await request.json());
    const planSnap = await adminDb.collection("plans").doc(body.planId).get();
    if (!planSnap.exists) return fail("Plan not found", 404);
    const plan = planSnap.data()!;
    if (plan.active !== true) return fail("Plan is unavailable", 409);
    const amount = Number(plan.price);
    if (!Number.isSafeInteger(amount) || amount <= 0) return fail("Invalid plan price", 500);
    const currency = String(plan.currency || "INR").toUpperCase();
    if (currency !== "INR") return fail("Only INR is currently configured", 400);
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) return fail("Payment gateway is not configured", 503);

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const receipt = `podmen_${user.uid.slice(0, 12)}_${Date.now()}`;
    const order = await razorpay.orders.create({ amount, currency, receipt, notes: { userId: user.uid, planId: body.planId } });
    await adminDb.collection("orders").doc(order.id).set({
      id: order.id, userId: user.uid, planId: body.planId, amount, currency,
      status: "CREATED", razorpayOrderId: order.id, createdAt: Date.now(), updatedAt: Date.now(),
    });
    return ok({ orderId: order.id, amount, currency, keyId });
  } catch (error: any) {
    if (error?.name === "ZodError") return fail("Invalid request", 400);
    if (error?.message === "UNAUTHORIZED") return fail("Authentication required", 401);
    return fail("Unable to create payment order", 500);
  }
}
