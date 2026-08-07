import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { ok, bad } from "@/lib/api/responses";

// POST { rows: Array<{ name?, sku?, price?, ... }> }
// Returns a summary of inserted/failed rows. Uses the service role (admin only).
export async function POST(req: NextRequest) {
  const client = supabaseServer();
  const body = await req.json().catch(() => ({})) as any;
  const rows: any[] = Array.isArray(body) ? body : Array.isArray(body.rows) ? body.rows : [];
  if (rows.length === 0) return bad("No rows supplied. Send { rows: [...] } or a JSON array.");

  let inserted = 0; let failed = 0; const errors: any[] = [];
  for (const r of rows) {
    if (!r.name) { failed++; errors.push({ row: r, error: "missing name" }); continue; }
    const slug = r.slug ?? r.name.toLowerCase().replace(/\s+/g, "-");
    const { error } = await client.from("products").insert({
      name: r.name, slug,
      description: r.description ?? "", materials: r.materials ?? r.material ?? "", care: r.care ?? "",
      shipping: r.shipping ?? "Free shipping over $75.", returns: r.returns ?? "30-day returns.",
      price: Number(r.price ?? 0), sale_price: r.sale_price ?? r.salePrice ?? null,
      material: r.material ?? "", sku: r.sku ?? "", barcode: r.barcode ?? "",
      cost: Number(r.cost ?? 0), images: r.images ?? [], tags: r.tags ?? [],
    });
    if (error) { failed++; errors.push({ row: r, error: error.message }); }
    else inserted++;
  }
  return ok({ inserted, failed, errors });
}

// GET — returns a CSV template (the columns our importer accepts).
export async function GET() {
  const csv = "name,sku,barcode,brand,category,price,salePrice,cost,material,totalStock\n";
  return new Response(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": 'attachment; filename="products-template.csv"' } });
}
