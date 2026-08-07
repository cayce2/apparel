import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { ok, bad } from "@/lib/api/responses";

// PATCH /api/orders/[id]/status  { status: "processing" | ... }
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const client = supabaseServer();
  const body = await req.json().catch(() => ({})) as any;
  const valid = ["pending","processing","shipped","delivered","cancelled","refunded","returned"];
  if (!valid.includes(body.status)) return bad(`status must be one of ${valid.join(", ")}`);
  const patch: any = { status: body.status };
  if (body.tracking) patch.tracking = body.tracking;
  const { error } = await client.from("orders").update(patch).eq("id", id);
  if (error) return bad(error.message);
  return ok({ id, status: body.status });
}
