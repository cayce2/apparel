"use client";
import { adminProducts, warehouses, inventoryAdjustments } from "@/data/account";
import { StatCard, Table, PageHeader } from "@/components/admin-ui";
import { formatPrice } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export default function InventoryAdmin() {
  const low = adminProducts.filter((p) => p.totalStock > 0 && p.totalStock < 30);
  const out = adminProducts.filter((p) => p.totalStock === 0);
  const inventoryValue = adminProducts.reduce((s, p) => s + p.totalStock * p.cost, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory" subtitle={`${warehouses.length} warehouses`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Inventory value" value={formatPrice(inventoryValue)} sub="at cost" />
        <StatCard label="SKUs" value={String(adminProducts.length)} />
        <StatCard label="Low stock" value={String(low.length)} sub="< 30 units" />
        <StatCard label="Out of stock" value={String(out.length)} />
      </div>

      {low.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
          <div className="flex items-center gap-2 font-medium text-amber-800"><AlertTriangle size={16} /> Low stock alerts</div>
          <ul className="mt-2 space-y-1 text-sm text-amber-800">
            {low.map((p) => <li key={p.id}>{p.name} ({p.sku}) - {p.totalStock} units left</li>)}
          </ul>
        </div>
      )}

      <h2 className="font-display text-xl">Stock by product</h2>
      <Table headers={["Product", "SKU", "Total stock", "Warehouse", "Unit cost", "Stock value"]}>
        {adminProducts.map((p) => {
          const wh = warehouses.find((w) => w.id === p.warehouseId);
          return (
            <tr key={p.id}>
              <td className="px-4 py-3 font-medium">{p.name}</td>
              <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
              <td className="px-4 py-3">{p.totalStock} units</td>
              <td className="px-4 py-3 text-muted-foreground">{wh?.name ?? "-"}</td>
              <td className="px-4 py-3">{formatPrice(p.cost)}</td>
              <td className="px-4 py-3 font-medium">{formatPrice(p.totalStock * p.cost)}</td>
            </tr>
          );
        })}
      </Table>

      <h2 className="font-display text-xl">Inventory adjustments</h2>
      <Table headers={["Date", "Product", "Warehouse", "Delta", "Reason"]}>
        {inventoryAdjustments.map((a) => (
          <tr key={a.id}>
            <td className="px-4 py-3 text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</td>
            <td className="px-4 py-3">{a.productName}</td>
            <td className="px-4 py-3 text-muted-foreground">{warehouses.find((w) => w.id === a.warehouseId)?.name ?? "-"}</td>
            <td className={`px-4 py-3 font-medium ${a.delta > 0 ? "text-emerald-600" : "text-rose-600"}`}>{a.delta > 0 ? `+${a.delta}` : a.delta}</td>
            <td className="px-4 py-3">{a.reason}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
