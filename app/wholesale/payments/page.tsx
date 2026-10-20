"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function WholesalePaymentsPage() {
  const [upiId, setUpiId] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/account/payment-log", { cache: "no-store" });
    if (res.status === 401) {
      location.href = "/login?role=wholesaler&next=/wholesale/payments";
      return;
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not load payments.");
    setUpiId(data.upiId || "");
    setOrders(data.wholesaleOrders || []);
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
    <main className="min-h-screen bg-[#08101b] px-5 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/wholesale" className="font-bold text-cyan-300">← Wholesale dashboard</Link>
        <h1 className="mt-5 text-3xl font-black">Payment Log</h1>
        <p className="mt-2 text-white/60">Manage your UPI ID and track payments for your wholesale orders.</p>

        <form onSubmit={saveUpi} className="mt-6 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <label htmlFor="upi" className="font-bold">Your UPI ID</label>
          <input id="upi" value={upiId} onChange={(e) => setUpiId(e.target.value)}
            placeholder="yourname@bank" className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 p-3 text-white outline-none focus:border-cyan-300" />
          <button disabled={saving} className="mt-4 rounded-xl bg-cyan-300 px-5 py-3 font-bold text-slate-950 disabled:opacity-50">
            {saving ? "Saving…" : "Save UPI ID"}
          </button>
          {message && <p className="mt-3 text-sm">{message}</p>}
        </form>

        <h2 className="mt-8 text-xl font-black">Orders and payouts</h2>
        {loading ? <p className="mt-4">Loading…</p> : orders.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-white/5 p-6 text-white/60">No wholesale orders yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {orders.map((o) => (
              <article key={o.id} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="font-black">Order #{o.id.slice(-8)}</p>
                    <p className="mt-1 text-sm text-white/50">{new Date(o.createdAt).toLocaleDateString("en-IN")}</p>
                    <p className="mt-1 text-sm">Buyer: {o.buyerName}</p>
                    <p className="text-sm">Phone: {o.buyerPhone}</p>
                    <p className="text-sm">Address: {o.buyerAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black">₹{Number(o.totalAmount).toLocaleString("en-IN")}</p>
                    <p className="mt-1 text-xs">Order: {o.status}</p>
                    <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-black ${o.payoutStatus === "PAID" ? "bg-emerald-300 text-slate-950" : "bg-amber-300 text-slate-950"}`}>
                      {o.payoutStatus === "PAID" ? "Payment Received" : "Payment Pending"}
                    </span>
                    {o.payoutPaidAt && <p className="mt-1 text-xs text-white/50">Paid {new Date(o.payoutPaidAt).toLocaleDateString("en-IN")}</p>}
                  </div>
                </div>
                <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                  {o.items.map((i: any) => (
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