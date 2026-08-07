"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useWishlist } from "@/store/cart";
import { getProductsByIds, type ApiProduct } from "@/lib/api/storefront";
import { ProductCard } from "@/components/ProductCard";

export default function WishlistPage() {
  const ids = useWishlist((s) => s.ids);
  const loaded = useWishlist((s) => s.loaded);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loaded) return;
    setLoading(true);
    getProductsByIds(ids).then((p) => { setProducts(p); setLoading(false); });
  }, [ids, loaded]);

  return (
    <div className="container-page mt-10">
      <h1 className="font-display text-4xl">Wishlist</h1>
      {loading ? (
        <p className="mt-12 text-muted-foreground">Loading...</p>
      ) : products.length === 0 ? (
        <div className="mt-12 rounded-lg border p-16 text-center">
          <p className="text-muted-foreground">You have no saved items.</p>
          <Link href="/shop" className="btn-primary mt-6">Browse products</Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
