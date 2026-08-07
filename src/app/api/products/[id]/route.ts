import { NextRequest } from "next/server";
import { supabasePublic, supabaseServer } from "@/lib/supabase";
import { ok, notFound, bad, serverError } from "@/lib/api/responses";

const FIELDS = "id,name,slug,description,materials,care,shipping,returns,price,sale_price,material,rating,review_count,sku,barcode,cost,is_new,is_trending,is_on_sale,is_featured,images,tags,created_at,brand:brands(name,slug),category:categories(name,slug)";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const client = supabasePublic();
  // If the param looks like a UUID, look it up by id; otherwise go straight
  // to the slug lookup (eq on a uuid column with a non-uuid value errors in pg).
  if (UUID_RE.test(id)) {
    const { data, error } = await client.from("products").select(FIELDS).eq("id", id).maybeSingle();
    if (error) return serverError(error.message);
    if (data) return ok(await hydrate(client, data));
  }
  const { data: bySlug, error: slugErr } = await client.from("products").select(FIELDS).eq("slug", id).maybeSingle();
  if (slugErr) return serverError(slugErr.message);
  if (!bySlug) return notFound("Product not found");
  return ok(await hydrate(client, bySlug));
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const client = supabaseServer();
  const body = await req.json().catch(() => ({})) as any;
  const patch: any = {};
  const map: Record<string, string> = {
    name: "name", slug: "slug", description: "description", materials: "materials", care: "care",
    shipping: "shipping", returns: "returns", price: "price", salePrice: "sale_price", material: "material",
    sku: "sku", barcode: "barcode", cost: "cost", images: "images", tags: "tags",
    isNew: "is_new", isTrending: "is_trending", isOnSale: "is_on_sale", isFeatured: "is_featured",
  };
  for (const [k, v] of Object.entries(body)) if (map[k]) patch[map[k]] = v;
  const { error } = await client.from("products").update(patch).eq("id", id);
  if (error) return bad(error.message);
  return ok({ id, updated: true });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const client = supabaseServer();
  const { error } = await client.from("products").delete().eq("id", id);
  if (error) return bad(error.message);
  return ok({ id, deleted: true });
}

async function hydrate(client: ReturnType<typeof supabasePublic>, p: any) {
  const { data: colors } = await client.from("product_colors").select("id,color,color_hex").eq("product_id", p.id);
  const colorIds = (colors ?? []).map((c) => c.id);
  const { data: sizes } = colorIds.length
    ? await client.from("product_sizes").select("product_color_id,size,stock").in("product_color_id", colorIds)
    : { data: [] };
  const sizesByColor: Record<string, any[]> = {};
  (sizes ?? []).forEach((s) => (sizesByColor[s.product_color_id] ??= []).push({ size: s.size, stock: s.stock }));
  const variants = (colors ?? []).map((c) => ({ color: c.color, colorHex: c.color_hex, sizes: sizesByColor[c.id] ?? [] }));
  const { data: reviews } = await client.from("reviews").select("id,author,rating,title,body,created_at,status").eq("product_id", p.id).eq("status", "published").order("created_at", { ascending: false });
  return {
    ...p,
    salePrice: p.sale_price ?? null,
    isNew: p.is_new, isTrending: p.is_trending, isOnSale: p.is_on_sale, isFeatured: p.is_featured,
    reviewCount: p.review_count,
    brand: p.brand?.slug ?? p.brand?.name ?? "",
    category: p.category?.slug ?? "",
    brandName: p.brand?.name ?? "",
    reviews: reviews ?? [],
    variants,
  };
}
