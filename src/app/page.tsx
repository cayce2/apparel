"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { Newsletter } from "@/components/Newsletter";
import { ArrowRight } from "lucide-react";
import { listProducts, listCollections, type ApiProduct, type ApiCollectionSummary } from "@/lib/api/storefront";

export default function Home() {
  const [featured, setFeatured] = useState<ApiProduct[]>([]);
  const [ newArrivals, setNewArrivals] = useState<ApiProduct[]>([]);
  const [trending, setTrending] = useState<ApiProduct[]>([]);
  const [onSale, setOnSale] = useState<ApiProduct[]>([]);
  const [collections, setCollections] = useState<ApiCollectionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      listProducts({ filter: "featured", pageSize: 4 }),
      listProducts({ filter: "new", pageSize: 4 }),
      listProducts({ sort: "popular", pageSize: 4 }),
      listProducts({ filter: "sale", pageSize: 4 }),
      listCollections(),
    ])
      .then(([f, n, t, s, c]) => {
        if (!alive) return;
        setFeatured(f); setNewArrivals(n); setTrending(t); setOnSale(s); setCollections(c); setLoading(false);
      })
      .catch((e) => { if (alive) { setErr(e.message); setLoading(false); } });
    return () => { alive = false; };
  }, []);

  if (loading) return <div className="container-page mt-24 text-center text-muted-foreground">Loading the storefront...</div>;
  if (err) return (
    <div className="container-page mt-24 max-w-xl rounded-lg border p-10 text-center">
      <h1 className="font-display text-2xl">Cannot reach the API</h1>
      <p className="mt-3 text-sm text-muted-foreground">{err}</p>
      <p className="mt-2 text-xs">Has <code>.env.local</code> been configured with Supabase keys? See <code>supabase/README.md</code>.</p>
    </div>
  );

  return (
    <>
      <section className="relative h-[80vh] min-h-[520px] w-full overflow-hidden bg-secondary">
        <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="container-page relative flex h-full flex-col justify-end pb-20 text-white">
          <p className="text-xs uppercase tracking-[0.3em]">Fall / Winter 2026</p>
          <h1 className="mt-4 max-w-xl font-display text-5xl md:text-6xl">Quiet luxury, built to last.</h1>
          <p className="mt-4 max-w-md text-sm text-white/80">Considered pieces in natural fibers, cut for an effortless everyday wardrobe.</p>
          <div className="mt-8 flex gap-3">
            <Link href="/shop" className="btn-primary">Shop the collection <ArrowRight size={16} /></Link>
            <Link href="/shop?filter=sale" className="btn-outline border-white/50 text-white hover:bg-white/10">Shop sale</Link>
          </div>
        </div>
      </section>

      <CollectionsStrip collections={collections} />

      <Section title="Featured" href="/shop" products={featured} />
      <Section title="New Arrivals" href="/shop?filter=new" products={newArrivals} />

      <section className="container-page my-24">
        <div className="grid gap-1 md:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-md">
            <img src="https://images.unsplash.com/photo-1483985988355-7638282ecf3c?auto=format&fit=crop&w=1200&q=80" alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
              <h3 className="font-display text-3xl">The Denim Edit</h3>
              <Link href="/collections/denim-edit" className="mt-3 inline-flex items-center gap-1 text-sm underline">Explore <ArrowRight size={14} /></Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-md">
            <img src="https://images.unsplash.com/photo-1520975916090-788d2cfe7c3b?auto=format&fit=crop&w=1200&q=80" alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
              <h3 className="font-display text-3xl">Winter Essentials</h3>
              <Link href="/collections/winter-essentials" className="mt-3 inline-flex items-center gap-1 text-sm underline">Explore <ArrowRight size={14} /></Link>
            </div>
          </div>
        </div>
      </section>

      <Section title="Trending Now" href="/shop?sort=popular" products={trending} />
      <Section title="On Sale" href="/shop?filter=sale" products={onSale} />

      <ReviewsSection />
      <Newsletter />
    </>
  );
}

function CollectionsStrip({ collections }: { collections: ApiCollectionSummary[] }) {
  if (!collections?.length) return null;
  return (
    <section className="container-page mt-16">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {collections.slice(0, 4).map((c) => (
          <Link key={c.id} href={`/collections/${c.slug}`} className="group rounded-md bg-secondary p-6 text-center transition hover:bg-muted">
            <p className="font-display text-lg">{c.name}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground group-hover:text-foreground">Shop now</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Section({ title, href, products }: { title: string; href: string; products: ApiProduct[] }) {
  if (!products.length) return null;
  return (
    <section className="container-page mt-20">
      <div className="flex items-end justify-between">
        <h2 className="font-display text-3xl">{title}</h2>
        <Link href={href} className="text-sm text-muted-foreground hover:text-foreground">View all</Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
        {products.map((p) => <ProductCard key={p.id} product={p as any} />)}
      </div>
    </section>
  );
}

function ReviewsSection() {
  const reviews = [
    { quote: "The quality is exactly what I hoped for. Pieces feel like an investment.", name: "Amara K." },
    { quote: "Sizing is honest, fabric is heavy, and shipping was fast. Will buy again.", name: "Daniel R." },
    { quote: "Beautifully packaged and the linen shirt has become my most-worn item.", name: "Priya S." },
  ];
  return (
    <section className="container-page my-24">
      <h2 className="text-center font-display text-3xl">What customers say</h2>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {reviews.map((r, i) => (
          <div key={i} className="rounded-lg border bg-card p-8">
            <p className="text-primary">{"★".repeat(5)}</p>
            <p className="mt-4 text-sm leading-relaxed">{r.quote}</p>
            <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">{r.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
