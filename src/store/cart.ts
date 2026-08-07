"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types";

interface CartState {
  items: CartItem[];
  saved: CartItem[];
  add: (product: Product, color: string, size: string, quantity?: number) => void;
  remove: (productId: string, color: string, size: string) => void;
  updateQty: (productId: string, color: string, size: string, quantity: number) => void;
  saveForLater: (productId: string, color: string, size: string) => void;
  moveToCart: (productId: string, color: string, size: string) => void;
  clear: () => void;
  subtotal: () => number;
  count: () => number;
}

const key = (p: string, c: string, s: string) => `${p}__${c}__${s}`;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      saved: [],
      add: (product, color, size, quantity = 1) => {
        const existing = get().items.find((i) => key(i.productId, i.color, i.size) === key(product.id, color, size));
        if (existing) {
          set({ items: get().items.map((i) => (key(i.productId, i.color, i.size) === key(product.id, color, size) ? { ...i, quantity: i.quantity + quantity } : i)) });
        } else {
          set({
            items: [
              ...get().items,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                image: product.images[0],
                price: product.salePrice ?? product.price,
                color,
                size,
                quantity,
              },
            ],
          });
        }
      },
      remove: (productId, color, size) =>
        set({ items: get().items.filter((i) => key(i.productId, i.color, i.size) !== key(productId, color, size)) }),
      updateQty: (productId, color, size, quantity) =>
        set({
          items: get()
            .items.map((i) => (key(i.productId, i.color, i.size) === key(productId, color, size) ? { ...i, quantity: Math.max(1, quantity) } : i))
            .filter((i) => i.quantity > 0),
        }),
      saveForLater: (productId, color, size) => {
        const item = get().items.find((i) => key(i.productId, i.color, i.size) === key(productId, color, size));
        if (!item) return;
        set({
          items: get().items.filter((i) => key(i.productId, i.color, i.size) !== key(productId, color, size)),
          saved: [...get().saved, item],
        });
      },
      moveToCart: (productId, color, size) => {
        const item = get().saved.find((i) => key(i.productId, i.color, i.size) === key(productId, color, size));
        if (!item) return;
        set({ saved: get().saved.filter((i) => key(i.productId, i.color, i.size) !== key(productId, color, size)), items: [...get().items, item] });
      },
      clear: () => set({ items: [] }),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "atelier-cart" }
  )
);

interface WishlistState {
  ids: string[];
  loaded: boolean;
  loadFromServer: (ids: string[]) => void;
  sync: () => Promise<void>;
  toggle: (id: string) => void;
  has: (id: string) => boolean;
}
export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      loaded: false,
      loadFromServer: (ids) => set({ ids, loaded: true }),
      sync: async () => {
        try {
          const res = await fetch("/api/wishlist", { credentials: "same-origin" });
          if (!res.ok) return;
          const rows = await res.json();
          set({ ids: rows.map((r: any) => r.productId), loaded: true });
        } catch {
          // not authed or network issue; keep local store
        }
      },
      toggle: async (id) => {
        const wasIn = get().ids.includes(id);
        set({ ids: wasIn ? get().ids.filter((x) => x !== id) : [...get().ids, id] });
        // best-effort sync with server when signed in
        try {
          const res = await fetch("/api/auth/me", { credentials: "same-origin" });
          const { user } = await res.json();
          if (!user) return;
          if (wasIn) {
            await fetch(`/api/wishlist/${id}`, { method: "DELETE", credentials: "same-origin" });
          } else {
            await fetch("/api/wishlist", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId: id }), credentials: "same-origin",
            });
          }
        } catch {
          // ignore — UI already reflects local state
        }
      },
      has: (id) => get().ids.includes(id),
    }),
    { name: "atelier-wishlist" }
  )
);
