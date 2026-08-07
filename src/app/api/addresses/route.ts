import { NextRequest } from "next/server";
import { supabaseServer, supabasePublic } from "@/lib/supabase";
import { ok, bad, serverError } from "@/lib/api/responses";

export async function GET() {
  const pub = supabasePublic();
  const { data: { user } } = await pub.auth.getUser();
  if (!user) return ok([]); // guests have none
  const client = supabaseServer();
  const { data, error } = await client.from("addresses").select("*").eq("customer_id", user.id).order("created_at", { ascending: false });
  if (error) return serverError(error.message);
  return ok(data ?? []);
}

export async function POST(req: NextRequest) {
  const pub = supabasePublic();
  const { data: { user } } = await pub.auth.getUser();
  if (!user) return bad("Sign in to save an address", 401);
  const client = supabaseServer();
  const body = await req.json().catch(() => ({})) as any;
  const required = ["label", "full_name", "line1", "city", "state", "zip", "country"];
  for (const k of required) if (!body[k]) return bad(`${k} is required`);
  if (body.isDefault) await client.from("addresses").update({ is_default: false }).eq("customer_id", user.id);
  const row = {
    customer_id: user.id, label: body.label, full_name: body.full_name, line1: body.line1, line2: body.line2 ?? null,
    city: body.city, state: body.state, zip: body.zip, country: body.country, is_default: !!body.isDefault,
  };
  const { data, error } = await client.from("addresses").insert(row).select().single();
  if (error) return bad(error.message);
  return ok(data);
}

export async function PUT(req: NextRequest) {
  const pub = supabasePublic();
  const { data: { user } } = await pub.auth.getUser();
  if (!user) return bad("Sign in", 401);
  const client = supabaseServer();
  const body = await req.json().catch(() => ({})) as any;
  if (!body.id) return bad("id is required");
  if (body.isDefault) await client.from("addresses").update({ is_default: false }).eq("customer_id", user.id);
  const patch: any = {};
  ["label","full_name","line1","line2","city","state","zip","country","is_default"].forEach((k) => { if (body[camel(k)] !== undefined) patch[k] = body[camel(k)]; });
  Object.keys(patch).forEach((k) => { if (k === "is_default") patch[k] = !!patch[k]; });
  const { data, error } = await client.from("addresses").update(patch).eq("id", body.id).eq("customer_id", user.id).select().single();
  if (error) return bad(error.message);
  return ok(data);
}

function camel(k: string) { return k.replace(/_./g, (m) => m[1].toUpperCase()); }
