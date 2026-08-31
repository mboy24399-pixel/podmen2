import { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import type { UserRole } from "@/types";

const PRIVILEGED_ROLES: UserRole[] = ["EDITOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"];

export async function requireUser(request: NextRequest) {
  if (!adminAuth) throw new Error("Firebase Admin is not configured");
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const token = header.slice(7).trim();
  if (!token) throw new Error("UNAUTHORIZED");
  try {
    return await adminAuth.verifyIdToken(token, true);
  } catch (error) {
    console.error("Firebase ID token verification failed", error);
    throw new Error("UNAUTHORIZED");
  }
}

export async function getUserRole(uid: string, claims?: Record<string, unknown>): Promise<UserRole> {
  if (claims?.admin === true) return "ADMIN";
  const claimRole = String(claims?.role || "").toUpperCase() as UserRole;
  if (PRIVILEGED_ROLES.includes(claimRole)) return claimRole;
  if (!adminDb) throw new Error("Firebase Admin is not configured");
  const snap = await adminDb.collection("users").doc(uid).get();
  const role = String(snap.data()?.role || "USER").toUpperCase() as UserRole;
  return role;
}

export async function requireRole(request: NextRequest, roles: UserRole[]) {
  const user = await requireUser(request);
  const role = await getUserRole(user.uid, user as unknown as Record<string, unknown>);
  if (!roles.includes(role)) throw new Error("FORBIDDEN");
  return { user, role };
}
