import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { ok, serverError } from "@/lib/api/responses";

// GET /api/admin/dashboard - aggregates KPIs for the admin home page.
export async function GET(req: NextRequest) {
  const client = supabaseServer();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const { data: allOrders } = await client.from("orders").select("id,total,status,created_at").order("created_at", { ascending: false });
  const orders = allOrders ?? [];
  const monthOrders = orders.filter((o: any) => new Date(o.created_at) >= monthStart);
  const prevMonthOrders = orders.filter((o: any) => new Date(o.created_at) >= prevMonthStart && new Date(o.created_at) < monthStart);
  const monthRevenue = monthOrders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);
  const prevMonthRevenue = prevMonthOrders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);
  const change = prevMonthRevenue ? Math.round((monthRevenue / prevMonthRevenue - 1) * 1000) / 10 : 0;

  const { data: prods } = await client.from("products").select("id,name,sku,images,cost,product_colors(id,product_sizes(stock))");
  const inventory = (prods ?? []).map((p: any) => {
    const total = (p.product_colors ?? []).reduce((s: number, c: any) => s + (c.product_sizes ?? []).reduce((a: number, x: any) => a + (x.stock ?? 0), 0), 0);
    return { id: p.id, name: p.name, sku: p.sku, image: p.images?.[0], totalStock: total };
  });

  const { data: top } = await client.from("order_items").select("product_id,name,quantity,price").limit(2000);
  const topMap: Record<string, { name: string; units: number; revenue: number }> = {};
  (top ?? []).forEach((i: any) => {
    const k = i.product_id ?? i.name;
    topMap[k] ??= { name: i.name, units: 0, revenue: 0 };
    topMap[k].units += Number(i.quantity);
    topMap[k].revenue += Number(i.quantity) * Number(i.price);
  });
  const topProducts = Object.entries(topMap).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // visitor figures are mock; in a real deployment these come from analytics.
  return ok({
    revenue: { today: Math.round(monthRevenue / 30), week: Math.round(monthRevenue / 4), month: monthRevenue, change },
    orders: { today: Math.ceil(monthOrders.length / 30), week: Math.ceil(monthOrders.length / 4), month: monthOrders.length, pending: orders.filter((o) => o.status === "pending").length },
    visitors: { today: 3120, week: 21840, month: 96400, prevMonth: 88200 },
    conversionRate: 2.74,
    topProducts,
    inventoryAlerts: inventory.filter((p) => p.totalStock < 30),
    recentOrders: orders.slice(0, 6),
  });
}
