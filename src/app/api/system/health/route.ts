import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

const requiredPublicFirebase = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const;

export async function GET() {
  const missingPublicFirebase = requiredPublicFirebase.filter((key) => !process.env[key]?.trim());
  const razorpayConfigured = Boolean(
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() && process.env.RAZORPAY_KEY_SECRET?.trim(),
  );
  const firebaseConfigured = Boolean(adminDb);
  const ok = missingPublicFirebase.length === 0 && firebaseConfigured;

  return NextResponse.json(
    {
      ok,
      service: 'podmen-x',
      firebase: {
        adminConfigured: firebaseConfigured,
        missingPublicConfig: missingPublicFirebase,
      },
      payments: {
        razorpayConfigured,
      },
      timestamp: new Date().toISOString(),
    },
    {
      status: ok ? 200 : 503,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    },
  );
}
