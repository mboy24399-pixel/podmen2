import { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import type { UserRole } from "@/types";

export async function requireUser(request: NextRequest) {
  if (!adminAuth) throw new Error("Firebase Admin is not configured");
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const token = header.slice(7).trim();
  if (!token) throw new Error("UNAUTHORIZED");
  const decoded = await adminAuth.verifyIdToken(token, true);
  return decoded;
}

export async function getUserRole(uid: string): Promise<UserRole> {
  if (!adminDb) throw new Error("Firebase Admin is not configured");
  const snap = await adminDb.collection("users").doc(uid).get();
  return (snap.data()?.role as UserRole | undefined) ?? "USER";
}

export async function requireRole(request: NextRequest, roles: UserRole[]) {
  const user = await requireUser(request);
  const role = await getUserRole(user.uid);
  if (!roles.includes(role)) throw new Error("FORBIDDEN");
  return { user, role };
}
