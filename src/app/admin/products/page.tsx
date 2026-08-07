"use client";
import { useState, useRef } from "react";
import { adminProducts, warehouses } from "@/data/account";
import type { AdminProduct } from "@/data/account";
import { Table, PageHeader } from "@/components/admin-ui";
import { Button } from "@/components/ui/primitives";
import { Pencil, Trash2, Plus, Download, Upload, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

const seed = (): AdminProduct[] => adminProducts.map((p) => ({ ...p, variants: p.variants.map((v) => ({ ...v, sizes: v.sizes.map((s) => ({ ...s })) })) }));

const blank = (): AdminProduct => ({
  id: `p${Date.now()}`,
  name: "", slug: "", description: "", materials: "", care: "", shipping: "Free shipping over $75.", returns: "30-day returns.",
  price: 0, salePrice: null, brand: "Atelier", category: "t-shirts", collections: [], tags: [], images: [], rating: 0, reviewCount: 0,
  reviews: [], material: "Cotton", isNew: true, isTrending: false, isOnSale: false, isFeatured: false,
  variants: [{ color: "Black", colorHex: "#1a1a1a", sizes: [{ size: "M", stock: 10 }] }],
  createdAt: new Date().toISOString(),
  sku: "", barcode: "", totalStock: 10, warehouseId: "wh1", cost: 0,
});

export default function ProductsAdmin() {
  const [list, setList] = useState<AdminProduct[]>(seed());
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const filtered = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()));

  const toggleSelect = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map((p) => p.id));

  const remove = (id: string) => { if (confirm("Delete this product?")) setList(list.filter((p) => p.id !== id)); };
  const bulkDelete = () => { if (confirm(`Delete ${selected.length} products?`)) { setList(list.filter((p) => !selected.includes(p.id))); setSelected([]); } };

  const save = (p: AdminProduct) => {
    p.totalStock = p.variants.reduce((s, v) => s + v.sizes.reduce((a, x) => a + x.stock, 0), 0);
    p.slug = p.slug || p.name.toLowerCase().replace(/\s+/g, "-");
    if (list.find((x) => x.id === p.id)) {
      setList(list.map((x) => (x.id === p.id ? p : x)));
    } else {
      setList([p, ...list]);
    }
    setEditing(null); setShowForm(false);
  };

  const exportCsv = () => {
    const header = ["id","name","sku","barcode","brand","category","price","salePrice","cost","totalStock","material"];
    const rows = list.map((p) => [p.id, `"${p.name}"`, p.sku, p.barcode, p.brand, p.category, p.price, p.salePrice ?? "", p.cost, p.totalStock, p.material]);
    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "products.csv"; a.click(); URL.revokeObjectURL(url);
  };

  const importCsv = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result);
      const lines = text.trim().split("\n").slice(1);
      const imported = lines.map((line) => {
        const cols = line.split(",");
        return {
          id: `imp${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: (cols[1] ?? "Imported Product").replace(/"/g, ""),
          sku: cols[2] ?? "IMP-",
          price: Number(cols[6] ?? 0), brand: "Atelier", category: "t-shirts",
        };
      });
      setImportMsg(`Imported ${imported.length} rows (demo - data not persisted).`);
      setList((prev) => [...imported.map((i) => ({ ...blank(), ...i, id: i.id, name: i.name, price: i.price, sku: i.sku })), ...prev]);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Products" subtitle={`${list.length} products`} action={<div className="flex gap-2">
        <Button variant="outline" onClick={() => setBulkOpen((v) => !v)}><Upload size={16} /> Bulk</Button>
        <Button variant="outline" onClick={exportCsv}><Download size={16} /> Export CSV</Button>
        <Button onClick={() => { setEditing(blank()); setShowForm(true); }}><Plus size={16} /> Add product</Button>
      </div>} />

      {bulkOpen && (
        <div className="rounded-lg border bg-secondary/40 p-5">
          <h3 className="font-display text-lg">Bulk upload</h3>
          <p className="mt-1 text-sm text-muted-foreground">Upload a CSV with columns: id, name, sku, barcode, brand, category, price, salePrice, cost, totalStock, material. The first row is treated as a header.</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input ref={fileRef} type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])} className="text-sm" />
            <Button variant="outline" onClick={exportCsv}>Download template</Button>
            {importMsg && <span className="text-sm text-emerald-600">{importMsg}</span>}
          </div>
        </div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or SKU..." className="h-9 w-full rounded-md border pl-9 pr-3 text-sm" />
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-3 rounded-md bg-secondary p-3 text-sm">
          <span>{selected.length} selected</span>
          <Button variant="outline" onClick={bulkDelete}><Trash2 size={14} /> Delete selected</Button>
          <Button variant="outline" onClick={() => setSelected([])}>Clear</Button>
        </div>
      )}

      <Table headers={["", "Product", "SKU", "Brand", "Category", "Price", "Stock", "Status", ""]}>
        {filtered.map((p) => (
          <tr key={p.id} className={cn(selected.includes(p.id) && "bg-secondary/40")}>
            <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} /></td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                {p.images[0] ? <img src={p.images[0]} alt="" className="h-10 w-8 rounded object-cover" /> : <div className="h-10 w-8 rounded bg-secondary" />}
                <span className="font-medium">{p.name || <span className="text-muted-foreground">Untitled</span>}</span>
              </div>
            </td>
            <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
            <td className="px-4 py-3">{p.brand}</td>
            <td className="px-4 py-3 capitalize">{p.category}</td>
            <td className="px-4 py-3">{formatPrice(p.price)}</td>
            <td className="px-4 py-3">
              <span className={cn(p.totalStock < 30 ? "text-amber-600 font-medium" : "")}>{p.totalStock}</span>
            </td>
            <td className="px-4 py-3 flex gap-1">
              {p.isFeatured && <Tag>Featured</Tag>}
              {p.isOnSale && <Tag tone="amber">Sale</Tag>}
              {p.isNew && <Tag tone="blue">New</Tag>}
              {!p.isFeatured && !p.isOnSale && !p.isNew && <span className="text-muted-foreground">-</span>}
            </td>
            <td className="px-4 py-3 text-right">
              <div className="flex justify-end gap-2">
                <button onClick={() => { setEditing(p); setShowForm(true); }} aria-label="Edit"><Pencil size={16} /></button>
                <button onClick={() => remove(p.id)} aria-label="Delete" className="text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
              </div>
            </td>
          </tr>
        ))}
      </Table>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} /> Select all
      </div>

      {showForm && editing && <ProductForm initial={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSave={save} />}
    </div>
  );
}

function Tag({ children, tone }: { children: React.ReactNode; tone?: "amber" | "blue" }) {
  const cls = tone === "amber" ? "bg-amber-100 text-amber-800" : tone === "blue" ? "bg-blue-100 text-blue-800" : "bg-secondary";
  return <span className={cn("rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider", cls)}>{children}</span>;
}

function ProductForm({ initial, onClose, onSave }: { initial: AdminProduct; onClose: () => void; onSave: (p: AdminProduct) => void }) {
  const [p, setP] = useState<AdminProduct>(initial);
  const set = (k: keyof AdminProduct, v: unknown) => setP((prev) => ({ ...prev, [k]: v }));

  const addVariant = () => set("variants", [...p.variants, { color: "White", colorHex: "#ffffff", sizes: [{ size: "M", stock: 10 }] }]);
  const removeVariant = (i: number) => set("variants", p.variants.filter((_, idx) => idx !== i));
  const updateVariant = (i: number, patch: Partial<typeof p.variants[0]>) => set("variants", p.variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  const addSize = (vi: number) => updateVariant(vi, { sizes: [...p.variants[vi].sizes, { size: "M", stock: 10 }] });
  const updateSize = (vi: number, si: number, patch: Partial<{ size: string; stock: number }>) => updateVariant(vi, { sizes: p.variants[vi].sizes.map((s, idx) => (idx === si ? { ...s, ...patch } : s)) });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-10">
      <div className="w-full max-w-3xl rounded-lg bg-background p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="font-display text-xl">{initial.name ? "Edit product" : "New product"}</h2>
          <button onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="mt-5 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <L label="Name" full><input value={p.name} onChange={(e) => set("name", e.target.value)} className="input" /></L>
            <L label="Brand"><input value={p.brand} onChange={(e) => set("brand", e.target.value)} className="input" /></L>
            <L label="Category"><input value={p.category} onChange={(e) => set("category", e.target.value)} className="input" /></L>
            <L label="Price"><input type="number" value={p.price} onChange={(e) => set("price", +e.target.value)} className="input" /></L>
            <L label="Sale price (optional)"><input type="number" value={p.salePrice ?? ""} onChange={(e) => set("salePrice", e.target.value ? +e.target.value : null)} className="input" /></L>
            <L label="SKU"><input value={p.sku} onChange={(e) => set("sku", e.target.value)} className="input" /></L>
            <L label="Barcode"><input value={p.barcode} onChange={(e) => set("barcode", e.target.value)} className="input" /></L>
            <L label="Material"><input value={p.material} onChange={(e) => set("material", e.target.value)} className="input" /></L>
            <L label="Warehouse">
              <select value={p.warehouseId} onChange={(e) => set("warehouseId", e.target.value)} className="input">
                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </L>
            <L label="Cost"><input type="number" value={p.cost} onChange={(e) => set("cost", +e.target.value)} className="input" /></L>
          </div>

          <L label="Description" full><textarea value={p.description} onChange={(e) => set("description", e.target.value)} className="input min-h-24" /></L>
          <L label="Image URL (comma separated)" full>
            <input value={p.images.join(",")} onChange={(e) => set("images", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} className="input" />
          </L>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.isNew} onChange={(e) => set("isNew", e.target.checked)} /> New arrival</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.isTrending} onChange={(e) => set("isTrending", e.target.checked)} /> Trending</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.isOnSale} onChange={(e) => set("isOnSale", e.target.checked)} /> On sale</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} /> Featured</label>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Variants</h3>
              <Button variant="outline" onClick={addVariant}><Plus size={14} /> Add variant</Button>
            </div>
            <div className="mt-3 space-y-3">
              {p.variants.map((v, vi) => (
                <div key={vi} className="rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <input value={v.color} onChange={(e) => updateVariant(vi, { color: e.target.value })} placeholder="Color" className="input h-9 flex-1" />
                    <input value={v.colorHex} onChange={(e) => updateVariant(vi, { colorHex: e.target.value })} placeholder="Hex" className="input h-9 w-24" />
                    <button onClick={() => removeVariant(vi)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {v.sizes.map((s, si) => (
                      <div key={si} className="flex items-center gap-2">
                        <input value={s.size} onChange={(e) => updateSize(vi, si, { size: e.target.value })} placeholder="Size" className="input h-9 w-24" />
                        <input type="number" value={s.stock} onChange={(e) => updateSize(vi, si, { stock: +e.target.value })} placeholder="Stock" className="input h-9 w-32" />
                        <button onClick={() => updateVariant(vi, { sizes: v.sizes.filter((_, idx) => idx !== si) })} className="text-muted-foreground hover:text-destructive"><X size={14} /></button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={() => addSize(vi)}><Plus size={14} /> Add size</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(p)}>Save product</Button>
        </div>
      </div>
    </div>
  );
}

function L({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={full ? "block md:col-span-2" : "block"}>
      <span className="label">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
