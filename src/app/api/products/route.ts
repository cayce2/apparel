import { NextRequest } from "next/server";
import { supabaseServer, supabasePublic } from "@/lib/supabase";
import { ok, bad, serverError, pagination } from "@/lib/api/responses";

const ALL = "id,name,slug,description,materials,care,shipping,returns,price,sale_price,material,rating,review_count,sku,barcode,cost,is_new,is_trending,is_on_sale,is_featured,images,tags,created_at,brand:brands(name,slug),category:categories(name,slug)";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const client = supabasePublic();
  let q = client.from("products").select(ALL, { count: "exact" });

  // filters
  if (sp.get("category")) {
    const { data: cat } = await client.from("categories").select("id").eq("slug", sp.get("category")).single();
    if (cat) q = q.eq("category_id", cat.id);
  }
  const filter = sp.get("filter");
  if (filter === "new") q = q.eq("is_new", true);
  if (filter === "sale") q = q.eq("is_on_sale", true);
  if (filter === "featured") q = q.eq("is_featured", true);
  if (sp.get("brand")) q = q.eq("brands.slug", sp.get("brand"));
  if (sp.get("q")) q = q.ilike("name", `%${sp.get("q")}%`);
  const min = Number(sp.get("minPrice") ?? 0); const max = Number(sp.get("maxPrice") ?? 100000);
  q = q.gte("sale_price", min).lte("sale_price", max);

  const sort = sp.get("sort") ?? "newest";
  switch (sort) {
    case "price-asc":    q = q.order("sale_price", { ascending: true }); break;
    case "price-desc":   q = q.order("sale_price", { ascending: false }); break;
    case "popular":      q = q.order("review_count", { ascending: false }); break;
    default:             q = q.order("created_at", { ascending: false });
  }

  const { page, pageSize, from, to } = pagination(sp);
  const { data, count, error } = await q.range(from, to);
  if (error) return serverError(error.message);
  const products = await hydrateVariants(client, data ?? []);

  return ok({ data: products, page, pageSize, total: count ?? 0 });
}

export async function POST(req: NextRequest) {
  const client = supabaseServer();
  const body = await req.json().catch(() => ({})) as any;
  if (!body.name) return bad("name is required");
  const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, "-");

  // resolve brand/category by slug if provided
  let brandId: string | undefined; let categoryId: string | undefined;
  if (body.brand) {
    const { data } = await client.from("brands").select("id").eq("slug", body.brand).maybeSingle();
    if (data) brandId = data.id; else { const { data: nb } = await client.from("brands").insert({ name: body.brand, slug: body.brand }).select("id").single(); if (nb) brandId = nb.id; }
  }
  if (body.category) {
    const { data } = await client.from("categories").select("id").eq("slug", body.category).maybeSingle();
    if (data) categoryId = data.id; else { const { data: nc } = await client.from("categories").insert({ name: body.category, slug: body.category }).select("id").single(); if (nc) categoryId = nc.id; }
  }

  const { data: product, error } = await client.from("products").insert({
    name: body.name, slug, description: body.description ?? "",
    materials: body.materials ?? materials(body.material), care: body.care ?? "", shipping: body.shipping ?? "", returns: body.returns ?? "",
    price: body.price ?? 0, sale_price: body.salePrice ?? null, brand_id: brandId ?? null, category_id: categoryId ?? null,
    material: body.material ?? "", sku: body.sku ?? "", barcode: body.barcode ?? "", cost: body.cost ?? 0,
    is_new: !!body.isNew, is_trending: !!body.isTrending, is_on_sale: !!body.isOnSale, is_featured: !!body.isFeatured,
    images: body.images ?? [], tags: body.tags ?? [],
  }).select("id").single();
  if (error) return bad(error.message);

  // variants + sizes
  if (Array.isArray(body.variants)) await writeVariants(client, product.id, body.variants);
  if (Array.isArray(body.warehouseIds)) await client.from("product_warehouses").insert(body.warehouseIds.map((wid: string) => ({ product_id: product.id, warehouse_id: wid })));
  if (Array.isArray(body.collectionSlugs)) {
    const { data: cols } = await client.from("collections").select("id,slug").in("slug", body.collectionSlugs);
    if (cols && cols.length) await client.from("product_collections").insert(cols.map((c) => ({ product_id: product.id, collection_id: c.id })));
  }
  return ok({ id: product.id, slug });
}

export async function PUT(req: NextRequest) {
  const client = supabaseServer();
  const body = await req.json().catch(() => ({})) as any;
  const id = body.id;
  if (!id) return bad("id is required");
  const slug = body.slug ? body.slug : body.name ? body.name.toLowerCase().replace(/\s+/g, "-") : undefined;
  const patch: any = {};
  ["name", "description", "materials", "care", "shipping", "returns", "price", "sale_price", "material", "sku", "barcode", "cost",
   "is_new", "is_trending", "is_on_sale", "is_featured", "images", "tags"].forEach((k) => { if (body[flatField(k)] !== undefined) patch[k] = body[flatField(k)]; });
  if (slug) patch.slug = slug;
  if (body.images) patch.images = body.images;
  if (body.tags) patch.tags = body.tags;
  const { error } = await client.from("products").update(patch).eq("id", id);
  if (error) return bad(error.message);
  if (Array.isArray(body.variants)) await writeVariants(client, id, body.variants, true);
  return ok({ id });
}

export async function DELETE(req: NextRequest) {
  const client = supabaseServer();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return bad("id is required");
  const { error } = await client.from("products").delete().eq("id", id);
  if (error) return bad(error.message);
  return ok({ id, deleted: true });
}

// ---- helpers ----------------------------------------------------------------
function flatField(k: string) {
  return ({ sale_price: "salePrice", is_new: "isNew", is_trending: "isTrending", is_on_sale: "isOnSale", is_featured: "isFeatured" } as any)[k] ?? k;
}
function materials(m?: string) { return m ?? ""; }

async function hydrateVariants(client: ReturnType<typeof supabasePublic>, products: any[]) {
  if (products.length === 0) return products;
  const ids = products.map((p) => p.id);
  const { data: colors } = await client.from("product_colors").select("id,product_id,color,color_hex").in("product_id", ids);
  const colorIds = (colors ?? []).map((c) => c.id);
  const { data: sizes } = colorIds.length
    ? await client.from("product_sizes").select("id,product_color_id,size,stock").in("product_color_id", colorIds)
    : { data: [] };
  const sizesByColor: Record<string, any[]> = {};
  (sizes ?? []).forEach((s) => { (sizesByColor[s.product_color_id] ??= []).push({ size: s.size, stock: s.stock }); });
  const colorsByProduct: Record<string, any[]> = {};
  (colors ?? []).forEach((c) => {
    (colorsByProduct[c.product_id] ??= []).push({
      color: c.color, colorHex: c.color_hex,
      sizes: sizesByColor[c.id] ?? [],
    });
  });
  return products.map((p) => {
    const { brand, category, ...rest } = p;
    return {
      ...rest,
      salePrice: p.sale_price ?? null,
      isNew: p.is_new, isTrending: p.is_trending, isOnSale: p.is_on_sale, isFeatured: p.is_featured,
      reviewCount: p.review_count,
      brand: brand?.name ?? "", category: category?.slug ?? "",
      variants: colorsByProduct[p.id] ?? [],
    };
  });
}

async function writeVariants(client: ReturnType<typeof supabaseServer>, productId: string, variants: any[], replace?: boolean) {
  if (replace) {
    // remove existing colors (cascade to sizes)
    const { data: existing } = await client.from("product_colors").select("id").eq("product_id", productId);
    if (existing && existing.length) {
      await client.from("product_sizes").delete().in("product_color_id", existing.map((c) => c.id));
      await client.from("product_colors").delete().eq("product_id", productId);
    }
  }
  for (const v of variants) {
    const { data: color } = await client.from("product_colors").insert({ product_id: productId, color: v.color, color_hex: v.colorHex ?? "#000000" }).select("id").single();
    if (!color || !Array.isArray(v.sizes)) continue;
    await client.from("product_sizes").insert(v.sizes.map((s: any) => ({ product_color_id: color.id, size: s.size, stock: s.stock ?? 0 })));
  }
}