"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { StatCard, PageHeader, StatusPill } from "@/components/admin-ui";
import { Button } from "@/components/ui/primitives";
import { useWishlist } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import {
  listMyOrders, listNotifications, listRewards, listMyReviews,
  type ApiOrder, type ApiNotification, type ApiRewardTx,
} from "@/lib/api/account";

export default function AccountDashboard() {
  const wishlistCount = useWishlist((s) => s.ids.length);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [rewards, setRewards] = useState<{ balance: number; transactions: ApiRewardTx[] }>({ balance: 0, transactions: [] });
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listMyOrders(), listNotifications(), listRewards(), listMyReviews()])
      .then(([o, n, rw, rev]) => {
        setOrders(o ?? []); setNotifications(n ?? []); setRewards(rw ?? { balance: 0, transactions: [] }); setMyReviews(rev ?? []);
        setLoading(false);
      })
      .catch((e) => { setErr(e.message); setLoading(false); });
  }, []);

  if (loading) return <div className="text-muted-foreground">Loading your dashboard...</div>;
  if (err) return <div className="rounded-lg border p-10 text-center text-muted-foreground">Sign in to view your account. <Link href="/auth/sign-in" className="underline">Sign in</Link></div>;

  const unread = notifications.filter((n) => !n.read).length;
  const pendingReviews = myReviews.filter((r) => r.status === "pending").length;
  const reviewsPublished = myReviews.filter((r) => r.status === "published").length;
  const totalSpend = orders.reduce((s, o) => (o.status === "cancelled" ? s : s + o.total), 0);
  const inProgress = orders.filter((o) => o.status === "processing" || o.status === "shipped").length;

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" subtitle="Here is your recent activity." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Orders" value={String(orders.length)} sub={`${inProgress} in progress`} />
        <StatCard label="Wishlist" value={String(wishlistCount)} />
        <StatCard label="Reward points" value={String(rewards.balance)} sub="Redeem at checkout" />
        <StatCard label="Lifetime spend" value={formatPrice(totalSpend)} />
        <StatCard label="Unread notifications" value={String(unread)} sub="See what's new" />
        <StatCard label="Reviews" value={String(reviewsPublished)} sub={`${pendingReviews} pending approval`} />
        <StatCard label="Tip" value="$0 earned" sub="Spend to earn points"/>
        <StatCard label="Tier" value="Bronze" sub="Earn 1000 to reach Silver" />
      </div>

      <section>
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="font-display text-xl">Recent orders</h2>
          <Link href="/account/orders" className="text-sm text-muted-foreground hover:text-foreground">View all</Link>
        </div>
        {orders.length === 0 ? (
          <p className="mt-4 text-muted-foreground">You have no orders yet.</p>
        ) : (
          <div className="mt-4 divide-y rounded-lg border">
            {orders.slice(0, 3).map((o) => (
              <div key={o.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium">{o.number}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()} - {o.items.length} item(s)</p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusPill status={o.status} />
                  <span className="text-sm font-medium">{formatPrice(o.total)}</span>
                  <Link href={`/account/orders/${o.id}`} className="text-sm underline">View</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="font-display text-xl">Latest notifications</h2>
          <Link href="/account/notifications" className="text-sm text-muted-foreground hover:text-foreground">View all</Link>
        </div>
        <ul className="mt-4 space-y-2">
          {notifications.slice(0, 3).map((n) => (
            <li key={n.id} className="flex items-start gap-3 rounded-md border p-3">
              <span className={`mt-1 h-2 w-2 rounded-full ${n.read ? "bg-muted" : "bg-primary"}`} />
              <div>
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="rounded-lg bg-secondary p-6">
        <h2 className="font-display text-xl">Need help?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Start a return, update an address, or contact support.</p>
        <div className="mt-4 flex gap-2">
          <Link href="/account/returns"><Button variant="outline">Start a return</Button></Link>
          <Link href="/contact"><Button variant="outline">Contact support</Button></Link>
        </div>
      </div>
    </div>
  );
}
