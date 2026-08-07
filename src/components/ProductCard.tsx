"use client";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";
import { formatPrice, useHydrated } from "@/lib/utils";
import { useWishlist, useCart } from "@/store/cart";
import { wishlistToggle } from "@/lib/api/storefront";
import type { ApiProduct } from "@/lib/api/storefront";

interface CardProduct {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  brandName?: string;
  price: number;
  salePrice?: number | null;
  sale_price?: number | null;
  images: string[];
  isNew?: boolean; is_new?: boolean;
  isOnSale?: boolean; is_on_sale?: boolean;
  isFeatured?: boolean; is_featured?: boolean;
  variants?: { color: string; colorHex?: string; color_hex?: string; sizes: { size: string; stock: number }[] }[];
}

export function ProductCard({ product }: { product: CardProduct | ApiProduct }) {
  const toggle = useWishlist((s) => s.toggle);
  const liked = useWishlist((s) => s.has(product.id));
  const add = useCart((s) => s.add);
  const hydrated = useHydrated();

  const salePrice = (product as any).salePrice ?? (product as any).sale_price ?? null;
  const isNew = (product as any).isNew ?? (product as any).is_new;
  const isOnSale = (product as any).isOnSale ?? (product as any).is_on_sale;
  const brand = (product as any).brand ?? (product as any).brandName ?? "";
  const variant = product.variants?.[0];

  const onAdd = () => {
    if (!variant || !variant.sizes.length) return;
    add(product as any, variant.color, variant.sizes[0].size);
  };

  const onWishlist = () => {
    toggle(product.id);
    if (typeof window !== "undefined") {
      void wishlistToggle(product.id, !liked).catch(() => {});
    }
  };

  return (
    <div className="group relative">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-secondary">
          {product.images?.[0] ? (
            <Image src={product.images[0]} alt={product.name} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No image</div>
          )}
          {isOnSale && <span className="absolute left-3 top-3 bg-primary px-2 py-1 text-[10px] uppercase tracking-wider text-primary-foreground">Sale</span>}
          {isNew && !isOnSale && <span className="absolute left-3 top-3 bg-background px-2 py-1 text-[10px] uppercase tracking-wider">New</span>}
        </div>
      </Link>
      <button
        onClick={onWishlist}
        className="absolute right-3 top-3 rounded-full bg-background/80 p-2 backdrop-blur transition hover:bg-background"
        aria-label="Toggle wishlist"
      >
        <Heart size={16} className={hydrated && liked ? "fill-primary text-primary" : "text-foreground"} />
      </button>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{brand}</p>
          <Link href={`/product/${product.slug}`} className="text-sm hover:underline">{product.name}</Link>
          <p className="mt-1 text-sm">
            {salePrice ? (
              <><span className="text-destructive">{formatPrice(salePrice)}</span><span className="ml-2 text-muted-foreground line-through">{formatPrice(product.price)}</span></>
            ) : (
              <span>{formatPrice(product.price)}</span>
            )}
          </p>
        </div>
        <button
          onClick={onAdd}
          disabled={!variant}
          className="rounded-md border p-2 opacity-0 transition group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground disabled:opacity-0"
          aria-label="Add to cart"
        >
          <ShoppingCart size={16} />
        </button>
      </div>
    </div>
  );
}
