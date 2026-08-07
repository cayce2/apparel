import { NextRequest } from "next/server";
import { supabaseServer, supabasePublic } from "@/lib/supabase";
import { ok, bad, serverError } from "@/lib/api/responses";

export async function GET() {
  const pub = supabasePublic();
  const { data: { user } } = await pub.auth.getUser();
  if (!user) return ok([]);
  const client = supabaseServer();
  const { data, error } = await client.from("payment_methods").select("*").eq("customer_id", user.id).order("is_default", { ascending: false });
  if (error) return serverError(error.message);
  return ok(data ?? []);
}

export async function POST(req: NextRequest) {
  const pub = supabasePublic();
  const { data: { user } } = await pub.auth.getUser();
  if (!user) return bad("Sign in", 401);
  const body = await req.json().catch(() => ({})) as any;
  const valid = ["visa","mastercard","amex","paypal","mpesa"];
  if (!valid.includes(body.brand) || !body.last4) return bad("brand (visa|mastercard|amex|paypal|mpesa) and last4 are required");
  const client = supabaseServer();
  if (body.isDefault) await client.from("payment_methods").update({ is_default: false }).eq("customer_id", user.id);
  const { data, error } = await client.from("payment_methods").insert({
    customer_id: user.id, brand: body.brand, last4: String(body.last4).slice(-4), expiry: body.expiry ?? null, is_default: !!body.isDefault,
  }).select().single();
  if (error) return bad(error.message);
  return ok(data);
}
