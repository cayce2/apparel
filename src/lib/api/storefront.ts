"use client";

import { api, mutate } from "@/lib/api/client";

// ============================================================================
//  Typed API accessors for the storefront. Shapes mirror what the POST/GET
//  route handlers in /app/api return. See supabase/schema.sql for the source.
// ============================================================================

export interface ApiProductList {
  data: ApiProduct[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  materials: string;
  material?: string;
  care: string;
  shipping: string;
  returns: string;
  price: number;
  sale_price: number | null;
  salePrice?: number | null;
  brandName?: string;
  brand?: string;
  category?: string;
  categorySlug?: string;
  rating: number;
  review_count?: number;
  reviewCount?: number;
  sku?: string;
  barcode?: string;
  cost?: number;
  is_new: boolean;
  is_trending: boolean;
  is_on_sale: boolean;
  is_featured: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  isOnSale?: boolean;
  isFeatured?: boolean;
  images: string[];
  tags: string[];
  created_at?: string;
  reviews?: ApiReview[];
  variants?: { color: string; colorHex?: string; color_hex?: string; sizes: { size: string; stock: number }[] }[];
}

export interface ApiReview {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  status?: string;
  createdAt?: string;
  created_at?: string;
  product_id?: string;
  productId?: string;
  productName?: string;
}

export interface ApiCollection {
  id: string;
  name: string;
  slug: string;
  products?: ApiProduct[];
}

export interface ApiBrand { id: string; name: string; slug: string; }
export interface ApiCategory { id: string; name: string; slug: string; parent_id?: string | null; }
export interface ApiCollectionSummary { id: string; name: string; slug: string; }

export interface ApiCoupon { id: string; code: string; type: "percent" | "fixed" | "shipping"; value: number; uses: number; max_uses: number; expires_at?: string | null; active: boolean; }

// ---- storefront reads ------------------------------------------------------

export async function listProducts(params: Record<string, string | number | undefined> = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== "") qs.set(k, String(v)); });
  const res = await api<ApiProductList>(`/api/products?${qs}`);
  return res.data.map(normalizeProduct);
}

export async function getProduct(slugOrId: string) {
  return normalizeProduct(await api<ApiProduct>(`/api/products/${slugOrId}`));
}

export async function getProductsByIds(ids: string[]) {
  if (!ids.length) return [];
  const results = await Promise.all(
    ids.map((id) =>
      getProduct(id).catch(() => null)
    )
  );
  return results.filter((p): p is NonNullable<typeof p> => p !== null);
}

export async function listBrands() { return api<ApiBrand[]>("/api/brands"); }
export async function listCategories() { return api<ApiCategory[]>("/api/categories"); }
export async function listCollections() { return api<ApiCollectionSummary[]>("/api/collections"); }
export async function getCollection(slug: string) { return api<ApiCollection>(`/api/collections/${slug}`); }
export async function validateCoupon(code: string, cartTotal: number) {
  return api<{ valid: boolean; code?: string; type?: string; value?: number; discount?: number | "shipping"; reason?: string }>(
    `/api/coupons/${encodeURIComponent(code)}?cartTotal=${cartTotal}`
  );
}

// ---- wishlist / reviews / auth -------------------------------------------

export async function wishlistToggle(productId: string, want: boolean) {
  if (want) return mutate(`/api/wishlist`, { method: "POST", body: JSON.stringify({ productId }) });
  return mutate(`/api/wishlist/${productId}`, { method: "DELETE" });
}

export async function listReviews(productId: string) {
  return api<ApiReview[]>(`/api/reviews?productId=${productId}`);
}
export async function submitReview(payload: { productId: string; rating: number; title?: string; body?: string }) {
  return mutate<ApiReview>(`/api/reviews`, { method: "POST", body: JSON.stringify(payload) });
}

// ---- orders (checkout) ----------------------------------------------------

export interface CheckoutPayload {
  items: { productId: string; color: string; size: string; quantity: number }[];
  shippingAddress?: { name: string; line1: string; city: string; state: string; zip: string; country: string } | null;
  paymentMethod?: string;
  shipping?: number;
}

export async function placeOrder(payload: CheckoutPayload) {
  return mutate<{ id: string; number: string; subtotal: number; shipping: number; tax: number; total: number }>(`/api/orders`, {
    method: "POST", body: JSON.stringify(payload),
  });
}

// ============================================================================
//  Shape normalization — the API still returns snake_case columns; the legacy
//  UI was written against camelCase. This keeps the existing JSX working.
// ============================================================================
function normalizeProduct(p: ApiProduct) {
  return {
    ...p,
    salePrice: p.salePrice ?? p.sale_price ?? null,
    isNew: p.isNew ?? p.is_new,
    isTrending: p.isTrending ?? p.is_trending,
    isOnSale: p.isOnSale ?? p.is_on_sale,
    isFeatured: p.isFeatured ?? p.is_featured,
    reviewCount: p.reviewCount ?? p.review_count ?? 0,
    brand: p.brand ?? p.brandName ?? "",
    category: p.category ?? p.categorySlug ?? "",
    variants: (p.variants ?? []).map((v) => ({
      color: v.color,
      colorHex: v.colorHex ?? v.color_hex ?? "#000000",
      sizes: v.sizes ?? [],
    })),
    reviews: (p.reviews ?? []).map((r) => ({
      id: r.id, author: r.author, rating: r.rating, title: r.title ?? "", body: r.body ?? "",
      createdAt: r.createdAt ?? r.created_at,
    })),
  };
}
