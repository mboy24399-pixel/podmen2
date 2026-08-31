import { NextRequest } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { requireUser, getUserRole } from "@/lib/server-auth";
import { fail, ok } from "@/lib/api-response";

const privileged = new Set(["ADMIN", "SUPER_ADMIN"]);

function allowedBootstrapEmails() {
  return (process.env.ADMIN_BOOTSTRAP_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function POST(request: NextRequest) {
  try {
    if (!adminDb || !adminAuth) return fail("Admin authentication service is not configured", 503);
    const user = await requireUser(request);
    const existingRole = await getUserRole(user.uid, user as unknown as Record<string, unknown>);

    if (privileged.has(existingRole)) {
      return ok({ uid: user.uid, email: user.email || null, role: existingRole, bootstrapped: false });
    }

    const email = String(user.email || "").trim().toLowerCase();
    const allowlist = allowedBootstrapEmails();
    if (!email || !allowlist.includes(email)) return fail("This Google account is not authorized for Podmen X Admin", 403);

    const ref = adminDb.collection("users").doc(user.uid);
    const now = Date.now();
    await ref.set({
      uid: user.uid,
      email: user.email || "",
      displayName: user.name || user.email || "Administrator",
      photoURL: user.picture || "",
      role: "SUPER_ADMIN",
      isSubscribed: false,
      createdAt: now,
      updatedAt: now,
      adminProvisionedAt: now,
    }, { merge: true });

    await adminDb.collection("auditLogs").add({
      actorId: user.uid,
      actorEmail: user.email || "",
      action: "ADMIN_BOOTSTRAP",
      targetId: user.uid,
      createdAt: now,
      source: "admin-login",
    });

    return ok({ uid: user.uid, email: user.email || null, role: "SUPER_ADMIN", bootstrapped: true });
  } catch (error: any) {
    console.error("Admin bootstrap failed", { name: error?.name, message: error?.message });
    if (error?.message === "UNAUTHORIZED") return fail("Authentication required", 401);
    return fail("Unable to provision administrator access", 500);
  }
}
