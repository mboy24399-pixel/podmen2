import { NextRequest } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { requireUser } from '@/lib/server-auth';
import { fail, ok } from '@/lib/api-response';

const schema=z.object({name:z.string().trim().min(1).max(100),description:z.string().trim().max(500).optional()});

export async function GET(request:NextRequest){try{const user=await requireUser(request);if(!adminDb)return fail('Service is not configured',503);const snap=await adminDb.collection('users').doc(user.uid).collection('playlists').orderBy('updatedAt','desc').limit(100).get();return ok({items:snap.docs.map(d=>({id:d.id,...d.data()}))})}catch(e:any){if(e?.message==='UNAUTHORIZED')return fail('Authentication required',401);return fail('Unable to load playlists',500)}}
export async function POST(request:NextRequest){try{const user=await requireUser(request);if(!adminDb)return fail('Service is not configured',503);const input=schema.parse(await request.json());const ref=adminDb.collection('users').doc(user.uid).collection('playlists').doc();const now=Date.now();await ref.set({id:ref.id,userId:user.uid,name:input.name,description:input.description||'',isPublic:false,trackIds:[],createdAt:now,updatedAt:now});return ok({id:ref.id},201)}catch(e:any){if(e?.message==='UNAUTHORIZED')return fail('Authentication required',401);if(e?.name==='ZodError')return fail('Invalid playlist',400);return fail('Unable to create playlist',500)}}
export async function DELETE(request:NextRequest){try{const user=await requireUser(request);if(!adminDb)return fail('Service is not configured',503);const id=String(request.nextUrl.searchParams.get('id')||'');if(!id)return fail('Playlist id is required',400);await adminDb.collection('users').doc(user.uid).collection('playlists').doc(id).delete();return ok({id,deleted:true})}catch(e:any){if(e?.message==='UNAUTHORIZED')return fail('Authentication required',401);return fail('Unable to delete playlist',500)}}
