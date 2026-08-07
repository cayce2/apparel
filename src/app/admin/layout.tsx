"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Package, ShoppingBag, Users, Megaphone, Warehouse,
  BarChart3, Settings, ChevronLeft, Bell, Search,
} from "lucide-react";

const nav = [
  { section: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    section: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
    ],
  },
  {
    section: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/customers", label: "Customers", icon: Users },
    ],
  },
  {
    section: "Growth",
    items: [
      { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
      { href: "/admin/reports", label: "Reports", icon: BarChart3 },
    ],
  },
  { section: "System", items: [{ href: "/admin/settings", label: "Settings", icon: Settings }] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="grid lg:grid-cols-[240px_1fr]">
        <aside className="relative hidden h-screen border-r bg-background lg:block">
          <div className="flex h-16 items-center border-b px-6 font-display text-xl tracking-[0.2em]">ATELIER</div>
          <nav className="px-3 py-4">
            {nav.map((g) => (
              <div key={g.section} className="mb-6">
                <p className="px-3 text-[10px] uppercase tracking-wider text-muted-foreground">{g.section}</p>
                <ul className="mt-2 space-y-1">
                  {g.items.map((i) => {
                    const active = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
                    return (
                      <li key={i.href}>
                        <Link href={i.href} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm", active ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-secondary")}>
                          <i.icon size={16} /> {i.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
          <div className="absolute bottom-4 left-4 right-4 rounded-md border p-3 text-xs text-muted-foreground">
            <p>Admin demo</p>
            <Link href="/" className="mt-1 inline-flex items-center gap-1 hover:text-foreground"><ChevronLeft size={12} /> Back to store</Link>
          </div>
        </aside>

        <div>
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur">
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
              <input placeholder="Search products, orders, customers..." className="h-9 w-72 rounded-md border pl-9 pr-3 text-sm" />
            </div>
            <div className="flex items-center gap-4">
              <button aria-label="Notifications" className="relative"><Bell size={18} /><span className="absolute -right-1 -top-1 rounded-full bg-destructive px-1 text-[10px] text-white">3</span></button>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">AD</div>
                <span className="hidden text-sm md:block">Admin</span>
              </div>
            </div>
          </header>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
