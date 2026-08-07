"use client";
import Link from "next/link";
import { adminCustomers } from "@/data/account";
import { Table, PageHeader } from "@/components/admin-ui";
import { Button } from "@/components/ui/primitives";
import { formatPrice } from "@/lib/utils";
import { Search } from "lucide-react";
import { useState } from "react";

export default function CustomersAdmin() {
  const [query, setQuery] = useState("");
  const filtered = adminCustomers.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.email.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeader title="Customers" subtitle={`${adminCustomers.length} customers`} action={<Button>Add customer</Button>} />
      <div className="relative">
        <Search size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email..." className="h-9 w-full rounded-md border pl-9 pr-3 text-sm" />
      </div>
      <Table headers={["Customer", "Email", "Joined", "Orders", "Spend", "Points", "Marketing", ""]}>
        {filtered.map((c) => (
          <tr key={c.id}>
            <td className="px-4 py-3 font-medium">{c.name}</td>
            <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
            <td className="px-4 py-3 text-muted-foreground">{new Date(c.joinedAt).toLocaleDateString()}</td>
            <td className="px-4 py-3">{c.orders}</td>
            <td className="px-4 py-3 font-medium">{formatPrice(c.spend)}</td>
            <td className="px-4 py-3">{c.points}</td>
            <td className="px-4 py-3">
              <span className={c.marketingConsent ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800" : "rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700"}>{c.marketingConsent ? "Opted in" : "Opted out"}</span>
            </td>
            <td className="px-4 py-3 text-right"><Link href={`/admin/customers/${c.id}`} className="text-sm underline">View</Link></td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
