import { NextRequest } from "next/server";
import { supabasePublic } from "@/lib/supabase";
import { ok, notFound, serverError } from "@/lib/api/responses";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const client = supabasePublic();
  const { data: collection, error } = await client.from("collections").select("*").eq("slug", slug).maybeSingle();
  if (error) return serverError(error.message);
  if (!collection) return notFound("Collection not found");

  const { data: links } = await client.from("product_collections").select("product_id").eq("collection_id", collection.id);
  const ids = (links ?? []).map((l) => l.product_id);
  if (ids.length === 0) return ok({ ...collection, products: [] });

  const { data: products } = await client.from("products")
    .select("id,name,slug,price,sale_price,images,is_new,is_on_sale,brand:brands(name)")
    .in("id", ids);
  return ok({
    ...collection,
    products: (products ?? []).map((p: any) => ({
      id: p.id, name: p.name, slug: p.slug, price: p.price, salePrice: p.sale_price,
      images: p.images, isNew: p.is_new, isOnSale: p.is_on_sale, brand: p.brand?.name,
    })),
  });
}
