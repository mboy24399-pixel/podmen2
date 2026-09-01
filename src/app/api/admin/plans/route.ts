import { NextRequest } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { requireRole } from '@/lib/server-auth';
import { getRazorpay } from '@/lib/razorpay';
import { fail, ok } from '@/lib/api-response';

const featureList = z.preprocess(
  value => Array.isArray(value) ? value : typeof value === 'string' ? value.split(/\r?\n|,/).map(v => v.trim()).filter(Boolean) : value,
  z.array(z.string().trim().min(1).max(200)).max(30)
);

const schema = z.object({
  id: z.string().trim().min(2).max(80).transform(v => v.toLowerCase().replace(/[^a-z0-9_-]/g, '_')),
  name: z.string().trim().min(2).max(120),
  price: z.coerce.number().int().positive().max(10000000),
  currency: z.literal('INR'),
  interval: z.enum(['monthly', 'yearly']),
  trialDays: z.coerce.number().int().min(0).max(30),
  active: z.coerce.boolean(),
  features: featureList,
});

async function createGatewayPlan(input: { id: string; name: string; price: number; interval: 'monthly' | 'yearly' }) {
  try {
    const gateway = getRazorpay();
    const created = await gateway.plans.create({
      period: input.interval,
      interval: 1,
      item: {
        name: input.name.slice(0, 120),
        amount: input.price * 100,
        currency: 'INR',
        description: `Podmen X ${input.name}`.slice(0, 200),
      },
      notes: { podmenPlanId: input.id },
    });
    if (!created?.id) throw new Error('Razorpay plan was not created');
    return { razorpayPlanId: created.id, paymentReady: true };
  } catch (error: any) {
    if (error?.message === 'RAZORPAY_NOT_CONFIGURED') return { razorpayPlanId: null, paymentReady: false };
    console.error('[admin/plans] Razorpay plan creation failed', { name: error?.name, message: error?.message });
    return { razorpayPlanId: null, paymentReady: false };
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ['ADMIN', 'SUPER_ADMIN', 'EDITOR']);
    if (!adminDb) return fail('Server is not configured', 503);
    const snap = await adminDb.collection('plans').orderBy('updatedAt', 'desc').limit(100).get();
    return ok({ items: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
  } catch (e: any) {
    if (e?.message === 'UNAUTHORIZED') return fail('Authentication required', 401);
    if (e?.message === 'FORBIDDEN') return fail('Forbidden', 403);
    console.error('[admin/plans] list failed', e);
    return fail('Unable to load plans', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireRole(request, ['ADMIN', 'SUPER_ADMIN']);
    if (!adminDb) return fail('Server is not configured', 503);
    const input = schema.parse(await request.json());
    const existing = await adminDb.collection('plans').doc(input.id).get();
    const previous = existing.exists ? existing.data() : undefined;
    const gateway = previous?.razorpayPlanId && previous.price === input.price && previous.interval === input.interval
      ? { razorpayPlanId: previous.razorpayPlanId, paymentReady: previous.paymentReady !== false }
      : await createGatewayPlan(input);
    const now = Date.now();
    await adminDb.collection('plans').doc(input.id).set({
      ...input,
      slug: input.id,
      description: previous?.description || '',
      displayOrder: previous?.displayOrder || 0,
      ...gateway,
      createdAt: previous?.createdAt || now,
      updatedAt: now,
    }, { merge: true });
    await adminDb.collection('auditLogs').add({ actorId: user.uid, action: 'PLAN_UPSERT', targetId: input.id, createdAt: now });
    return ok({ id: input.id, paymentReady: gateway.paymentReady }, 201);
  } catch (e: any) {
    if (e?.message === 'UNAUTHORIZED') return fail('Authentication required', 401);
    if (e?.message === 'FORBIDDEN') return fail('Forbidden', 403);
    if (e?.name === 'ZodError') {
      console.error('[admin/plans] validation failed', e.issues);
      return fail('Invalid plan payload. Check name, price, interval, trial days and features.', 400);
    }
    console.error('[admin/plans] save failed', e);
    return fail('Unable to save plan', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user } = await requireRole(request, ['ADMIN', 'SUPER_ADMIN']);
    if (!adminDb) return fail('Server is not configured', 503);
    const body = await request.json();
    const id = String(body.id || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    if (!/^[a-z0-9_-]{2,80}$/.test(id)) return fail('Invalid plan id', 400);
    const currentSnap = await adminDb.collection('plans').doc(id).get();
    if (!currentSnap.exists) return fail('Plan not found', 404);
    const current = currentSnap.data() || {};
    const patch = schema.omit({ id: true }).partial().parse(body);
    const nextPrice = patch.price ?? current.price;
    const nextInterval = patch.interval ?? current.interval;
    const billingChanged = nextPrice !== current.price || nextInterval !== current.interval;
    const gateway = billingChanged
      ? await createGatewayPlan({ id, name: String(patch.name ?? current.name), price: Number(nextPrice), interval: nextInterval as 'monthly' | 'yearly' })
      : { razorpayPlanId: current.razorpayPlanId || null, paymentReady: current.paymentReady !== false };
    await adminDb.collection('plans').doc(id).set({
      ...patch,
      ...(billingChanged ? gateway : {}),
      updatedAt: Date.now(),
    }, { merge: true });
    await adminDb.collection('auditLogs').add({ actorId: user.uid, action: 'PLAN_UPDATE', targetId: id, billingChanged, createdAt: Date.now() });
    return ok({ id, paymentReady: gateway.paymentReady });
  } catch (e: any) {
    if (e?.message === 'UNAUTHORIZED') return fail('Authentication required', 401);
    if (e?.message === 'FORBIDDEN') return fail('Forbidden', 403);
    if (e?.name === 'ZodError') return fail('Invalid plan payload. Check the edited fields.', 400);
    console.error('[admin/plans] update failed', e);
    return fail('Unable to update plan', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user } = await requireRole(request, ['ADMIN', 'SUPER_ADMIN']);
    if (!adminDb) return fail('Server is not configured', 503);
    const id = String(request.nextUrl.searchParams.get('id') || '').trim().toLowerCase();
    if (!/^[a-z0-9_-]{2,80}$/.test(id)) return fail('Invalid plan id', 400);
    await adminDb.collection('plans').doc(id).set({ active: false, updatedAt: Date.now() }, { merge: true });
    await adminDb.collection('auditLogs').add({ actorId: user.uid, action: 'PLAN_ARCHIVE', targetId: id, createdAt: Date.now() });
    return ok({ id, active: false });
  } catch (e: any) {
    if (e?.message === 'UNAUTHORIZED') return fail('Authentication required', 401);
    if (e?.message === 'FORBIDDEN') return fail('Forbidden', 403);
    console.error('[admin/plans] archive failed', e);
    return fail('Unable to archive plan', 500);
  }
}
