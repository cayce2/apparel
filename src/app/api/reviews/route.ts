import { NextRequest } from "next/server";
import { supabaseServer, supabasePublic } from "@/lib/supabase";
import { ok, bad, serverError } from "@/lib/api/responses";

// GET /api/reviews?productId=...
// GET /api/reviews?mine=1     (authed — user's own reviews, any status)
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const client = supabasePublic();
  let q = client.from("reviews").select("id,product_id,author,rating,title,body,status,created_at,product:products(name)").order("created_at", { ascending: false });
  if (sp.get("productId")) q = q.eq("product_id", sp.get("productId"));
  const mine = sp.get("mine") === "1";
  if (mine) {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return ok([]);
    // mine uses service role to see pending ones too
    const srv = supabaseServer();
    const { data, error } = await srv.from("reviews").select("id,product_id,author,rating,title,body,status,created_at,product:products(name)").eq("customer_id", user.id).order("created_at", { ascending: false });
    if (error) return serverError(error.message);
    return ok((data ?? []).map(format));
  }
  if (!sp.get("productId")) q = q.eq("status", "published");
  const { data, error } = await q;
  if (error) return serverError(error.message);
  return ok((data ?? []).map(format));
}

export async function POST(req: NextRequest) {
  const pub = supabasePublic();
  const { data: { user } } = await pub.auth.getUser();
  const body = await req.json().catch(() => ({})) as any;
  if (!body.productId) return bad("productId is required");
  if (!body.rating || body.rating < 1 || body.rating > 5) return bad("rating 1-5 is required");
  const client = supabaseServer();
  const { data } = await client.from("profiles").select("full_name,email").eq("id", user?.id ?? "").maybeSingle();
  const author = body.author || data?.full_name || data?.email?.split("@")[0] || "Anonymous";
  const { data: review, error } = await client.from("reviews").insert({
    product_id: body.productId, customer_id: user?.id ?? null, author,
    rating: body.rating, title: body.title ?? "", body: body.body ?? "",
    status: "published",
  }).select().single();
  if (error) return bad(error.message);
  return ok(format(review));
}

const format = (r: any) => ({
  id: r.id, productId: r.product_id, author: r.author, rating: r.rating,
  title: r.title, body: r.body, status: r.status, createdAt: r.created_at,
  productName: r.product?.name,
});
