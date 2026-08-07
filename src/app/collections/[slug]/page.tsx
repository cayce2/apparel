"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCollection, type ApiCollection } from "@/lib/api/storefront";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";

export default function CollectionPage() {
  const params = useParams<{ slug: string }>();
  const [collection, setCollection] = useState<ApiCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getCollection(params.slug)
      .then((c) => { if (alive) { setCollection(c); setLoading(false); } })
      .catch((e) => { if (alive) { setErr(e.message); setLoading(false); } });
    return () => { alive = false; };
  }, [params.slug]);

  if (loading) return <div className="container-page mt-24 text-center text-muted-foreground">Loading collection...</div>;
  if (err || !collection) return (
    <div className="container-page mt-24 text-center">
      <h1 className="font-display text-4xl">Collection not found</h1>
      <Link href="/" className="btn-primary mt-6">Home</Link>
    </div>
  );

  return (
    <div className="container-page mt-10">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Collection</p>
      <h1 className="mt-2 font-display text-5xl">{collection.name}</h1>
      {!collection.products?.length ? (
        <p className="mt-6 text-muted-foreground">No products in this collection yet.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {collection.products.map((p) => <ProductCard key={p.id} product={p as any} />)}
        </div>
      )}
    </div>
  );
}
