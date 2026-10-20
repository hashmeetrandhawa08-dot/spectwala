
"use client";

import { useCallback, useEffect, useState } from "react";

type PaymentOrder = {
  id: string;
  totalAmount: string;
  paymentMethod: string;
  paymentReference: string | null;
  paymentProofData: string | null;
  paymentStatus: string;
  status: string;
  shippingName: string;
  phone: string;
  address: string;
  createdAt: string;
  customer: {
    name: string | null;
    email: string;
    phone: string | null;
  };
  store: {
    storeName: string;
  };
  items: {
    id: string;
    productName: string;
    quantity: number;
    unitPrice: string | number;
  }[];
};

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selected, setSelected] = useState<PaymentOrder | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/payments", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load payments.");
      }

      setOrders(data.orders || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load payments."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  async function updatePayment(
    order: PaymentOrder,
    paymentStatus: "VERIFIED" | "REJECTED"
  ) {
    const action = paymentStatus === "VERIFIED" ? "verify" : "reject";

    if (!window.confirm(`Are you sure you want to ${action} this payment?`)) {
      return;
    }

    setBusyId(order.id);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/payments/${encodeURIComponent(order.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update payment.");
      }

      setSelected(null);
      await loadOrders();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update payment."
      );
    } finally {
      setBusyId(null);
    }
  }

  function money(value: string | number) {
    return Number(value).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });
  }

  function statusStyle(status: string) {
    if (status === "VERIFIED") return "bg-green-100 text-green-800";
    if (status === "REJECTED") return "bg-red-100 text-red-800";
    return "bg-amber-100 text-amber-800";
  }

  const pendingCount = orders.filter(
    (order) => order.paymentStatus === "PENDING_REVIEW"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[#3426a8]">
              Spectwala Admin
            </p>
            <h1 className="mt-2 text-3xl font-black">Payment Log</h1>
            <p className="mt-2 text-sm text-slate-500">
              Review UPI references and uploaded payment screenshots.
            </p>
          </div>

          <button
            onClick={() => void loadOrders()}
            disabled={loading}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">UPI orders</p>
            <p className="mt-2 text-3xl font-black">{orders.length}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Awaiting review</p>
            <p className="mt-2 text-3xl font-black text-amber-600">
              {pendingCount}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Verified payments</p>
            <p className="mt-2 text-3xl font-black text-green-700">
              {orders.filter((order) => order.paymentStatus === "VERIFIED").length}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 rounded-2xl bg-white p-10 text-center">
            Loading payment records...
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-10 text-center">
            <h2 className="text-xl font-bold">No UPI orders yet</h2>
            <p className="mt-2 text-slate-500">
              Customer orders submitted through UPI checkout will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Order / Date</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Seller store</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Payment status</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-slate-100">
                    <td className="px-5 py-4">
                      <p className="font-bold">{order.id}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleString("en-IN")}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold">
                        {order.customer.name || order.shippingName}
                      </p>
                      <p className="text-sm text-slate-500">
                        {order.customer.email}
                      </p>
                    </td>
                    <td className="px-5 py-4">{order.store.storeName}</td>
                    <td className="px-5 py-4 font-black">
                      {money(order.totalAmount)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle(order.paymentStatus)}`}>
                        {order.paymentStatus.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelected(order)}
                        className="rounded-lg bg-[#3426a8] px-4 py-2 text-sm font-bold text-white"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <section className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-black">Review payment</h2>
                <p className="mt-1 break-all text-xs text-slate-500">
                  Order: {selected.id}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg bg-slate-100 px-3 py-2 font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Customer
                  </p>
                  <p className="mt-2 font-bold">
                    {selected.shippingName}
                  </p>
                  <p className="text-sm">{selected.phone}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                    {selected.address}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Payment details
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    {money(selected.totalAmount)}
                  </p>
                  <p className="mt-2 break-all text-sm">
                    UTR: {selected.paymentReference || "Not provided"}
                  </p>
                  <p className="mt-2 text-sm">
                    Status: <strong>{selected.paymentStatus}</strong>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-black">Items in this seller order</h3>
                <div className="mt-2 divide-y rounded-xl border">
                  {selected.items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-4 p-3">
                      <span>
                        {item.productName} × {item.quantity}
                      </span>
                      <strong>
                        {money(Number(item.unitPrice) * item.quantity)}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-black">Payment screenshot</h3>
                {selected.paymentProofData ? (
                  <a
                    href={selected.paymentProofData}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block rounded-xl border bg-slate-50 p-3"
                  >
                    <img
                      src={selected.paymentProofData}
                      alt="Customer-submitted payment screenshot"
                      className="mx-auto max-h-[420px] w-full object-contain"
                    />
                    <p className="mt-2 text-center text-sm font-bold text-[#3426a8]">
                      Open screenshot in new tab
                    </p>
                  </a>
                ) : (
                  <p className="mt-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                    No payment screenshot was saved for this order.
                  </p>
                )}
                <p className="mt-3 text-sm text-slate-500">
                  Verify the payment in your UPI account. A screenshot and UTR
                  alone do not confirm that money was received.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 border-t pt-5">
                <button
                  onClick={() => void updatePayment(selected, "REJECTED")}
                  disabled={busyId === selected.id}
                  className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white disabled:opacity-50"
                >
                  Reject payment
                </button>
                <button
                  onClick={() => void updatePayment(selected, "VERIFIED")}
                  disabled={busyId === selected.id}
                  className="rounded-xl bg-green-700 px-5 py-3 font-bold text-white disabled:opacity-50"
                >
                  {busyId === selected.id ? "Saving..." : "Mark verified"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
