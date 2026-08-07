import { NextRequest } from "next/server";
import { supabaseServer, supabasePublic } from "@/lib/supabase";
import { ok, bad } from "@/lib/api/responses";

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const pub = supabasePublic();
  const { data: { user } } = await pub.auth.getUser();
  if (!user) return bad("Sign in", 401);
  const { error } = await supabaseServer().from("addresses").delete().eq("id", id).eq("customer_id", user.id);
  if (error) return bad(error.message);
  return ok({ id, deleted: true });
}
