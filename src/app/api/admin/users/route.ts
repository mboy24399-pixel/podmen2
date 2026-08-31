import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireRole } from "@/lib/server-auth";
import { fail, ok } from "@/lib/api-response";
export async function GET(request:NextRequest){try{await requireRole(request,["ADMIN","SUPER_ADMIN","MODERATOR"]);if(!adminDb)return fail("Server is not configured",503);const limit=Math.min(Math.max(Number(request.nextUrl.searchParams.get("limit")||50),1),100);const snap=await adminDb.collection("users").orderBy("createdAt","desc").limit(limit).get();return ok({items:snap.docs.map(d=>({id:d.id,...d.data()}))})}catch(e:any){if(e?.message==="UNAUTHORIZED")return fail("Authentication required",401);if(e?.message==="FORBIDDEN")return fail("Forbidden",403);return fail("Unable to load users",500)}}
