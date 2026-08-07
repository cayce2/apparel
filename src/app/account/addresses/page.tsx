"use client";
import { useEffect, useState, useCallback } from "react";
import { listAddresses, saveAddress, deleteAddress, type ApiAddress } from "@/lib/api/account";
import { PageHeader } from "@/components/admin-ui";
import { Button } from "@/components/ui/primitives";
import { Pencil, Trash2, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AddressesPage() {
  const [list, setList] = useState<ApiAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<ApiAddress>>({});
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    listAddresses().then((a) => { setList(a ?? []); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!draft.label || !draft.full_name || !draft.line1 || !draft.city) { alert("label, name, address, city required"); return; }
    try {
      await saveAddress({
        id: editing ?? undefined,
        label: draft.label ?? "Address", full_name: draft.full_name ?? "", line1: draft.line1 ?? "",
        line2: draft.line2, city: draft.city ?? "", state: draft.state ?? "", zip: draft.zip ?? "",
        country: draft.country ?? "USA", is_default: !!draft.is_default,
      });
      setShowForm(false); setEditing(null); setDraft({}); load();
    } catch (e: any) { alert(e.message); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    try { await deleteAddress(id); load(); } catch (e: any) { alert(e.message); }
  };

  const makeDefault = async (id: string) => {
    const a = list.find((x) => x.id === id);
    if (!a) return;
    try { await saveAddress({ ...a, is_default: true }); load(); } catch (e: any) { alert(e.message); }
  };

  const startEdit = (a: ApiAddress) => { setEditing(a.id); setDraft(a); setShowForm(true); };
  const startNew = () => { setEditing(null); setDraft({ country: "USA" }); setShowForm(true); };

  return (
    <div className="space-y-6">
      <PageHeader title="Addresses" subtitle="Manage saved shipping addresses" action={<Button onClick={startNew}><Plus size={16} /> New address</Button>} />
      {loading && <p className="text-muted-foreground">Loading...</p>}

      {showForm && (
        <div className="rounded-lg border p-6">
          <h3 className="font-display text-lg">{editing ? "Edit address" : "New address"}</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Label" value={draft.label ?? ""} onChange={(v) => setDraft({ ...draft, label: v })} />
            <Field label="Full name" value={draft.full_name ?? ""} onChange={(v) => setDraft({ ...draft, full_name: v })} />
            <Field label="Address line 1" value={draft.line1 ?? ""} full onChange={(v) => setDraft({ ...draft, line1: v })} />
            <Field label="Address line 2 (optional)" value={draft.line2 ?? ""} full onChange={(v) => setDraft({ ...draft, line2: v })} />
            <Field label="City" value={draft.city ?? ""} onChange={(v) => setDraft({ ...draft, city: v })} />
            <Field label="State / Province" value={draft.state ?? ""} onChange={(v) => setDraft({ ...draft, state: v })} />
            <Field label="ZIP / Postal" value={draft.zip ?? ""} onChange={(v) => setDraft({ ...draft, zip: v })} />
            <Field label="Country" value={draft.country ?? ""} onChange={(v) => setDraft({ ...draft, country: v })} />
            <label className="flex items-center gap-2 md:col-span-2 text-sm">
              <input type="checkbox" checked={!!draft.is_default} onChange={(e) => setDraft({ ...draft, is_default: e.target.checked })} /> Set as default address
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={save}>Save address</Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); setDraft({}); }}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {list.map((a) => (
          <div key={a.id} className={cn("rounded-lg border p-5", a.is_default && "border-primary")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{a.label}</h3>
                {a.is_default && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary-foreground">Default</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(a)} className="text-muted-foreground hover:text-foreground" aria-label="Edit"><Pencil size={14} /></button>
                <button onClick={() => remove(a.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete"><Trash2 size={14} /></button>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{a.full_name}<br />{a.line1}{a.line2 && <><br />{a.line2}</>}<br />{a.city}, {a.state} {a.zip}<br />{a.country}</p>
            {!a.is_default && <button onClick={() => makeDefault(a.id)} className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><Check size={12} /> Set as default</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, full }: { label: string; value: string; onChange: (v: string) => void; full?: boolean }) {
  return (
    <label className={full ? "md:col-span-2 block" : "block"}>
      <span className="label">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="input mt-1" />
    </label>
  );
}
