"use client";
import Link from "next/link";
import { ShoppingBag, Heart, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/store/cart";
import { cn, useHydrated } from "@/lib/utils";

const nav = [
  { label: "New", href: "/shop?filter=new" },
  { label: "Women", href: "/shop?category=women" },
  { label: "Men", href: "/shop?category=men" },
  { label: "Shoes", href: "/shop?category=shoes" },
  { label: "Accessories", href: "/shop?category=accessories" },
  { label: "Sale", href: "/shop?filter=sale" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const hydrated = useHydrated();
  const count = useCart((s) => s.count());
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link href="/" className="font-display text-xl tracking-[0.2em]">ATELIER</Link>
        </div>
        <nav className={cn("gap-6 md:flex", open ? "absolute left-0 top-16 flex w-full flex-col border-b bg-background p-6" : "hidden")}>
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm tracking-wide text-foreground/80 hover:text-foreground">{n.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/search" aria-label="Search"><Search size={20} /></Link>
          <Link href="/wishlist" aria-label="Wishlist"><Heart size={20} /></Link>
          <Link href="/cart" aria-label="Cart" className="relative">
            <ShoppingBag size={20} />
            {hydrated && count > 0 && <span className="absolute -right-2 -top-2 rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">{count}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
