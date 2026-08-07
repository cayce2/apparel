"use client";
import Link from "next/link";
import { adminDashboardStats, reportsData } from "@/data/account";
import { StatCard, PageHeader, Table } from "@/components/admin-ui";
import { BarChart, LineChart } from "@/components/Charts";
import { Button } from "@/components/ui/primitives";
import { StatusPill } from "@/components/admin-ui";
import { formatPrice } from "@/lib/utils";
import { AlertTriangle, ArrowUpRight } from "lucide-react";

export default function AdminDashboard() {
  const s = adminDashboardStats;
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Last 30 days overview" action={<div className="text-sm text-muted-foreground">Updated just now</div>} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue (month)" value={formatPrice(s.revenue.month)} sub={<span className="inline-flex items-center gap-1 text-emerald-600"><ArrowUpRight size={12} />+{s.revenue.change}% vs prev</span>} />
        <StatCard label="Orders (month)" value={String(s.orders.month)} sub={`${s.orders.pending} pending`} />
        <StatCard label="Visitors (month)" value={s.visitors.month.toLocaleString()} sub={`+${Math.round((s.visitors.month / s.visitors.prevMonth - 1) * 100)}% vs prev`} />
        <StatCard label="Conversion rate" value={`${s.conversionRate}%`} sub="Add to cart + visits/orders" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">Revenue this month</h2>
            <span className="text-sm text-muted-foreground">7-month trend</span>
          </div>
          <div className="mt-4">
            <LineChart points={reportsData.salesByMonth.map((m) => m.revenue)} />
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              {reportsData.salesByMonth.map((m) => <span key={m.month}>{m.month}</span>)}
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h2 className="font-display text-lg">Traffic sources</h2>
          <div className="mt-4">
            <BarChart data={reportsData.trafficSources.map((t) => ({ label: t.source.slice(0, 3), value: t.visitors }))} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-display text-lg">Top products</h2>
            <Link href="/admin/reports" className="text-sm text-muted-foreground hover:text-foreground">Reports</Link>
          </div>
          <Table headers={["Product", "Units sold", "Revenue"]}>
            {s.topProducts.map((p, i) => (
              <tr key={p.id}>
                <td className="px-4 py-3"><span className="mr-2 text-muted-foreground">#{i + 1}</span>{p.name}</td>
                <td className="px-4 py-3">{p.units}</td>
                <td className="px-4 py-3 font-medium">{formatPrice(p.revenue)}</td>
              </tr>
            ))}
          </Table>
        </div>

        <div className="rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-display text-lg flex items-center gap-2"><AlertTriangle size={18} /> Inventory alerts</h2>
            <Link href="/admin/inventory" className="text-sm text-muted-foreground hover:text-foreground">Manage</Link>
          </div>
          {s.inventoryAlerts.length === 0 ? (
            <div className="p-5 text-sm text-muted-foreground">No low-stock products.</div>
          ) : (
            <ul className="divide-y">
              {s.inventoryAlerts.map((p) => (
                <li key={p.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.sku} - {p.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-amber-600">{p.totalStock} units</p>
                    <p className="text-xs text-muted-foreground">Below threshold</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-display text-lg">Recent orders</h2>
          <Link href="/admin/orders"><Button variant="outline">View all</Button></Link>
        </div>
        <Table headers={["Order", "Date", "Status", "Items", "Total", ""]}>
          {s.recentOrders.slice(0, 5).map((o) => (
            <tr key={o.id}>
              <td className="px-4 py-3 font-mono text-xs">{o.number}</td>
              <td className="px-4 py-3 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-3"><StatusPill status={o.status} /></td>
              <td className="px-4 py-3">{o.items.length}</td>
              <td className="px-4 py-3 font-medium">{formatPrice(o.total)}</td>
              <td className="px-4 py-3 text-right"><Link href={`/admin/orders/${o.id}`} className="text-sm underline">Open</Link></td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
}
