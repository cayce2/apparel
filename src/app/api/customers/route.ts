import { supabaseServer } from "@/lib/supabase";
import { ok } from "@/lib/api/responses";

// GET /api/customers - list all customers (admin). Joins aggregated order stats inline.
export async function GET() {
  const client = supabaseServer();
  const { data: profiles } = await client.from("profiles")
    .select("id,email,full_name,marketing_consent,points,notes,created_at")
    .order("created_at", { ascending: false });

  const { data: orders } = await client.from("orders")
    .select("customer_id,total,status")
    .not("customer_id", "is", null);

  const stats: Record<string, { orders: number; spend: number }> = {};
  (orders ?? []).forEach((o: any) => {
    const k = o.customer_id as string;
    if (!k) return;
    stats[k] ??= { orders: 0, spend: 0 };
    stats[k].orders++;
    if (o.status !== "cancelled") stats[k].spend += Number(o.total);
  });

  return ok((profiles ?? []).map((p: any) => ({
    id: p.id,
    email: p.email,
    name: p.full_name ?? p.email,
    marketingConsent: p.marketing_consent,
    points: p.points ?? 0,
    notes: p.notes ?? "",
    joinedAt: p.created_at,
    orders: stats[p.id]?.orders ?? 0,
    spend: stats[p.id]?.spend ?? 0,
  })));
}
