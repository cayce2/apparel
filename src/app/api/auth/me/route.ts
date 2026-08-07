import { NextRequest } from "next/server";
import { supabasePublic } from "@/lib/supabase";
import { ok } from "@/lib/api/responses";

export async function GET(_req: NextRequest) {
  const client = supabasePublic();
  const { data } = await client.auth.getUser();
  if (!data.user) return ok({ user: null });
  return ok({
    user: data.user,
    profile: (await client.from("profiles").select("id,email,full_name,role,marketing_consent,points,notes,created_at").eq("id", data.user.id).maybeSingle()).data,
  });
}
