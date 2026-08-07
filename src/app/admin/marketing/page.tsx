"use client";
import { coupons, flashSales, bundles, giftCards, affiliates, emailCampaigns } from "@/data/account";
import { Table, PageHeader, StatCard } from "@/components/admin-ui";
import { Button } from "@/components/ui/primitives";
import { formatPrice } from "@/lib/utils";
import { Plus } from "lucide-react";

export default function MarketingAdmin() {
  return (
    <div className="space-y-10">
      <PageHeader title="Marketing" subtitle="Discounts, campaigns, and partnerships" action={<Button><Plus size={16} /> New campaign</Button>} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active coupons" value={String(coupons.filter((c) => c.active).length)} />
        <StatCard label="Active flash sales" value={String(flashSales.filter((f) => f.active).length)} />
        <StatCard label="Gift cards issued" value={String(giftCards.length)} />
        <StatCard label="Affiliate revenue" value={formatPrice(affiliates.reduce((s, a) => s + a.earnings, 0))} />
      </div>

      <Section title="Discount codes" action={<Button variant="outline"><Plus size={14} /> New coupon</Button>}>
        <Table headers={["Code", "Type", "Value", "Uses", "Expires", "Status", ""]}>
          {coupons.map((c) => (
            <tr key={c.id}>
              <td className="px-4 py-3 font-mono">{c.code}</td>
              <td className="px-4 py-3 capitalize">{c.type}</td>
              <td className="px-4 py-3">{c.type === "shipping" ? "Free shipping" : c.type === "percent" ? `${c.value}%` : formatPrice(c.value)}</td>
              <td className="px-4 py-3">{c.uses}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
              <td className="px-4 py-3 text-muted-foreground">{new Date(c.expiresAt).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <span className={c.active ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800" : "rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700"}>{c.active ? "Active" : "Paused"}</span>
              </td>
              <td className="px-4 py-3 text-right"><Button variant="outline">Edit</Button></td>
            </tr>
          ))}
        </Table>
      </Section>

      <Section title="Flash sales" action={<Button variant="outline"><Plus size={14} /> New flash sale</Button>}>
        <Table headers={["Name", "Product", "Discount", "Window", "Status"]}>
          {flashSales.map((f) => (
            <tr key={f.id}>
              <td className="px-4 py-3 font-medium">{f.name}</td>
              <td className="px-4 py-3">{f.productId}</td>
              <td className="px-4 py-3">{f.discount}% off</td>
              <td className="px-4 py-3 text-muted-foreground">{new Date(f.startAt).toLocaleDateString()} - {new Date(f.endAt).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <span className={f.active ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800" : "rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700"}>{f.active ? "Live" : "Scheduled"}</span>
              </td>
            </tr>
          ))}
        </Table>
      </Section>

      <Section title="Bundles, upsells & cross-sells" action={<Button variant="outline"><Plus size={14} /> New bundle</Button>}>
        <Table headers={["Bundle", "Products", "Price", "Status"]}>
          {bundles.map((b) => (
            <tr key={b.id}>
              <td className="px-4 py-3 font-medium">{b.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{b.productIds.join(", ")}</td>
              <td className="px-4 py-3 font-medium">{formatPrice(b.price)}</td>
              <td className="px-4 py-3">{b.active ? "Active" : "Off"}</td>
            </tr>
          ))}
        </Table>
        <p className="mt-3 text-sm text-muted-foreground">Tip: configure &lsquo;Complete the Look&rsquo; suggestions and &lsquo;Frequently bought together&rsquo; cross-sells per product (per-product admin).</p>
      </Section>

      <Section title="Email campaigns">
        <Table headers={["Campaign", "Sent", "Opens", "Clicks", "Revenue"]}>
          {emailCampaigns.map((e) => (
            <tr key={e.id}>
              <td className="px-4 py-3 font-medium">{e.name}</td>
              <td className="px-4 py-3">{e.sent.toLocaleString()}</td>
              <td className="px-4 py-3">{e.opens.toLocaleString()} ({Math.round(e.opens / e.sent * 100)}%)</td>
              <td className="px-4 py-3">{e.clicks.toLocaleString()}</td>
              <td className="px-4 py-3 font-medium">{formatPrice(e.revenue)}</td>
            </tr>
          ))}
        </Table>
      </Section>

      <Section title="Gift cards">
        <Table headers={["Code", "Balance", "Initial value", "Status"]}>
          {giftCards.map((g) => (
            <tr key={g.id}>
              <td className="px-4 py-3 font-mono">{g.code}</td>
              <td className="px-4 py-3 font-medium">{formatPrice(g.balance)}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatPrice(g.initial)}</td>
              <td className="px-4 py-3 capitalize">{g.status}</td>
            </tr>
          ))}
        </Table>
      </Section>

      <Section title="Affiliate program">
        <Table headers={["Partner", "Email", "Clicks", "Conversions", "Earnings"]}>
          {affiliates.map((a) => (
            <tr key={a.id}>
              <td className="px-4 py-3 font-medium">{a.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{a.email}</td>
              <td className="px-4 py-3">{a.clicks}</td>
              <td className="px-4 py-3">{a.conversions}</td>
              <td className="px-4 py-3 font-medium">{formatPrice(a.earnings)}</td>
            </tr>
          ))}
        </Table>
      </Section>
    </div>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center justify-between border-b pb-3">
        <h2 className="font-display text-xl">{title}</h2>
        {action}
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}
