"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Order = {
  id: string;
  createdAt: string;
  status: string;
  payoutStatus: string;
  payoutPaidAt?: string | null;
  totalAmount: string;
  customer?: { name?: string | null; email?: string; phone?: string | null };
  store?: { storeName: string };
  items: { id: string; productName: string; quantity: number; unitPrice: string }[];
};

export default function SellerPaymentsPage() {
  const [upiId, setUpiId] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/account/payment-log", { cache: "no-store" });
    if (res.status === 401) {
      location.href = "/login?next=/seller/payments";
      return;
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not load payment log.");
    setUpiId(data.upiId || "");
    setOrders(data.orders || []);
  }

  useEffect(() => {
    load().catch((e) => setMessage(e.message)).finally(() => setLoading(false));
  }, []);

  async function saveUpi(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/account/payment-log", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upiId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save UPI ID.");
      setMessage("UPI ID saved.");
    } catch (e: any) {
      setMessage(e.message || "Could not save UPI ID.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f6ff] px-5 py-8 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <Link href="/seller" className="font-bold text-[#3426a8]">← Seller dashboard</Link>
        <h1 className="mt-5 text-3xl font-black">Payment Log</h1>
        <p className="mt-2 text-slate-500">Save your UPI ID and track admin payouts for your customer orders.</p>

        <form onSubmit={saveUpi} className="mt-6 rounded-2xl bg-white p-6 shadow">
          <label className="block font-bold" htmlFor="upi">Your UPI ID</label>
          <input
            id="upi"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="yourname@bank"
            className="mt-2 w-full rounded-xl border p-3 outline-none focus:border-violet-500"
          />
          <button disabled={saving} className="mt-4 rounded-xl bg-[#3426a8] px-5 py-3 font-bold text-white disabled:opacity-50">
            {saving ? "Saving…" : "Save UPI ID"}
          </button>
          {message && <p className="mt-3 text-sm">{message}</p>}
        </form>

        <h2 className="mt-8 text-xl font-black">Customer orders and payouts</h2>

        {loading ? <p className="mt-4">Loading…</p> : orders.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-white p-6">No customer orders yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {orders.map((o) => (
              <article key={o.id} className="rounded-2xl bg-white p-6 shadow">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="font-black">Order #{o.id.slice(-8)}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {o.store?.storeName || "Your store"} · {new Date(o.createdAt).toLocaleDateString("en-IN")}
                    </p>
                    <p className="mt-1 text-sm">Customer: {o.customer?.name || "Customer"} · {o.customer?.email || ""}</p>
                    {o.customer?.phone && <p className="text-sm">Phone: {o.customer.phone}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black">₹{Number(o.totalAmount).toLocaleString("en-IN")}</p>
                    <p className="mt-1 text-xs">Order: {o.status}</p>
                    <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-black ${o.payoutStatus === "PAID" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                      {o.payoutStatus === "PAID" ? "Payment Received" : "Payment Pending"}
                    </span>
                    {o.payoutPaidAt && <p className="mt-1 text-xs text-slate-500">Paid {new Date(o.payoutPaidAt).toLocaleDateString("en-IN")}</p>}
                  </div>
                </div>
                <div className="mt-4 space-y-2 border-t pt-4">
                  {o.items.map((i) => (
                    <div key={i.id} className="flex justify-between gap-3 text-sm">
                      <span>{i.productName} × {i.quantity}</span>
                      <span>₹{(Number(i.unitPrice) * i.quantity).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}