import { NextRequest } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { requireRole } from '@/lib/server-auth';
import { fail, ok } from '@/lib/api-response';

const keys = ['privacy','terms','help'] as const;
const schema = z.object({ key:z.enum(keys), title:z.string().trim().min(1).max(200), body:z.string().trim().min(1).max(50000), updatedAt:z.number().optional() });

export async function GET(request:NextRequest){
  try{await requireRole(request,['ADMIN','SUPER_ADMIN','EDITOR']);if(!adminDb)return fail('Server is not configured',503);const snap=await adminDb.collection('siteContent').get();const items=snap.docs.map(doc=>({id:doc.id,...doc.data()}));return ok({items});}
  catch(e:any){if(e?.message==='UNAUTHORIZED')return fail('Authentication required',401);if(e?.message==='FORBIDDEN')return fail('Forbidden',403);console.error('[admin/site-content] list failed',e);return fail('Unable to load site content',500)}
}

export async function PATCH(request:NextRequest){
  try{const {user}=await requireRole(request,['ADMIN','SUPER_ADMIN']);if(!adminDb)return fail('Server is not configured',503);const input=schema.parse(await request.json());const now=Date.now();await adminDb.collection('siteContent').doc(input.key).set({key:input.key,title:input.title,body:input.body,updatedAt:now,updatedBy:user.uid},{merge:true});await adminDb.collection('auditLogs').add({actorId:user.uid,action:'SITE_CONTENT_UPDATE',targetId:input.key,createdAt:now});return ok({key:input.key,updatedAt:now});}
  catch(e:any){if(e?.message==='UNAUTHORIZED')return fail('Authentication required',401);if(e?.message==='FORBIDDEN')return fail('Forbidden',403);if(e?.name==='ZodError')return fail('Invalid site content',400);console.error('[admin/site-content] update failed',e);return fail('Unable to update site content',500)}
}
