import { NextRequest } from "next/server";
import { supabaseServer, supabasePublic } from "@/lib/supabase";
import { ok, bad, serverError, pagination } from "@/lib/api/responses";

// GET /api/orders - list orders. Authed users see their own (admin sees all when ?all=1).
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const client = supabaseServer(); // already authed via RLS-safe equivalent
  const { data: { user } } = await supabasePublic().auth.getUser();
  const isCounted = sp.get("all") === "1";

  let q = client.from("orders").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (!isCounted && user) q = q.eq("customer_id", user.id);
  if (sp.get("status")) q = q.eq("status", sp.get("status"));
  const { page, pageSize, from, to } = pagination(sp);
  const { data, count, error } = await q.range(from, to);
  if (error) return serverError(error.message);

  // attach items
  const ids = (data ?? []).map((o: any) => o.id);
  let items: any[] = [];
  if (ids.length) {
    const { data: it } = await client.from("order_items").select("*").in("order_id", ids);
    items = it ?? [];
  }
  const withItems = (data ?? []).map((o: any) => ({ ...o, items: items.filter((i) => i.order_id === o.id) }));
  return ok({ data: withItems, page, pageSize, total: count ?? 0 });
}

// POST /api/orders - create an order (anonymous ok, used by checkout).
export async function POST(req: NextRequest) {
  const client = supabaseServer();
  const body = await req.json().catch(() => ({})) as any;
  if (!Array.isArray(body.items) || body.items.length === 0) return bad("items is required");

  // resolve customer if a session exists via anon public client
  const pub = supabasePublic();
  const { data: { user } } = await pub.auth.getUser();

  // validate prices server-side from each product's price
  let subtotal = 0;
  const resolved = [];
  for (const it of body.items) {
    if (!it.productId || !it.quantity) return bad("each item needs productId and quantity");
    const { data: prod } = await client.from("products").select("id,name,slug,images,price,sale_price").eq("id", it.productId).maybeSingle();
    if (!prod) return bad(`Product ${it.productId} not found`);
    const unit = prod.sale_price ?? prod.price;
    subtotal += Number(unit) * it.quantity;
    resolved.push({ product_id: prod.id, name: prod.name, slug: prod.slug, image: prod.images?.[0] ?? null, color: it.color, size: it.size, quantity: it.quantity, price: unit });
  }
  const shipping = Number(body.shipping ?? (subtotal > 75 ? 0 : 9));
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;
  const number = "ATL-" + Math.random().toString(36).slice(2, 10).toUpperCase();

  // decrement stock (server-side, admin role bypasses RLS on writes)
  for (const it of resolved) {
    const { data: colorRow } = await client.from("product_colors").select("id").eq("product_id", it.product_id).eq("color", it.color).maybeSingle();
    if (colorRow) {
      const { data: sizeRow } = await client.from("product_sizes").select("id,stock").eq("product_color_id", colorRow.id).eq("size", it.size).maybeSingle();
      if (sizeRow) await client.from("product_sizes").update({ stock: Math.max(0, sizeRow.stock - it.quantity) }).eq("id", sizeRow.id);
    }
  }

  const { data: order, error } = await client.from("orders").insert({
    number, customer_id: user?.id ?? null, status: "pending",
    subtotal, shipping, tax, total,
    payment_method: body.paymentMethod ?? "Card",
    shipping_address: body.shippingAddress ?? null,
  }).select("id,number").single();
  if (error) return bad(error.message);

  await client.from("order_items").insert(resolved.map((r) => ({ order_id: order.id, ...r })));

  // award reward points if logged in
  if (user) {
    const pts = Math.floor(total);
    await client.from("reward_transactions").insert({ customer_id: user.id, type: "earn", points: pts, description: `Order ${number}` });
    const { data: cur } = await client.from("profiles").select("points").eq("id", user.id).maybeSingle();
    if (cur) await client.from("profiles").update({ points: (cur.points ?? 0) + pts }).eq("id", user.id);
  }

  return ok({ id: order.id, number, subtotal, shipping, tax, total });
}
