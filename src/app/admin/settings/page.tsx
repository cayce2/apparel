"use client";
import { PageHeader } from "@/components/admin-ui";
import { Button } from "@/components/ui/primitives";

export default function AdminSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Settings" subtitle="Store configuration" />
      <div className="rounded-lg border p-5 space-y-4">
        <h2 className="font-display text-lg">Store profile</h2>
        <label className="block"><span className="label">Store name</span><input defaultValue="Atelier" className="input mt-1" /></label>
        <label className="block"><span className="label">Support email</span><input defaultValue="hello@atelier.example" className="input mt-1" /></label>
        <label className="block"><span className="label">Currency</span><select className="input mt-1"><option>USD ($)</option><option>EUR (€)</option><option>GBP (£)</option><option>KES (KSh)</option></select></label>
      </div>
      <div className="rounded-lg border p-5 space-y-4">
        <h2 className="font-display text-lg">Payments</h2>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" defaultChecked /> Accept card payments (Stripe)</label>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" defaultChecked /> Accept M-Pesa STK Push</label>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" defaultChecked /> Accept PayPal</label>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" /> Allow cash on delivery</label>
      </div>
      <div className="rounded-lg border p-5 space-y-4">
        <h2 className="font-display text-lg">Notifications</h2>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" defaultChecked /> Email customer on order placed</label>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" defaultChecked /> Email customer on shipment</label>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" defaultChecked /> Email customer on refund</label>
      </div>
      <Button>Save settings</Button>
    </div>
  );
}
