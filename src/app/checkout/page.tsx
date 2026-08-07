"use client";
import { useState } from "react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/primitives";
import { Check } from "lucide-react";
import { placeOrder } from "@/lib/api/storefront";

const steps = ["Shipping", "Delivery", "Payment", "Review"] as const;

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "card" | "paypal" | "cod">("card");
  const [placed, setPlaced] = useState<{ number: string; total: number } | null>(null);
  const [placing, setPlacing] = useState(false);
  const [orderErr, setOrderErr] = useState<string | null>(null);
  const [ship, setShip] = useState({ name: "", email: "", line1: "", city: "", state: "", zip: "", country: "USA" });

  const shipping = subtotal() > 75 ? 0 : 9;
  const tax = Math.round(subtotal() * 0.08 * 100) / 100;
  const total = subtotal() + shipping + tax;

  if (placed) {
    return (
      <div className="container-page mt-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check size={28} /></div>
        <h1 className="mt-6 font-display text-4xl">Order confirmed</h1>
        <p className="mt-3 text-muted-foreground">Thank you. A confirmation has been sent to {ship.email || "your email"}.</p>
        <p className="mt-6 text-sm">Order number: <span className="font-mono">{placed.number}</span></p>
        <p className="mt-2 text-lg font-medium">{formatPrice(placed.total)}</p>
      </div>
    );
  }

  const submit = async () => {
    if (!items.length) { setOrderErr("Your cart is empty."); return; }
    setPlacing(true); setOrderErr(null);
    try {
      const res = await placeOrder({
        items: items.map((i) => ({ productId: i.productId, color: i.color, size: i.size, quantity: i.quantity })),
        shippingAddress: { name: ship.name, line1: ship.line1, city: ship.city, state: ship.state, zip: ship.zip, country: ship.country },
        paymentMethod: paymentMethod === "card" ? "Card" : paymentMethod === "mpesa" ? "M-Pesa" : paymentMethod === "paypal" ? "PayPal" : "Cash on Delivery",
        shipping,
      });
      clear();
      setPlaced({ number: res.number, total: res.total });
    } catch (e: any) {
      setOrderErr(e.message ?? "Failed to place order.");
    } finally { setPlacing(false); }
  };

  return (
    <div className="container-page mt-10">
      <h1 className="font-display text-4xl">Checkout</h1>

      <div className="mt-6 flex items-center gap-2 text-sm">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span className={i <= step ? "font-medium" : "text-muted-foreground"}>{i + 1}. {s}</span>
            {i < steps.length - 1 && <span className="text-muted-foreground">/</span>}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl">Shipping address</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Full name" full value={ship.name} onChange={(v) => setShip({ ...ship, name: v })} />
                <Input label="Email" type="email" full value={ship.email} onChange={(v) => setShip({ ...ship, email: v })} />
                <Input label="Address" full value={ship.line1} onChange={(v) => setShip({ ...ship, line1: v })} />
                <Input label="City" value={ship.city} onChange={(v) => setShip({ ...ship, city: v })} />
                <Input label="State" value={ship.state} onChange={(v) => setShip({ ...ship, state: v })} />
                <Input label="ZIP / Postal" value={ship.zip} onChange={(v) => setShip({ ...ship, zip: v })} />
                <Input label="Country" full value={ship.country} onChange={(v) => setShip({ ...ship, country: v })} />
              </div>
              <Button onClick={() => setStep(1)}>Continue to delivery</Button>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl">Delivery method</h2>
              {[
                { id: "standard", name: "Standard", desc: "3-5 business days", price: shipping === 0 ? "Free" : formatPrice(9) },
                { id: "express", name: "Express", desc: "1-2 business days", price: formatPrice(19) },
                { id: "pickup", name: "Store pickup", desc: "Ready in 24h", price: "Free" },
              ].map((m) => (
                <label key={m.id} className="flex items-center justify-between rounded-md border p-4">
                  <span><p className="font-medium">{m.name}</p><p className="text-sm text-muted-foreground">{m.desc}</p></span>
                  <div className="flex items-center gap-3"><span className="text-sm">{m.price}</span><input type="radio" name="delivery" defaultChecked={m.id === "standard"} /></div>
                </label>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                <Button onClick={() => setStep(2)}>Continue to payment</Button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl">Payment</h2>
              {([
                { id: "card", name: "Credit / Debit Card", desc: "Visa, Mastercard, Amex" },
                { id: "mpesa", name: "M-Pesa STK Push", desc: "Pay via M-Pesa prompt on your phone" },
                { id: "paypal", name: "PayPal", desc: "Pay with your PayPal balance" },
                { id: "cod", name: "Cash on Delivery", desc: "Pay when your order arrives (optional)" },
              ] as const).map((m) => (
                <label key={m.id} className={`flex items-center justify-between rounded-md border p-4 ${paymentMethod === m.id ? "border-primary" : ""}`}>
                  <span><p className="font-medium">{m.name}</p><p className="text-sm text-muted-foreground">{m.desc}</p></span>
                  <input type="radio" name="payment" checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} />
                </label>
              ))}
              {paymentMethod === "card" && (
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Card number" full />
                  <Input label="Expiry MM/YY" />
                  <Input label="CVC" />
                </div>
              )}
              {paymentMethod === "mpesa" && <Input label="M-Pesa phone number" full />}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)}>Review order</Button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl">Review</h2>
              <ul className="divide-y border-y text-sm">
                {items.map((i) => (
                  <li key={`${i.productId}-${i.color}-${i.size}`} className="flex justify-between py-3">
                    <span>{i.name} - {i.color}/{i.size} x{i.quantity}</span>
                    <span>{formatPrice(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="text-sm text-muted-foreground">
                Ship to: {ship.name}, {ship.line1}, {ship.city} {ship.zip}, {ship.country}
              </div>
              {orderErr && <p className="text-sm text-destructive">{orderErr}</p>}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={submit} disabled={placing}>{placing ? "Placing order..." : `Place order - ${formatPrice(total)}`}</Button>
              </div>
            </div>
          )}
        </div>

        <aside className="h-fit rounded-lg border p-6">
          <h2 className="font-display text-xl">Order Summary</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((i) => (
              <li key={`${i.productId}-${i.color}-${i.size}`} className="flex justify-between">
                <span className="text-muted-foreground">{i.name} x{i.quantity}</span>
                <span>{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(subtotal())}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd></div>
            <div className="flex justify-between"><dt>Tax (8%)</dt><dd>{formatPrice(tax)}</dd></div>
            <div className="flex justify-between border-t pt-2 text-lg font-medium"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}

function Input({ label, type = "text", full, value, onChange }: { label: string; type?: string; full?: boolean; value?: string; onChange?: (v: string) => void }) {
  return (
    <label className={full ? "col-span-2 block" : "block"}>
      <span className="label">{label}</span>
      <input type={type} className="input mt-1" value={value} onChange={(e) => onChange?.(e.target.value)} />
    </label>
  );
}
