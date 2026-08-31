import { NextRequest } from "next/server";
import { requireRole } from "@/lib/server-auth";
import { ok, fail } from "@/lib/api-response";

export async function GET(request: NextRequest){
  try{
    const {user, role}=await requireRole(request,["ADMIN","SUPER_ADMIN","EDITOR","MODERATOR"]);
    return ok({uid:user.uid,email:user.email||null,role});
  }catch(error:any){
    if(error?.message==="UNAUTHORIZED") return fail("Authentication required",401);
    if(error?.message==="FORBIDDEN") return fail("Administrator access required",403);
    return fail("Unable to validate admin session",500);
  }
}
