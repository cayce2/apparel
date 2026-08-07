"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, Heart, MapPin, CreditCard, RotateCcw, Star, Bell, Award } from "lucide-react";

const nav = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/payments", label: "Saved payment methods", icon: CreditCard },
  { href: "/account/returns", label: "Returns", icon: RotateCcw },
  { href: "/account/reviews", label: "Reviews", icon: Star },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/rewards", label: "Reward points", icon: Award },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="container-page mt-8">
      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside>
          <div className="rounded-lg border p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">J</div>
              <div>
                <p className="text-sm font-medium">Jordan M.</p>
                <p className="text-xs text-muted-foreground">jordan@example.com</p>
              </div>
            </div>
          </div>
          <nav className="mt-4 space-y-1">
            {nav.map((n) => {
              const active = n.href === "/account" ? pathname === "/account" : pathname.startsWith(n.href);
              return (
                <Link key={n.href} href={n.href} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm", active ? "bg-secondary font-medium" : "text-muted-foreground hover:bg-secondary/60")}>
                  <n.icon size={16} /> {n.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
