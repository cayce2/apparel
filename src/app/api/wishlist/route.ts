import { NextRequest } from "next/server";
import { supabaseServer, supabasePublic } from "@/lib/supabase";
import { ok, bad, serverError } from "@/lib/api/responses";

export async function GET() {
  const pub = supabasePublic();
  const { data: { user } } = await pub.auth.getUser();
  if (!user) return ok([]);
  const client = supabaseServer();
  const { data: w } = await client.from("wishlist").select("product_id,product:products(id,name,slug,price,sale_price,images,brand:brands(name))").eq("customer_id", user.id);
  return ok((w ?? []).map((r: any) => ({
    productId: r.product_id,
    product: {
      id: r.product.id, name: r.product.name, slug: r.product.slug, price: r.product.price,
      salePrice: r.product.sale_price, image: r.product.images?.[0], brand: r.product.brand?.name,
    },
  })));
}

export async function POST(req: NextRequest) {
  const pub = supabasePublic();
  const { data: { user } } = await pub.auth.getUser();
  if (!user) return bad("Sign in", 401);
  const body = await req.json().catch(() => ({})) as any;
  if (!body.productId) return bad("productId is required");
  const client = supabaseServer();
  const { error } = await client.from("wishlist").upsert({ customer_id: user.id, product_id: body.productId }).eq("customer_id", user.id).eq("product_id", body.productId);
  if (error) return serverError(error.message);
  return ok({ productId: body.productId, added: true });
}
