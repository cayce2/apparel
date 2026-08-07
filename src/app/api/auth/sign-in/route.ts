import { NextRequest } from "next/server";
import { supabasePublic } from "@/lib/supabase";
import { ok, bad } from "@/lib/api/responses";

export async function POST(req: NextRequest) {
  const client = supabasePublic();
  const body = await req.json().catch(() => ({})) as any;
  if (!body.email || !body.password) return bad("email and password are required");
  const { data, error } = await client.auth.signInWithPassword({ email: body.email, password: body.password });
  if (error) return bad(error.message, 401);
  return ok({ user: data.user, session: data.session });
}
