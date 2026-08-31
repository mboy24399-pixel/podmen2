import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { requireUser } from '@/lib/server-auth';
import { fail, ok } from '@/lib/api-response';

export async function GET(request:NextRequest){
  try { const user=await requireUser(request); if(!adminDb)return fail('Service is not configured',503); const snap=await adminDb.collection('users').doc(user.uid).collection('history').orderBy('lastPlayedAt','desc').limit(100).get(); return ok({items:snap.docs.map(d=>({id:d.id,...d.data()}))}); }
  catch(e:any){if(e?.message==='UNAUTHORIZED')return fail('Authentication required',401);return fail('Unable to load history',500)}
}
