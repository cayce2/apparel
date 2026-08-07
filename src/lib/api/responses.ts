import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export const json = (body: unknown, status = 200) => NextResponse.json(body, { status });

export const ok = (body: unknown) => json(body);
export const created = (body: unknown) => json(body, 201);
export const bad = (msg: string, status = 400) => json({ error: msg }, status);
export const notFound = (msg = "Not found") => json({ error: msg }, 404);
export const serverError = (msg = "Internal server error") => json({ error: msg }, 500);

/** Resolve the authed user id from the Authorization header (Bearer token in the access JWT). */
export async function requireUser(supabase: SupabaseClient): Promise<{ id: string; email: string } | { error: NextResponse }> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { error: bad("Unauthorized", 401) };
  return { id: data.user.id, email: data.user.email ?? "" };
}

/** Same as requireUser but only allows admins (profiles.role = 'admin'). */
export async function requireAdmin(supabase: SupabaseClient): Promise<{ id: string; email: string } | { error: NextResponse }> {
  const user = await requireUser(supabase);
  if ("error" in user) return user;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (data?.role !== "admin") return { error: bad("Forbidden: admin role required", 403) };
  return user;
}

/** Try to parse JSON body; falls back to {} so callers can default. */
export async function parseBody<T = any>(req: Request): Promise<T> {
  try { return await req.json(); } catch { return {} as T; }
}

const pageOpts = (searchParams: URLSearchParams) => {
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "24")));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { page, pageSize, from, to };
};

export const pagination = pageOpts;
