
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  sku?: string | null;
  brand?: string | null;
  description?: string | null;
  price: number | string;
  wholesalePrice?: number | string | null;
  stock: number;
  images?: { url: string }[];
  category?: { name: string } | null;
  wholesaleStore?: {
    storeName: string;
    city?: string | null;
    state?: string | null;
  } | null;
};

export default function SellerWholesaleMarket() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/seller/wholesale-market", {
        cache: "no-store",
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        window.location.href = "/login?role=seller";
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Could not load wholesale products.");
      }

      setProducts(data.products || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load products."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return products;

    return products.filter((product) =>
      [
        product.name,
        product.brand,
        product.sku,
        product.category?.name,
        product.wholesaleStore?.storeName,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [products, search]);

  async function placeOrder(product: Product) {
    const quantity = Math.floor(Number(quantities[product.id] || 1));

    if (quantity < 1) {
      setError("Choose a quantity of at least 1.");
      return;
    }

    if (quantity > product.stock) {
      setError(`Only ${product.stock} units are currently available.`);
      return;
    }

    setOrdering(product.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/seller/wholesale-market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        window.location.href = "/login?role=seller";
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Could not place wholesale order.");
      }

      setMessage(
        `Order placed successfully for ${product.name}. Order ID: ${data.order.id}`
      );
      setQuantities((previous) => ({ ...previous, [product.id]: 1 }));
      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not place order."
      );
    } finally {
      setOrdering(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-white/[0.03]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-5 py-5">
          <a href="/seller" className="mr-auto text-xl font-black">
            SPECTWALA <span className="text-cyan-300">SELLER</span>
          </a>
          <a
            href="/seller"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold"
          >
            Back to Dashboard
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <section className="rounded-3xl bg-gradient-to-br from-cyan-800 to-blue-950 p-7 sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-100">
            Business-to-business marketplace
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-5xl">
            Wholesale Market
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
            Discover products listed by wholesalers and manufacturers,
            compare wholesale prices, and order stock for your optical store.
          </p>
        </section>

        <section className="mt-7">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product, brand, category or wholesaler..."
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/35 focus:border-cyan-400"
            />
            <button
              onClick={() => void loadProducts()}
              className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950"
            >
              Refresh products
            </button>
          </div>

          {message && (
            <div className="mt-5 break-words rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-200">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-5 break-words rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="mt-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-cyan-300">
                Available catalogue
              </p>
              <h2 className="mt-1 text-2xl font-black">Wholesale products</h2>
            </div>
            <span className="text-sm text-white/50">
              {filteredProducts.length} products
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-white/60">
              Loading wholesale products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <p className="text-lg font-bold">No wholesale products found</p>
              <p className="mt-2 text-sm text-white/50">
                Try another search, or check again after wholesalers publish
                products.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                const unitPrice = Number(
                  product.wholesalePrice ?? product.price ?? 0
                );

                return (
                  <article
                    key={product.id}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]"
                  >
                    {product.images?.[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="h-52 w-full bg-white object-cover"
                      />
                    ) : (
                      <div className="grid h-52 place-items-center bg-white/5 text-6xl">
                        👓
                      </div>
                    )}

                    <div className="p-5">
                      <p className="text-xs font-bold text-cyan-300">
                        {product.wholesaleStore?.storeName ||
                          "Wholesale supplier"}
                      </p>

                      <h3 className="mt-2 text-lg font-black">
                        {product.name}
                      </h3>

                      <p className="mt-1 text-xs text-white/45">
                        {[product.category?.name, product.brand, product.sku]
                          .filter(Boolean)
                          .join(" · ") || "Optical product"}
                      </p>

                      <p className="mt-3 line-clamp-3 min-h-12 text-sm leading-6 text-white/60">
                        {product.description || "Wholesale optical product."}
                      </p>

                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs text-white/45">
                            Wholesale price / unit
                          </p>
                          <p className="text-2xl font-black">
                            ₹{unitPrice.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            product.stock > 0
                              ? "bg-emerald-400/10 text-emerald-300"
                              : "bg-red-400/10 text-red-300"
                          }`}
                        >
                          {product.stock} in stock
                        </span>
                      </div>

                      <div className="mt-5 flex gap-3">
                        <label className="flex w-24 shrink-0 flex-col gap-1 text-xs text-white/50">
                          Quantity
                          <input
                            type="number"
                            min={1}
                            max={product.stock}
                            value={quantities[product.id] ?? 1}
                            onChange={(event) =>
                              setQuantities((previous) => ({
                                ...previous,
                                [product.id]: Math.max(
                                  1,
                                  Math.floor(Number(event.target.value) || 1)
                                ),
                              }))
                            }
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-sm text-white"
                          />
                        </label>

                        <button
                          disabled={
                            product.stock < 1 || ordering === product.id
                          }
                          onClick={() => void placeOrder(product)}
                          className="mt-5 flex-1 rounded-xl bg-cyan-400 px-3 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {ordering === product.id
                            ? "Placing order..."
                            : product.stock < 1
                              ? "Out of stock"
                              : "Place order"}
                        </button>
                      </div>

                      <p className="mt-3 text-xs text-white/40">
                        Estimated total: ₹
                        {(unitPrice *
                          Math.max(
                            1,
                            Math.floor(Number(quantities[product.id] || 1))
                          )).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
