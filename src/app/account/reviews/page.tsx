"use client";
import { customerReviews } from "@/data/account";
import { PageHeader } from "@/components/admin-ui";
import { cn } from "@/lib/utils";

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="My reviews" subtitle="Products you have reviewed" />
      <div className="space-y-4">
        {customerReviews.map((r) => (
          <div key={r.id} className="rounded-lg border p-5">
            <div className="flex items-center justify-between">
              <p className="font-medium">{r.productName}</p>
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                r.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800")}>
                {r.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-primary">{"★".repeat(r.rating)}<span className="text-muted">{"★".repeat(5 - r.rating)}</span></p>
            <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>
            <p className="mt-3 text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
