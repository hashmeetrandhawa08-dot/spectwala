"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

  seller: {
    id: string;
    storeName: string;
    logoUrl?: string | null;
    description?: string | null;
    city?: string | null;
    district?: string | null;
    state?: string | null;
  };
};

type Store = {
  id: string;
  storeName: string;
  logoUrl?: string | null;
  description?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;

  _count: {
    products: number;
  };
};

type User = {
  id: string;
  name?: string | null;
  email: string;
  role: string;
};

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [loading, setLoading] = useState(true);
  const [addingProduct, setAddingProduct] = useState<string | null>(
    null
  );

  const [user, setUser] = useState<User | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    loadProducts();
    loadStores();
    loadUser();
  }, []);

  async function loadProducts() {
    try {
      const response = await fetch("/api/products", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load products");
      }

      /*
       * API returns:
       *
       * {
       *   success: true,
       *   products: [...]
       * }
       *
       * Only these database products are displayed.
       */
      setProducts(data.products || []);
    } catch (error) {
      console.error("Could not load products:", error);
      setProducts([]);
    }
  }

  async function loadStores() {
    try {
      const response = await fetch("/api/shop/stores", {
        cache: "no-store",
      });

      const data = await response.json();

      setStores(data.stores || []);
    } catch (error) {
      console.error("Could not load stores:", error);
      setStores([]);
    }
  }

  async function loadUser() {
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      const data = await response.json();

      setLoggedIn(Boolean(data.loggedIn));
      setUser(data.user || null);
    } catch {
      setLoggedIn(false);
      setUser(null);
    }
  }

  /*
   * Categories are generated ONLY from
   * actual seller-uploaded products.
   */
  const categories = useMemo(() => {
    const values = new Set<string>();

    products.forEach((product) => {
      if (product.category?.name) {
        values.add(product.category.name);
      }
    });

    return ["All", ...Array.from(values)];
  }, [products]);

  /*
   * Search ONLY actual database products.
   */
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        category === "All" ||
        product.category?.name === category;

      const searchableText = [
        product.name,
        product.description || "",
        product.category?.name || "",
        product.seller?.storeName || "",
        product.seller?.city || "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        query.length === 0 ||
        searchableText.includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [products, search, category]);

  async function addToCart(productId: string) {
    if (!loggedIn) {
      window.location.href =
        "/login?next=/shop";

      return;
    }

    setAddingProduct(productId);

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
          "/login?next=/shop";

        return;
      }

      if (!response.ok) {
        alert(
          data.error ||
            "Unable to add this product to cart."
        );

        return;
      }

      alert("Product added to cart ✓");
    } catch {
      alert("Something went wrong.");
    } finally {
      setAddingProduct(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f5fb] text-[#11152c]">

      {/* ================= NAVBAR ================= */}

      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-4">

          <Link
            href="/shop"
            className="mr-auto text-2xl font-black tracking-tight text-[#3426a8]"
          >
            SPECTWALA
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <Link
              href="/shop"
              className="text-sm font-black text-[#3426a8]"
            >
              Shop
            </Link>

            <a
              href="#stores"
              className="text-sm font-bold text-slate-600 hover:text-[#3426a8]"
            >
              Stores
            </a>

            <a
              href="#categories"
              className="text-sm font-bold text-slate-600 hover:text-[#3426a8]"
            >
              Categories
            </a>
          </nav>

          <Link
            href="/orders"
            className="hidden rounded-xl px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 md:block"
          >
            Orders
          </Link>

          <Link
            href="/cart"
            className="rounded-xl bg-[#3426a8] px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-purple-200"
          >
            🛒 Cart
          </Link>

          {loggedIn ? (
            <div className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 md:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3426a8] text-xs font-black text-white">
                {(user?.name || "C")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="max-w-[130px]">
                <p className="truncate text-xs font-black">
                  {user?.name || "Customer"}
                </p>

                <p className="truncate text-[10px] text-slate-400">
                  {user?.email}
                </p>
              </div>
            </div>
          ) : (
            <Link
              href="/login?next=/shop"
              className="rounded-xl border-2 border-[#3426a8] px-4 py-2 text-sm font-black text-[#3426a8] transition hover:bg-[#3426a8] hover:text-white"
            >
              Login with Google
            </Link>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">

        {/* ================= HERO ================= */}

        <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#100d3f] via-[#3426a8] to-[#8b5cf6] p-7 text-white shadow-2xl md:p-12">

          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10">

            <p className="text-xs font-black uppercase tracking-[0.3em] text-white/60">
              SPECTWALA OPTICAL MARKETPLACE
            </p>

            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              Find your perfect
              <br />
              vision style.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 md:text-lg">
              Shop real products uploaded by
              Spectwala optical stores.
            </p>

            {/* SEARCH */}

            <div className="mt-8 flex max-w-3xl items-center overflow-hidden rounded-2xl bg-white shadow-2xl">

              <span className="pl-5 text-xl">
                🔍
              </span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search products or stores..."
                className="w-full border-0 bg-transparent px-4 py-4 text-sm font-semibold text-slate-900 outline-none md:text-base"
              />
            </div>

            {!loggedIn && (
              <div className="mt-6 flex flex-wrap items-center gap-4">

                <Link
                  href="/login?next=/shop"
                  className="rounded-xl bg-white px-6 py-3 text-sm font-black text-[#3426a8] shadow-xl"
                >
                  Continue with Google →
                </Link>

                <span className="text-sm text-white/60">
                  Login to purchase products
                </span>

              </div>
            )}

          </div>
        </section>

        {/* ================= CATEGORIES ================= */}

        {categories.length > 1 && (
          <section
            id="categories"
            className="mt-10"
          >

            <p className="text-xs font-black uppercase tracking-widest text-[#3426a8]">
              Browse products
            </p>

            <h2 className="mt-1 text-3xl font-black">
              Categories
            </h2>

            <div className="mt-5 flex gap-3 overflow-x-auto pb-2">

              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    setCategory(item)
                  }
                  className={`whitespace-nowrap rounded-full px-5 py-3 text-sm font-black transition ${
                    category === item
                      ? "bg-[#3426a8] text-white shadow-lg"
                      : "bg-white text-slate-600 shadow-sm hover:bg-[#f0efff]"
                  }`}
                >
                  {item === "All"
                    ? "✨ All"
                    : item}
                </button>
              ))}

            </div>
          </section>
        )}

        {/* ================= STORES ================= */}

        {stores.length > 0 && (
          <section
            id="stores"
            className="mt-12"
          >

            <p className="text-xs font-black uppercase tracking-widest text-[#3426a8]">
              Real Spectwala sellers
            </p>

            <h2 className="mt-1 text-3xl font-black">
              Shop by store
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {stores.map((store) => (
                <Link
                  key={store.id}
                  href={`/store/${store.id}`}
                  className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >

                  <div className="flex items-center gap-4">

                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[#f0efff] ring-4 ring-[#f5f3ff]">

                      {store.logoUrl ? (
                        <img
                          src={store.logoUrl}
                          alt={store.storeName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl">
                          👓
                        </div>
                      )}

                    </div>

                    <div className="min-w-0">

                      <p className="truncate font-black">
                        {store.storeName}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {[
                          store.city,
                          store.district,
                          store.state,
                        ]
                          .filter(Boolean)
                          .join(" · ") ||
                          "India"}
                      </p>

                    </div>

                  </div>

                  <div className="mt-5 flex items-center justify-between">

                    <span className="text-xs font-bold text-slate-500">
                      {store._count.products} products
                    </span>

                    <span className="text-sm font-black text-[#3426a8]">
                      Visit →
                    </span>

                  </div>

                </Link>
              ))}

            </div>
          </section>
        )}

        {/* ================= PRODUCTS ================= */}

        <section className="mt-14">

          <div className="flex flex-wrap items-end justify-between gap-4">

            <div>

              <p className="text-xs font-black uppercase tracking-widest text-[#3426a8]">
                Seller catalogue
              </p>

              <h2 className="mt-1 text-3xl font-black">
                {category === "All"
                  ? "Products"
                  : category}
              </h2>

            </div>

            <p className="text-sm font-semibold text-slate-500">
              {filteredProducts.length} real products
            </p>

          </div>

          {/* NO PRODUCTS */}

          {!loading &&
            filteredProducts.length === 0 && (
              <div className="mt-8 rounded-3xl bg-white p-14 text-center shadow-sm">

                <div className="text-5xl">
                  👓
                </div>

                <h3 className="mt-4 text-2xl font-black">
                  No seller products yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-slate-500">
                  Products uploaded by approved
                  Spectwala stores will appear here.
                </p>

                {(search ||
                  category !== "All") && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setCategory("All");
                    }}
                    className="mt-5 rounded-xl bg-[#3426a8] px-5 py-3 font-black text-white"
                  >
                    Clear filters
                  </button>
                )}

              </div>
            )}

          {/* LOADING */}

          {loading && (
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">

              {Array.from({
                length: 8,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-80 animate-pulse rounded-3xl bg-white"
                />
              ))}

            </div>
          )}

          {/* REAL PRODUCTS */}

          {!loading &&
            filteredProducts.length > 0 && (
              <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">

                {filteredProducts.map(
                  (product) => (
                    <article
                      key={product.id}
                      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl"
                    >

                      {/* IMAGE */}

                      <Link
                        href={`/store/${product.seller.id}`}
                      >
                        <div className="relative aspect-square overflow-hidden bg-slate-100">

                          {product.images?.length >
                          0 ? (
                            <img
                              src={
                                product.images[0]
                                  .url
                              }
                              alt={
                                product.name
                              }
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-7xl">
                              👓
                            </div>
                          )}

                          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black text-[#3426a8] backdrop-blur">
                            {
                              product
                                .category
                                .name
                            }
                          </div>

                        </div>
                      </Link>

                      <div className="p-4">

                        {/* STORE */}

                        <Link
                          href={`/store/${product.seller.id}`}
                          className="flex items-center gap-2"
                        >

                          <div className="h-6 w-6 overflow-hidden rounded-full bg-[#f0efff]">

                            {product.seller
                              .logoUrl ? (
                              <img
                                src={
                                  product
                                    .seller
                                    .logoUrl
                                }
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs">
                                👓
                              </div>
                            )}

                          </div>

                          <p className="truncate text-[11px] font-black text-[#3426a8]">
                            {
                              product
                                .seller
                                .storeName
                            }
                          </p>

                        </Link>

                        {/* PRODUCT */}

                        <Link
                          href={`/store/${product.seller.id}`}
                        >
                          <h3 className="mt-2 line-clamp-2 min-h-[40px] font-black">
                            {product.name}
                          </h3>
                        </Link>

                        {/* PRICE */}

                        <div className="mt-3 flex items-end justify-between">

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
                              ? `${product.stock} in stock`
                              : "Out of stock"}
                          </span>

                        </div>

                        {/* CART */}

                        <button
                          disabled={
                            addingProduct ===
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
                          {addingProduct ===
                          product.id
                            ? "Adding..."
                            : product.stock <= 0
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

        {/* ================= FOOTER ================= */}

        <footer className="mt-20 border-t border-slate-200 py-10">

          <div className="flex flex-col justify-between gap-5 md:flex-row">

            <div>

              <p className="text-xl font-black text-[#3426a8]">
                SPECTWALA
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Premium optical marketplace.
              </p>

            </div>

            <div className="flex gap-5 text-sm font-bold text-slate-500">

              <Link href="/orders">
                My Orders
              </Link>

              <Link href="/cart">
                Cart
              </Link>

              {!loggedIn && (
                <Link href="/login">
                  Login
                </Link>
              )}

            </div>

          </div>

        </footer>

      </div>
    </main>
  );
}