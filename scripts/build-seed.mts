// Build supabase/seed.sql deterministically from src/data/products.ts.
// Run:  npx tsx scripts/build-seed.mts
import { writeFileSync } from "node:fs";

import { products } from "../src/data/products";

const NL = "\n";
function L(...lines) { return lines.join(NL); }

function sqlStr(s) { return "'" + s.replace(/'/g, "''") + "'"; }
function sqlArr(arr) { return "array[" + arr.map(sqlStr).join(",") + "]"; }

const catVar = { "shirts-and-tees": "c_shirts", sweaters: "c_sweaters", tracksuits: "c_tracks", polos: "c_polos", "long-sleeve": "c_long" };
const colVar = {
  "best-sellers": "col_best",
  "new-arrivals": "col_new",
  "shirts-and-tees": "col_shirts",
  "hoodies-and-sweaters": "col_hoodie",
  polos: "col_polos",
  "long-sleeve": "col_long",
};

let sku = 1000;
let barcode = 8410001000001;
function costFor(p) { return Math.round(p * 0.5 * 100) / 100; }
// Hand-tuned stocks for the first eight (Ascend) products, preserved verbatim
// from the original hand-written seed.sql so re-running the generator doesn't
// silently change the demo inventory for p1-p8.
const origStocks = {
  "relaxed-fit-checked-polo":            { Charcoal: { S:12, M:14, L:9,  XL:6 }, Cream: { S:7, M:8, L:10 } },
  "relaxed-fit-checkered-button-shirt":  { Black:   { S:9,  M:12, L:11, XL:6 }, Sand:  { M:8, L:7 } },
  "relaxed-fit-crew-neck-tee":           { White:   { S:10, M:14, L:11, XL:6 }, Black: { S:8, M:9,  L:7 } },
  "textured-knit-polo-shirt":            { Oatmeal: { S:9,  M:14, L:11, XL:7 }, Forest:{ M:10, L:8, XL:5 } },
  "relaxed-fit-linen-band-collar-shirt":  { Ivory:   { S:9,  M:12, L:11, XL:6 }, Sand:  { M:8, L:7 } },
  "relaxed-fit-camp-collar-shirt":       { Sky:     { S:10, M:14, L:11, XL:5 }, Black: { M:8, L:7, XL:4 } },
  "relaxed-fit-rib-knit-crewneck-sweater":{ Charcoal:{ S:9, M:14, L:11, XL:7 }, Cream: { M:10, L:8, XL:5 } },
  "fluent-fade-tracksuit":               { "Fade Grey": { S:9, M:12, L:11, XL:5 }, "Fade Black": { M:10, L:8, XL:5 } },
};
function stockFor(p, colorName, si) {
  const cs = origStocks[p.slug];
  if (cs && cs[colorName]) {
    const m = cs[colorName];
    // walk sizes in order so si indexes correctly
    const vals = Object.values(m);
    return vals[si];
  }
  const b = [9, 12, 14, 11, 8, 7, 10, 6];
  return b[(si) % b.length];
}
function warehouseFor(p, i) {
  const map = {
    "relaxed-fit-checked-polo": "w_reno",
    "relaxed-fit-checkered-button-shirt": "w_newark",
    "relaxed-fit-crew-neck-tee": "w_newark",
    "textured-knit-polo-shirt": "w_reno",
    "relaxed-fit-linen-band-collar-shirt": "w_newark",
    "relaxed-fit-camp-collar-shirt": "w_reno",
    "relaxed-fit-rib-knit-crewneck-sweater": "w_reno",
    "fluent-fade-tracksuit": "w_newark",
  };
  if (map[p.slug]) return map[p.slug];
  return i % 2 === 0 ? "w_newark" : "w_reno";
}

function productBlock(p, idx) {
  const i = idx; // 0-indexed product index in products[]
  const brand = p.brand === "Ascend" ? "b_ascend" : "b_antonios";
  const cat = catVar[p.category] || "c_shirts";
  const sale = p.salePrice === null || p.salePrice === undefined ? "null" : p.salePrice.toFixed(2);
  const out = [];
  out.push(`  -- p${i + 1} ${p.name}`);
  out.push(`  insert into public.products`);
  out.push(`    (name, slug, description, materials, care, shipping, returns, price, sale_price,`);
  out.push(`     brand_id, category_id, material, rating, review_count, sku, barcode, cost,`);
  out.push(`     is_new, is_trending, is_on_sale, is_featured, images, tags, created_at)`);
  out.push(`  values`);
  out.push(`    (${sqlStr(p.name)},${sqlStr(p.slug)},${sqlStr(p.description)},`);
  out.push(`     ${sqlStr(p.materials)},${sqlStr(p.care)},${sqlStr(p.shipping)},${sqlStr(p.returns)},`);
  out.push(`     ${p.price.toFixed(2)},${sale}, ${brand}, ${cat}, ${sqlStr(p.material)}, ${p.rating}, ${p.reviewCount}, ${sqlStr("ASC-" + (sku++))}, ${sqlStr(String(barcode++))}, ${costFor(p.price).toFixed(2)},`);
  out.push(`     ${p.isNew}, ${p.isTrending}, ${p.isOnSale}, ${p.isFeatured},`);
  out.push(`     ${sqlArr(p.images)},`);
  out.push(`     ${sqlArr(p.tags)}, ${sqlStr(p.createdAt)}::timestamptz)`);
  out.push(`  returning id into p;`);
  p.variants.forEach((v, vi) => {
    const hex = v.colorHex || "#888888";
    out.push(`  insert into public.product_colors (product_id, color, color_hex) values (p,${sqlStr(v.color)},'${hex}') returning id into pc;`);
    const sizes = v.sizes.map((s, si) => `(pc,${sqlStr(s.size)},${stockFor(p, v.color, si)})`).join(",");
    out.push(`  insert into public.product_sizes (product_color_id, size, stock) values ${sizes};`);
  });
  if (p.collections.length > 0) {
    const refs = p.collections.map((c) => colVar[c]).filter(Boolean).join("),(p, ");
    if (refs) out.push(`  insert into public.product_collections (product_id, collection_id) values (p, ${refs});`);
  }
  out.push(`  insert into public.product_warehouses (product_id, warehouse_id) values (p, ${warehouseFor(p, i)});`);
  // A couple of in-source reviews on specific products, matching the original seed.sql p1+p8 reviews.
  if (p.slug === "relaxed-fit-checked-polo") {
    out.push(`  insert into public.reviews (product_id, author, rating, title, body, status)`);
    out.push(`    values (p,'Jordan M.',5,'Great polo','Soft, drapes well, exactly what I wanted.','published');`);
  }
  if (p.slug === "fluent-fade-tracksuit") {
    out.push(`  insert into public.reviews (product_id, author, rating, title, body, status)`);
    out.push(`    values (p,'Alex P.',4,'Nice set','Fabric is light, fade looks better in person.','published');`);
  }
  return out.join(NL);
}

const header = L(
"-- =================================================================-----------",
"--  ATELIER — seed data. Run AFTER schema.sql in your Supabase SQL Editor.",
"--  Catalog mirrors src/data/products.ts (Ascend Apparel + Antonios), 26 products.",
"--  Regenerate with:  npx tsx scripts/build-seed.mts",
"-- =================================================================-----------",
"",
"-- Wipe the old demo catalog so slug-unique constraints don't conflict and",
"-- old products don't linger in the storefront.",
"delete from public.inventory_adjustments;",
"delete from public.product_warehouses;",
"delete from public.product_sizes;",
"delete from public.product_colors;",
"delete from public.product_collections;",
"delete from public.order_items;",
"delete from public.orders;",
"delete from public.reviews;",
"delete from public.flash_sales;",
"delete from public.bundles;",
"delete from public.products;",
"delete from public.brands;",
"delete from public.categories;",
"delete from public.collections;",
"delete from public.warehouses;",
"delete from public.coupons;",
"delete from public.gift_cards;",
"delete from public.affiliates;",
"delete from public.email_campaigns;",
"",
"insert into public.brands (name, slug) values",
"  ('Ascend','ascend'),",
"  ('Antonios','antonios')",
"on conflict (slug) do nothing;",
"",
"insert into public.categories (name, slug) values",
"  ('Shirts & Tees','shirts-and-tees'),",
"  ('Hoodies & Sweatshirts','hoodies-and-sweatshirts'),",
"  ('Sweaters','sweaters'),",
"  ('Tracksuits','tracksuits'),",
"  ('Long Sleeve','long-sleeve'),",
"  ('Jerseys','jerseys'),",
"  ('Polos','polos'),",
"  ('Best Sellers','best-sellers'),",
"  ('New Arrivals','new-arrivals')",
"on conflict (slug) do nothing;",
"",
"insert into public.collections (name, slug) values",
"  ('Best Sellers','best-sellers'),",
"  ('New Arrivals','new-arrivals'),",
"  ('Shirts & Tees','shirts-and-tees'),",
"  ('Hoodies & Sweaters','hoodies-and-sweaters'),",
"  ('Polos','polos'),",
"  ('Long Sleeve','long-sleeve')",
"on conflict (slug) do nothing;",
"",
"insert into public.warehouses (name, location) values",
"  ('Newark DC','Newark, NJ'),",
"  ('Reno DC','Reno, NV')",
"on conflict do nothing;",
"",
);

const doHeader = L(
"-- helper to create a product with colors/sizes in one go",
"do $$",
"declare",
"  b_ascend uuid; b_antonios uuid;",
"  c_shirts uuid; c_sweaters uuid; c_tracks uuid; c_polos uuid; c_long uuid;",
"  col_best uuid; col_new uuid; col_shirts uuid; col_hoodie uuid; col_polos uuid; col_long uuid;",
"  w_newark uuid; w_reno uuid;",
"  p uuid;",
"  pc uuid;",
"begin",
"  select id into b_ascend   from public.brands where slug='ascend';",
"  select id into b_antonios  from public.brands where slug='antonios';",
"  select id into c_shirts    from public.categories where slug='shirts-and-tees';",
"  select id into c_sweaters  from public.categories where slug='sweaters';",
"  select id into c_tracks    from public.categories where slug='tracksuits';",
"  select id into c_polos     from public.categories where slug='polos';",
"  select id into c_long      from public.categories where slug='long-sleeve';",
"  select id into col_best    from public.collections where slug='best-sellers';",
"  select id into col_new     from public.collections where slug='new-arrivals';",
"  select id into col_shirts  from public.collections where slug='shirts-and-tees';",
"  select id into col_hoodie  from public.collections where slug='hoodies-and-sweaters';",
"  select id into col_polos   from public.collections where slug='polos';",
"  select id into col_long    from public.collections where slug='long-sleeve';",
"  select id into w_newark    from public.warehouses where name='Newark DC';",
"  select id into w_reno      from public.warehouses where name='Reno DC';",
"",
);

// Note: orders, marketing and footer are preserved verbatim from the original
// seed.sql so behaviour stays identical.
const trailing = L(
"end $$;",
"",
"-- sample orders + items (customer_id null = guest demo)",
"do $$",
"declare",
"  o uuid;",
"  p_polo uuid; p_tracks uuid; p_tee uuid;",
"begin",
"  select id into p_polo   from public.products where slug='relaxed-fit-checked-polo';",
"  select id into p_tracks from public.products where slug='fluent-fade-tracksuit';",
"  select id into p_tee    from public.products where slug='relaxed-fit-crew-neck-tee';",
"",
"  insert into public.orders (number, status, subtotal, shipping, tax, total, payment_method, tracking, shipping_address, created_at)",
"  values ('ASC-7QX2K9FP','delivered',41.00,0,3.28,44.28,'Visa .... 4242','1Z999AA10123456784',",
"          jsonb_build_object('name','Avery Lee','line1','123 Maple St','city','Brooklyn','state','NY','zip','11201','country','USA'),",
"          now() - interval '16 days')",
"  returning id into o;",
"  insert into public.order_items (order_id, product_id, name, slug, image, color, size, quantity, price)",
"  values (o, p_polo, 'Relaxed Fit Checked Polo','relaxed-fit-checked-polo',",
"          'https://ascendapparel.us/cdn/shop/files/e348b516278496b26f2b2f9a3f2bced2.png?v=1783824119&width=900',",
"          'Charcoal','M',1,41.00);",
"",
"  insert into public.orders (number, status, subtotal, shipping, tax, total, payment_method, tracking, shipping_address, created_at)",
"  values ('ASC-3LKD8842','shipped',95.00,0,7.60,102.60,'Mastercard .... 5111','1Z999AA10198765432',",
"          jsonb_build_object('name','Sam Rivera','line1','88 Birch Ave','city','Austin','state','TX','zip','78704','country','USA'),",
"          now() - interval '30 days')",
"  returning id into o;",
"  insert into public.order_items (order_id, product_id, name, slug, image, color, size, quantity, price)",
"  values (o, p_tracks, 'Fluent Fade Tracksuit','fluent-fade-tracksuit',",
"          'https://ascendapparel.us/cdn/shop/files/2_e43d0327-a2d3-434e-a84d-a52de159e4d9.webp?v=1781321353&width=900',",
"          'Fade Grey','L',1,74.00),",
"         (o, p_tee, 'Relaxed Fit Crew Neck Tee','relaxed-fit-crew-neck-tee',",
"          'https://ascendapparel.us/cdn/shop/files/32fd7f8f-e5af-4abb-b8b3-d81b76ed496f.jpg?v=1783833754&width=900',",
"          'White','M',1,21.00);",
"",
"  insert into public.orders (number, status, subtotal, shipping, tax, total, payment_method, shipping_address, created_at)",
"  values ('ASC-9PPO2210','processing',41.00,0,3.28,44.28,'Visa .... 4242',",
"          jsonb_build_object('name','Jordan Kim','line1','404 Cedar St','city','Seattle','state','WA','zip','98101','country','USA'),",
"          now() - interval '4 days')",
"  returning id into o;",
"  insert into public.order_items (order_id, product_id, name, slug, image, color, size, quantity, price)",
"  values (o, p_polo, 'Relaxed Fit Checked Polo','relaxed-fit-checked-polo',",
"          'https://ascendapparel.us/cdn/shop/files/e348b516278496b26f2b2f9a3f2bced2.png?v=1783824119&width=900',",
"          'Cream','L',1,41.00);",
"",
"  insert into public.orders (number, status, subtotal, shipping, tax, total, payment_method, shipping_address, created_at)",
"  values ('ASC-2BNM0015','cancelled',50.00,9.00,4.00,63.00,'Visa .... 4242',",
"          jsonb_build_object('name','Riley Chen','line1','11 Elm Ct','city','Denver','state','CO','zip','80205','country','USA'),",
"          now() - interval '60 days')",
"  returning id into o;",
"  insert into public.order_items (order_id, product_id, name, slug, image, color, size, quantity, price)",
"  values (o, p_tee, 'Relaxed Fit Crew Neck Tee','relaxed-fit-crew-neck-tee',",
"          'https://ascendapparel.us/cdn/shop/files/32fd7f8f-e5af-4abb-b8b3-d81b76ed496f.jpg?v=1783833754&width=900',",
"          'White','L',2,25.00);",
"end $$;",
"",
"-- marketing seed",
"insert into public.coupons (code, type, value, uses, max_uses, expires_at, active) values",
"  ('WELCOME10','percent',10,142,1000,'2026-12-31'::timestamptz,true),",
"  ('SUMMER15','percent',15,88,500,'2026-08-31'::timestamptz,true),",
"  ('FREESHIP','shipping',0,320,0,'2026-12-31'::timestamptz,true),",
"  ('FLASH25','fixed',25,18,100,'2026-07-31'::timestamptz,false)",
"on conflict (code) do nothing;",
"",
"insert into public.flash_sales (name, product_id, start_at, end_at, discount, active)",
"  select 'Mid-season polo markdown', p.id, now() - interval '3 days', now() + interval '2 days', 22, true",
"  from public.products p where p.slug='relaxed-fit-checked-polo'",
"on conflict do nothing;",
"",
"insert into public.flash_sales (name, product_id, start_at, end_at, discount, active)",
"  select 'Tracksuit weekend drop', p.id, now() - interval '1 day', now() + interval '2 days', 18, false",
"  from public.products p where p.slug='fluent-fade-tracksuit'",
"on conflict do nothing;",
"",
"insert into public.bundles (name, price, active, product_ids)",
"  select 'Tee + Polo starter', 49.00, true,",
"         array(select id from public.products p where p.slug in ('relaxed-fit-checked-polo','relaxed-fit-crew-neck-tee'))",
"  where not exists (select 1 from public.bundles where name='Tee + Polo starter');",
"",
"insert into public.gift_cards (code, balance, initial, status) values",
"  ('GIFT-AB12CD',75.00,100.00,'active'),",
"  ('GIFT-XY99ZW',0.00,50.00,'redeemed')",
"on conflict (code) do nothing;",
"",
"insert into public.affiliates (name, email, clicks, conversions, earnings) values",
"  ('Style Blogger Co.','team@styleblogger.co',1840,96,840),",
"  ('Marcus T.','marcus@example.com',420,14,112)",
"on conflict do nothing;",
"",
"insert into public.email_campaigns (name, sent, opens, clicks, revenue) values",
"  ('New arrivals launch',8400,4200,1050,18400),",
"  ('Cart abandon winback',1240,620,240,5600)",
"on conflict do nothing;",
"",
"insert into public.inventory_adjustments (product_id, warehouse_id, delta, reason)",
"  select p.id, w.id, -2, 'Damaged in transit'",
"  from public.products p, public.warehouses w",
"  where p.slug='relaxed-fit-crew-neck-tee' and w.name='Newark DC'",
"    and not exists (select 1 from public.inventory_adjustments where reason='Damaged in transit');",
"",
"insert into public.inventory_adjustments (product_id, warehouse_id, delta, reason)",
"  select p.id, w.id, 24, 'Restock PO-2201'",
"  from public.products p, public.warehouses w",
"  where p.slug='relaxed-fit-checked-polo' and w.name='Reno DC'",
"    and not exists (select 1 from public.inventory_adjustments where reason='Restock PO-2201');",
"",
"-- ============================================================================",
"--  ADMIN USER PROMOTION",
"--  After you create an account via /auth/sign-up (or your Supabase dashboard),",
"--  promote yourself to admin by running:",
"--     update public.profiles set role='admin' where email='YOUR_EMAIL';",
"-- ============================================================================",
"",
);

const productBlocks = products.map((p, i) => productBlock(p, i)).join(NL + NL);

const full = L(header, doHeader, productBlocks, trailing) + NL;
writeFileSync("supabase/seed.sql", full, "utf8");
console.log("wrote supabase/seed.sql  (" + full.length + " bytes, " + (full.split("\n").length - 1) + " lines)");
