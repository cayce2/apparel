"use client";
import { reportsData, adminProducts } from "@/data/account";
import { PageHeader, Table, StatCard } from "@/components/admin-ui";
import { BarChart, LineChart } from "@/components/Charts";
import { formatPrice } from "@/lib/utils";

export default function ReportsAdmin() {
  const totalRevenue = reportsData.salesByMonth.reduce((s, m) => s + m.revenue, 0);
  const totalOrders = reportsData.salesByMonth.reduce((s, m) => s + m.orders, 0);
  const profit = reportsData.profitByMonth[reportsData.profitByMonth.length - 1].profit;
  const margin = (profit / reportsData.salesByMonth[reportsData.salesByMonth.length - 1].revenue) * 100;

  return (
    <div className="space-y-8">
      <PageHeader title="Reports" subtitle="Last 7 months" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="7-month revenue" value={formatPrice(totalRevenue)} sub={`${totalOrders} orders`} />
        <StatCard label="Inventory value" value={formatPrice(adminProducts.reduce((s, p) => s + p.totalStock * p.cost, 0))} />
        <StatCard label="New customers (Jul)" value={String(reportsData.customersByMonth[reportsData.customersByMonth.length - 1].new)} />
        <StatCard label="Net profit (Jul)" value={formatPrice(profit)} sub={`${margin.toFixed(1)}% margin`} />
      </div>

      <div className="rounded-lg border bg-card p-5">
        <h2 className="font-display text-lg">Sales by month</h2>
        <div className="mt-4"><LineChart points={reportsData.salesByMonth.map((m) => m.revenue)} /></div>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          {reportsData.salesByMonth.map((m) => <span key={m.month}>{m.month}</span>)}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <h2 className="font-display text-lg">Orders by month</h2>
          <div className="mt-4"><BarChart data={reportsData.salesByMonth.map((m) => ({ label: m.month, value: m.orders }))} /></div>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <h2 className="font-display text-lg">Customers (new vs returning)</h2>
          <div className="mt-4"><BarChart data={reportsData.customersByMonth.map((m) => ({ label: m.month, value: m.new + m.returning }))} /></div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-5">
        <h2 className="font-display text-lg">Traffic sources</h2>
        <div className="mt-4"><BarChart data={reportsData.trafficSources.map((t) => ({ label: t.source.slice(0, 3), value: t.visitors }))} /></div>
        <div className="mt-3 flex flex-wrap justify-end gap-4 text-xs text-muted-foreground">
          {reportsData.trafficSources.map((t) => <span key={t.source}>{t.source}: {t.visitors.toLocaleString()}</span>)}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-5">
        <h2 className="font-display text-lg">Profit trend</h2>
        <div className="mt-4"><LineChart points={reportsData.profitByMonth.map((m) => m.profit)} /></div>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          {reportsData.profitByMonth.map((m) => <span key={m.month}>{m.month}</span>)}
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl">Top selling products</h2>
        <div className="mt-3">
          <Table headers={["Product", "Units", "Revenue"]}>
            {[
              { name: "Selvedge Straight Jeans", units: 142, revenue: 26696 },
              { name: "Court Leather Sneaker", units: 98, revenue: 17444 },
              { name: "Oversized Wool Sweater", units: 84, revenue: 10836 },
              { name: "Tailored Linen Shirt", units: 76, revenue: 7448 },
            ].map((p, i) => (
              <tr key={i}>
                <td className="px-4 py-3"><span className="mr-2 text-muted-foreground">#{i + 1}</span>{p.name}</td>
                <td className="px-4 py-3">{p.units}</td>
                <td className="px-4 py-3 font-medium">{formatPrice(p.revenue)}</td>
              </tr>
            ))}
          </Table>
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl">Tax summary (estimated)</h2>
        <div className="mt-3">
          <Table headers={["Month", "Revenue", "Est. tax (8%)"]}>
            {reportsData.salesByMonth.map((m) => (
              <tr key={m.month}>
                <td className="px-4 py-3">{m.month}</td>
                <td className="px-4 py-3">{formatPrice(m.revenue)}</td>
                <td className="px-4 py-3 font-medium">{formatPrice(m.revenue * 0.08)}</td>
              </tr>
            ))}
          </Table>
        </div>
      </div>
    </div>
  );
}
