import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
export const dynamic='force-dynamic';
export const revalidate=0;

export async function GET(request:Request){
  try{if(!adminDb)return NextResponse.json({ok:false,error:'Content service is not configured'},{status:503});const key=new URL(request.url).searchParams.get('key');if(key){const snap=await adminDb.collection('siteContent').doc(key).get();if(!snap.exists)return NextResponse.json({ok:true,data:null});return NextResponse.json({ok:true,data:{id:snap.id,...snap.data()}})}const snap=await adminDb.collection('siteContent').get();return NextResponse.json({ok:true,data:Object.fromEntries(snap.docs.map(doc=>[doc.id,{id:doc.id,...doc.data()}]))});}
  catch(error){console.error('[site-content] failed',error);return NextResponse.json({ok:false,error:'Unable to load site content'},{status:500})}
}
