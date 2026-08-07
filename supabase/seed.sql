-- ============================================================================
--  ATELIER — seed data. Run AFTER schema.sql in your Supabase SQL Editor.
--  Catalog mirrors src/data/products.ts (Ascend Apparel + Antonios), 26 products.
-- ============================================================================

-- Wipe the old demo catalog so slug-unique constraints don't conflict and
-- old products don't linger in the storefront.
delete from public.inventory_adjustments;
delete from public.product_warehouses;
delete from public.product_sizes;
delete from public.product_colors;
delete from public.product_collections;
delete from public.order_items;
delete from public.orders;
delete from public.reviews;
delete from public.flash_sales;
delete from public.bundles;
delete from public.products;
delete from public.brands;
delete from public.categories;
delete from public.collections;
delete from public.warehouses;
delete from public.coupons;
delete from public.gift_cards;
delete from public.affiliates;
delete from public.email_campaigns;

insert into public.brands (name, slug) values
  ('Ascend','ascend'),
  ('Antonios','antonios')
on conflict (slug) do nothing;

insert into public.categories (name, slug) values
  ('Shirts & Tees','shirts-and-tees'),
  ('Hoodies & Sweatshirts','hoodies-and-sweatshirts'),
  ('Sweaters','sweaters'),
  ('Tracksuits','tracksuits'),
  ('Long Sleeve','long-sleeve'),
  ('Jerseys','jerseys'),
  ('Polos','polos'),
  ('Best Sellers','best-sellers'),
  ('New Arrivals','new-arrivals')
on conflict (slug) do nothing;

insert into public.collections (name, slug) values
  ('Best Sellers','best-sellers'),
  ('New Arrivals','new-arrivals'),
  ('Shirts & Tees','shirts-and-tees'),
  ('Hoodies & Sweaters','hoodies-and-sweaters'),
  ('Polos','polos'),
  ('Long Sleeve','long-sleeve')
on conflict (slug) do nothing;

insert into public.warehouses (name, location) values
  ('Newark DC','Newark, NJ'),
  ('Reno DC','Reno, NV')
on conflict do nothing;

-- helper to create a product with colors/sizes in one go
do $$
declare
  b_ascend uuid; b_antonios uuid;
  c_shirts uuid; c_sweaters uuid; c_tracks uuid; c_polos uuid; c_long uuid;
  col_best uuid; col_new uuid; col_shirts uuid; col_hoodie uuid; col_polos uuid; col_long uuid;
  w_newark uuid; w_reno uuid;
  p uuid;
  pc uuid;
begin
  select id into b_ascend   from public.brands where slug='ascend';
  select id into b_antonios  from public.brands where slug='antonios';
  select id into c_shirts    from public.categories where slug='shirts-and-tees';
  select id into c_sweaters  from public.categories where slug='sweaters';
  select id into c_tracks    from public.categories where slug='tracksuits';
  select id into c_polos     from public.categories where slug='polos';
  select id into c_long      from public.categories where slug='long-sleeve';
  select id into col_best    from public.collections where slug='best-sellers';
  select id into col_new     from public.collections where slug='new-arrivals';
  select id into col_shirts  from public.collections where slug='shirts-and-tees';
  select id into col_hoodie  from public.collections where slug='hoodies-and-sweaters';
  select id into col_polos   from public.collections where slug='polos';
  select id into col_long    from public.collections where slug='long-sleeve';
  select id into w_newark    from public.warehouses where name='Newark DC';
  select id into w_reno      from public.warehouses where name='Reno DC';

  -- p1 Relaxed Fit Checked Polo
  insert into public.products
    (name, slug, description, materials, care, shipping, returns, price, sale_price,
     brand_id, category_id, material, rating, review_count, sku, barcode, cost,
     is_new, is_trending, is_on_sale, is_featured, images, tags, created_at)
  values
    ('Relaxed Fit Checked Polo','relaxed-fit-checked-polo',
     'A relaxed-fit checked polo in soft pique cotton. Easy to layer or wear on its own with a laid-back drape.',
     '100% cotton pique','Machine wash cold. Tumble dry low.',
     'Free shipping on orders over $50. Ships in 1-2 business days.','30-day free returns. Items must be unworn with tags attached.',
     29.00, 41.00, b_ascend, c_shirts, 'Cotton', 4.7, 128, 'ASC-1000', '8410001000001', 14.50,
     false, true, true, true,
     array['https://ascendapparel.us/cdn/shop/files/e348b516278496b26f2b2f9a3f2bced2.png?v=1783824119&width=900',
           'https://ascendapparel.us/cdn/shop/files/3c94c74d-18b4-4f24-a840-1d3e668fd29d_92e8b4d5-d948-405d-a36f-6533af16d2c3.png?v=1783834580&width=900'],
     array['polo','checked','relaxed'], now() - interval '40 days')
  returning id into p;
  insert into public.product_colors (product_id, color, color_hex) values (p,'Charcoal','#3b3b3b') returning id into pc;
  insert into public.product_sizes (product_color_id, size, stock) values (pc,'S',12),(pc,'M',14),(pc,'L',9),(pc,'XL',6);
  insert into public.product_colors (product_id, color, color_hex) values (p,'Cream','#e8e1d4') returning id into pc;
  insert into public.product_sizes (product_color_id, size, stock) values (pc,'S',7),(pc,'M',8),(pc,'L',10);
  insert into public.product_collections (product_id, collection_id) values (p, col_best),(p, col_shirts);
  insert into public.product_warehouses (product_id, warehouse_id) values (p, w_reno);
  insert into public.reviews (product_id, author, rating, title, body, status)
    values (p,'Jordan M.',5,'Great polo','Soft, drapes well, exactly what I wanted.','published');

  -- p2 Relaxed Fit Checkered Button Shirt
  insert into public.products
    (name, slug, description, materials, care, shipping, returns, price, sale_price,
     brand_id, category_id, material, rating, review_count, sku, barcode, cost,
     is_new, is_trending, is_on_sale, is_featured, images, tags, created_at)
  values
    ('Relaxed Fit Checkered Button Shirt','relaxed-fit-checkered-button-shirt',
     'An easygoing checkered button-up with a relaxed cut and soft hand feel. A summer staple that layers over a tee just as well.',
     '100% cotton','Machine wash cold. Hang dry.',
     'Free shipping on orders over $50. Ships in 1-2 business days.','30-day free returns. Items must be unworn with tags attached.',
     33.00, 46.00, b_ascend, c_shirts, 'Cotton', 4.6, 86, 'ASC-1001', '8410001000002', 16.50,
     true, true, true, true,
     array['https://ascendapparel.us/cdn/shop/files/c6b13476-ebbe-4686-a37b-43cdf5df4956.jpg?v=1783834370&width=900',
           'https://ascendapparel.us/cdn/shop/files/58824880-3164-4771-affe-a6c88e17bed6.jpg?v=1783834394&width=900'],
     array['shirt','checkered','relaxed'], now() - interval '20 days')
  returning id into p;
  insert into public.product_colors (product_id, color, color_hex) values (p,'Black','#1a1a1a') returning id into pc;
  insert into public.product_sizes (product_color_id, size, stock) values (pc,'S',9),(pc,'M',12),(pc,'L',11),(pc,'XL',6);
  insert into public.product_colors (product_id, color, color_hex) values (p,'Sand','#d9c5a0') returning id into pc;
  insert into public.product_sizes (product_color_id, size, stock) values (pc,'M',8),(pc,'L',7);
  insert into public.product_collections (product_id, collection_id) values (p, col_shirts);
  insert into public.product_warehouses (product_id, warehouse_id) values (p, w_newark);

  -- p3 Relaxed Fit Crew Neck Tee
  insert into public.products
    (name, slug, description, materials, care, shipping, returns, price, sale_price,
     brand_id, category_id, material, rating, review_count, sku, barcode, cost,
     is_new, is_trending, is_on_sale, is_featured, images, tags, created_at)
  values
    ('Relaxed Fit Crew Neck Tee','relaxed-fit-crew-neck-tee',
     'A heavyweight crew neck tee cut for a relaxed fit. Pre-washed for an instant lived-in feel.',
     '100% heavyweight cotton','Machine wash cold. Tumble dry low.',
     'Free shipping on orders over $50. Ships in 1-2 business days.','30-day free returns. Items must be unworn with tags attached.',
     25.00, 38.00, b_ascend, c_shirts, 'Cotton', 4.5, 174, 'ASC-1002', '8410001000003', 12.50,
     false, true, true, true,
     array['https://ascendapparel.us/cdn/shop/files/32fd7f8f-e5af-4abb-b8b3-d81b76ed496f.jpg?v=1783833754&width=900',
           'https://ascendapparel.us/cdn/shop/files/878a3db3-d2a1-4f94-984b-3d5e90d74749.jpg?v=1783833766&width=900'],
     array['tee','crew-neck'], now() - interval '30 days')
  returning id into p;
  insert into public.product_colors (product_id, color, color_hex) values (p,'White','#ffffff') returning id into pc;
  insert into public.product_sizes (product_color_id, size, stock) values (pc,'S',10),(pc,'M',14),(pc,'L',11),(pc,'XL',6);
  insert into public.product_colors (product_id, color, color_hex) values (p,'Black','#1a1a1a') returning id into pc;
  insert into public.product_sizes (product_color_id, size, stock) values (pc,'S',8),(pc,'M',9),(pc,'L',7);
  insert into public.product_collections (product_id, collection_id) values (p, col_best),(p, col_shirts);
  insert into public.product_warehouses (product_id, warehouse_id) values (p, w_newark);

  -- p4 Textured Knit Polo Shirt
  insert into public.products
    (name, slug, description, materials, care, shipping, returns, price, sale_price,
     brand_id, category_id, material, rating, review_count, sku, barcode, cost,
     is_new, is_trending, is_on_sale, is_featured, images, tags, created_at)
  values
    ('Textured Knit Polo Shirt','textured-knit-polo-shirt',
     'A textured knit polo with a subtle weave and a soft, breathable feel. Easy to dress up or down.',
     'Cotton blend knit','Machine wash cold. Lay flat to dry.',
     'Free shipping on orders over $50. Ships in 1-2 business days.','30-day free returns. Items must be unworn with tags attached.',
     29.00, 41.00, b_ascend, c_shirts, 'Cotton', 4.7, 64, 'ASC-1003', '8410001000004', 14.50,
     true, true, true, true,
     array['https://ascendapparel.us/cdn/shop/files/c2155f91-3f8d-47ed-b295-df8c3f06da2c.png?v=1783833435&width=900',
           'https://ascendapparel.us/cdn/shop/files/eecd63d7-78bf-4fa5-86e8-e484fbd32bd2.png?v=1783833354&width=900'],
     array['polo','knit','textured'], now() - interval '10 days')
  returning id into p;
  insert into public.product_colors (product_id, color, color_hex) values (p,'Oatmeal','#d8c8a8') returning id into pc;
  insert into public.product_sizes (product_color_id, size, stock) values (pc,'S',9),(pc,'M',14),(pc,'L',11),(pc,'XL',7);
  insert into public.product_colors (product_id, color, color_hex) values (p,'Forest','#3c4a3e') returning id into pc;
  insert into public.product_sizes (product_color_id, size, stock) values (pc,'M',10),(pc,'L',8),(pc,'XL',5);
  insert into public.product_collections (product_id, collection_id) values (p, col_new),(p, col_shirts);
  insert into public.product_warehouses (product_id, warehouse_id) values (p, w_reno);

  -- p5 Relaxed Fit Linen Band Collar Shirt
  insert into public.products
    (name, slug, description, materials, care, shipping, returns, price, sale_price,
     brand_id, category_id, material, rating, review_count, sku, barcode, cost,
     is_new, is_trending, is_on_sale, is_featured, images, tags, created_at)
  values
    ('Relaxed Fit Linen Band Collar Shirt','relaxed-fit-linen-band-collar-shirt',
     'A breezy linen shirt with a band collar and relaxed cut. Made for warm days and warm evenings.',
     '100% linen','Machine wash cold. Iron while damp.',
     'Free shipping on orders over $50. Ships in 1-2 business days.','30-day free returns. Items must be unworn with tags attached.',
     29.00, 41.00, b_ascend, c_shirts, 'Linen', 4.6, 47, 'ASC-1004', '8410001000005', 14.50,
     true, false, true, true,
     array['https://ascendapparel.us/cdn/shop/files/ChatGPTImageJul4_2026_07_49_39PM.png?v=1783219785&width=900',
           'https://ascendapparel.us/cdn/shop/files/ChatGPTImageJul4_2026_07_49_43PM.png?v=1783219791&width=900'],
     array['linen','band-collar','relaxed'], now() - interval '7 days')
  returning id into p;
  insert into public.product_colors (product_id, color, color_hex) values (p,'Ivory','#f5f0e6') returning id into pc;
  insert into public.product_sizes (product_color_id, size, stock) values (pc,'S',9),(pc,'M',12),(pc,'L',11),(pc,'XL',6);
  insert into public.product_colors (product_id, color, color_hex) values (p,'Sand','#d9c5a0') returning id into pc;
  insert into public.product_sizes (product_color_id, size, stock) values (pc,'M',8),(pc,'L',7);
  insert into public.product_collections (product_id, collection_id) values (p, col_new);
  insert into public.product_warehouses (product_id, warehouse_id) values (p, w_newark);

  -- p6 Relaxed Fit Camp Collar Shirt
  insert into public.products
    (name, slug, description, materials, care, shipping, returns, price, sale_price,
     brand_id, category_id, material, rating, review_count, sku, barcode, cost,
     is_new, is_trending, is_on_sale, is_featured, images, tags, created_at)
  values
    ('Relaxed Fit Camp Collar Shirt','relaxed-fit-camp-collar-shirt',
     'A short-sleeve camp collar shirt with a relaxed cut. Summer weight and easy to wear open or buttoned.',
     '100% cotton','Machine wash cold. Hang dry.',
     'Free shipping on orders over $50. Ships in 1-2 business days.','30-day free returns. Items must be unworn with tags attached.',
     29.00, 41.00, b_ascend, c_shirts, 'Cotton', 4.5, 39, 'ASC-1005', '8410001000006', 14.50,
     true, false, true, true,
     array['https://ascendapparel.us/cdn/shop/files/63ad6ce6f9b314a418c18e299765206e_4604dbd7-fdaa-4f6c-ae75-23f429b2b427.png?v=1783218567&width=900',
           'https://ascendapparel.us/cdn/shop/files/84bf81bd-79d7-4c60-bcc0-aaa774500d2d.jpg?v=1783219198&width=900'],
     array['camp-collar','shirt','short-sleeve'], now() - interval '8 days')
  returning id into p;
  insert into public.product_colors (product_id, color, color_hex) values (p,'Sky','#9ec3d9') returning id into pc;
  insert into public.product_sizes (product_color_id, size, stock) values (pc,'S',10),(pc,'M',14),(pc,'L',11),(pc,'XL',5);
  insert into public.product_colors (product_id, color, color_hex) values (p,'Black','#1a1a1a') returning id into pc;
  insert into public.product_sizes (product_color_id, size, stock) values (pc,'M',8),(pc,'L',7),(pc,'XL',4);
  insert into public.product_collections (product_id, collection_id) values (p, col_new);
  insert into public.product_warehouses (product_id, warehouse_id) values (p, w_reno);

  -- p7 Relaxed Fit Rib Knit Crewneck Sweater
  insert into public.products
    (name, slug, description, materials, care, shipping, returns, price, sale_price,
     brand_id, category_id, material, rating, review_count, sku, barcode, cost,
     is_new, is_trending, is_on_sale, is_featured, images, tags, created_at)
  values
    ('Relaxed Fit Rib Knit Crewneck Sweater','relaxed-fit-rib-knit-crewneck-sweater',
     'A rib-knit crewneck sweater with a relaxed fit and a soft, stretchy hand. A layering essential for cooler days.',
     'Cotton blend knit','Machine wash cold. Lay flat to dry.',
     'Free shipping on orders over $50. Ships in 1-2 business days.','30-day free returns. Items must be unworn with tags attached.',
     29.00, 41.00, b_ascend, c_sweaters, 'Cotton', 4.7, 73, 'ASC-1006', '8410001000007', 14.50,
     false, true, true, true,
     array['https://ascendapparel.us/cdn/shop/files/8d411a3d-935d-4058-b791-2430a123a8d7.png?v=1783218131&width=900',
           'https://ascendapparel.us/cdn/shop/files/39cfefc4c86c975a782c9efbc3b76fea_6fb4d303-4edf-42bb-8cca-4bc2d1be44f7.png?v=1783217935&width=900'],
     array['sweater','rib-knit','crewneck'], now() - interval '5 days')
  returning id into p;
  insert into public.product_colors (product_id, color, color_hex) values (p,'Charcoal','#3b3b3b') returning id into pc;
  insert into public.product_sizes (product_color_id, size, stock) values (pc,'S',9),(pc,'M',14),(pc,'L',11),(pc,'XL',7);
  insert into public.product_colors (product_id, color, color_hex) values (p,'Cream','#e8e1d4') returning id into pc;
  insert into public.product_sizes (product_color_id, size, stock) values (pc,'M',10),(pc,'L',8),(pc,'XL',5);
  insert into public.product_collections (product_id, collection_id) values (p, col_hoodie);
  insert into public.product_warehouses (product_id, warehouse_id) values (p, w_reno);

  -- p8 Fluent Fade Tracksuit
  insert into public.products
    (name, slug, description, materials, care, shipping, returns, price, sale_price,
     brand_id, category_id, material, rating, review_count, sku, barcode, cost,
     is_new, is_trending, is_on_sale, is_featured, images, tags, created_at)
  values
    ('Fluent Fade Tracksuit','fluent-fade-tracksuit',
     'A matching two-piece tracksuit with a gradient fade. Lightweight, breathable, and ready to move.',
     'Polyester blend','Machine wash cold. Tumble dry low.',
     'Free shipping on orders over $50. Ships in 1-2 business days.','30-day free returns. Items must be unworn with tags attached.',
     57.00, 74.00, b_ascend, c_tracks, 'Polyester', 4.6, 41, 'ASC-1007', '8410001000008', 28.50,
     true, true, true, true,
     array['https://ascendapparel.us/cdn/shop/files/2_e43d0327-a2d3-434e-a84d-a52de159e4d9.webp?v=1781321353&width=900',
           'https://ascendapparel.us/cdn/shop/files/3_52bb4b12-32fc-4438-b5c0-2ca71028e652.webp?v=1781321354&width=900'],
     array['tracksuit','fade','two-piece'], now() - interval '3 days')
  returning id into p;
  insert into public.product_colors (product_id, color, color_hex) values (p,'Fade Grey','#9ca3af') returning id into pc;
  insert into public.product_sizes (product_color_id, size, stock) values (pc,'S',9),(pc,'M',12),(pc,'L',11),(pc,'XL',5);
  insert into public.product_colors (product_id, color, color_hex) values (p,'Fade Black','#3b3b3b') returning id into pc;
  insert into public.product_sizes (product_color_id, size, stock) values (pc,'M',10),(pc,'L',8),(pc,'XL',5);
  insert into public.product_collections (product_id, collection_id) values (p, col_new);
  insert into public.product_warehouses (product_id, warehouse_id) values (p, w_newark);
  insert into public.reviews (product_id, author, rating, title, body, status)
    values (p,'Alex P.',4,'Nice set','Fabric is light, fade looks better in person.','published');
end $$;

-- sample orders + items (customer_id null = guest demo)
do $$
declare
  o uuid;
  p_polo uuid; p_tracks uuid; p_tee uuid;
begin
  select id into p_polo   from public.products where slug='relaxed-fit-checked-polo';
  select id into p_tracks from public.products where slug='fluent-fade-tracksuit';
  select id into p_tee    from public.products where slug='relaxed-fit-crew-neck-tee';

  insert into public.orders (number, status, subtotal, shipping, tax, total, payment_method, tracking, shipping_address, created_at)
  values ('ASC-7QX2K9FP','delivered',41.00,0,3.28,44.28,'Visa .... 4242','1Z999AA10123456784',
          jsonb_build_object('name','Avery Lee','line1','123 Maple St','city','Brooklyn','state','NY','zip','11201','country','USA'),
          now() - interval '16 days')
  returning id into o;
  insert into public.order_items (order_id, product_id, name, slug, image, color, size, quantity, price)
  values (o, p_polo, 'Relaxed Fit Checked Polo','relaxed-fit-checked-polo',
          'https://ascendapparel.us/cdn/shop/files/e348b516278496b26f2b2f9a3f2bced2.png?v=1783824119&width=900',
          'Charcoal','M',1,41.00);

  insert into public.orders (number, status, subtotal, shipping, tax, total, payment_method, tracking, shipping_address, created_at)
  values ('ASC-3LKD8842','shipped',95.00,0,7.60,102.60,'Mastercard .... 5111','1Z999AA10198765432',
          jsonb_build_object('name','Sam Rivera','line1','88 Birch Ave','city','Austin','state','TX','zip','78704','country','USA'),
          now() - interval '30 days')
  returning id into o;
  insert into public.order_items (order_id, product_id, name, slug, image, color, size, quantity, price)
  values (o, p_tracks, 'Fluent Fade Tracksuit','fluent-fade-tracksuit',
          'https://ascendapparel.us/cdn/shop/files/2_e43d0327-a2d3-434e-a84d-a52de159e4d9.webp?v=1781321353&width=900',
          'Fade Grey','L',1,74.00),
         (o, p_tee, 'Relaxed Fit Crew Neck Tee','relaxed-fit-crew-neck-tee',
          'https://ascendapparel.us/cdn/shop/files/32fd7f8f-e5af-4abb-b8b3-d81b76ed496f.jpg?v=1783833754&width=900',
          'White','M',1,21.00);

  insert into public.orders (number, status, subtotal, shipping, tax, total, payment_method, shipping_address, created_at)
  values ('ASC-9PPO2210','processing',41.00,0,3.28,44.28,'Visa .... 4242',
          jsonb_build_object('name','Jordan Kim','line1','404 Cedar St','city','Seattle','state','WA','zip','98101','country','USA'),
          now() - interval '4 days')
  returning id into o;
  insert into public.order_items (order_id, product_id, name, slug, image, color, size, quantity, price)
  values (o, p_polo, 'Relaxed Fit Checked Polo','relaxed-fit-checked-polo',
          'https://ascendapparel.us/cdn/shop/files/e348b516278496b26f2b2f9a3f2bced2.png?v=1783824119&width=900',
          'Cream','L',1,41.00);

  insert into public.orders (number, status, subtotal, shipping, tax, total, payment_method, shipping_address, created_at)
  values ('ASC-2BNM0015','cancelled',50.00,9.00,4.00,63.00,'Visa .... 4242',
          jsonb_build_object('name','Riley Chen','line1','11 Elm Ct','city','Denver','state','CO','zip','80205','country','USA'),
          now() - interval '60 days')
  returning id into o;
  insert into public.order_items (order_id, product_id, name, slug, image, color, size, quantity, price)
  values (o, p_tee, 'Relaxed Fit Crew Neck Tee','relaxed-fit-crew-neck-tee',
          'https://ascendapparel.us/cdn/shop/files/32fd7f8f-e5af-4abb-b8b3-d81b76ed496f.jpg?v=1783833754&width=900',
          'White','L',2,25.00);
end $$;

-- marketing seed
insert into public.coupons (code, type, value, uses, max_uses, expires_at, active) values
  ('WELCOME10','percent',10,142,1000,'2026-12-31'::timestamptz,true),
  ('SUMMER15','percent',15,88,500,'2026-08-31'::timestamptz,true),
  ('FREESHIP','shipping',0,320,0,'2026-12-31'::timestamptz,true),
  ('FLASH25','fixed',25,18,100,'2026-07-31'::timestamptz,false)
on conflict (code) do nothing;

insert into public.flash_sales (name, product_id, start_at, end_at, discount, active)
  select 'Mid-season polo markdown', p.id, now() - interval '3 days', now() + interval '2 days', 22, true
  from public.products p where p.slug='relaxed-fit-checked-polo'
on conflict do nothing;

insert into public.flash_sales (name, product_id, start_at, end_at, discount, active)
  select 'Tracksuit weekend drop', p.id, now() - interval '1 day', now() + interval '2 days', 18, false
  from public.products p where p.slug='fluent-fade-tracksuit'
on conflict do nothing;

insert into public.bundles (name, price, active, product_ids)
  select 'Tee + Polo starter', 49.00, true,
         array(select id from public.products p where p.slug in ('relaxed-fit-checked-polo','relaxed-fit-crew-neck-tee'))
  where not exists (select 1 from public.bundles where name='Tee + Polo starter');

insert into public.gift_cards (code, balance, initial, status) values
  ('GIFT-AB12CD',75.00,100.00,'active'),
  ('GIFT-XY99ZW',0.00,50.00,'redeemed')
on conflict (code) do nothing;

insert into public.affiliates (name, email, clicks, conversions, earnings) values
  ('Style Blogger Co.','team@styleblogger.co',1840,96,840),
  ('Marcus T.','marcus@example.com',420,14,112)
on conflict do nothing;

insert into public.email_campaigns (name, sent, opens, clicks, revenue) values
  ('New arrivals launch',8400,4200,1050,18400),
  ('Cart abandon winback',1240,620,240,5600)
on conflict do nothing;

insert into public.inventory_adjustments (product_id, warehouse_id, delta, reason)
  select p.id, w.id, -2, 'Damaged in transit'
  from public.products p, public.warehouses w
  where p.slug='relaxed-fit-crew-neck-tee' and w.name='Newark DC'
    and not exists (select 1 from public.inventory_adjustments where reason='Damaged in transit');

insert into public.inventory_adjustments (product_id, warehouse_id, delta, reason)
  select p.id, w.id, 24, 'Restock PO-2201'
  from public.products p, public.warehouses w
  where p.slug='relaxed-fit-checked-polo' and w.name='Reno DC'
    and not exists (select 1 from public.inventory_adjustments where reason='Restock PO-2201');

-- ============================================================================
--  ADMIN USER PROMOTION
--  After you create an account via /auth/sign-up (or your Supabase dashboard),
--  promote yourself to admin by running:
--     update public.profiles set role='admin' where email='YOUR_EMAIL';
-- ============================================================================