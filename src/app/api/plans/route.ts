import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
export const dynamic='force-dynamic';
export const revalidate=0;
export async function GET(){try{if(!adminDb)return NextResponse.json({ok:false,error:'Plan service is not configured'},{status:503});const snap=await adminDb.collection('plans').where('active','==',true).get();return NextResponse.json({ok:true,data:{items:snap.docs.map(doc=>({id:doc.id,...doc.data()}))}},{headers:{'Cache-Control':'no-store, max-age=0'}})}catch(error){console.error('Public plans load failed',error);return NextResponse.json({ok:false,error:'Unable to load plans'},{status:500})}}
