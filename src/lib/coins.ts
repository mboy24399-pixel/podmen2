import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

export type CoinDirection = "CREDIT" | "DEBIT";

export async function applyCoinLedger(input: {
  uid: string;
  direction: CoinDirection;
  amount: number;
  reason: string;
  source: string;
  sourceId: string;
  metadata?: Record<string, unknown>;
}) {
  if (!adminDb) throw new Error("Firebase Admin is not configured");
  const amount = Math.floor(input.amount);
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Invalid coin amount");

  const ledgerId = `${input.direction.toLowerCase()}_${input.uid}_${input.source}_${input.sourceId}`.replace(/[^a-zA-Z0-9_-]/g, "_");
  const userRef = adminDb.collection("users").doc(input.uid);
  const ledgerRef = adminDb.collection("coinLedger").doc(ledgerId);

  return adminDb.runTransaction(async (tx) => {
    const [userSnap, ledgerSnap] = await Promise.all([tx.get(userRef), tx.get(ledgerRef)]);
    if (!userSnap.exists) throw new Error("USER_NOT_FOUND");
    if (ledgerSnap.exists) return { duplicate: true, balance: Number(userSnap.data()?.coinBalance || 0) };

    const current = Math.max(0, Math.floor(Number(userSnap.data()?.coinBalance || 0)));
    const next = input.direction === "CREDIT" ? current + amount : current - amount;
    if (next < 0) throw new Error("INSUFFICIENT_COINS");

    tx.update(userRef, { coinBalance: next, updatedAt: Date.now() });
    tx.create(ledgerRef, {
      uid: input.uid,
      direction: input.direction,
      amount,
      reason: input.reason,
      source: input.source,
      sourceId: input.sourceId,
      metadata: input.metadata || {},
      balanceBefore: current,
      balanceAfter: next,
      createdAt: FieldValue.serverTimestamp(),
    });
    return { duplicate: false, balance: next };
  });
}
