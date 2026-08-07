import type { ID } from "@/types";
import type {
  Address, Order, PaymentMethod, ReturnRequest, Notification, RewardTransaction,
  CustomerReview, AdminCustomer, Coupon, FlashSale, Bundle, GiftCard, Affiliate,
  Warehouse, InventoryAdjustment, OrderStatus,
} from "@/types/account";
import { products, getProductBySlug } from "@/data/products";
import type { Product } from "@/types";

const iso = (d: string) => new Date(d).toISOString();

export const addresses: Address[] = [
  { id: "a1", label: "Home", name: "Jordan M.", line1: "140 Greenpoint Ave", line2: "Apt 2B", city: "Brooklyn", state: "NY", zip: "11222", country: "USA", isDefault: true },
  { id: "a2", label: "Office", name: "Jordan M.", line1: "1 Market Street", city: "San Francisco", state: "CA", zip: "94105", country: "USA", isDefault: false },
];

export const paymentMethods: PaymentMethod[] = [
  { id: "pm1", brand: "visa", last4: "4242", expiry: "08/27", isDefault: true },
  { id: "pm2", brand: "mastercard", last4: "5111", expiry: "11/26", isDefault: false },
  { id: "pm3", brand: "mpesa", last4: "0712", isDefault: false },
];

export const orders: Order[] = [
  {
    id: "o1", number: "ATL-7QX2K9FP", createdAt: iso("2026-07-12"), status: "delivered",
    items: [
      { productId: "p1", name: products[0].name, slug: products[0].slug, image: products[0].images[0], color: "Charcoal", size: "M", quantity: 1, price: 129 },
    ],
    subtotal: 129, shipping: 0, tax: 10.32, total: 139.32, paymentMethod: "Visa •• 4242", tracking: "1Z999AA10123456784", shippingAddressId: "a1",
  },
  {
    id: "o2", number: "ATL-3LKD8842", createdAt: iso("2026-06-28"), status: "shipped",
    items: [
      { productId: "p3", name: products[2].name, slug: products[2].slug, image: products[2].images[0], color: "Indigo", size: "32", quantity: 1, price: 188 },
      { productId: "p5", name: products[4].name, slug: products[4].slug, image: products[4].images[0], color: "White", size: "10", quantity: 1, price: 178 },
    ],
    subtotal: 366, shipping: 0, tax: 29.28, total: 395.28, paymentMethod: "Mastercard •• 5111", tracking: "1Z999AA10198765432", shippingAddressId: "a1",
  },
  {
    id: "o3", number: "ATL-9PPO2210", createdAt: iso("2026-05-04"), status: "processing",
    items: [
      { productId: "p4", name: products[3].name, slug: products[3].slug, image: products[3].images[0], color: "Olive", size: "L", quantity: 1, price: 240 },
    ],
    subtotal: 240, shipping: 0, tax: 19.2, total: 259.2, paymentMethod: "M-Pesa •• 0712",
  },
  {
    id: "o4", number: "ATL-2BNM0015", createdAt: iso("2026-04-19"), status: "cancelled",
    items: [
      { productId: "p8", name: products[7].name, slug: products[7].slug, image: products[7].images[0], color: "Navy", size: "8", quantity: 2, price: 48 },
    ],
    subtotal: 96, shipping: 9, tax: 7.68, total: 112.68, paymentMethod: "Visa •• 4242",
  },
];

export const returns: ReturnRequest[] = [
  { id: "rt1", orderId: "o1", reason: "Wrong size ordered, would like a Medium instead.", status: "completed", createdAt: iso("2026-07-20") },
  { id: "rt2", orderId: "o4", reason: "Cancellation confirmed.", status: "requested", createdAt: iso("2026-04-22") },
];

export const notifications: Notification[] = [
  { id: "n1", type: "order", title: "Order shipped", body: "Your order ATL-3LKD8842 is on its way. Track: 1Z999AA10198765432.", read: false, createdAt: iso("2026-06-29") },
  { id: "n2", type: "marketing", title: "Summer Linen is here", body: "New arrivals in European linen, up to 15% off this week.", read: false, createdAt: iso("2026-06-25") },
  { id: "n3", type: "reward", title: "200 points earned", body: "Thanks for your order ATL-7QX2K9FP. 200 points added to your balance.", read: true, createdAt: iso("2026-07-12") },
  { id: "n4", type: "system", title: "Payment method expiring soon", body: "Your Mastercard ending 5111 expires in November.", read: true, createdAt: iso("2026-07-01") },
];

export const rewardTransactions: RewardTransaction[] = [
  { id: "rw1", type: "earn", points: 200, description: "Order ATL-7QX2K9FP", createdAt: iso("2026-07-12") },
  { id: "rw2", type: "earn", points: 400, description: "Order ATL-3LKD8842", createdAt: iso("2026-06-28") },
  { id: "rw3", type: "redeem", points: -150, description: "$15 off coupon redeemed", createdAt: iso("2026-06-15") },
  { id: "rw4", type: "earn", points: 100, description: "Birthday bonus", createdAt: iso("2026-04-02") },
];

export const rewardBalance = rewardTransactions.reduce((s, t) => s + t.points, 0);

export const customerReviews: CustomerReview[] = [
  { id: "cr1", productId: "p2", productName: "Tailored Linen Shirt", rating: 5, body: "Became my most-worn item this summer.", status: "published", createdAt: iso("2026-08-01") },
  { id: "cr2", productId: "p1", productName: "Oversized Wool Sweater", rating: 4, body: "Great fit, sleeve is slightly long.", status: "pending", createdAt: iso("2026-09-22") },
];

export const adminCustomers: AdminCustomer[] = [
  { id: "cu1", name: "Jordan M.", email: "jordan@example.com", joinedAt: iso("2025-09-12"), orders: 8, spend: 1240.5, points: 1200, marketingConsent: true, notes: "VIP customer, prefers wool blends." },
  { id: "cu2", name: "Marisa L.", email: "marisa@example.com", joinedAt: iso("2025-11-04"), orders: 4, spend: 460.0, points: 460, marketingConsent: true, notes: "" },
  { id: "cu3", name: "Daniel R.", email: "daniel@example.com", joinedAt: iso("2026-01-22"), orders: 12, spend: 2380.0, points: 2200, marketingConsent: false, notes: "Frequent returns, mostly denim." },
  { id: "cu4", name: "Priya S.", email: "priya@example.com", joinedAt: iso("2026-03-18"), orders: 2, spend: 196.0, points: 180, marketingConsent: true, notes: "" },
  { id: "cu5", name: "Amara K.", email: "amara@example.com", joinedAt: iso("2026-05-30"), orders: 6, spend: 880.0, points: 880, marketingConsent: true, notes: "Loves the linen collection." },
];

export const coupons: Coupon[] = [
  { id: "co1", code: "WELCOME10", type: "percent", value: 10, uses: 142, maxUses: 1000, expiresAt: iso("2026-12-31"), active: true },
  { id: "co2", code: "SUMMER15", type: "percent", value: 15, uses: 88, maxUses: 500, expiresAt: iso("2026-08-31"), active: true },
  { id: "co3", code: "FREESHIP", type: "shipping", value: 0, uses: 320, maxUses: 0, expiresAt: iso("2026-12-31"), active: true },
  { id: "co4", code: "FLASH25", type: "fixed", value: 25, uses: 18, maxUses: 100, expiresAt: iso("2026-07-31"), active: false },
];

export const flashSales: FlashSale[] = [
  { id: "fs1", name: "Mid-season sweater markdown", productId: "p1", startAt: iso("2026-07-25"), endAt: iso("2026-07-30"), discount: 22, active: true },
  { id: "fs2", name: "Sneaker weekend drop", productId: "p5", startAt: iso("2026-08-01"), endAt: iso("2026-08-03"), discount: 18, active: false },
];

export const bundles: Bundle[] = [
  { id: "bn1", name: "Winter trio (sweater + jacket + scarf)", productIds: ["p1", "p4"], price: 320, active: true },
  { id: "bn2", name: "Denim lovers", productIds: ["p3"], price: 168, active: true },
];

export const giftCards: GiftCard[] = [
  { id: "gc1", code: "GIFT-AB12CD", balance: 75, initial: 100, status: "active" },
  { id: "gc2", code: "GIFT-XY99ZW", balance: 0, initial: 50, status: "redeemed" },
];

export const affiliates: Affiliate[] = [
  { id: "af1", name: "Style Blogger Co.", email: "team@styleblogger.co", clicks: 1840, conversions: 96, earnings: 840 },
  { id: "af2", name: "Marcus T.", email: "marcus@example.com", clicks: 420, conversions: 14, earnings: 112 },
];

export const warehouses: Warehouse[] = [
  { id: "wh1", name: "Newark DC", location: "Newark, NJ" },
  { id: "wh2", name: "Reno DC", location: "Reno, NV" },
];

export const inventoryAdjustments: InventoryAdjustment[] = [
  { id: "ia1", productId: "p3", productName: "Selvedge Straight Jeans", warehouseId: "wh1", delta: -2, reason: "Damaged in transit", createdAt: iso("2026-06-15") },
  { id: "ia2", productId: "p1", productName: "Oversized Wool Sweater", warehouseId: "wh2", delta: 24, reason: "Restock PO-2201", createdAt: iso("2026-06-20") },
  { id: "ia3", productId: "p5", productName: "Court Leather Sneaker", warehouseId: "wh1", delta: -6, reason: "Cycle count", createdAt: iso("2026-07-01") },
];

export const emailCampaigns = [
  { id: "ec1", name: "Summer linen launch", sent: 8400, opens: 4200, clicks: 1050, revenue: 18400 },
  { id: "ec2", name: "Cart abandon winback", sent: 1240, opens: 620, clicks: 240, revenue: 5600 },
];

export interface AdminProduct extends Product {
  sku: string;
  barcode: string;
  totalStock: number;
  warehouseId: ID;
  cost: number;
}
export const adminProducts: AdminProduct[] = products.map((p, i) => {
  const totalStock = p.variants.reduce((s, v) => s + v.sizes.reduce((a, x) => a + x.stock, 0), 0);
  return {
    ...p,
    sku: `ATL-${(1000 + i).toString()}`,
    barcode: `841000${(1000000 + i).toString()}`,
    totalStock,
    warehouseId: i % 2 === 0 ? "wh1" : "wh2",
    cost: Math.round((p.salePrice ?? p.price) * 0.45),
  };
});

export const orderStatuses: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded", "returned"];

export const adminDashboardStats = {
  revenue: { today: 4820, week: 28640, month: 124880, previousMonth: 118200, change: 5.6 },
  orders: { today: 24, week: 168, month: 720, pending: 14 },
  visitors: { today: 3120, week: 21840, month: 96400, prevMonth: 88200 },
  conversionRate: 2.74,
  topProducts: [
    { id: "p3", name: "Selvedge Straight Jeans", units: 142, revenue: 26696 },
    { id: "p5", name: "Court Leather Sneaker", units: 98, revenue: 17444 },
    { id: "p1", name: "Oversized Wool Sweater", units: 84, revenue: 10836 },
    { id: "p2", name: "Tailored Linen Shirt", units: 76, revenue: 7448 },
  ],
  inventoryAlerts: adminProducts.filter((p) => p.totalStock < 30),
  recentOrders: orders,
};

export const reportsData = {
  salesByMonth: [
    { month: "Jan", revenue: 98000, orders: 540 },
    { month: "Feb", revenue: 102000, orders: 580 },
    { month: "Mar", revenue: 110000, orders: 620 },
    { month: "Apr", revenue: 96000, orders: 510 },
    { month: "May", revenue: 118000, orders: 680 },
    { month: "Jun", revenue: 122000, orders: 705 },
    { month: "Jul", revenue: 124880, orders: 720 },
  ],
  inventoryValueByWarehouse: [
    { name: "Newark DC", value: 184000 },
    { name: "Reno DC", value: 96000 },
  ],
  customersByMonth: [
    { month: "Jan", new: 120, returning: 320 },
    { month: "Feb", new: 140, returning: 360 },
    { month: "Mar", new: 180, returning: 380 },
    { month: "Apr", new: 110, returning: 340 },
    { month: "May", new: 220, returning: 420 },
    { month: "Jun", new: 240, returning: 460 },
    { month: "Jul", new: 280, returning: 480 },
  ],
  trafficSources: [
    { source: "Organic", visitors: 38400 },
    { source: "Direct", visitors: 24800 },
    { source: "Social", visitors: 18200 },
    { source: "Email", visitors: 12800 },
    { source: "Paid", visitors: 6200 },
  ],
  profitByMonth: [
    { month: "Jan", revenue: 98000, cost: 42000, profit: 56000 },
    { month: "Feb", revenue: 102000, cost: 44000, profit: 58000 },
    { month: "Mar", revenue: 110000, cost: 48000, profit: 62000 },
    { month: "Apr", revenue: 96000, cost: 41000, profit: 55000 },
    { month: "May", revenue: 118000, cost: 51000, profit: 67000 },
    { month: "Jun", revenue: 122000, cost: 52000, profit: 70000 },
    { month: "Jul", revenue: 124880, cost: 54000, profit: 70880 },
  ],
};

export function getProductForAdmin(id: ID) {
  return adminProducts.find((p) => p.id === id);
}
export function getProductByName(name: string): Product | undefined {
  return getProductBySlug(name.toLowerCase().replace(/\s+/g, "-"));
}
