import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { ok } from "@/lib/api/responses";

export async function GET(req: NextRequest) {
  const client = supabaseServer();
  const { data: orders } = await client.from("orders").select("id,total,status,created_at").order("created_at", { ascending: true });
  const all = orders ?? [];

  // bucket by month YYYY-MM
  const bucket = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const byMonth: Record<string, { revenue: number; orders: number; cost: number }> = {};
  for (const o of all) {
    const m = bucket(new Date(o.created_at));
    byMonth[m] ??= { revenue: 0, orders: 0, cost: 0 };
    if (o.status !== "cancelled") byMonth[m].revenue += Number(o.total);
    byMonth[m].orders++;
  }
  // estimate cost as 45% of revenue (demo until COGS ledger is wired)
  Object.values(byMonth).forEach((m) => (m.cost = Math.round(m.revenue * 0.45 * 100) / 100));

  // customers per month (signups)
  const { data: profiles } = await client.from("profiles").select("created_at");
  const custByMonth: Record<string, { new: number; returning: number }> = {};
  (profiles ?? []).forEach((p: any) => { const m = bucket(new Date(p.created_at)); custByMonth[m] ??= { new: 0, returning: 0 }; custByMonth[m].new++; });

  // traffic sources — demo (would come from analytics integration)
  const trafficSources = [
    { source: "Organic", visitors: 38400 }, { source: "Direct", visitors: 24800 },
    { source: "Social", visitors: 18200 }, { source: "Email", visitors: 12800 }, { source: "Paid", visitors: 6200 },
  ];

  // top products (admin view)
  const { data: items } = await client.from("order_items").select("product_id,name,quantity,price");
  const topMap: Record<string, { name: string; units: number; revenue: number }> = {};
  (items ?? []).forEach((i: any) => {
    const k = i.product_id ?? i.name;
    topMap[k] ??= { name: i.name, units: 0, revenue: 0 };
    topMap[k].units += Number(i.quantity);
    topMap[k].revenue += Number(i.quantity) * Number(i.price);
  });
  const topProducts = Object.entries(topMap).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  // inventory value
  const { data: prods } = await client.from("products").select("id,name,sku,cost,product_colors(id,product_sizes(stock))");
  const inventoryRows = (prods ?? []).map((p: any) => {
    const total = (p.product_colors ?? []).reduce((s: number, c: any) => s + (c.product_sizes ?? []).reduce((a: number, x: any) => a + (x.stock ?? 0), 0), 0);
    return { id: p.id, name: p.name, sku: p.sku, totalStock: total, cost: Number(p.cost ?? 0), value: total * Number(p.cost ?? 0) };
  });

  return ok({
    salesByMonth: Object.entries(byMonth).map(([month, v]) => ({ month, ...v, profit: Math.round((v.revenue - v.cost) * 100) / 100 })),
    customersByMonth: Object.entries(custByMonth).map(([month, v]) => ({ month, ...v })),
    trafficSources,
    topProducts,
    inventoryValue: inventoryRows.reduce((s, r) => s + r.value, 0),
    inventoryRows,
  });
}
