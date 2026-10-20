
"use client";

import { useCallback, useEffect, useState } from "react";

type AnyRecord = Record<string, any>;

export default function Seller() {
  const [tab, setTab] = useState("store");
  const [store, setStore] = useState<AnyRecord | null>(null);
  const [orders, setOrders] = useState<AnyRecord[]>([]);
  const [products, setProducts] = useState<AnyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [storeMissing, setStoreMissing] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    setStoreMissing(false);

    try {
      const [storeResponse, ordersResponse, productsResponse] =
        await Promise.all([
          fetch("/api/store/setup", { cache: "no-store" }),
          fetch("/api/store/orders", { cache: "no-store" }),
          fetch("/api/store/products", { cache: "no-store" }),
        ]);

      const readJson = async (response: Response) => {
        try {
          return await response.json();
        } catch {
          return {};
        }
      };

      const [storeData, orderData, productData] = await Promise.all([
        readJson(storeResponse),
        readJson(ordersResponse),
        readJson(productsResponse),
      ]);

      if (!storeResponse.ok) {
        if (storeResponse.status === 401) {
          setLoadError(
            "Your seller session could not be verified. Please sign in again using Optical Store."
          );
        } else if (storeResponse.status === 403) {
          setLoadError(
            "This account does not have seller access. Sign in with the approved Optical Store account."
          );
        } else {
          setLoadError(
            storeData.error || "Could not load your store information."
          );
        }
      }

      if (storeResponse.ok && !storeData.store) {
        setStoreMissing(true);
      }

      setStore(storeData.store || null);

      if (ordersResponse.ok) {
        setOrders(Array.isArray(orderData.orders) ? orderData.orders : []);
      } else {
        setLoadError(
          (previous) =>
            previous ||
            orderData.error ||
            "Could not load your customer orders."
        );
      }

      if (productsResponse.ok) {
        setProducts(
          Array.isArray(productData.products) ? productData.products : []
        );
      } else {
        setLoadError(
          (previous) =>
            previous ||
            productData.error ||
            "Could not load your products."
        );
      }
    } catch (error) {
      console.error("Seller dashboard load failed:", error);
      setLoadError(
        "A network error occurred while loading the dashboard. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <main className="min-h-screen bg-[#f6f5fb] text-[#11152c]">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-5 py-4">
          <a
            href="/seller"
            className="mr-auto text-2xl font-black text-[#3426a8]"
          >
            SPECTWALA{" "}
            <span className="text-sm text-slate-400">SELLER</span>
          </a>

          {/* ADDED: Seller Wholesale Market link */}
          <a
            href="/seller/wholesale-market"
            className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-black text-[#3426a8] transition hover:bg-violet-100"
          >
            🏪 Wholesale Market
          </a>

          <a
            href="/seller/payments"
            className="rounded-xl bg-violet-700 px-4 py-2 text-sm font-black text-white hover:bg-violet-800"
          >
            Payment Log
          </a>

          <a
            href={store ? `/store/${store.id}` : "/store-setup"}
            className="rounded-xl bg-[#3426a8] px-4 py-2 text-sm font-black text-white"
          >
            {store ? "View Store" : "Set Up Store"}
          </a>

          <a
            href="/api/auth/logout"
            className="rounded-xl border px-4 py-2 text-sm font-bold"
          >
            Logout
          </a>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-7 px-5 py-8 lg:grid-cols-[230px_1fr]">
        <aside className="h-fit rounded-3xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
          <button
            onClick={() => setTab("store")}
            className={`w-full rounded-2xl p-4 text-left font-black ${
              tab === "store" ? "bg-[#f0efff] text-[#3426a8]" : ""
            }`}
          >
            🏪 Store
          </button>

          <button
            onClick={() => setTab("products")}
            className={`w-full rounded-2xl p-4 text-left font-black ${
              tab === "products" ? "bg-[#f0efff] text-[#3426a8]" : ""
            }`}
          >
            👓 Products
          </button>

          <button
            onClick={() => setTab("orders")}
            className={`w-full rounded-2xl p-4 text-left font-black ${
              tab === "orders" ? "bg-[#f0efff] text-[#3426a8]" : ""
            }`}
          >
            📦 Orders
            <span className="float-right rounded-full bg-violet-100 px-2 text-xs">
              {orders.length}
            </span>
          </button>

          <a
            href="/seller/payments"
            className="mt-1 block rounded-2xl p-4 font-black text-violet-700 hover:bg-violet-50"
          >
            💳 Payment Log
          </a>
        </aside>

        <section className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[.25em] text-[#3426a8]">
            Business dashboard
          </p>

          <h1 className="mt-2 break-words text-4xl font-black">
            {store?.storeName || "Your store"}
          </h1>

          {loadError && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p>{loadError}</p>
              <button
                onClick={() => void loadDashboard()}
                className="mt-3 rounded-lg bg-amber-900 px-4 py-2 font-bold text-white"
              >
                Retry loading
              </button>
            </div>
          )}

          {loading ? (
            <div className="mt-7 rounded-3xl bg-white p-8 text-slate-500">
              Loading dashboard...
            </div>
          ) : (
            <>
              {storeMissing && (
                <div className="mt-7 rounded-3xl border border-violet-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-black">
                    Finish setting up your optical store
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Your seller login is active, but no store is linked to this
                    account yet. Create or complete your store setup to manage
                    products and orders.
                  </p>
                  <a
                    href="/store-setup"
                    className="mt-5 inline-block rounded-xl bg-[#3426a8] px-5 py-3 font-black text-white"
                  >
                    Set Up Store
                  </a>
                </div>
              )}

              {tab === "store" && (
                <div className="mt-7 grid gap-5 sm:grid-cols-3">
                  <Stat n={String(products.length)} t="Products" />
                  <Stat n={String(orders.length)} t="Orders" />
                  <Stat n="COD" t="Payment mode" />
                </div>
              )}

              {tab === "products" && (
                <div className="mt-7">
                  <a
                    href="/store-setup/products"
                    className="inline-block rounded-2xl bg-[#3426a8] px-5 py-3 font-black text-white"
                  >
                    + Add product
                  </a>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="rounded-3xl bg-white p-5 ring-1 ring-slate-200"
                      >
                        <p className="font-black">{product.name}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          ₹{Number(product.price).toLocaleString("en-IN")} ·{" "}
                          {product.stock} stock
                        </p>
                      </div>
                    ))}

                    {!products.length && (
                      <div className="rounded-3xl bg-white p-8 text-slate-500">
                        No products found.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {tab === "orders" && (
                <div className="mt-7 space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-3xl bg-white p-6 ring-1 ring-slate-200"
                    >
                      <div className="flex flex-wrap justify-between gap-4">
                        <div>
                          <p className="font-black">
                            {order.customer?.name || "Customer"}
                          </p>
                          <p className="text-sm text-slate-500">
                            {order.customer?.email || ""}
                          </p>
                          <p className="mt-1 break-all text-xs text-slate-400">
                            Order ID: {order.id}
                          </p>
                        </div>

                        <span className="h-fit rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-[#3426a8]">
                          {order.status}
                        </span>
                      </div>

                      <p className="mt-4 text-xl font-black">
                        ₹
                        {Number(order.totalAmount || 0).toLocaleString("en-IN")}
                      </p>

                      {Array.isArray(order.items) && (
                        <div className="mt-3 space-y-1 text-sm text-slate-600">
                          {order.items.map(
                            (item: AnyRecord, index: number) => (
                              <p key={item.id || index}>
                                {item.productName || item.name || "Product"} ×{" "}
                                {item.quantity}
                              </p>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {!orders.length && (
                    <div className="rounded-3xl bg-white p-12 text-center text-slate-500">
                      No customer orders yet.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({ n, t }: { n: string; t: string }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <p className="text-3xl font-black">{n}</p>
      <p className="mt-1 text-sm text-slate-500">{t}</p>
    </div>
  );
}
