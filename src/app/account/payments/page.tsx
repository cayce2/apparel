"use client";
import { useEffect, useState, useCallback } from "react";
import { listPaymentMethods, savePaymentMethod, deletePaymentMethod, setDefaultPayment, type ApiPaymentMethod } from "@/lib/api/account";
import { PageHeader } from "@/components/admin-ui";
import { Button } from "@/components/ui/primitives";
import { Trash2, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const brandLabel: Record<ApiPaymentMethod["brand"], string> = {
  visa: "Visa", mastercard: "Mastercard", amex: "Amex", paypal: "PayPal", mpesa: "M-Pesa",
};

export default function PaymentsPage() {
  const [list, setList] = useState<ApiPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<{ brand: ApiPaymentMethod["brand"]; last4: string; expiry: string }>({ brand: "visa", last4: "", expiry: "" });

  const load = useCallback(() => {
    setLoading(true);
    listPaymentMethods().then((p) => { setList(p ?? []); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const remove = async (id: string) => { if (!confirm("Delete this payment method?")) return; try { await deletePaymentMethod(id); load(); } catch (e: any) { alert(e.message); } };
  const makeDefault = async (id: string) => { try { await setDefaultPayment(id); load(); } catch (e: any) { alert(e.message); } };

  const save = async () => {
    if (!draft.last4) { alert("Last 4 digits required"); return; }
    try {
      await savePaymentMethod({ brand: draft.brand, last4: String(draft.last4).slice(-4), expiry: draft.expiry || null, is_default: list.length === 0 });
      setShowForm(false); setDraft({ brand: "visa", last4: "", expiry: "" }); load();
    } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Saved payment methods" subtitle="Manage cards and wallets used at checkout" action={<Button onClick={() => setShowForm((v) => !v)}><Plus size={16} /> Add method</Button>} />
      {loading && <p className="text-muted-foreground">Loading...</p>}

      {showForm && (
        <div className="rounded-lg border p-6">
          <h3 className="font-display text-lg">New payment method</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="label">Brand</span>
              <select value={draft.brand} onChange={(e) => setDraft({ ...draft, brand: e.target.value as ApiPaymentMethod["brand"] })} className="input mt-1">
                {(["visa","mastercard","amex","paypal","mpesa"] as const).map((b) => <option key={b} value={b}>{brandLabel[b]}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="label">Last 4 digits</span>
              <input value={draft.last4} onChange={(e) => setDraft({ ...draft, last4: e.target.value })} className="input mt-1" maxLength={4} />
            </label>
            <label className="block">
              <span className="label">Expiry (MM/YY)</span>
              <input value={draft.expiry} onChange={(e) => setDraft({ ...draft, expiry: e.target.value })} className="input mt-1" placeholder="08/27" />
            </label>
          </div>
          <div className="mt-4 flex gap-2"><Button onClick={save}>Save</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {list.map((p) => (
          <div key={p.id} className={cn("rounded-lg border p-5", p.is_default && "border-primary")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="rounded-md bg-secondary px-3 py-1 text-xs font-medium uppercase">{p.brand}</span>
                <span className="font-mono text-sm">.... {p.last4}</span>
              </div>
              <div className="flex gap-2">
                {!p.is_default && <button onClick={() => makeDefault(p.id)} aria-label="Set default"><Check size={16} /></button>}
                <button onClick={() => remove(p.id)} aria-label="Delete" className="text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{brandLabel[p.brand]}{p.expiry && ` - exp ${p.expiry}`}</span>
              {p.is_default && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary-foreground">Default</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
