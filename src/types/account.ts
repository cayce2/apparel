import type { ID } from "@/types";

export interface Address {
  id: ID;
  label: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" | "returned";

export interface OrderItem {
  productId: ID;
  name: string;
  slug: string;
  image: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: ID;
  number: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: string;
  tracking?: string;
  shippingAddressId?: ID;
}

export interface PaymentMethod {
  id: ID;
  brand: "visa" | "mastercard" | "amex" | "paypal" | "mpesa";
  last4: string;
  expiry?: string;
  isDefault: boolean;
}

export interface ReturnRequest {
  id: ID;
  orderId: ID;
  reason: string;
  status: "requested" | "approved" | "denied" | "completed";
  createdAt: string;
}

export interface Notification {
  id: ID;
  type: "order" | "marketing" | "system" | "reward";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface RewardTransaction {
  id: ID;
  type: "earn" | "redeem" | "expire";
  points: number;
  description: string;
  createdAt: string;
}

export interface CustomerReview {
  id: ID;
  productId: ID;
  productName: string;
  rating: number;
  body: string;
  status: "published" | "pending";
  createdAt: string;
}

export interface CustomerReviews {
  reviews: CustomerReview[];
}

export interface AdminCustomer {
  id: ID;
  name: string;
  email: string;
  joinedAt: string;
  orders: number;
  spend: number;
  points: number;
  marketingConsent: boolean;
  notes: string;
}

export interface Coupon {
  id: ID;
  code: string;
  type: "percent" | "fixed" | "shipping";
  value: number;
  uses: number;
  maxUses: number;
  expiresAt: string;
  active: boolean;
}

export interface FlashSale {
  id: ID;
  name: string;
  productId: ID;
  startAt: string;
  endAt: string;
  discount: number;
  active: boolean;
}

export interface Bundle {
  id: ID;
  name: string;
  productIds: ID[];
  price: number;
  active: boolean;
}

export interface GiftCard {
  id: ID;
  code: string;
  balance: number;
  initial: number;
  status: "active" | "redeemed" | "expired";
}

export interface Affiliate {
  id: ID;
  name: string;
  email: string;
  clicks: number;
  conversions: number;
  earnings: number;
}

export interface Warehouse {
  id: ID;
  name: string;
  location: string;
}

export interface InventoryAdjustment {
  id: ID;
  productId: ID;
  productName: string;
  warehouseId: ID;
  delta: number;
  reason: string;
  createdAt: string;
}

export interface BlogPost {
  id: ID;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  createdAt: string;
}
