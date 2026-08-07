"use client";
import Link from "next/link";
import Image from "next/image";
import { useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { getOrder, type ApiOrder } from "@/lib/api/account";
import { StatusPill, PageHeader } from "@/components/admin-ui";
import { Button } from "@/components/ui/primitives";
import { formatPrice } from "@/lib/utils";
import { Printer, Truck, RefreshCw } from "lucide-react";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getOrder(id).then((o) => { setOrder(o); setLoading(false); }).catch((e) => { setErr(e.message); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-muted-foreground">Loading order...</div>;
  if (err) return <div className="rounded-lg border p-10 text-center text-muted-foreground">Order not found.</div>;
  if (!order) return notFound();

  return (
    <div className="space-y-6">
      <Link href="/account/orders" className="text-sm text-muted-foreground hover:text-foreground">&larr; Back to orders</Link>
      <PageHeader
        title={order.number}
        subtitle={`Placed on ${new Date(order.created_at).toLocaleDateString()} - ${order.status}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}><Printer size={16} /> Invoice</Button>
            {order.status === "delivered" && <Link href="/account/returns"><Button variant="outline"><RefreshCw size={16} /> Return</Button></Link>}
            {order.tracking && <Button variant="outline"><Truck size={16} /> Track</Button>}
          </div>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-lg border">
            <div className="border-b px-4 py-3 text-sm font-medium">Items</div>
            <ul className="divide-y">
              {order.items.map((it, i) => (
                <li key={i} className="flex items-center gap-4 p-4">
                  {it.image ? (
                    <Link href={`/product/${it.slug ?? it.product_id}`} className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                      <Image src={it.image} alt={it.name} fill sizes="64px" className="object-cover" />
                    </Link>
                  ) : (
                    <div className="h-20 w-16 shrink-0 rounded-md bg-secondary" />
                  )}
                  <div className="flex-1">
                    <Link href={`/product/${it.slug ?? it.product_id}`} className="text-sm font-medium hover:underline">{it.name}</Link>
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

          {order.tracking && (
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm font-medium"><Truck size={16} /> Tracking</div>
              <p className="mt-2 font-mono text-xs text-muted-foreground">{order.tracking}</p>
              <p className="mt-2 text-sm">Estimated delivery in 2 business days.</p>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border p-4 text-sm">
            <h3 className="font-medium">Status</h3>
            <div className="mt-2"><StatusPill status={order.status} /></div>
            <p className="mt-3 text-xs text-muted-foreground">Payment via {order.payment_method}</p>
          </div>
          {order.shipping_address ? (
            <div className="rounded-lg border p-4 text-sm">
              <h3 className="font-medium">Shipping address</h3>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-muted-foreground">
                {order.shipping_address?.name ? `${order.shipping_address.name}\n` : ""}
                {order.shipping_address?.line1 ?? ""}
                {order.shipping_address?.city ? `\n${order.shipping_address.city}, ${order.shipping_address.state ?? ""} ${order.shipping_address.zip ?? ""}` : ""}
              </pre>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
