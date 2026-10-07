"use client";

import { useEffect, useState } from "react";

type Tab = "store" | "products" | "orders";

export default function Wholesale() {
  const [tab, setTab] = useState<Tab>("store");

  const [store, setStore] = useState<any>();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [storeRes, productRes, orderRes] =
          await Promise.all([
            fetch("/api/wholesale/setup"),
            fetch("/api/wholesale/products"),
            fetch("/api/wholesale/orders"),
          ]);

        const storeData = await storeRes.json();
        const productData = await productRes.json();
        const orderData = await orderRes.json();

        if (storeData.error) {
          location.href =
            "/login?role=wholesaler";

          return;
        }

        setStore(storeData.store);
        setProducts(productData.products || []);
        setOrders(orderData.orders || []);
      } catch (error) {
        console.error(
          "Wholesale dashboard error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#08101b] text-white">
        <div className="text-center">
          <div className="text-4xl">S</div>
          <p className="mt-4 font-black">
            Loading wholesale workspace…
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#08101b] text-white">

      {/* HEADER */}

      <header className="border-b border-white/10 bg-white/[.03]">

        <div className="mx-auto flex max-w-7xl items-center px-5 py-5">

          <a
            href="/wholesale"
            className="mr-auto text-2xl font-black"
          >
            SPECTWALA{" "}
            <span className="text-sm text-cyan-300">
              WHOLESALE
            </span>
          </a>

          <a
            href="/api/auth/logout"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold transition hover:bg-white/10"
          >
            Logout
          </a>

        </div>

      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">

        {/* HERO */}

        <div className="rounded-[32px] bg-gradient-to-br from-cyan-700 to-blue-900 p-8 md:p-10">

          <p className="text-xs font-black uppercase tracking-[.25em] text-white/60">
            Private B2B workspace
          </p>

          <h1 className="mt-2 text-4xl font-black">
            {store?.storeName ||
              "Wholesale store"}
          </h1>

          <p className="mt-3 max-w-2xl text-white/65">
            Manage your wholesale store,
            products, inventory, bulk imports
            and orders from one private
            workspace.
          </p>

        </div>

        {/* NAVIGATION */}

        <div className="mt-7 flex flex-wrap gap-2">

          <button
            onClick={() => setTab("store")}
            className={`rounded-xl px-5 py-3 text-sm font-black transition ${
              tab === "store"
                ? "bg-white text-[#08101b]"
                : "bg-white/10 hover:bg-white/15"
            }`}
          >
            Store
          </button>

          <button
            onClick={() => setTab("products")}
            className={`rounded-xl px-5 py-3 text-sm font-black transition ${
              tab === "products"
                ? "bg-white text-[#08101b]"
                : "bg-white/10 hover:bg-white/15"
            }`}
          >
            Products
          </button>

          <button
            onClick={() => setTab("orders")}
            className={`rounded-xl px-5 py-3 text-sm font-black transition ${
              tab === "orders"
                ? "bg-white text-[#08101b]"
                : "bg-white/10 hover:bg-white/15"
            }`}
          >
            Orders
          </button>

        </div>

        {/* =====================================================
            STORE
        ===================================================== */}

        {tab === "store" && (
          <section className="mt-7">

            <div className="grid gap-5 md:grid-cols-3">

              <Stat
                n={String(products.length)}
                t="Wholesale products"
              />

              <Stat
                n={String(orders.length)}
                t="Orders"
              />

              <Stat
                n="B2B"
                t="Private visibility"
              />

            </div>

            <div className="mt-7 rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>

                  <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-300">
                    Store settings
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    Manage wholesale store
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
                    Update your wholesale store
                    name, logo, business details,
                    GST, PAN and address.
                  </p>

                </div>

                <a
                  href="/wholesale/setup"
                  className="rounded-xl bg-white px-5 py-3 text-center text-sm font-black text-[#08101b] transition hover:bg-cyan-100"
                >
                  Manage Store
                </a>

              </div>

            </div>

            {/* PRODUCT MANAGEMENT SHORTCUT */}

            <div className="mt-5 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-7 ring-1 ring-cyan-300/20">

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>

                  <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-300">
                    Catalogue management
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    Products & Bulk Import
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
                    Add products manually or
                    import your supplier catalogue
                    using CSV, XLSX or XLS.
                    Existing SKUs are automatically
                    updated instead of duplicated.
                  </p>

                </div>

                <a
                  href="/wholesale/products"
                  className="rounded-xl bg-cyan-300 px-5 py-3 text-center text-sm font-black text-[#08101b] transition hover:bg-cyan-200"
                >
                  Manage Products
                </a>

              </div>

            </div>

          </section>
        )}

        {/* =====================================================
            PRODUCTS
        ===================================================== */}

        {tab === "products" && (
          <section className="mt-7">

            <div className="rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-7 ring-1 ring-cyan-300/20">

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>

                  <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-300">
                    Product management
                  </p>

                  <h2 className="mt-2 text-3xl font-black">
                    Wholesale Catalogue
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                    Manage product details,
                    pricing, stock, images, SKU,
                    categories and supplier imports.
                  </p>

                </div>

                <a
                  href="/wholesale/products"
                  className="rounded-xl bg-cyan-300 px-5 py-3 text-center text-sm font-black text-[#08101b] transition hover:bg-cyan-200"
                >
                  Open Product Manager
                </a>

              </div>

            </div>

            {/* PRODUCT SUMMARY */}

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">

                <p className="text-3xl font-black">
                  {products.length}
                </p>

                <p className="mt-1 text-sm text-white/40">
                  Total products
                </p>

              </div>

              <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">

                <p className="text-3xl font-black">
                  {
                    products.filter(
                      (p) =>
                        Number(
                          p.stock || 0
                        ) > 0
                    ).length
                  }
                </p>

                <p className="mt-1 text-sm text-white/40">
                  In stock
                </p>

              </div>

              <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">

                <p className="text-3xl font-black">
                  {
                    products.filter(
                      (p) =>
                        Number(
                          p.stock || 0
                        ) <= 0
                    ).length
                  }
                </p>

                <p className="mt-1 text-sm text-white/40">
                  Out of stock
                </p>

              </div>

            </div>

            {/* PRODUCT PREVIEW */}

            {products.length === 0 ? (
              <div className="mt-7 rounded-3xl border border-dashed border-white/10 p-12 text-center">

                <div className="text-5xl">
                  📦
                </div>

                <h3 className="mt-4 text-xl font-black">
                  No products yet
                </h3>

                <p className="mt-2 text-sm text-white/40">
                  Open Product Manager to
                  manually add products or
                  import your supplier catalogue.
                </p>

                <a
                  href="/wholesale/products"
                  className="mt-6 inline-block rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-[#08101b]"
                >
                  Add Products
                </a>

              </div>
            ) : (
              <div className="mt-7">

                <div className="mb-4 flex items-center justify-between">

                  <div>
                    <p className="text-xs font-black uppercase tracking-[.2em] text-white/35">
                      Inventory preview
                    </p>

                    <h3 className="mt-1 text-xl font-black">
                      Your products
                    </h3>
                  </div>

                  <a
                    href="/wholesale/products"
                    className="rounded-xl bg-white/10 px-4 py-2 text-xs font-black hover:bg-white/15"
                  >
                    View all
                  </a>

                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                  {products
                    .slice(0, 6)
                    .map((product) => (
                      <div
                        key={product.id}
                        className="overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10"
                      >

                        {product.images?.[0]?.url ? (
                          <img
                            src={
                              product
                                .images[0]
                                .url
                            }
                            className="h-44 w-full object-cover"
                            alt={
                              product.name
                            }
                          />
                        ) : (
                          <div className="grid h-44 place-items-center bg-white/5 text-5xl">
                            👓
                          </div>
                        )}

                        <div className="p-5">

                          <div className="flex items-start justify-between gap-3">

                            <div>

                              <p className="font-black">
                                {
                                  product.name
                                }
                              </p>

                              {product.brand && (
                                <p className="mt-1 text-xs font-bold text-cyan-300">
                                  {
                                    product.brand
                                  }
                                </p>
                              )}

                            </div>

                            {product.sku && (
                              <span className="rounded-lg bg-white/10 px-2 py-1 font-mono text-[10px] text-white/50">
                                {
                                  product.sku
                                }
                              </span>
                            )}

                          </div>

                          <p className="mt-2 text-xs text-white/35">
                            {
                              product
                                .category
                                ?.name ||
                              "Optical wholesale"
                            }
                          </p>

                          <div className="mt-4 flex items-center justify-between">

                            <p className="text-sm font-bold text-white/60">

                              ₹
                              {Number(
                                product.wholesalePrice ||
                                  product.price ||
                                  0
                              ).toLocaleString(
                                "en-IN"
                              )}

                            </p>

                            <p
                              className={`text-xs font-black ${
                                Number(
                                  product.stock ||
                                    0
                                ) > 0
                                  ? "text-emerald-300"
                                  : "text-red-300"
                              }`}
                            >
                              {
                                product.stock
                              }{" "}
                              units
                            </p>

                          </div>

                        </div>

                      </div>
                    ))}

                </div>

              </div>
            )}

          </section>
        )}

        {/* =====================================================
            ORDERS
        ===================================================== */}

        {tab === "orders" && (
          <section className="mt-7">

            {orders.length === 0 ? (
              <div className="rounded-3xl bg-white/5 p-12 text-center">

                <div className="text-5xl">
                  🧾
                </div>

                <h3 className="mt-4 text-xl font-black">
                  No wholesale orders yet
                </h3>

                <p className="mt-2 text-sm text-white/40">
                  Orders from your wholesale
                  buyers will appear here.
                </p>

              </div>
            ) : (
              <div className="space-y-4">

                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10"
                  >

                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                      <div>

                        <p className="font-black">
                          Order #
                          {order.id.slice(-6)}
                        </p>

                        <p className="mt-2 text-sm text-white/45">
                          ₹
                          {Number(
                            order.totalAmount
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                      </div>

                      <span className="inline-block w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                        {
                          order.status
                        }
                      </span>

                    </div>

                  </div>
                ))}

              </div>
            )}

          </section>
        )}

      </div>
    </main>
  );
}

function Stat({
  n,
  t,
}: {
  n: string;
  t: string;
}) {
  return (
    <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">

      <p className="text-3xl font-black">
        {n}
      </p>

      <p className="mt-1 text-sm text-white/45">
        {t}
      </p>

    </div>
  );
}