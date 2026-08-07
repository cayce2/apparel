"use client";
import { rewardTransactions, rewardBalance } from "@/data/account";
import { PageHeader, Table, StatCard } from "@/components/admin-ui";
import { formatPrice } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Award } from "lucide-react";

export default function RewardsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Reward points" subtitle="Earn 1 point per $1 spent. Redeem at checkout." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Current balance" value={String(rewardBalance)} sub="points" />
        <StatCard label="Tier" value="Gold" sub="Next: Platinum at 3,000 pts" />
        <StatCard label="Worth" value={formatPrice(rewardBalance / 100, "USD")} sub="1 point = $0.01" />
      </div>

      <div className="rounded-lg border bg-secondary p-6">
        <div className="flex items-center gap-3"><Award size={20} /><h2 className="font-display text-lg">How rewards work</h2></div>
        <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">
          <li>Earn 1 point per $1 on every order.</li>
          <li>Birthday bonus + 100 points.</li>
          <li>Refer a friend and earn 500 points when they make their first purchase.</li>
          <li>Redeem points at checkout as a discount, 100 pts = $1.</li>
        </ul>
      </div>

      <div>
        <h2 className="font-display text-xl">History</h2>
        <div className="mt-4">
          <Table headers={["Date", "Type", "Description", "Points"]}>
            {rewardTransactions.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-3 text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 capitalize">
                  <span className="inline-flex items-center gap-1">
                    {t.points > 0 ? <ArrowUpRight size={14} className="text-emerald-600" /> : <ArrowDownRight size={14} className="text-rose-600" />}
                    {t.type}
                  </span>
                </td>
                <td className="px-4 py-3">{t.description}</td>
                <td className="px-4 py-3 font-medium">{t.points > 0 ? `+${t.points}` : t.points}</td>
              </tr>
            ))}
          </Table>
        </div>
      </div>
    </div>
  );
}
