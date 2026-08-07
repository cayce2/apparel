import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { ok, bad } from "@/lib/api/responses";

// PATCH { notes: string }
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({})) as any;
  if (typeof body.notes !== "string") return bad("notes (string) is required");
  const { error } = await supabaseServer().from("profiles").update({ notes: body.notes }).eq("id", id);
  if (error) return bad(error.message);
  return ok({ id, notes: body.notes });
}
