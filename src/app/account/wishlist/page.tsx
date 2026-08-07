"use client";
import { useEffect, useState } from "react";
import { useWishlist } from "@/store/cart";
import { getProductsByIds, type ApiProduct } from "@/lib/api/storefront";
import { ProductCard } from "@/components/ProductCard";
import { PageHeader } from "@/components/admin-ui";

export default function AccountWishlist() {
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
    <div className="space-y-6">
      <PageHeader title="Wishlist" subtitle={`${products.length} saved item(s)`} />
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : products.length === 0 ? (
        <div className="rounded-lg border p-12 text-center text-muted-foreground">You have no saved items yet.</div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
