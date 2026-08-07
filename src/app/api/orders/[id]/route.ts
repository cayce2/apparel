import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { ok, notFound, serverError } from "@/lib/api/responses";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const client = supabaseServer();
  // If the param looks like a UUID, look up by id; otherwise go straight to
  // the order number lookup (eq on a uuid column with a non-uuid value errors in pg).
  if (UUID_RE.test(id)) {
    const { data: order, error } = await client.from("orders").select("*").eq("id", id).maybeSingle();
    if (error) return serverError(error.message);
    if (order) return ok(await withItems(client, order));
  }
  const { data: byNumber, error: numErr } = await client.from("orders").select("*").eq("number", id).maybeSingle();
  if (numErr) return serverError(numErr.message);
  if (!byNumber) return notFound("Order not found");
  return ok(await withItems(client, byNumber));
}

async function withItems(client: ReturnType<typeof supabaseServer>, order: any) {
  const { data: items } = await client.from("order_items").select("*").eq("order_id", order.id);
  const { data: returns } = await client.from("return_requests").select("*").eq("order_id", order.id);
  return { ...order, items: items ?? [], returns: returns ?? [] };
}
