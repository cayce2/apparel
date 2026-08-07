"use client";
import { useEffect, useState } from "react";
import { listProducts, type ApiProduct } from "@/lib/api/storefront";
import { ProductCard } from "@/components/ProductCard";

const recentKey = "atelier-recent-searches";
const suggestionSeeds = ["sweater", "linen", "denim", "sneaker", "hoodie", "jacket"];

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try { const r = JSON.parse(localStorage.getItem(recentKey) ?? "[]"); if (Array.isArray(r)) setRecent(r); } catch {}
  }, []);

  useEffect(() => {
    if (!q.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    const t = setTimeout(() => {
      listProducts({ q, pageSize: 50 })
        .then((items) => { setResults(items); setLoading(false); })
        .catch(() => { setResults([]); setLoading(false); });
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const runSearch = (term: string) => {
    setQ(term);
    if (!term.trim()) return;
    const next = [term, ...recent.filter((r) => r !== term)].slice(0, 6);
    setRecent(next);
    try { localStorage.setItem(recentKey, JSON.stringify(next)); } catch {}
  };

  const suggestions = q ? suggestionSeeds.filter((s) => s.startsWith(q.toLowerCase())) : [];

  return (
    <div className="container-page mt-10">
      <h1 className="font-display text-4xl">Search</h1>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") runSearch(q); }}
        placeholder="Search products, brands, or keywords..."
        className="input mt-6"
        autoFocus
      />

      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {suggestions.map((s) => <button key={s} onClick={() => runSearch(s)} className="chip">{s}</button>)}
        </div>
      )}

      {recent.length > 0 && !q && (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Recent searches</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {recent.map((r) => <button key={r} onClick={() => runSearch(r)} className="chip">{r}</button>)}
          </div>
        </div>
      )}

      {q && loading && <p className="mt-6 text-muted-foreground">Searching...</p>}
      {q && !loading && results.length === 0 && <p className="mt-6 text-muted-foreground">No results for &lsquo;{q}&rsquo;.</p>}
      {results.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {results.map((p) => <ProductCard key={p.id} product={p as any} />)}
        </div>
      )}
    </div>
  );
}
