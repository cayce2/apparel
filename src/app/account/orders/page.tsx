"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { listMyOrders, type ApiOrder } from "@/lib/api/account";
import { Table, StatusPill, PageHeader } from "@/components/admin-ui";
import { Button } from "@/components/ui/primitives";
import { formatPrice } from "@/lib/utils";

export default function OrdersList() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    listMyOrders().then((o) => { setOrders(o ?? []); setLoading(false); }).catch((e) => { setErr(e.message); setLoading(false); });
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" subtitle={loading ? "Loading..." : `${orders.length} orders placed`} />
      {err && <div className="rounded-lg border border-destructive p-6 text-destructive">Sign in to view your orders. <Link href="/auth/sign-in" className="underline">Sign in</Link></div>}
      {orders.length === 0 && !loading && !err && (
        <div className="rounded-lg border p-10 text-center text-muted-foreground">No orders yet.</div>
      )}
      {orders.length > 0 && (
        <Table headers={["Order", "Date", "Items", "Status", "Total", ""]}>
          {orders.map((o) => (
            <tr key={o.id} className="align-middle">
              <td className="px-4 py-3 font-mono text-xs">{o.number}</td>
              <td className="px-4 py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
              <td className="px-4 py-3">{o.items.length}</td>
              <td className="px-4 py-3"><StatusPill status={o.status} /></td>
              <td className="px-4 py-3 font-medium">{formatPrice(o.total)}</td>
              <td className="px-4 py-3 text-right"><Link href={`/account/orders/${o.id}`}><Button variant="outline">View</Button></Link></td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
