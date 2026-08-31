import { NextRequest } from 'next/server';
import { z } from 'zod';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { requireRole } from '@/lib/server-auth';
import { fail, ok } from '@/lib/api-response';

const patchSchema = z.object({
  userId: z.string().min(1).max(200),
  action: z.enum(['edit', 'block', 'unblock', 'grantPremium', 'revokePremium']),
  displayName: z.string().trim().min(1).max(120).optional(),
  role: z.enum(['USER', 'PREMIUM_USER', 'EDITOR', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN']).optional(),
  email: z.string().email().max(320).optional(),
  planId: z.string().trim().min(2).max(80).optional(),
  days: z.number().int().min(1).max(3650).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ['ADMIN', 'SUPER_ADMIN', 'MODERATOR']);
    if (!adminDb) return fail('Server is not configured', 503);
    const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get('limit') || 100), 1), 100);
    const snap = await adminDb.collection('users').orderBy('createdAt', 'desc').limit(limit).get();
    return ok({ items: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
  } catch (e: any) {
    if (e?.message === 'UNAUTHORIZED') return fail('Authentication required', 401);
    if (e?.message === 'FORBIDDEN') return fail('Forbidden', 403);
    console.error('[admin/users] list failed', e);
    return fail('Unable to load users', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, role: actorRole } = await requireRole(request, ['ADMIN', 'SUPER_ADMIN']);
    if (!adminDb || !adminAuth) return fail('Server is not configured', 503);

    const input = patchSchema.parse(await request.json());
    if (input.userId === user.uid && ['block', 'revokePremium'].includes(input.action)) {
      return fail('You cannot remove access from your own account', 400);
    }

    const targetRef = adminDb.collection('users').doc(input.userId);
    const target = await targetRef.get();
    if (!target.exists) return fail('User not found', 404);

    const targetData = target.data() || {};
    const targetRole = String(targetData.role || 'USER').toUpperCase();
    if (input.role === 'SUPER_ADMIN' && actorRole !== 'SUPER_ADMIN') return fail('Only a super admin can grant this role', 403);
    if (input.role && actorRole !== 'SUPER_ADMIN' && (targetRole === 'SUPER_ADMIN' || input.role === 'ADMIN')) {
      return fail('Only a super admin can change privileged roles', 403);
    }

    const now = Date.now();
    const update: Record<string, unknown> = { updatedAt: now };

    if (input.action === 'block') update.banned = true;
    if (input.action === 'unblock') update.banned = false;

    if (input.action === 'edit') {
      if (input.displayName !== undefined) update.displayName = input.displayName;
      if (input.role !== undefined) update.role = input.role;
      if (input.email !== undefined) {
        await adminAuth.updateUser(input.userId, { email: input.email });
        update.email = input.email;
      }
      if (input.displayName !== undefined) {
        await adminAuth.updateUser(input.userId, { displayName: input.displayName });
      }
    }

    if (input.action === 'block' || input.action === 'unblock') {
      await adminAuth.updateUser(input.userId, { disabled: input.action === 'block' });
      if (input.action === 'block') await adminAuth.revokeRefreshTokens(input.userId);
    }

    if (input.action === 'grantPremium') {
      const requestedDays = input.days ?? 30;
      let planId = input.planId || 'admin-premium';
      let planName = 'Premium (Admin Grant)';
      let planInterval = 'custom';

      if (input.planId) {
        const planSnap = await adminDb.collection('plans').doc(input.planId).get();
        if (!planSnap.exists || planSnap.data()?.active !== true) return fail('Selected plan is not active', 400);
        const plan = planSnap.data() || {};
        planId = input.planId;
        planName = String(plan.name || input.planId);
        planInterval = String(plan.interval || 'custom');
      }

      const currentExpiry = Number(targetData.subscriptionExpiry || 0);
      const base = Math.max(now, currentExpiry);
      const expiry = base + requestedDays * 24 * 60 * 60 * 1000;
      Object.assign(update, {
        isSubscribed: true,
        subscriptionStatus: 'ACTIVE',
        subscriptionExpiry: expiry,
        subscriptionPlanId: planId,
        subscriptionPlanName: planName,
        subscriptionPlanInterval: planInterval,
        premiumGrantedBy: user.uid,
        premiumGrantedAt: now,
      });
    }

    if (input.action === 'revokePremium') {
      Object.assign(update, {
        isSubscribed: false,
        subscriptionStatus: 'CANCELLED',
        subscriptionExpiry: now,
        premiumRevokedBy: user.uid,
        premiumRevokedAt: now,
      });
    }

    await targetRef.set(update, { merge: true });
    await adminDb.collection('auditLogs').add({
      actorId: user.uid,
      action: input.action === 'edit' ? 'USER_EDIT' : input.action === 'block' ? 'USER_BLOCK' : input.action === 'unblock' ? 'USER_UNBLOCK' : input.action === 'grantPremium' ? 'PREMIUM_GRANT' : 'PREMIUM_REVOKE',
      targetId: input.userId,
      planId: input.planId || null,
      days: input.days || null,
      createdAt: now,
    });

    return ok({ id: input.userId, action: input.action, ...update });
  } catch (e: any) {
    if (e?.message === 'UNAUTHORIZED') return fail('Authentication required', 401);
    if (e?.message === 'FORBIDDEN') return fail('Forbidden', 403);
    if (e?.name === 'ZodError') return fail('Invalid user payload', 400);
    console.error('[admin/users] mutation failed', e);
    return fail('Unable to update user', 500);
  }
}
