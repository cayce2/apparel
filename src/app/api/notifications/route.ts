import { NextRequest } from "next/server";
import { supabaseServer, supabasePublic } from "@/lib/supabase";
import { ok, bad, serverError } from "@/lib/api/responses";

const map = (n: any) => ({ id: n.id, type: n.type, title: n.title, body: n.body, read: n.read, createdAt: n.created_at });

export async function GET() {
  const pub = supabasePublic();
  const { data: { user } } = await pub.auth.getUser();
  if (!user) return ok([]);
  const client = supabaseServer();
  const { data, error } = await client.from("notifications").select("*").eq("customer_id", user.id).order("created_at", { ascending: false });
  if (error) return serverError(error.message);
  return ok((data ?? []).map(map));
}

// POST { readAll: true } marks all as read. { id } marks one.
export async function POST(req: NextRequest) {
  const pub = supabasePublic();
  const { data: { user } } = await pub.auth.getUser();
  if (!user) return bad("Sign in", 401);
  const body = await req.json().catch(() => ({})) as any;
  const client = supabaseServer();
  if (body.readAll) {
    const { error } = await client.from("notifications").update({ read: true }).eq("customer_id", user.id).eq("read", false);
    if (error) return bad(error.message);
    return ok({ readAll: true });
  }
  if (body.id) {
    const { data: cur } = await client.from("notifications").select("read").eq("id", body.id).eq("customer_id", user.id).maybeSingle();
    if (!cur) return bad("Notification not found", 404);
    const { error } = await client.from("notifications").update({ read: !cur.read }).eq("id", body.id).eq("customer_id", user.id);
    if (error) return bad(error.message);
    return ok({ id: body.id, read: !cur.read });
  }
  return bad("Provide id or readAll=true");
}
