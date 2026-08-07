"use client";
import { useState } from "react";
import { returns as seed } from "@/data/account";
import type { ReturnRequest } from "@/types/account";
import { PageHeader, Table } from "@/components/admin-ui";
import { Button } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

const statusStyle: Record<string, string> = {
  requested: "bg-amber-100 text-amber-800",
  approved: "bg-blue-100 text-blue-800",
  denied: "bg-rose-100 text-rose-800",
  completed: "bg-emerald-100 text-emerald-800",
};

export default function ReturnsPage() {
  const [list] = useState<ReturnRequest[]>(seed);
  return (
    <div className="space-y-6">
      <PageHeader title="Returns" subtitle="View and request order returns" action={<Button><Plus size={16} /> New return</Button>} />
      <Table headers={["Return", "Order", "Reason", "Status", "Date"]}>
        {list.map((r) => (
          <tr key={r.id}>
            <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
            <td className="px-4 py-3 font-mono text-xs">{r.orderId}</td>
            <td className="px-4 py-3">{r.reason}</td>
            <td className="px-4 py-3"><span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", statusStyle[r.status])}>{r.status}</span></td>
            <td className="px-4 py-3 text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</td>
          </tr>
        ))}
      </Table>
      <div className="rounded-lg p-6 text-sm text-muted-foreground">
        Returns are free within 30 days. Items must be unworn with tags attached. Once approved, a refund is issued to your original payment method within 5-7 business days.
      </div>
    </div>
  );
}
