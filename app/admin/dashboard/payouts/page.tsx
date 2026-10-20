
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: string | number;
};

type PayoutOrder = {
  id: string;
  createdAt?: string;
  totalAmount: string | number;
  status: string;
  payoutStatus?: string;
  payoutPaidAt?: string | null;
  customer?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  store?: {
    storeName?: string | null;
    owner?: {
      name?: string | null;
      email?: string | null;
      upiId?: string | null;
    } | null;
  } | null;
  wholesaleStore?: {
    storeName?: string | null;
    owner?: {
      name?: string | null;
      email?: string | null;
      upiId?: string | null;
    } | null;
  } | null;
  shippingName?: string | null;
  phone?: string | null;
  address?: string | null;
  buyerName?: string | null;
  buyerPhone?: string | null;
  buyerAddress?: string | null;
  items?: OrderItem[];
};

export default function AdminPayoutsPage() {
  const [customerOrders, setCustomerOrders] = useState<PayoutOrder[]>([]);
  const [wholesaleOrders, setWholesaleOrders] = useState<PayoutOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"customer" | "wholesale">("customer");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/payouts", {
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data.details || data.error ||
          (res.status === 401
            ? "Admin access required. Please sign in as admin."
            : "Could not load payouts.")
      );
    }

    setCustomerOrders(
      Array.isArray(data.customerOrders) ? data.customerOrders : []
    );
    setWholesaleOrders(
      Array.isArray(data.wholesaleOrders) ? data.wholesaleOrders : []
    );
  }, []);

  useEffect(() => {
    load()
      .catch((error: unknown) => {
        setMessage(
          error instanceof Error ? error.message : "Could not load payouts."
        );
      })
      .finally(() => setLoading(false));
  }, [load]);

  async function markDone(
    id: string,
    type: "CUSTOMER_ORDER" | "WHOLESALE_ORDER",
    payoutStatus: "PAID" | "PENDING"
  ) {
    setBusy(id);
    setMessage("");

    try {
      const res = await fetch("/api/admin/payouts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type, payoutStatus }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.details || data.error || "Could not update payout.");
      }

      await load();

      setMessage(
        payoutStatus === "PAID"
          ? "Payment marked as done."
          : "Payment reverted to pending."
      );
    } catch (error: unknown) {
      setMessage(
        error instanceof Error ? error.message : "Could not update payout."
      );
    } finally {
      setBusy("");
    }
  }

  const records =
    tab === "customer" ? customerOrders : wholesaleOrders;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 md:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin/dashboard" className="font-bold text-violet-700">
          ← Admin dashboard
        </Link>

        <h1 className="mt-5 text-3xl font-black">Payment Log</h1>
        <p className="mt-2 text-slate-600">
          Review orders, check the recipient&apos;s UPI ID, transfer manually,
          then mark the payout done.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setTab("customer")}
            className={`rounded-xl px-5 py-3 font-bold ${
              tab === "customer"
                ? "bg-violet-700 text-white"
                : "bg-white"
            }`}
          >
            Customer orders ({customerOrders.length})
          </button>

          <button
            onClick={() => setTab("wholesale")}
            className={`rounded-xl px-5 py-3 font-bold ${
              tab === "wholesale"
                ? "bg-violet-700 text-white"
                : "bg-white"
            }`}
          >
            Wholesale orders ({wholesaleOrders.length})
          </button>
        </div>

        {message && (
          <div
            role="status"
            className="mt-4 break-words rounded-xl bg-white p-4 text-sm"
          >
            {message}
          </div>
        )}

        {loading ? (
          <p className="mt-6">Loading payment records…</p>
        ) : records.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-8">
            <p className="font-bold">No orders found in this section.</p>
            <p className="mt-2 text-sm text-slate-600">
              Customer and wholesale orders appear in separate tabs.
            </p>
            <button
              onClick={() => {
                setLoading(true);
                setMessage("");
                load()
                  .catch((error: unknown) =>
                    setMessage(
                      error instanceof Error
                        ? error.message
                        : "Could not reload payouts."
                    )
                  )
                  .finally(() => setLoading(false));
              }}
              className="mt-4 rounded-xl bg-violet-700 px-4 py-2 font-bold text-white"
            >
              Refresh orders
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {records.map((o) => {
              const recipient =
                tab === "customer"
                  ? o.store?.owner
                  : o.wholesaleStore?.owner;

              const recipientStore =
                tab === "customer" ? o.store : o.wholesaleStore;

              const type =
                tab === "customer"
                  ? "CUSTOMER_ORDER"
                  : "WHOLESALE_ORDER";

              const items = Array.isArray(o.items) ? o.items : [];

              return (
                <article
                  key={o.id}
                  className="rounded-2xl bg-white p-5 shadow-sm md:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="break-all text-lg font-black">
                        Order #{o.id.slice(-8)}
                      </p>

                      {o.createdAt && (
                        <p className="mt-1 text-sm text-slate-500">
                          {new Date(o.createdAt).toLocaleString("en-IN")}
                        </p>
                      )}

                      <p className="mt-3 font-bold">
                        {tab === "customer" ? "Store" : "Manufacturer / Wholesaler"}:{" "}
                        {recipientStore?.storeName || "Store name unavailable"}
                      </p>

                      {tab === "customer" ? (
                        <>
                          <p className="mt-1 text-sm">
                            Customer: {o.customer?.name || "Customer"}
                          </p>
                          <p className="break-all text-sm">
                            {o.customer?.email || ""}
                          </p>
                          <p className="text-sm">
                            Customer phone: {o.customer?.phone || "—"}
                          </p>
                          <p className="mt-1 text-sm">
                            Delivery: {o.shippingName || "—"}, {o.phone || "—"},{" "}
                            {o.address || "—"}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="mt-1 text-sm">
                            Buyer: {o.buyerName || "—"}
                          </p>
                          <p className="text-sm">
                            Phone: {o.buyerPhone || "—"}
                          </p>
                          <p className="text-sm">
                            Address: {o.buyerAddress || "—"}
                          </p>
                        </>
                      )}

                      <div className="mt-3 rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Recipient UPI ID
                        </p>
                        <p className="mt-1 break-all font-black">
                          {recipient?.upiId || "Not added yet"}
                        </p>
                        <p className="mt-1 break-all text-xs text-slate-500">
                          Account: {recipient?.name || "—"} ·{" "}
                          {recipient?.email || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="min-w-44 text-left md:text-right">
                      <p className="text-2xl font-black">
                        ₹{Number(o.totalAmount || 0).toLocaleString("en-IN")}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Order status: {o.status}
                      </p>

                      <span
                        className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-black ${
                          o.payoutStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {o.payoutStatus === "PAID"
                          ? "Payment Done"
                          : "Payment Pending"}
                      </span>

                      {o.payoutPaidAt && (
                        <p className="mt-1 text-xs text-slate-500">
                          Paid:{" "}
                          {new Date(o.payoutPaidAt).toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 border-t pt-4">
                    <p className="mb-2 font-bold">Order items</p>
                    {items.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No item details returned by the API.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between gap-3 text-sm"
                          >
                            <span>
                              {item.productName} × {item.quantity}
                            </span>
                            <span>
                              ₹
                              {(
                                Number(item.unitPrice) * item.quantity
                              ).toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {o.payoutStatus !== "PAID" ? (
                      <button
                        disabled={busy === o.id || !recipient?.upiId}
                        onClick={() =>
                          markDone(o.id, type, "PAID")
                        }
                        className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {busy === o.id ? "Updating…" : "Payment Done"}
                      </button>
                    ) : (
                      <button
                        disabled={busy === o.id}
                        onClick={() =>
                          markDone(o.id, type, "PENDING")
                        }
                        className="rounded-xl border border-amber-300 px-5 py-3 font-bold text-amber-800 disabled:opacity-50"
                      >
                        {busy === o.id ? "Updating…" : "Revert to Pending"}
                      </button>
                    )}

                    {!recipient?.upiId && (
                      <p className="self-center text-sm text-red-600">
                        Recipient must add a UPI ID before this payout can be
                        marked done.
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
