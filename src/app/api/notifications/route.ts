import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
export const dynamic='force-dynamic';
export const revalidate=0;

export async function GET(){try{if(!adminDb)return NextResponse.json({ok:false,error:'Notification service is not configured'},{status:503});const snap=await adminDb.collection('notifications').where('active','==',true).orderBy('createdAt','desc').limit(50).get();return NextResponse.json({ok:true,data:{items:snap.docs.map(doc=>({id:doc.id,title:String(doc.data().title||''),body:String(doc.data().body||''),createdAt:Number(doc.data().createdAt||0)}))}})}catch(error){console.error('[notifications] failed',error);return NextResponse.json({ok:false,error:'Unable to load notifications'},{status:500})}}
