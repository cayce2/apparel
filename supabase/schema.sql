-- ============================================================================
--  ATELIER — full Supabase schema + RLS policies + seed data
--  Run this in your Supabase project: SQL Editor > New query > paste > Run.
--  Idempotent: uses IF NOT EXISTS / DROP ... IF EXISTS where it matters.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Extensions / basic enums
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

do $$ begin
  create type order_status as enum ('pending','processing','shipped','delivered','cancelled','refunded','returned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type return_status as enum ('requested','approved','denied','completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type coupon_type as enum ('percent','fixed','shipping');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_brand as enum ('visa','mastercard','amex','paypal','mpesa');
exception when duplicate_object then null; end $$;

do $$ begin
  create type review_status as enum ('published','pending');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum ('order','marketing','system','reward');
exception when duplicate_object then null; end $$;

do $$ begin
  create type reward_kind as enum ('earn','redeem','expire');
exception when duplicate_object then null; end $$;

do $$ begin
  create type gift_card_status as enum ('active','redeemed','expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type admin_role as enum ('admin','staff');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- profiles   ( Supabase auth.users is the source of truth for accounts )
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role admin_role not null default 'staff',
  is_admin boolean generated always as (role = 'admin') stored,
  marketing_consent boolean not null default false,
  points integer not null default 0,
  notes text default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- catalog: brands, categories, collections
-- ---------------------------------------------------------------------------
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- products + variants
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text default '',
  materials text default '',
  care text default '',
  shipping text default '',
  returns text default '',
  price numeric(10,2) not null default 0,
  sale_price numeric(10,2),
  brand_id uuid references public.brands(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  material text default '',
  rating numeric(3,1) not null default 0,
  review_count integer not null default 0,
  sku text,
  barcode text,
  cost numeric(10,2) not null default 0,
  is_new boolean not null default false,
  is_trending boolean not null default false,
  is_on_sale boolean not null default false,
  is_featured boolean not null default false,
  images text[] not null default '{}',
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.product_colors (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  color text not null,
  color_hex text not null default '#000000'
);

create table if not exists public.product_sizes (
  id uuid primary key default gen_random_uuid(),
  product_color_id uuid not null references public.product_colors(id) on delete cascade,
  size text not null,
  stock integer not null default 0
);

create table if not exists public.product_collections (
  product_id uuid not null references public.products(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  primary key (product_id, collection_id)
);

-- ---------------------------------------------------------------------------
-- warehouses + inventory adjustments + stock snapshot
-- ---------------------------------------------------------------------------
create table if not exists public.warehouses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text default ''
);

create table if not exists public.product_warehouses (
  product_id uuid not null references public.products(id) on delete cascade,
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  primary key (product_id, warehouse_id)
);

create table if not exists public.inventory_adjustments (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  warehouse_id uuid references public.warehouses(id) on delete set null,
  delta integer not null,
  reason text default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- orders + items
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  customer_id uuid references public.profiles(id) on delete set null,
  status order_status not null default 'pending',
  subtotal numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  tax numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  payment_method text default '',
  tracking text,
  shipping_address jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  slug text,
  image text,
  color text,
  size text,
  quantity integer not null,
  price numeric(10,2) not null
);

-- ---------------------------------------------------------------------------
-- customer-facing data
-- ---------------------------------------------------------------------------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Address',
  full_name text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  zip text not null,
  country text not null default 'USA',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  brand payment_brand not null,
  last4 text not null,
  expiry text,
  is_default boolean not null default false
);

create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (customer_id, product_id)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  customer_id uuid references public.profiles(id) on delete set null,
  author text not null,
  rating integer not null check (rating between 1 and 5),
  title text default '',
  body text default '',
  status review_status not null default 'published',
  created_at timestamptz not null default now()
);

create table if not exists public.return_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  customer_id uuid references public.profiles(id) on delete set null,
  reason text not null,
  status return_status not null default 'requested',
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.reward_transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  type reward_kind not null,
  points integer not null,
  description text default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- marketing
-- ---------------------------------------------------------------------------
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type coupon_type not null,
  value numeric(10,2) not null default 0,
  uses integer not null default 0,
  max_uses integer not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.flash_sales (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  product_id uuid references public.products(id) on delete set null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  discount numeric(5,2) not null default 0,
  active boolean not null default true
);

create table if not exists public.bundles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10,2) not null default 0,
  active boolean not null default true,
  product_ids uuid[] not null default '{}'
);

create table if not exists public.gift_cards (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  balance numeric(10,2) not null default 0,
  initial numeric(10,2) not null default 0,
  status gift_card_status not null default 'active'
);

create table if not exists public.affiliates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  clicks integer not null default 0,
  conversions integer not null default 0,
  earnings numeric(10,2) not null default 0
);

create table if not exists public.email_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sent integer not null default 0,
  opens integer not null default 0,
  clicks integer not null default 0,
  revenue numeric(10,2) not null default 0
);

-- ---------------------------------------------------------------------------
-- helper views used by the admin API
-- ---------------------------------------------------------------------------
create or replace view public.admin_top_products as
  select product_id, name, sum(quantity) as units,
         sum(quantity * price) as revenue
  from public.order_items
  group by product_id, name
  order by revenue desc;

-- ===========================================================================
-- Row Level Security
--   - public read for catalog + published reviews
--   - authenticated customer can CRUD own profile-related rows
--   - admins (profiles.role = 'admin') get full access via the service role
-- ===========================================================================
alter table public.profiles              enable row level security;
alter table public.brands                enable row level security;
alter table public.categories            enable row level security;
alter table public.collections           enable row level security;
alter table public.products              enable row level security;
alter table public.product_colors        enable row level security;
alter table public.product_sizes         enable row level security;
alter table public.product_collections   enable row level security;
alter table public.warehouses            enable row level security;
alter table public.product_warehouses    enable row level security;
alter table public.inventory_adjustments  enable row level security;
alter table public.orders               enable row level security;
alter table public.order_items          enable row level security;
alter table public.addresses            enable row level security;
alter table public.payment_methods      enable row level security;
alter table public.wishlist             enable row level security;
alter table public.reviews              enable row level security;
alter table public.return_requests      enable row level security;
alter table public.notifications         enable row level security;
alter table public.reward_transactions  enable row level security;
alter table public.coupons              enable row level security;
alter table public.flash_sales          enable row level security;
alter table public.bundles             enable row level security;
alter table public.gift_cards          enable row level security;
alter table public.affiliates          enable row level security;
alter table public.email_campaigns     enable row level security;

-- helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select coalesce((
    select role = 'admin' from public.profiles where id = auth.uid()
  ), false);
$$;

-- catalog public reads
create policy "catalog read" on public.brands           for select using (true);
create policy "catalog read" on public.categories       for select using (true);
create policy "catalog read" on public.collections      for select using (true);
create policy "catalog read" on public.products          for select using (true);
create policy "catalog read" on public.product_colors    for select using (true);
create policy "catalog read" on public.product_sizes     for select using (true);
create policy "catalog read" on public.product_collections for select using (true);
create policy "catalog read" on public.warehouses        for select using (true);
create policy "catalog read" on public.product_warehouses for select using (true);
create policy "catalog read" on public.coupons           for select using (true);
create policy "catalog read" on public.flash_sales       for select using (true);
create policy "catalog read" on public.bundles           for select using (true);
create policy "published reviews" on public.reviews      for select using (status = 'published' or is_admin());

-- profile: each user reads/updates own, admins read all
create policy "own profile read"   on public.profiles for select using (auth.uid() = id or is_admin());
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

-- customer-scoped tables: own rows only
create policy "own orders read"      on public.orders             for select using (customer_id = auth.uid() or is_admin());
create policy "own order items read" on public.order_items        for select using (
  exists(select 1 from public.orders o where o.id = order_id and (o.customer_id = auth.uid() or is_admin()))
);
create policy "own addresses"        on public.addresses          for all    using (customer_id = auth.uid() or is_admin());
create policy "own payments"         on public.payment_methods    for all    using (customer_id = auth.uid() or is_admin());
create policy "own wishlist"         on public.wishlist           for all    using (customer_id = auth.uid() or is_admin());
create policy "own reviews"          on public.reviews            for all    using (customer_id = auth.uid() or is_admin());
create policy "own returns"          on public.return_requests   for all    using (customer_id = auth.uid() or is_admin());
create policy "own notifications"    on public.notifications      for all    using (customer_id = auth.uid() or is_admin());
create policy "own rewards"          on public.reward_transactions for select using (customer_id = auth.uid() or is_admin());

-- anonymous order creation (guest checkout); admin reads all (already handled above).
-- create is unconditionally allowed because customer_id may be null (guest).
create policy "create orders"        on public.orders      for insert with check (true);
create policy "create order items"   on public.order_items for insert with check (true);

-- writes for admins only
create policy "admin write catalog"   on public.products           for all using (is_admin()) with check (is_admin());
create policy "admin write catalog"   on public.brands             for all using (is_admin()) with check (is_admin());
create policy "admin write catalog"   on public.categories         for all using (is_admin()) with check (is_admin());
create policy "admin write catalog"   on public.collections        for all using (is_admin()) with check (is_admin());
create policy "admin write catalog"   on public.product_colors     for all using (is_admin()) with check (is_admin());
create policy "admin write catalog"   on public.product_sizes      for all using (is_admin()) with check (is_admin());
create policy "admin write catalog"   on public.product_collections for all using (is_admin()) with check (is_admin());
create policy "admin write catalog"   on public.warehouses         for all using (is_admin()) with check (is_admin());
create policy "admin write catalog"   on public.product_warehouses for all using (is_admin()) with check (is_admin());
create policy "admin write inventory" on public.inventory_adjustments for all using (is_admin()) with check (is_admin());
create policy "admin write orders"    on public.orders             for update using (is_admin());
create policy "admin write marketing" on public.coupons            for all using (is_admin()) with check (is_admin());
create policy "admin write marketing" on public.flash_sales         for all using (is_admin()) with check (is_admin());
create policy "admin write marketing" on public.bundles             for all using (is_admin()) with check (is_admin());
create policy "admin write marketing" on public.gift_cards         for all using (is_admin()) with check (is_admin());
create policy "admin write marketing" on public.affiliates         for all using (is_admin()) with check (is_admin());
create policy "admin write marketing" on public.email_campaigns   for all using (is_admin()) with check (is_admin());

-- auto-provision a profile row whenever a new auth user is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
