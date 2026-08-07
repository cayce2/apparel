"use client";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import { adminCustomers, orders } from "@/data/account";
import { StatCard, PageHeader, Table, StatusPill } from "@/components/admin-ui";
import { Button } from "@/components/ui/primitives";
import { formatPrice } from "@/lib/utils";
import { Mail, Phone } from "lucide-react";

export default function AdminCustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const customer = adminCustomers.find((c) => c.id === id);
  const [notes, setNotes] = useState(customer?.notes ?? "");
  const [marketing, setMarketing] = useState(customer?.marketingConsent ?? false);
  if (!customer) return notFound();

  const customerOrders = orders.filter((o) => o.id.startsWith("o")) // demo: assume all relate
    .slice(0, customer.orders % 4);

  return (
    <div className="space-y-6">
      <PageHeader title={customer.name} subtitle={`Customer since ${new Date(customer.joinedAt).toLocaleDateString()}`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total orders" value={String(customer.orders)} />
        <StatCard label="Lifetime spend" value={formatPrice(customer.spend)} />
        <StatCard label="Reward points" value={String(customer.points)} />
        <StatCard label="Avg order value" value={formatPrice(customer.spend / customer.orders)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-display text-xl">Purchase history</h2>
          <Table headers={["Order", "Date", "Status", "Items", "Total"]}>
            {customerOrders.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3 font-mono text-xs">{o.number}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3"><StatusPill status={o.status} /></td>
                <td className="px-4 py-3">{o.items.length}</td>
                <td className="px-4 py-3 font-medium">{formatPrice(o.total)}</td>
              </tr>
            ))}
            {customerOrders.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No orders in demo data.</td></tr>}
          </Table>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border p-5 text-sm">
            <h3 className="font-medium">Contact</h3>
            <div className="mt-3 space-y-2 text-muted-foreground">
              <p className="flex items-center gap-2"><Mail size={14} /> {customer.email}</p>
              <p className="flex items-center gap-2"><Phone size={14} /> +1 (555) 010-1010</p>
            </div>
          </div>

          <div className="rounded-lg border p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Marketing consent</h3>
              <button onClick={() => setMarketing((v) => !v)} className={`relative h-6 w-11 rounded-full transition ${marketing ? "bg-primary" : "bg-muted"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${marketing ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{marketing ? "Receives email marketing." : "Opted out of email marketing."}</p>
          </div>

          <div className="rounded-lg border p-5">
            <h3 className="font-medium">Internal notes</h3>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input mt-3 min-h-24" placeholder="Add a private note..." />
            <Button className="mt-3 w-full" onClick={() => alert("Notes saved")}>Save notes</Button>
          </div>

          <div className="rounded-lg border p-5">
            <h3 className="font-medium">Adjust reward points</h3>
            <div className="mt-3 flex gap-2">
              <input type="number" placeholder="+/- points" className="input h-9" />
              <Button variant="outline" onClick={() => alert("Points adjusted")}>Apply</Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
