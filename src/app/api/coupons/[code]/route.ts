import { NextRequest } from "next/server";
import { supabasePublic } from "@/lib/supabase";
import { ok, notFound, bad } from "@/lib/api/responses";

// GET /api/coupons/[code]?cartTotal=299.99 — validates and returns discount.
export async function GET(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const sp = req.nextUrl.searchParams;
  const client = supabasePublic();
  const { data, error } = await client.from("coupons").select("*").eq("code", code.toUpperCase()).eq("active", true).maybeSingle();
  if (error || !data) return notFound("Coupon not found or expired");
  if (data.expires_at && new Date(data.expires_at) < new Date()) return ok({ valid: false, reason: "expired" });
  if (data.max_uses > 0 && data.uses >= data.max_uses) return ok({ valid: false, reason: "limit_reached" });

  const cartTotal = Number(sp.get("cartTotal") ?? 0);
  let discount: number | "shipping" = 0;
  if (data.type === "percent") discount = Math.round(cartTotal * (data.value / 100) * 100) / 100;
  else if (data.type === "fixed") discount = Math.min(Number(data.value), cartTotal);
  else if (data.type === "shipping") discount = "shipping";
  return ok({ valid: true, code: data.code, type: data.type, value: Number(data.value), discount });
}

// POST /api/coupons/[code]  (increment uses) — call after an order applies it.
export async function POST(_req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const client = supabasePublic();
  const { data } = await client.from("coupons").select("id,uses").eq("code", code.toUpperCase()).maybeSingle();
  if (!data) return bad("Coupon not found", 404);
  await client.from("coupons").update({ uses: (data.uses ?? 0) + 1 }).eq("id", data.id);
  return ok({ code, uses: (data.uses ?? 0) + 1 });
}
