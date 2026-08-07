import { NextRequest } from "next/server";
import { supabaseServer, supabasePublic } from "@/lib/supabase";
import { ok, bad } from "@/lib/api/responses";

export async function GET() {
  const { data } = await supabasePublic().from("categories").select("*").order("name");
  return ok(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as any;
  if (!body.name) return bad("name is required");
  const slug = body.slug ?? body.name.toLowerCase().replace(/\s+/g, "-");
  const { data, error } = await supabaseServer().from("categories").insert({ name: body.name, slug, parent_id: body.parentId ?? null }).select().single();
  if (error) return bad(error.message);
  return ok(data);
}
