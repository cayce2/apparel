"use client";

import { api, mutate } from "@/lib/api/client";

// ============================================================================
//  Customer account API
// ============================================================================

export interface ApiOrder {
  id: string;
  number: string;
  created_at: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" | "returned";
  items: {
    id: string; product_id: string; name: string; slug: string | null; image: string | null;
    color: string; size: string; quantity: number; price: number;
  }[];
  subtotal: number; shipping: number; tax: number; total: number;
  payment_method: string; tracking?: string | null;
  shipping_address?: {
    name?: string; line1?: string; line2?: string;
    city?: string; state?: string; zip?: string; country?: string;
  } | null;
}

export async function listMyOrders() { return api<ApiOrder[]>("/api/orders"); }
export async function getOrder(idOrNumber: string) { return api<ApiOrder & { returns: any[] }>(`/api/orders/${idOrNumber}`); }

export interface ApiAddress {
  id: string; label: string; full_name: string; line1: string; line2?: string | null;
  city: string; state: string; zip: string; country: string; is_default: boolean; customer_id?: string;
}

export async function listAddresses() { return api<ApiAddress[]>("/api/addresses"); }
export async function saveAddress(body: Partial<ApiAddress> & { id?: string }) {
  if (body.id) return mutate<ApiAddress>(`/api/addresses`, { method: "PUT", body: JSON.stringify(body) });
  return mutate<ApiAddress>(`/api/addresses`, { method: "POST", body: JSON.stringify(body) });
}
export async function deleteAddress(id: string) {
  return mutate<{ id: string; deleted: boolean }>(`/api/addresses/${id}`, { method: "DELETE" });
}

export interface ApiPaymentMethod {
  id: string; brand: "visa" | "mastercard" | "amex" | "paypal" | "mpesa";
  last4: string; expiry?: string | null; is_default: boolean; customer_id?: string;
}

export async function listPaymentMethods() { return api<ApiPaymentMethod[]>("/api/payments"); }
export async function savePaymentMethod(body: Omit<ApiPaymentMethod, "id" | "customer_id">) {
  return mutate<ApiPaymentMethod>(`/api/payments`, { method: "POST", body: JSON.stringify(body) });
}
export async function deletePaymentMethod(id: string) {
  return mutate(`/api/payments/${id}`, { method: "DELETE" });
}
export async function setDefaultPayment(id: string) {
  return mutate(`/api/payments/${id}`, { method: "PATCH" });
}

export async function listMyReturns() {
  const rows = await api<{ id: string; orderId: string; orderNumber?: string; reason: string; status: string; createdAt: string }[]>("/api/returns");
  return rows;
}
export function startReturn(orderId: string, reason: string) {
  return mutate(`/api/returns`, { method: "POST", body: JSON.stringify({ orderId, reason }) });
}

export interface ApiNotification {
  id: string; type: "order" | "marketing" | "system" | "reward";
  title: string; body: string; read: boolean; createdAt: string;
}
export async function listNotifications() { return api<ApiNotification[]>("/api/notifications"); }
export function markAllNotificationsRead() { return mutate(`/api/notifications`, { method: "POST", body: JSON.stringify({ readAll: true }) }); }
export function toggleNotification(id: string) { return mutate(`/api/notifications`, { method: "POST", body: JSON.stringify({ id }) }); }

export interface ApiRewardTx { id: string; type: "earn" | "redeem" | "expire"; points: number; description: string; createdAt: string; }
export async function listRewards() {
  return api<{ balance: number; transactions: ApiRewardTx[] }>("/api/rewards");
}

export async function listMyReviews() {
  return api<any[]>("/api/reviews?mine=1");
}

// ============================================================================
//  Admin API
// ============================================================================
export const ORDER_STATUSES = ["pending","processing","shipped","delivered","cancelled","refunded","returned"] as const;

export interface AdminDashboard {
  revenue: { today: number; week: number; month: number; change: number };
  orders: { today: number; week: number; month: number; pending: number };
  visitors: { today: number; week: number; month: number; prevMonth: number };
  conversionRate: number;
  topProducts: { id: string; name: string; units: number; revenue: number }[];
  inventoryAlerts: { id: string; name: string; sku: string; image: string | null; totalStock: number }[];
  recentOrders: { id: string; number: string; created_at: string; status: any; total: number }[];
}

export async function getAdminDashboard() { return api<AdminDashboard>("/api/admin/dashboard"); }

export interface AdminReports {
  salesByMonth: { month: string; revenue: number; orders: number; cost: number; profit: number }[];
  customersByMonth: { month: string; new: number; returning: number }[];
  trafficSources: { source: string; visitors: number }[];
  topProducts: { id: string; name: string; units: number; revenue: number }[];
  inventoryValue: number;
  inventoryRows: { id: string; name: string; sku: string; totalStock: number; cost: number; value: number }[];
}
export async function getAdminReports() { return api<AdminReports>("/api/admin/reports"); }

export interface AdminCustomer {
  id: string; name: string; email: string; joinedAt: string;
  orders: number; spend: number; points: number; marketingConsent: boolean; notes: string;
}
export async function listCustomers() { return api<AdminCustomer[]>("/api/customers"); }
export async function getCustomer(id: string) {
  return api<AdminCustomer & { orders: any[] }>(`/api/customers/${id}`);
}
export async function saveCustomerNotes(id: string, notes: string) {
  return mutate(`/api/customers/${id}/notes`, { method: "PATCH", body: JSON.stringify({ notes }) });
}
export async function adjustPoints(id: string, delta: number, description?: string) {
  return mutate(`/api/rewards`, { method: "POST", body: JSON.stringify({ id, delta, description }) });
}

export interface AdminInventoryProduct {
  id: string; name: string; sku: string; image: string | null;
  cost: number; totalStock: number;
  warehouses: { warehouse_id: string }[];
}
export interface ApiWarehouse { id: string; name: string; location: string; }
export interface AdminInventoryPayload {
  skus: number;
  inventoryValue: number;
  lowStock: AdminInventoryProduct[];
  outOfStock: AdminInventoryProduct[];
  products: AdminInventoryProduct[];
}
export async function getInventory() { return api<AdminInventoryPayload>("/api/inventory"); }
export function adjustInventory(productId: string, delta: number, warehouseId: string, reason: string) {
  return mutate(`/api/inventory`, { method: "POST", body: JSON.stringify({ productId, warehouseId, delta, reason }) });
}

export async function listMarketing() {
  return api<{
    coupons: any[]; flashSales: any[]; bundles: any[];
    giftCards: any[]; affiliates: any[]; emailCampaigns: any[];
  }>("/api/marketing");
}
export function createCoupon(body: { code: string; type: "percent" | "fixed" | "shipping"; value: number; maxUses?: number; expiresAt?: string; active?: boolean }) {
  return mutate(`/api/coupons`, { method: "POST", body: JSON.stringify(body) });
}

// products admin
export interface AdminProductInput {
  id?: string;
  name: string; slug?: string; description?: string; materials?: string; care?: string;
  shipping?: string; returns?: string; price: number; salePrice?: number | null;
  brand?: string; category?: string; material?: string; sku?: string; barcode?: string;
  cost?: number; images?: string[]; tags?: string[];
  isNew?: boolean; isTrending?: boolean; isOnSale?: boolean; isFeatured?: boolean;
  variants?: { color: string; colorHex?: string; sizes: { size: string; stock: number }[] }[];
  warehouseIds?: string[];
  collectionSlugs?: string[];
}
export async function createProduct(body: AdminProductInput) {
  return mutate<{ id: string; slug: string }>("/api/products", { method: "POST", body: JSON.stringify(body) });
}
export async function updateProduct(id: string, body: Partial<AdminProductInput>) {
  return mutate(`/api/products`, { method: "PUT", body: JSON.stringify({ ...body, id }) });
}
export async function deleteProduct(id: string) {
  return mutate(`/api/products?id=${id}`, { method: "DELETE" });
}

export async function bulkImportProducts(rows: any[]) {
  return mutate<{ inserted: number; failed: number; errors: any[] }>(`/api/products/bulk`, { method: "POST", body: JSON.stringify({ rows }) });
}
export async function bulkExportCsvLink() { return "/api/products/bulk"; }
export function exportProductsCsvUrl() { return "/api/products/bulk"; }

export async function setOrderStatus(id: string, status: string, tracking?: string) {
  return mutate(`/api/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, tracking }) });
}
