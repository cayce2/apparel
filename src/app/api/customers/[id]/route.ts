import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { ok, notFound, serverError } from "@/lib/api/responses";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const client = supabaseServer();
  const { data: profile, error } = await client.from("profiles").select("*").eq("id", id).maybeSingle();
  if (error) return serverError(error.message);
  if (!profile) return notFound("Customer not found");
  const { data: orders } = await client.from("orders").select("id,number,created_at,status,total").eq("customer_id", id).order("created_at", { ascending: false });
  return ok({
    id: profile.id, email: profile.email, name: profile.full_name ?? profile.email,
    marketingConsent: profile.marketing_consent, notes: profile.notes ?? "",
    points: profile.points ?? 0, joinedAt: profile.created_at,
    orders: orders ?? [],
  });
}
