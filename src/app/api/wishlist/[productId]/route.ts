import { NextRequest } from "next/server";
import { supabaseServer, supabasePublic } from "@/lib/supabase";
import { ok, bad } from "@/lib/api/responses";

// toggle: GET returns whether saved; DELETE removes.
export async function GET(_req: NextRequest, ctx: { params: Promise<{ productId: string }> }) {
  const { productId } = await ctx.params;
  const pub = supabasePublic();
  const { data: { user } } = await pub.auth.getUser();
  if (!user) return ok({ saved: false });
  const { data } = await supabaseServer().from("wishlist").select("id").eq("customer_id", user.id).eq("product_id", productId).maybeSingle();
  return ok({ saved: !!data });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ productId: string }> }) {
  const { productId } = await ctx.params;
  const pub = supabasePublic();
  const { data: { user } } = await pub.auth.getUser();
  if (!user) return bad("Sign in", 401);
  const { error } = await supabaseServer().from("wishlist").delete().eq("customer_id", user.id).eq("product_id", productId);
  if (error) return bad(error.message);
  return ok({ productId, removed: true });
}
