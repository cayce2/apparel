"use client";
import Link from "next/link";
import Image from "next/image";
import { useParams, notFound } from "next/navigation";
import { useState } from "react";
import { orders, orderStatuses } from "@/data/account";
import type { OrderStatus } from "@/types/account";
import { PageHeader, StatusPill } from "@/components/admin-ui";
import { Button } from "@/components/ui/primitives";
import { formatPrice } from "@/lib/utils";
import { Printer, Truck, FileText } from "lucide-react";

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const order = orders.find((o) => o.id === id);
  const [status, setStatus] = useState<OrderStatus>(order?.status ?? "pending");
  if (!order) return notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="text-sm text-muted-foreground hover:text-foreground">&larr; Back to orders</Link>
      <PageHeader
        title={order.number}
        subtitle={`Placed ${new Date(order.createdAt).toLocaleDateString()}`}
        action={<div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}><Printer size={16} /> Print invoice</Button>
          <Button variant="outline"><Truck size={16} /> Shipping label</Button>
          <Button variant="outline"><FileText size={16} /> Refund</Button>
        </div>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border">
            <div className="border-b px-4 py-3 text-sm font-medium">Items</div>
            <ul className="divide-y">
              {order.items.map((it, i) => (
                <li key={i} className="flex items-center gap-4 p-4">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-secondary">
                    <Image src={it.image} alt={it.name} fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <Link href={`/product/${it.slug}`} className="text-sm font-medium hover:underline">{it.name}</Link>
                    <p className="text-xs text-muted-foreground">{it.color} / {it.size} - Qty {it.quantity}</p>
                  </div>
                  <p className="text-sm">{formatPrice(it.price * it.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="space-y-1 border-t p-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Tax</dt><dd>{formatPrice(order.tax)}</dd></div>
              <div className="flex justify-between border-t pt-2 font-medium"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
            </dl>
          </div>

          <div className="rounded-lg border p-5">
            <h3 className="font-medium">Status history</h3>
            <ol className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between"><span>Order placed</span><span className="text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</span></li>
              {order.status === "delivered" && <li className="flex justify-between"><span>Delivered</span><span className="text-muted-foreground">2 days ago</span></li>}
              {order.tracking && <li className="flex justify-between"><span>Shipped</span><span className="text-muted-foreground font-mono">{order.tracking}</span></li>}
              <li className="flex justify-between border-t pt-2"><span className="font-medium">Current</span><StatusPill status={status} /></li>
            </ol>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border p-5">
            <h3 className="font-medium">Update status</h3>
            <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} className="input mt-3">
              {orderStatuses.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
            <Button className="mt-3 w-full" onClick={() => alert(`Status updated to ${status}`)}>Save</Button>
          </div>

          <div className="rounded-lg border p-5 text-sm">
            <h3 className="font-medium">Customer</h3>
            <p className="mt-2 text-muted-foreground">Jordan M.<br />jordan@example.com</p>
            <Link href="/admin/customers/cu1" className="mt-2 inline-block text-xs underline">View profile</Link>
          </div>

          <div className="rounded-lg border p-5 text-sm">
            <h3 className="font-medium">Shipping address</h3>
            <p className="mt-2 text-muted-foreground">140 Greenpoint Ave, Apt 2B<br />Brooklyn, NY 11222<br />USA</p>
          </div>

          <div className="rounded-lg border p-5 text-sm">
            <h3 className="font-medium">Payment</h3>
            <p className="mt-2 text-muted-foreground">{order.paymentMethod}</p>
            <p className="mt-1 text-xs">Status: <span className="font-medium">Paid</span></p>
          </div>
        </aside>
      </div>
    </div>
  );
}
