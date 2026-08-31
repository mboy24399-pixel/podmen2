import { NextRequest } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { requireRole } from '@/lib/server-auth';
import { fail, ok } from '@/lib/api-response';

const collections = ['tracks','podcasts','episodes'] as const;
const baseSchema = z.object({ type:z.enum(collections), title:z.string().trim().min(1).max(200), description:z.string().trim().max(5000).default(''), audioUrl:z.string().url().refine(v=>v.startsWith('https://'),'HTTPS audio URL required').max(4000), accessType:z.enum(['FREE','PREMIUM']).default('FREE'), status:z.enum(['DRAFT','PUBLISHED','SCHEDULED','BLOCKED']).default('DRAFT'), thumbnailUrl:z.string().url().max(4000).optional() });

export async function GET(request:NextRequest){
  try { await requireRole(request,['ADMIN','SUPER_ADMIN','EDITOR','MODERATOR']); if(!adminDb)return fail('Server is not configured',503); const q=request.nextUrl.searchParams; const type=collections.includes(q.get('type') as any)?q.get('type')!:'tracks'; const limit=Math.min(Math.max(Number(q.get('limit')||100),1),100); const snap=await adminDb.collection(type).orderBy('createdAt','desc').limit(limit).get(); return ok({items:snap.docs.map(d=>({id:d.id,...d.data()}))}); }
  catch(e:any){if(e?.message==='UNAUTHORIZED')return fail('Authentication required',401);if(e?.message==='FORBIDDEN')return fail('Forbidden',403);console.error('[admin/content] list failed',e);return fail('Unable to load content',500)}
}

export async function POST(request:NextRequest){
  try { const {user}=await requireRole(request,['ADMIN','SUPER_ADMIN','EDITOR']); if(!adminDb)return fail('Server is not configured',503); const input=baseSchema.parse(await request.json()); const ref=adminDb.collection(input.type).doc(); const now=Date.now(); const slug=`${input.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}-${ref.id.slice(0,6)}`; await ref.set({id:ref.id,title:input.title,slug,description:input.description,audioUrl:input.audioUrl,accessType:input.accessType,status:input.status,thumbnailUrl:input.thumbnailUrl||'',creatorId:user.uid,playCount:0,likeCount:0,createdAt:now,updatedAt:now}); await adminDb.collection('auditLogs').add({actorId:user.uid,action:'CONTENT_CREATE',collection:input.type,targetId:ref.id,createdAt:now}); return ok({id:ref.id,slug},201); }
  catch(e:any){if(e?.message==='UNAUTHORIZED')return fail('Authentication required',401);if(e?.message==='FORBIDDEN')return fail('Forbidden',403);if(e?.name==='ZodError')return fail('Invalid content payload',400);console.error('[admin/content] create failed',e);return fail('Unable to create content',500)}
}

export async function PATCH(request:NextRequest){
  try { const {user}=await requireRole(request,['ADMIN','SUPER_ADMIN','EDITOR']); if(!adminDb)return fail('Server is not configured',503); const body=await request.json(); const type=collections.includes(body.type)?body.type:null; const id=String(body.id||'').trim(); if(!type||!id)return fail('Content type and id are required',400); const patch=baseSchema.omit({type:true}).partial().parse(body); const now=Date.now(); const data:any={...patch,updatedAt:now}; if(patch.title)data.slug=`${patch.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}-${id.slice(0,6)}`; await adminDb.collection(type).doc(id).set(data,{merge:true}); await adminDb.collection('auditLogs').add({actorId:user.uid,action:'CONTENT_UPDATE',collection:type,targetId:id,createdAt:now}); return ok({id}); }
  catch(e:any){if(e?.message==='UNAUTHORIZED')return fail('Authentication required',401);if(e?.message==='FORBIDDEN')return fail('Forbidden',403);if(e?.name==='ZodError')return fail('Invalid content payload',400);console.error('[admin/content] update failed',e);return fail('Unable to update content',500)}
}

export async function DELETE(request:NextRequest){
  try { const {user}=await requireRole(request,['ADMIN','SUPER_ADMIN']); if(!adminDb)return fail('Server is not configured',503); const type=collections.includes(request.nextUrl.searchParams.get('type') as any)?request.nextUrl.searchParams.get('type')!:null; const id=String(request.nextUrl.searchParams.get('id')||'').trim(); if(!type||!id)return fail('Content type and id are required',400); await adminDb.collection(type).doc(id).delete(); await adminDb.collection('auditLogs').add({actorId:user.uid,action:'CONTENT_DELETE',collection:type,targetId:id,createdAt:Date.now()}); return ok({id,deleted:true}); }
  catch(e:any){if(e?.message==='UNAUTHORIZED')return fail('Authentication required',401);if(e?.message==='FORBIDDEN')return fail('Forbidden',403);console.error('[admin/content] delete failed',e);return fail('Unable to delete content',500)}
}
