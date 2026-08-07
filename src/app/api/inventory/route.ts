import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { ok, bad, serverError } from "@/lib/api/responses";

export async function GET() {
  const client = supabaseServer();
  const { data: products, error } = await client.from("products").select("id,name,sku,images,cost,product_warehouses(warehouse_id),product_colors(id,product_sizes(stock))");
  if (error) return serverError(error.message);
  const lowThreshold = 30;
  const rows = (products ?? []).map((p: any) => {
    const total = (p.product_colors ?? []).reduce((s: number, c: any) => s + (c.product_sizes ?? []).reduce((a: number, x: any) => a + (x.stock ?? 0), 0), 0);
    return { id: p.id, name: p.name, sku: p.sku, image: p.images?.[0], cost: Number(p.cost ?? 0), totalStock: total, warehouses: p.product_warehouses ?? [] };
  });
  const totalValue = rows.reduce((s, r) => s + r.totalStock * r.cost, 0);
  return ok({
    skus: rows.length,
    inventoryValue: totalValue,
    lowStock: rows.filter((r) => r.totalStock > 0 && r.totalStock < lowThreshold),
    outOfStock: rows.filter((r) => r.totalStock === 0),
    products: rows,
  });
}

// POST creates an inventory adjustment. { productId, warehouseId, delta, reason }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as any;
  if (!body.productId || typeof body.delta !== "number") return bad("productId and delta are required");
  const client = supabaseServer();
  const { data, error } = await client.from("inventory_adjustments").insert({
    product_id: body.productId, warehouse_id: body.warehouseId ?? null, delta: body.delta, reason: body.reason ?? "",
  }).select().single();
  if (error) return bad(error.message);
  return ok(data);
}
