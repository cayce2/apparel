import { NextRequest } from "next/server";
import { supabaseServer, supabasePublic } from "@/lib/supabase";
import { ok, bad, serverError } from "@/lib/api/responses";

const map = (r: any) => ({ id: r.id, type: r.type, points: r.points, description: r.description, createdAt: r.created_at });

// GET /api/rewards - current user's reward transactions + balance (point). Query ?id=... for admin.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const pub = supabasePublic();
  const { data: { user } } = await pub.auth.getUser();
  const customer = sp.get("id") ?? user?.id;
  if (!customer) return ok({ balance: 0, transactions: [] });
  const client = supabaseServer();
  const { data: tx, error } = await client.from("reward_transactions").select("*").eq("customer_id", customer).order("created_at", { ascending: false });
  if (error) return serverError(error.message);
  const { data: profile } = await client.from("profiles").select("points").eq("id", customer).maybeSingle();
  const balance = profile?.points ?? (tx ?? []).reduce((s: number, t: any) => s + t.points, 0);
  return ok({ balance, transactions: (tx ?? []).map(map) });
}

// POST -- admin adjusts points. { id, delta, description }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as any;
  if (!body.id || typeof body.delta !== "number") return bad("id and delta (number) are required");
  const pub = supabasePublic();
  const { data: { user } } = await pub.auth.getUser();
  if (!user) return bad("Sign in", 401);
  const client = supabaseServer();
  // verify caller is admin
  const { data: profile } = await client.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return bad("Admin role required", 403);

  await client.from("reward_transactions").insert({ customer_id: body.id, type: body.delta > 0 ? "earn" : "redeem", points: body.delta, description: body.description ?? "Manual adjustment" });
  const { data: cur } = await client.from("profiles").select("points").eq("id", body.id).maybeSingle();
  if (cur) await client.from("profiles").update({ points: Math.max(0, (cur.points ?? 0) + body.delta) }).eq("id", body.id);
  return ok({ id: body.id, delta: body.delta });
}
