# Atelier — backend setup (Supabase)

The app uses [Supabase](https://supabase.com) (Postgres + Auth) as its database. This guide wires everything in ~5 minutes.

## 1. Create a Supabase project
- Go to https://app.supabase.com and create a new project.
- Note the **Project URL**, **anon public** key, and **service_role** key (Settings → API).

## 2. Add environment variables
Copy `.env.example` to `.env.local` at the project root and fill in your keys:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> The service-role key bypasses RLS and is only used server-side. Never expose it to the browser.

## 3. Apply the schema
In your Supabase dashboard open **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, and click **Run**. This creates all tables, enums, indexes, Row-Level-Security policies, and a trigger that auto-creates a `profiles` row for every new auth user.

## 4. Seed the catalog + sample orders
In Supabase **SQL Editor**, run `supabase/seed.sql`. It inserts brands, categories, collections, warehouses, 8 demo products (with colors/sizes), 4 sample orders, coupons, flash sales, bundles, gift cards, affiliates, and email campaigns.

## 5. Create an admin account
1. Visit `/auth/sign-up` (or create a user from the Supabase dashboard under Authentication → Users → Add user).
2. In SQL Editor run:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
   You now have full admin access to `/admin` and the admin-scoped API routes.

## API surface
All endpoints live under `/api`. Public reads work anonymously; writes require a logged-in Supabase session, and admin-only writes require the `admin` role (enforced by RLS).

| Resource | Methods | Notes |
| --- | --- | --- |
| `/api/products` | `GET` `POST` `PUT` `DELETE` | supports `?category=&filter=&sort=&minPrice=&maxPrice=&q=&page=&pageSize=`, `variant` write helper |
| `/api/products/[id]` | `GET` `PATCH` `DELETE` | accepts slug or id |
| `/api/products/bulk` | `POST` `GET` | bulk insert `{rows:[...]}` · `GET` returns CSV template |
| `/api/categories`, `/api/brands`, `/api/collections` | `GET` `POST` | |
| `/api/collections/[slug]` | `GET` | products in a collection |
| `/api/orders` | `GET` `POST` | auth-scoped GET; POST creates an order, decrements stock, awards reward points |
| `/api/orders/[id]` | `GET` | detail incl. items + returns |
| `/api/orders/[id]/status` | `PATCH` | admin status update + tracking |
| `/api/customers` | `GET` | admin list with aggregated stats |
| `/api/customers/[id]` | `GET` | profile + orders |
| `/api/customers/[id]/notes` | `PATCH` | admin internal notes |
| `/api/addresses`, `/api/addresses/[id]` | `GET` `POST` `PUT` `DELETE` | logged-in user only |
| `/api/payments`, `/api/payments/[id]` | `GET` `POST` `DELETE` `PATCH` | saved payment methods |
| `/api/wishlist`, `/api/wishlist/[productId]` | `GET` `POST` `DELETE` | toggle a product |
| `/api/reviews` | `GET` `POST` | supports `?productId=` & `?mine=1` |
| `/api/returns` | `GET` `POST` | logged-in only |
| `/api/notifications` | `GET` `POST` | `POST { readAll:true }` or `{ id }` |
| `/api/rewards` | `GET` `POST` | balance + transactions; admin POST adjusts |
| `/api/coupons`, `/api/coupons/[code]` | `GET` `POST` | validate code with `?cartTotal=` |
| `/api/inventory` | `GET` `POST` | aggregated stock + admin adjustments |
| `/api/marketing` | `GET` | coupons, flash sales, bundles, gift cards, affiliates, email campaigns |
| `/api/admin/dashboard` | `GET` | KPIs (revenue, orders, visitors, conversion, top products, inventory alerts) |
| `/api/admin/reports` | `GET` | monthly sales, customers, traffic, profit, top products, inventory value |
| `/api/auth/sign-up` `sign-in` `sign-out` `me` | `POST`* | wraps Supabase Auth; `/me` is `GET` |

## Row Level Security
- Public read on catalog (brands/categories/collections/products/variants/coupons/flash_sales/bundles) and on published reviews.
- Each logged-in customer can read/mutate only their own orders, addresses, payment methods, wishlist, reviews, returns, notifications, reward transactions.
- Admin (`profiles.role = 'admin'`) has full write access.
- Order creation is allowed anonymously (guest checkout) — items/status writes remain admin-only afterward.

## Running
```
npm install
npm run dev      # http://localhost:3000
```

If env vars are missing the Supabase client throws a clear error pointing you back to this file. The storefront pages still render with their existing mock seed data when env is unset — only the `/api/*` routes fail until keys are provided.
