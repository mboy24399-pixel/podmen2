import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireRole } from "@/lib/server-auth";
import { fail, ok } from "@/lib/api-response";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function GET(request: NextRequest){try{await requireRole(request,["ADMIN","SUPER_ADMIN"]);if(!adminDb)return fail("Server is not configured",503);const [tournaments,users,entries,ledger]=await Promise.all([adminDb.collection("tournaments").count().get(),adminDb.collection("users").count().get(),adminDb.collectionGroup("entries").count().get(),adminDb.collection("coinLedger").where("direction","==","CREDIT").limit(500).get()]);const coinsIssued=ledger.docs.reduce((sum,d)=>sum+Number(d.data().amount||0),0);return ok({tournaments:tournaments.data().count,users:users.data().count,entries:entries.data().count,coinsIssued});}catch(e:any){if(e?.message==='UNAUTHORIZED')return fail('Authentication required',401);if(e?.message==='FORBIDDEN')return fail('Forbidden',403);console.error('[admin/analytics] failed',e);return fail('Unable to load analytics',500)}}
