
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CartItem = {
  productId: string;
  quantity: number;
  product: {
    name: string;
    price: string | number;
    images: { url: string }[];
    seller?: { storeName: string } | null;
  };
};

const PAYMENT_QR_IMAGE = "/images/spectwala-payment-qr.jpeg";

function money(value: number) {
  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

export default function Checkout() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState({
    shippingName: "",
    phone: "",
    address: "",
    paymentReference: "",
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCart() {
      try {
        const response = await fetch("/api/cart");

        if (response.status === 401) {
          window.location.href = "/login?next=/checkout";
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not load your cart.");
        }

        if (!cancelled) {
          setItems(data?.cart?.items || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load your cart."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCart();

    return () => {
      cancelled = true;
    };
  }, []);

  const total = items.reduce(
    (sum, item) =>
      sum + Number(item.product.price) * item.quantity,
    0
  );

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMsg("");

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!screenshot) {
      setError("Please upload your UPI payment screenshot.");
      return;
    }

    if (screenshot.size > 1024 * 1024) {
      setError("Screenshot must be 1 MB or smaller.");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(screenshot.type)) {
      setError("Please select a JPG, PNG, or WebP image.");
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();

      data.set("shippingName", form.shippingName.trim());
      data.set("phone", form.phone.trim());
      data.set("address", form.address.trim());
      data.set("paymentReference", form.paymentReference.trim());

      // IMPORTANT: The API reads formData.get("paymentProof").
      // Use exactly the same field name here.
      data.set("paymentProof", screenshot, screenshot.name);

      const response = await fetch("/api/orders", {
        method: "POST",
        body: data,
      });

      if (response.status === 401) {
        window.location.href = "/login?next=/checkout";
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not place order.");
      }

      setMsg(
        result.message || "Order submitted successfully."
      );

      window.location.href = "/orders";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not place order."
      );
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="p-10">Loading checkout...</main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f6ff] text-[#11152c]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link
            href="/shop"
            className="text-2xl font-black text-[#3426a8]"
          >
            SPECTWALA
          </Link>

          <Link href="/cart" className="font-bold">
            Back to Cart
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10">
        <p className="text-xs font-black uppercase tracking-widest text-[#3426a8]">
          Secure checkout
        </p>

        <h1 className="mt-2 text-4xl font-black">
          Complete your order
        </h1>

        <p className="mt-3 text-slate-600">
          Pay using the Spectwala QR code and upload your payment
          proof. Your payment will be reviewed by the admin.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl bg-red-50 p-4 font-semibold text-red-700"
          >
            {error}
          </div>
        )}

        {msg && (
          <div
            role="status"
            className="mt-5 rounded-xl bg-green-50 p-4 font-semibold text-green-800"
          >
            {msg}
          </div>
        )}

        {items.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow">
            <h2 className="text-2xl font-black">
              Your cart is empty
            </h2>

            <Link
              href="/shop"
              className="mt-5 inline-block rounded-xl bg-[#3426a8] px-6 py-3 font-black text-white"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]"
          >
            <div className="space-y-6">
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black">
                  1. Delivery details
                </h2>

                <div className="mt-5 space-y-4">
                  <input
                    required
                    maxLength={120}
                    autoComplete="name"
                    className="w-full rounded-xl border p-4"
                    placeholder="Full name"
                    value={form.shippingName}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        shippingName: event.target.value,
                      })
                    }
                  />

                  <input
                    required
                    maxLength={20}
                    type="tel"
                    autoComplete="tel"
                    className="w-full rounded-xl border p-4"
                    placeholder="Mobile number"
                    value={form.phone}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        phone: event.target.value,
                      })
                    }
                  />

                  <textarea
                    required
                    maxLength={2000}
                    rows={4}
                    autoComplete="street-address"
                    className="w-full rounded-xl border p-4"
                    placeholder="Complete delivery address, city, state and PIN code"
                    value={form.address}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        address: event.target.value,
                      })
                    }
                  />
                </div>
              </section>

              <section className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black">
                  2. Pay using UPI
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  Scan this QR code with your UPI app. Confirm the
                  recipient and amount before paying.
                </p>

                <div className="mt-5 flex justify-center rounded-2xl bg-slate-50 p-4">
                  <img
                    src={PAYMENT_QR_IMAGE}
                    alt="Spectwala UPI payment QR code"
                    className="h-64 w-64 object-contain"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>

                <p className="mt-3 text-center text-xs text-slate-500">
                  Verify the recipient before making payment.
                </p>

                <div className="mt-5 rounded-2xl bg-[#f7f6ff] p-4">
                  <p className="text-sm font-bold text-slate-500">
                    Amount to pay
                  </p>

                  <p className="mt-1 text-3xl font-black text-[#3426a8]">
                    {money(total)}
                  </p>
                </div>

                <label className="mt-5 block text-sm font-bold">
                  UPI transaction reference / UTR

                  <input
                    required
                    minLength={4}
                    maxLength={100}
                    className="mt-2 w-full rounded-xl border p-4 font-normal"
                    placeholder="Enter reference from your UPI app"
                    value={form.paymentReference}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        paymentReference: event.target.value,
                      })
                    }
                  />
                </label>

                <label className="mt-5 block text-sm font-bold">
                  Upload payment screenshot

                  <input
                    required
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="mt-2 block w-full rounded-xl border p-3 font-normal"
                    onChange={(event) => {
                      setScreenshot(
                        event.target.files?.[0] || null
                      );
                      setError("");
                    }}
                  />

                  <span className="mt-2 block text-xs font-normal text-slate-500">
                    JPG, PNG or WebP. Maximum 1 MB.
                  </span>
                </label>

                {screenshot && (
                  <div className="mt-3 rounded-xl bg-green-50 p-3">
                    <p className="break-all text-sm font-semibold text-green-800">
                      Selected: {screenshot.name}
                    </p>

                    <button
                      type="button"
                      onClick={() => setScreenshot(null)}
                      className="mt-2 text-sm font-bold text-red-700 underline"
                    >
                      Remove screenshot
                    </button>
                  </div>
                )}
              </section>
            </div>

            <aside className="h-fit rounded-3xl bg-white p-6 shadow-xl">
              <h2 className="text-xl font-black">
                Order summary
              </h2>

              <div className="mt-5 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-bold">
                        {item.product.name}
                      </p>

                      <p className="text-sm text-slate-500">
                        Qty: {item.quantity}
                      </p>

                      {item.product.seller?.storeName && (
                        <p className="text-xs text-slate-500">
                          Seller: {item.product.seller.storeName}
                        </p>
                      )}
                    </div>

                    <p className="shrink-0 font-bold">
                      {money(
                        Number(item.product.price) * item.quantity
                      )}
                    </p>
                  </div>
                ))}
              </div>

              <div className="my-5 border-t" />

              <div className="flex items-center justify-between gap-3">
                <span className="font-bold">Total</span>

                <span className="text-2xl font-black text-[#3426a8]">
                  {money(total)}
                </span>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                Orders are submitted for review. Uploading a
                screenshot does not itself confirm that payment
                was received.
              </p>

              <button
                type="submit"
                disabled={submitting || items.length === 0}
                className="mt-6 w-full rounded-xl bg-[#3426a8] py-4 font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Submitting order..."
                  : "Submit payment proof & place order"}
              </button>
            </aside>
          </form>
        )}
      </div>
    </main>
  );
}
