"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { getProduct, listProducts, type ApiProduct } from "@/lib/api/storefront";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/primitives";
import { parseApiError } from "@/lib/api/client";
import { useCart, useWishlist } from "@/store/cart";
import { formatPrice, cn } from "@/lib/utils";
import { Heart, Minus, Plus, Truck, RotateCcw, Shield, Share2 } from "lucide-react";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [related, setRelated] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [activeImage, setActiveImage] = useState(0);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"details" | "care" | "shipping" | "returns" | "reviews">("details");

  const add = useCart((s) => s.add);
  const toggle = useWishlist((s) => s.toggle);
  const liked = useWishlist((s) => s.has(product?.id ?? ""));

  useEffect(() => {
    let alive = true;
    setLoading(true); setErr(null);
    getProduct(params.slug)
      .then((p) => {
        if (!alive) return;
        setProduct(p);
        setColor(p.variants?.[0]?.color ?? "");
        setActiveImage(0);
        setSize("");
        setLoading(false);
        listProducts({ category: p.category, pageSize: 10 })
          .then((items) => { if (alive) setRelated(items.filter((x) => x.id !== p.id).slice(0, 4)); })
          .catch(() => {});
      })
      .catch((e) => { if (alive) { setErr(parseApiError(e)); setLoading(false); } });
    return () => { alive = false; };
  }, [params.slug]);

  if (loading) return <div className="container-page mt-24 text-center text-muted-foreground">Loading product...</div>;
  if (err) return <div className="container-page mt-24 rounded-lg border p-10 text-center text-destructive">{err}</div>;
  if (!product) return notFound();

  const variant = product.variants?.find((v) => v.color === color) ?? product.variants?.[0];
  const sizeObj = variant?.sizes.find((s) => s.size === size);
  const outOfStock = sizeObj ? sizeObj.stock <= 0 : false;
  const relatedProducts = related;

  const handleAdd = () => {
    if (!size) { alert("Please select a size"); return; }
    add(product as any, color, size, qty);
  };

  const reviews = product.reviews ?? [];
  const reviewCount = product.reviewCount ?? reviews.length;

  return (
    <div className="container-page mt-10">
      <nav className="text-xs text-muted-foreground">{product.brand} / {product.category} / {product.name}</nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col-reverse gap-4 md:flex-row">
          <div className="flex gap-3 md:flex-col">
            {product.images.map((img, i) => (
              <button key={i} onClick={() => setActiveImage(i)} className={cn("relative h-20 w-16 overflow-hidden rounded-md border", activeImage === i && "border-primary")}>
                <Image src={img} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
          <div className="relative aspect-[3/4] flex-1 overflow-hidden rounded-md bg-secondary">
            <Image src={product.images[activeImage]} alt={product.name} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>

        <div className="lg:py-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{product.brand}</p>
          <h1 className="mt-2 font-display text-3xl">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-primary">{"★".repeat(Math.round(product.rating ?? 0))}</span>
            <span className="text-sm text-muted-foreground">{product.rating} ({reviewCount} reviews)</span>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            {product.salePrice ? (
              <>
                <span className="text-2xl text-destructive">{formatPrice(product.salePrice)}</span>
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.price)}</span>
                <span className="rounded-full border border-destructive px-2 py-0.5 text-[10px] uppercase tracking-wider text-destructive">Sale</span>
              </>
            ) : (
              <span className="text-2xl">{formatPrice(product.price)}</span>
            )}
          </div>

          <div className="mt-8">
            <p className="text-sm font-medium">Color: <span className="text-muted-foreground">{color}</span></p>
            <div className="mt-3 flex gap-2">
              {(product.variants ?? []).map((v) => (
                <button key={v.color} onClick={() => { setColor(v.color); setSize(""); }} title={v.color} className={cn("h-9 w-9 rounded-full border", color === v.color && "ring-2 ring-ring ring-offset-1")} style={{ backgroundColor: v.colorHex }} />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium">Size: {size && <span className="text-muted-foreground">{size}</span>}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(variant?.sizes ?? []).map((s) => (
                <button key={s.size} onClick={() => setSize(s.size)} disabled={s.stock <= 0} className={cn("h-12 w-14 rounded-md border text-sm", size === s.size && "border-primary bg-primary text-primary-foreground", s.stock <= 0 && "cursor-not-allowed border-muted text-muted-foreground line-through")}>
                  {s.size}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{sizeObj && sizeObj.stock > 0 ? `${sizeObj.stock} in stock` : "Select a size"}</p>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-3"><Minus size={16} /></button>
              <span className="w-12 text-center text-sm">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="px-3 py-3"><Plus size={16} /></button>
            </div>
            <Button onClick={handleAdd} disabled={outOfStock} className="flex-1">Add to Cart - {formatPrice((product.salePrice ?? product.price) * qty)}</Button>
            <button onClick={() => toggle(product.id)} className="rounded-md border p-3 hover:bg-secondary" aria-label="Wishlist">
              <Heart size={18} className={liked ? "fill-primary text-primary" : ""} />
            </button>
            <button className="rounded-md border p-3 hover:bg-secondary" aria-label="Share"><Share2 size={18} /></button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 border-y py-6 text-xs text-muted-foreground">
            <div className="flex flex-col items-center gap-1"><Truck size={18} /> Free over $75</div>
            <div className="flex flex-col items-center gap-1"><RotateCcw size={18} /> 30-day returns</div>
            <div className="flex flex-col items-center gap-1"><Shield size={18} /> Secure checkout</div>
          </div>

          <div className="mt-6">
            <div className="flex gap-6 border-b">
              {(["details", "care", "shipping", "returns", "reviews"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={cn("py-3 text-sm capitalize", tab === t ? "border-b-2 border-primary font-medium" : "text-muted-foreground")}>
                  {t === "reviews" ? `Reviews (${reviewCount})` : t}
                </button>
              ))}
            </div>
            <div className="py-6 text-sm leading-relaxed text-muted-foreground">
              {tab === "details" && <p>{product.description}<br /><br /><strong>Materials:</strong> {product.materials}</p>}
              {tab === "care" && <p>{product.care}</p>}
              {tab === "shipping" && <p>{product.shipping}</p>}
              {tab === "returns" && <p>{product.returns}</p>}
              {tab === "reviews" && (
                <div className="space-y-4">
                  {reviews.length === 0 ? <p>No reviews yet.</p> : reviews.map((r) => (
                    <div key={r.id} className="border-b pb-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground">{r.author}</p>
                        <span className="text-primary">{"★".repeat(r.rating)}</span>
                      </div>
                      <p className="mt-1 font-medium text-foreground">{r.title}</p>
                      <p className="mt-1">{r.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-24">
          <h2 className="font-display text-3xl">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {relatedProducts.map((p) => <ProductCard key={p.id} product={p as any} />)}
          </div>
        </section>
      )}
    </div>
  );
}
