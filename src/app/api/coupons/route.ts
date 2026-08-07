import { NextRequest } from "next/server";
import { supabaseServer, supabasePublic } from "@/lib/supabase";
import { ok, bad, serverError } from "@/lib/api/responses";

export async function GET() {
  const client = supabasePublic();
  const { data, error } = await client.from("coupons").select("*").order("active", { ascending: false }).order("code");
  if (error) return serverError(error.message);
  return ok(data ?? []);
}

export async function POST(req: NextRequest) {
  const pub = supabasePublic();
  const { data: { user } } = await pub.auth.getUser();
  if (!user) return bad("Sign in", 401);
  const body = await req.json().catch(() => ({})) as any;
  if (!body.code) return bad("code is required");
  const valid = ["percent","fixed","shipping"];
  if (!valid.includes(body.type)) return bad("type must be percent | fixed | shipping");
  const { data, error } = await supabaseServer().from("coupons").insert({
    code: body.code.toUpperCase(), type: body.type, value: Number(body.value ?? 0),
    max_uses: Number(body.maxUses ?? 0), expires_at: body.expiresAt ?? null, active: body.active ?? true,
  }).select().single();
  if (error) return bad(error.message);
  return ok(data);
}
