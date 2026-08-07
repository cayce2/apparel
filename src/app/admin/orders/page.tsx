"use client";
import { useState } from "react";
import { orders as seed, orderStatuses } from "@/data/account";
import type { Order, OrderStatus } from "@/types/account";
import { Table, PageHeader } from "@/components/admin-ui";
import { Button } from "@/components/ui/primitives";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { Printer } from "lucide-react";

export default function OrdersAdmin() {
  const [list, setList] = useState<Order[]>(seed);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [query, setQuery] = useState("");

  const setOrderStatus = (id: string, status: OrderStatus) => setList(list.map((o) => (o.id === id ? { ...o, status } : o)));

  const filtered = list.filter((o) => (filter === "all" ? true : o.status === filter) && (o.number.toLowerCase().includes(query.toLowerCase())));

  const counts = orderStatuses.reduce<Record<string, number>>((acc, s) => {
    acc[s] = list.filter((o) => o.status === s).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" subtitle={`${list.length} orders total`} />

      <div className="flex flex-wrap gap-1">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>All ({list.length})</FilterChip>
        {orderStatuses.map((s) => (
          <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)}>
            <span className="capitalize">{s}</span> ({counts[s] ?? 0})
          </FilterChip>
        ))}
      </div>

      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search order number..." className="input max-w-md" />

      <Table headers={["Order", "Date", "Items", "Total", "Status", "Payment", ""]}>
        {filtered.map((o) => (
          <tr key={o.id} className="align-middle">
            <td className="px-4 py-3 font-mono text-xs"><Link href={`/admin/orders/${o.id}`} className="hover:underline">{o.number}</Link></td>
            <td className="px-4 py-3 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
            <td className="px-4 py-3">{o.items.length}</td>
            <td className="px-4 py-3 font-medium">{formatPrice(o.total)}</td>
            <td className="px-4 py-3">
              <select value={o.status} onChange={(e) => setOrderStatus(o.id, e.target.value as OrderStatus)} className="h-8 rounded-md border bg-background px-2 text-xs capitalize">
                {orderStatuses.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </td>
            <td className="px-4 py-3 text-muted-foreground text-xs">{o.paymentMethod}</td>
            <td className="px-4 py-3 text-right"><Link href={`/admin/orders/${o.id}`}><Button variant="outline"><Printer size={14} /> Invoice</Button></Link></td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("rounded-full border px-3 py-1 text-xs", active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary")}>{children}</button>
  );
}
