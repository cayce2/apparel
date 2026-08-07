"use client";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/primitives";
import { Minus, Plus, Trash2, Heart } from "lucide-react";
import { useState } from "react";
import { validateCoupon } from "@/lib/api/storefront";

type CouponResult = { valid: boolean; code?: string; discount?: number | "shipping"; reason?: string };

export default function CartPage() {
  const { items, saved, updateQty, remove, saveForLater, moveToCart, subtotal, count } = useCart();
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<CouponResult | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const applyCoupon = async () => {
    setChecking(true); setCouponMsg(null);
    try {
      const r = await validateCoupon(coupon, subtotal());
      setApplied(r as CouponResult);
      if (r.reason === "expired") setCouponMsg("Coupon has expired.");
      else if (r.reason === "limit_reached") setCouponMsg("Coupon usage limit reached.");
    } catch (e: any) {
      setApplied(null); setCouponMsg(e.message ?? "Invalid coupon.");
    } finally { setChecking(false); }
  };

  const subtotalVal = subtotal();
  let discount = 0;
  let freeShipping = false;
  if (applied?.valid) {
    if (applied.discount === "shipping") freeShipping = true;
    else if (typeof applied.discount === "number") discount = applied.discount;
  }
  const baseShipping = subtotalVal === 0 ? 0 : subtotalVal > 75 ? 0 : 9;
  const shipping = freeShipping ? 0 : baseShipping;
  const total = subtotalVal - discount + shipping;

  if (count() === 0 && saved.length === 0) {
    return (
      <div className="container-page mt-24 text-center">
        <h1 className="font-display text-4xl">Your cart is empty</h1>
        <p className="mt-3 text-muted-foreground">Looks like you have not added anything yet.</p>
        <Link href="/shop" className="btn-primary mt-8">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-page mt-10">
      <h1 className="font-display text-4xl">Cart</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          {items.length === 0 ? <p className="text-muted-foreground">Your cart is empty.</p> : (
            <ul className="divide-y border-y">
              {items.map((item) => (
                <li key={`${item.productId}-${item.color}-${item.size}`} className="flex gap-4 py-6">
                  <Link href={`/product/${item.slug}`} className="relative h-32 w-24 shrink-0 overflow-hidden rounded-md bg-secondary">
                    <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <div>
                        <Link href={`/product/${item.slug}`} className="font-medium hover:underline">{item.name}</Link>
                        <p className="text-sm text-muted-foreground">{item.color} / {item.size}</p>
                      </div>
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                    <div className="mt-auto flex items-center gap-4">
                      <div className="flex items-center border">
                        <button onClick={() => updateQty(item.productId, item.color, item.size, item.quantity - 1)} className="px-2 py-1"><Minus size={14} /></button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQty(item.productId, item.color, item.size, item.quantity + 1)} className="px-2 py-1"><Plus size={14} /></button>
                      </div>
                      <button onClick={() => saveForLater(item.productId, item.color, item.size)} className="text-xs text-muted-foreground hover:underline"><Heart size={14} className="inline" /> Save for later</button>
                      <button onClick={() => remove(item.productId, item.color, item.size)} className="text-xs text-muted-foreground hover:underline"><Trash2 size={14} className="inline" /> Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {saved.length > 0 && (
            <div className="mt-12">
              <h2 className="font-display text-2xl">Saved for later</h2>
              <ul className="mt-4 divide-y border-y">
                {saved.map((item) => (
                  <li key={`${item.productId}-${item.color}-${item.size}`} className="flex items-center gap-4 py-4">
                    <Link href={`/product/${item.slug}`} className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                      <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                    </Link>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.color} / {item.size} - {formatPrice(item.price)}</p>
                    </div>
                    <Button variant="outline" onClick={() => moveToCart(item.productId, item.color, item.size)}>Move to cart</Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="h-fit rounded-lg border p-6">
          <h2 className="font-display text-xl">Order Summary</h2>
          <div className="mt-4 flex gap-2">
            <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Coupon code" className="input h-10" />
            <Button variant="outline" onClick={applyCoupon} disabled={checking || !coupon}>{checking ? "..." : "Apply"}</Button>
          </div>
          {applied?.valid && <p className="mt-2 text-xs text-green-600">Coupon {applied.code} applied{applied.discount === "shipping" ? " - free shipping" : typeof applied.discount === "number" ? ` - ${formatPrice(applied.discount)} off` : ""}.</p>}
          {couponMsg && <p className="mt-2 text-xs text-destructive">{couponMsg}</p>}
          <dl className="mt-6 space-y-2 text-sm">
            <Row label="Subtotal" value={formatPrice(subtotalVal)} />
            {discount > 0 && <Row label="Discount" value={`- ${formatPrice(discount)}`} />}
            <Row label="Shipping" value={shipping === 0 ? "Free" : formatPrice(shipping)} />
            <Row label="Estimated delivery" value="3-5 business days" muted />
            <div className="border-t pt-3">
              <Row label="Total" value={formatPrice(total)} big />
            </div>
          </dl>
          <Link href="/checkout" className="btn-primary mt-6 w-full">Checkout</Link>
          <Link href="/shop" className="mt-3 block text-center text-sm text-muted-foreground hover:underline">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, muted, big }: { label: string; value: string; muted?: boolean; big?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className={muted ? "text-muted-foreground" : ""}>{label}</dt>
      <dd className={big ? "text-lg font-medium" : ""}>{value}</dd>
    </div>
  );
}
