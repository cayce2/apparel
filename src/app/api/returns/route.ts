import { NextRequest } from "next/server";
import { supabaseServer, supabasePublic } from "@/lib/supabase";
import { ok, bad, serverError } from "@/lib/api/responses";

export async function GET() {
  const pub = supabasePublic();
  const { data: { user } } = await pub.auth.getUser();
  if (!user) return ok([]);
  const client = supabaseServer();
  const { data, error } = await client.from("return_requests").select("id,order_id,reason,status,created_at,order:orders(number)").eq("customer_id", user.id).order("created_at", { ascending: false });
  if (error) return serverError(error.message);
  return ok((data ?? []).map((r: any) => ({
    id: r.id, orderId: r.order_id, orderNumber: r.order?.number, reason: r.reason, status: r.status, createdAt: r.created_at,
  })));
}

export async function POST(req: NextRequest) {
  const pub = supabasePublic();
  const { data: { user } } = await pub.auth.getUser();
  if (!user) return bad("Sign in to start a return", 401);
  const body = await req.json().catch(() => ({})) as any;
  if (!body.orderId || !body.reason) return bad("orderId and reason are required");
  const { data, error } = await supabaseServer().from("return_requests").insert({
    order_id: body.orderId, customer_id: user.id, reason: body.reason, status: "requested",
  }).select().single();
  if (error) return bad(error.message);
  return ok({ ...data, createdAt: data.created_at });
}
