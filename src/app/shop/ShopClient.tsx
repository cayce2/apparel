"use client";
import { useEffect, useMemo, useState } from "react";
import type { ApiProduct, ApiBrand, ApiCategory } from "@/lib/api/storefront";
import { listProducts, listBrands, listCategories } from "@/lib/api/storefront";
import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/utils";

type Params = { category?: string; filter?: string; sort?: string; q?: string };

const SIZES = ["XS", "S", "M", "L", "XL", "28", "30", "32", "34", "7", "8", "9", "10", "11"];
const COLORS = [
  { name: "Black", hex: "#1a1a1a" }, { name: "White", hex: "#ffffff" }, { name: "Cream", hex: "#e8e1d4" },
  { name: "Charcoal", hex: "#3b3b3b" }, { name: "Indigo", hex: "#2b3a55" }, { name: "Olive", hex: "#5b5a3e" },
  { name: "Tan", hex: "#b38b4f" }, { name: "Grey", hex: "#9ca3af" },
];
const MATERIALS = ["Cotton", "Wool", "Linen", "Leather", "Polyester", "Suede"];

export function ShopClient({ initialParams }: { initialParams: Params }) {
  const [params, setParams] = useState<Params>(initialParams);
  const [price, setPrice] = useState<[number, number]>([0, 400]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [brands, setBrands] = useState<ApiBrand[]>([]);
  const [cats, setCats] = useState<ApiCategory[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sort = params.sort ?? "newest";

  // load catalog dims once
  useEffect(() => {
    Promise.all([listBrands(), listCategories()]).then(([b, c]) => { setBrands(b); setCats(c); }).catch(() => {});
  }, []);

  // load products on filter change
  useEffect(() => {
    setLoading(true); setError(null);
    const qp: Record<string, string | number | undefined> = {
      category: params.category, filter: params.filter, sort, q: params.q,
      minPrice: price[0], maxPrice: price[1], pageSize: 100,
    };
    listProducts(qp)
      .then((items) => {
        let list = items;
        if (selectedBrands.length) list = list.filter((p) => selectedBrands.includes(p.brand ?? ""));
        if (selectedColors.length) list = list.filter((p) => (p.variants ?? []).some((v) => selectedColors.includes(v.color)));
        if (selectedSizes.length) list = list.filter((p) => (p.variants ?? []).some((v) => v.sizes.some((s) => selectedSizes.includes(s.size))));
        if (selectedMaterials.length) list = list.filter((p) => selectedMaterials.includes(p.material ?? ""));
        if (minRating > 0) list = list.filter((p) => (p.rating ?? 0) >= minRating);
        if (inStockOnly) list = list.filter((p) => (p.variants ?? []).some((v) => v.sizes.some((s) => s.stock > 0)));
        setProducts(list); setTotal(list.length); setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [params, sort, price, selectedBrands, selectedColors, selectedSizes, selectedMaterials, minRating, inStockOnly]);

  const toggle = <T,>(arr: T[], v: T): T[] => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div className="container-page mt-10">
      <div className="flex items-end justify-between border-b pb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Shop</p>
          <h1 className="font-display text-4xl">{params.category ? cats.find((c) => c.slug === params.category)?.name ?? "All Products" : "All Products"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Sort by</label>
          <select value={sort} onChange={(e) => setParams((p) => ({ ...p, sort: e.target.value }))} className="h-9 rounded-md border bg-background px-2 text-sm">
            <option value="newest">Newest</option>
            <option value="best-selling">Best Selling</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-8">
          <FilterGroup title="Category">
            {cats.map((c) => (
              <button key={c.id} onClick={() => setParams((p) => ({ ...p, category: p.category === c.slug ? undefined : c.slug }))} className={cn("block py-1 text-sm hover:underline", params.category === c.slug && "font-medium")}>{c.name}</button>
            ))}
          </FilterGroup>
          <FilterGroup title="Price">
            <div className="flex items-center gap-2">
              <input type="number" value={price[0]} onChange={(e) => setPrice([+e.target.value, price[1]])} className="h-9 w-20 rounded-md border px-2 text-sm" />
              <span>-</span>
              <input type="number" value={price[1]} onChange={(e) => setPrice([price[0], +e.target.value])} className="h-9 w-20 rounded-md border px-2 text-sm" />
            </div>
          </FilterGroup>
          <FilterGroup title="Brand">
            {brands.map((b) => (
              <label key={b.id} className="flex items-center gap-2 py-1 text-sm">
                <input type="checkbox" checked={selectedBrands.includes(b.name)} onChange={() => setSelectedBrands(toggle(selectedBrands, b.name))} />
                {b.name}
              </label>
            ))}
          </FilterGroup>
          <FilterGroup title="Color">
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c.name} onClick={() => setSelectedColors(toggle(selectedColors, c.name))} title={c.name} className={cn("h-7 w-7 rounded-full border", selectedColors.includes(c.name) && "ring-2 ring-ring ring-offset-1")} style={{ backgroundColor: c.hex }} />
              ))}
            </div>
          </FilterGroup>
          <FilterGroup title="Size">
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button key={s} onClick={() => setSelectedSizes(toggle(selectedSizes, s))} className={cn("h-9 w-12 rounded-md border text-xs", selectedSizes.includes(s) && "border-primary bg-primary text-primary-foreground")}>{s}</button>
              ))}
            </div>
          </FilterGroup>
          <FilterGroup title="Material">
            {MATERIALS.map((m) => (
              <label key={m} className="flex items-center gap-2 py-1 text-sm">
                <input type="checkbox" checked={selectedMaterials.includes(m)} onChange={() => setSelectedMaterials(toggle(selectedMaterials, m))} />
                {m}
              </label>
            ))}
          </FilterGroup>
          <FilterGroup title="Rating">
            {[0, 3, 4, 4.5].map((r) => (
              <button key={r} onClick={() => setMinRating(r)} className={cn("block py-1 text-sm hover:underline", minRating === r && "font-medium")}>{r === 0 ? "Any" : `${r}+ stars`}</button>
            ))}
          </FilterGroup>
          <FilterGroup title="Availability">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} /> In stock only
            </label>
          </FilterGroup>
        </aside>

        <div>
          <p className="mb-4 text-sm text-muted-foreground">{loading ? "Loading..." : `${total} products`}</p>
          {error ? (
            <div className="rounded-lg border border-destructive p-10 text-center text-destructive">{error}</div>
          ) : products.length === 0 && !loading ? (
            <div className="rounded-lg border p-16 text-center text-muted-foreground">No products match your filters.</div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
              {products.map((p) => <ProductCard key={p.id} product={p as any} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}
