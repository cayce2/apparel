import { NextRequest } from "next/server";
import { supabasePublic } from "@/lib/supabase";
import { ok } from "@/lib/api/responses";

export async function POST(_req: NextRequest) {
  const client = supabasePublic();
  await client.auth.signOut();
  return ok({ signedOut: true });
}
