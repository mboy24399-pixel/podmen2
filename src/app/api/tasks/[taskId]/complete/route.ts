import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/server-auth";
import { applyCoinLedger } from "@/lib/coins";
import { ok, fail } from "@/lib/api-response";

export async function POST(request: NextRequest, { params }: { params: { taskId: string } }) {
  try {
    const { user } = await requireUser(request);
    if (!adminDb) return fail("Server is not configured", 503);
    const taskRef = adminDb.collection("tasks").doc(params.taskId);
    const claimRef = adminDb.collection("taskClaims").doc(`${user.uid}_${params.taskId}`);
    const now = Date.now();
    const result = await adminDb.runTransaction(async (tx) => {
      const [taskSnap, claimSnap] = await Promise.all([tx.get(taskRef), tx.get(claimRef)]);
      if (!taskSnap.exists) throw new Error("TASK_NOT_FOUND");
      if (claimSnap.exists) return { duplicate: true, rewardCoins: 0 };
      const task = taskSnap.data() || {};
      if (task.active !== true) throw new Error("TASK_INACTIVE");
      if (task.startsAt && Number(task.startsAt) > now) throw new Error("TASK_NOT_STARTED");
      if (task.endsAt && Number(task.endsAt) < now) throw new Error("TASK_EXPIRED");
      const rewardCoins = Math.floor(Number(task.rewardCoins || 0));
      if (!Number.isSafeInteger(rewardCoins) || rewardCoins <= 0) throw new Error("INVALID_REWARD");
      tx.create(claimRef, { uid: user.uid, taskId: params.taskId, status: "APPROVED", rewardCoins, createdAt: now });
      return { duplicate: false, rewardCoins };
    });
    if (!result.duplicate) await applyCoinLedger({ uid: user.uid, direction: "CREDIT", amount: result.rewardCoins, reason: "TASK_REWARD", source: "task", sourceId: params.taskId });
    const userSnap = await adminDb.collection("users").doc(user.uid).get();
    return ok({ claimed: !result.duplicate, rewardCoins: result.rewardCoins, coinBalance: Number(userSnap.data()?.coinBalance || 0) });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return fail("Authentication required", 401);
    if (e?.message === "TASK_NOT_FOUND") return fail("Task not found", 404);
    if (["TASK_INACTIVE", "TASK_NOT_STARTED", "TASK_EXPIRED"].includes(e?.message)) return fail(e.message.replaceAll("_", " "), 409);
    console.error("[tasks/complete] failed", e);
    return fail("Unable to complete task", 500);
  }
}
