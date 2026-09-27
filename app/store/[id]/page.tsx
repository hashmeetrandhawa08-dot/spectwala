"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: string | number;
  stock: number;

  images: {
    id?: string;
    url: string;
  }[];

  category: {
    id: string;
    name: string;
  };
};

type Store = {
  id: string;
  storeName: string;
  logoUrl?: string | null;
  description?: string | null;

  address?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  pincode?: string | null;

  products: Product[];
};

export default function StorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [store, setStore] =
    useState<Store | null>(null);

  const [loading, setLoading] = useState(true);

  const [adding, setAdding] =
    useState<string | null>(null);

  useEffect(() => {
    params.then(({ id }) => {
      loadStore(id);
    });
  }, [params]);

  async function loadStore(id: string) {
    try {
      const response = await fetch(
        `/api/shop/stores/${id}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setStore(null);
        return;
      }

      setStore(data.store);
    } catch (error) {
      console.error(
        "Store loading error:",
        error
      );

      setStore(null);
    } finally {
      setLoading(false);
    }
  }

  async function addToCart(productId: string) {
    setAdding(productId);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        window.location.href =
          "/login?next=" +
          encodeURIComponent(
            window.location.pathname
          );

        return;
      }

      if (!response.ok) {
        alert(
          data.error ||
            "Unable to add product."
        );

        return;
      }

      alert("Added to cart ✓");
    } catch {
      alert("Something went wrong.");
    } finally {
      setAdding(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f5fb] p-6">
        <div className="mx-auto max-w-6xl animate-pulse">

          <div className="h-72 rounded-[32px] bg-slate-200" />

          <div className="mt-8 h-12 w-64 rounded-xl bg-slate-200" />

          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({
              length: 8,
            }).map((_, index) => (
              <div
                key={index}
                className="h-80 rounded-3xl bg-slate-200"
              />
            ))}
          </div>

        </div>
      </main>
    );
  }

  if (!store) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f5fb] p-6">

        <div className="rounded-3xl bg-white p-10 text-center shadow-xl">

          <div className="text-6xl">
            👓
          </div>

          <h1 className="mt-5 text-3xl font-black">
            Store not found
          </h1>

          <p className="mt-2 text-slate-500">
            This store may no longer be active.
          </p>

          <Link
            href="/shop"
            className="mt-6 inline-block rounded-xl bg-[#3426a8] px-6 py-3 font-black text-white"
          >
            Back to marketplace
          </Link>

        </div>

      </main>
    );
  }

  const location = [
    store.city,
    store.district,
    store.state,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="min-h-screen bg-[#f6f5fb] text-[#11152c]">

      {/* NAVBAR */}

      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-4">

          <Link
            href="/shop"
            className="mr-auto text-2xl font-black text-[#3426a8]"
          >
            SPECTWALA
          </Link>

          <Link
            href="/shop"
            className="rounded-xl px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-100"
          >
            ← Marketplace
          </Link>

          <Link
            href="/orders"
            className="hidden rounded-xl px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-100 md:block"
          >
            Orders
          </Link>

          <Link
            href="/cart"
            className="rounded-xl bg-[#3426a8] px-4 py-2.5 text-sm font-black text-white"
          >
            🛒 Cart
          </Link>

        </div>

      </header>

      <div className="mx-auto max-w-6xl px-5 py-8">

        {/* ================= STORE HEADER ================= */}

        <section className="overflow-hidden rounded-[32px] bg-white shadow-xl">

          {/* COVER */}

          <div className="relative h-52 overflow-hidden bg-gradient-to-br from-[#100d3f] via-[#3426a8] to-[#8b5cf6] md:h-64">

            <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

            <div className="absolute bottom-5 left-5 text-xs font-black uppercase tracking-[0.3em] text-white/50">
              SPECTWALA VERIFIED STORE
            </div>

          </div>

          {/* PROFILE */}

          <div className="relative px-6 pb-8 md:px-10">

            <div className="-mt-20 flex flex-col gap-5 md:flex-row md:items-end">

              {/* LOGO */}

              <div className="h-36 w-36 shrink-0 overflow-hidden rounded-full border-8 border-white bg-[#f0efff] shadow-xl">

                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.storeName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-5xl">
                    👓
                  </div>
                )}

              </div>

              {/* NAME */}

              <div className="pb-2">

                <div className="flex flex-wrap items-center gap-2">

                  <h1 className="text-3xl font-black md:text-4xl">
                    {store.storeName}
                  </h1>

                  <span className="rounded-full bg-[#eeeaff] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#3426a8]">
                    ✓ Verified
                  </span>

                </div>

                {location && (
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    📍 {location}
                  </p>
                )}

              </div>

            </div>

            {/* BIO */}

            {store.description && (
              <p className="mt-6 max-w-3xl leading-7 text-slate-600">
                {store.description}
              </p>
            )}

            {/* STATS */}

            <div className="mt-7 flex flex-wrap gap-3">

              <div className="rounded-2xl bg-[#f5f3ff] px-5 py-3">

                <p className="text-2xl font-black text-[#3426a8]">
                  {store.products.length}
                </p>

                <p className="text-xs font-bold text-slate-500">
                  Products
                </p>

              </div>

              <div className="rounded-2xl bg-[#f5f3ff] px-5 py-3">

                <p className="text-2xl font-black text-[#3426a8]">
                  ★
                </p>

                <p className="text-xs font-bold text-slate-500">
                  Trusted store
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ================= PRODUCT SECTION ================= */}

        <section className="mt-12">

          <div className="flex items-end justify-between">

            <div>

              <p className="text-xs font-black uppercase tracking-widest text-[#3426a8]">
                Store catalogue
              </p>

              <h2 className="mt-1 text-3xl font-black">
                Products
              </h2>

            </div>

            <p className="text-sm font-bold text-slate-500">
              {store.products.length} products
            </p>

          </div>

          {/* NO PRODUCTS */}

          {store.products.length === 0 && (
            <div className="mt-7 rounded-3xl bg-white p-14 text-center shadow-sm">

              <div className="text-6xl">
                📦
              </div>

              <h3 className="mt-5 text-2xl font-black">
                No products listed yet
              </h3>

              <p className="mt-2 text-slate-500">
                This seller has not published any
                customer products yet.
              </p>

            </div>
          )}

          {/* PRODUCTS */}

          {store.products.length > 0 && (
            <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">

              {store.products.map(
                (product) => (
                  <article
                    key={product.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >

                    {/* PRODUCT IMAGE */}

                    <div className="aspect-square overflow-hidden bg-slate-100">

                      {product.images?.length >
                      0 ? (
                        <img
                          src={
                            product.images[0].url
                          }
                          alt={
                            product.name
                          }
                          className="h-full w-full object-cover transition duration-500 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-7xl">
                          👓
                        </div>
                      )}

                    </div>

                    {/* PRODUCT INFO */}

                    <div className="p-4">

                      <p className="text-[10px] font-black uppercase tracking-wider text-[#3426a8]">
                        {
                          product
                            .category
                            .name
                        }
                      </p>

                      <h3 className="mt-1 line-clamp-2 min-h-[42px] font-black">
                        {product.name}
                      </h3>

                      {product.description && (
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                          {
                            product.description
                          }
                        </p>
                      )}

                      <div className="mt-4 flex items-end justify-between">

                        <p className="text-xl font-black">
                          ₹
                          {Number(
                            product.price
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        <span className="text-[10px] font-bold text-slate-400">
                          {product.stock >
                          0
                            ? `${product.stock} available`
                            : "Out of stock"}
                        </span>

                      </div>

                      <button
                        disabled={
                          adding ===
                            product.id ||
                          product.stock <= 0
                        }
                        onClick={() =>
                          addToCart(
                            product.id
                          )
                        }
                        className="mt-4 w-full rounded-xl bg-[#3426a8] py-3 text-sm font-black text-white transition hover:bg-[#241b83] disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {adding ===
                        product.id
                          ? "Adding..."
                          : product.stock <=
                            0
                          ? "Out of stock"
                          : "Add to cart"}
                      </button>

                    </div>

                  </article>
                )
              )}

            </div>
          )}

        </section>

      </div>

    </main>
  );
}