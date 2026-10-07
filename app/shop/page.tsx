"use client";

import { useEffect, useMemo, useState } from "react";

type Store = {
  id: string;
  storeName: string;
  logoUrl?: string | null;
  description?: string | null;
  city?: string | null;
  state?: string | null;
  district?: string | null;
  _count?: {
    products: number;
  };
};

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: string | number;
  stock: number;
  images: { url: string }[];
  category?: { name: string } | null;
  seller?: Store;
};

type CampPost = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  eventDate?: string | null;
  timeText?: string | null;
  venue?: string | null;
  eyeCamp: {
    id: string;
    name: string;
    logoUrl?: string | null;
    city?: string | null;
  };
};

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [posts, setPosts] = useState<CampPost[]>([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedState, setSelectedState] = useState("All");

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/shop/stores").then((r) => r.json()),
      fetch("/api/eye-camps/feed").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ])
      .then(([p, s, c, u]) => {
        setProducts(p.products || []);
        setStores(s.stores || []);
        setPosts(c.posts || []);
        setUser(u.loggedIn ? u.user : null);
      })
      .finally(() => setLoading(false));
  }, []);

  const cats = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          products
            .map((p) => p.category?.name)
            .filter(Boolean) as string[]
        )
      ),
    ],
    [products]
  );

  /*
   * ONLY STATES FROM REAL REGISTERED STORES
   *
   * No hardcoded states.
   * No dummy stores.
   */
  const states = useMemo(() => {
    const unique = new Set<string>();

    stores.forEach((store) => {
      const state = String(store.state || "").trim();

      if (state) {
        unique.add(state);
      }
    });

    return Array.from(unique).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [stores]);

  /*
   * Number of approved registered stores per state.
   */
  const storesByState = useMemo(() => {
    const map: Record<string, number> = {};

    stores.forEach((store) => {
      const state = String(store.state || "").trim();

      if (!state) {
        return;
      }

      map[state] = (map[state] || 0) + 1;
    });

    return map;
  }, [stores]);

  /*
   * State filtered stores.
   */
  const stateStores = useMemo(() => {
    if (selectedState === "All") {
      return stores;
    }

    return stores.filter(
      (store) =>
        String(store.state || "").trim() === selectedState
    );
  }, [stores, selectedState]);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (category === "All" ||
            p.category?.name === category) &&
          (!search ||
            [
              p.name,
              p.description,
              p.category?.name,
              p.seller?.storeName,
            ]
              .join(" ")
              .toLowerCase()
              .includes(search.toLowerCase()))
      ),
    [products, category, search]
  );

  async function add(id: string) {
    if (!user) {
      location.href = "/login?role=customer&next=/shop";
      return;
    }

    setAdding(id);

    const r = await fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: id,
        quantity: 1,
      }),
    });

    if (r.status === 401) {
      location.href = "/login?role=customer&next=/shop";
    } else if (!r.ok) {
      const d = await r.json();
      alert(d.error || "Unable to add");
    } else {
      alert("Added to cart ✓");
    }

    setAdding(null);
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f6ff] font-black">
        Loading Spectwala…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f6ff] text-[#11152c]">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-4">

          <a
            href="/shop"
            className="mr-auto text-2xl font-black tracking-tight text-[#3426a8]"
          >
            SPECTWALA
          </a>

          <nav className="hidden gap-6 text-sm font-bold text-slate-500 md:flex">
            <a href="#camps">Eye Camps</a>
            <a href="#stores">Stores</a>
            <a href="#products">Products</a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="/cart"
              className="rounded-xl bg-[#3426a8] px-4 py-2.5 text-sm font-black text-white"
            >
              🛒 Cart
            </a>

            <a
              href="/orders"
              className="hidden rounded-xl px-3 py-2 text-sm font-bold md:block"
            >
              Orders
            </a>

            <a
              href="/api/auth/logout"
              className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 font-black"
            >
              {(user?.name || "C")[0].toUpperCase()}
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-7">

        {/* HERO */}
        <section className="rounded-[32px] bg-gradient-to-br from-[#110d42] via-[#3426a8] to-[#8b5cf6] p-7 text-white shadow-xl md:p-10">

          <p className="text-xs font-black uppercase tracking-[.3em] text-white/55">
            Welcome back
            {user?.name
              ? `, ${user.name.split(" ")[0]}`
              : ""}
          </p>

          <h1 className="mt-3 text-4xl font-black md:text-6xl">
            Your optical world.
          </h1>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search frames, sunglasses, stores…"
              className="w-full rounded-2xl bg-white px-5 py-4 text-[#11152c] outline-none"
            />

            <a
              href="#stores"
              className="rounded-2xl bg-white/15 px-6 py-4 text-center font-black backdrop-blur"
            >
              Explore stores
            </a>
          </div>

        </section>

        {/* EYE CAMPS */}
        <section id="camps" className="mt-10">

          <div className="flex items-end justify-between">

            <div>
              <p className="text-xs font-black uppercase tracking-[.25em] text-[#3426a8]">
                Community feed
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Eye camps near the community
              </h2>
            </div>

          </div>

          <div className="mt-6 flex gap-5 overflow-x-auto pb-3">

            {posts.length ? (
              posts.map((post) => (
                <article
                  key={post.id}
                  className="min-w-[300px] max-w-[360px] overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200"
                >

                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      className="h-48 w-full object-cover"
                      alt=""
                    />
                  ) : (
                    <div className="grid h-48 place-items-center bg-gradient-to-br from-violet-100 to-fuchsia-100 text-6xl">
                      👁️
                    </div>
                  )}

                  <div className="p-5">

                    <div className="flex items-center gap-3">

                      <div className="grid h-9 w-9 place-items-center rounded-full bg-[#3426a8] text-white">
                        👁
                      </div>

                      <div>
                        <p className="font-black">
                          {post.eyeCamp.name}
                        </p>

                        <p className="text-xs text-slate-400">
                          {post.eyeCamp.city || "India"}
                        </p>
                      </div>

                    </div>

                    <h3 className="mt-4 text-xl font-black">
                      {post.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {post.description}
                    </p>

                    {post.eventDate && (
                      <p className="mt-4 text-sm font-bold text-[#3426a8]">
                        📅{" "}
                        {new Date(
                          post.eventDate
                        ).toLocaleDateString("en-IN")}{" "}
                        {post.timeText
                          ? `· ${post.timeText}`
                          : ""}
                      </p>
                    )}

                  </div>
                </article>
              ))
            ) : (
              <div className="w-full rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                Eye-camp posts will appear here as approved organisations publish them.
              </div>
            )}

          </div>
        </section>

        {/* STORES BY STATE */}
        <section id="stores" className="mt-12">

          <p className="text-xs font-black uppercase tracking-[.25em] text-[#3426a8]">
            Spectwala Network
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Registered stores
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Browse only optical stores that are registered,
            verified and active on Spectwala.
          </p>

          {/* STATE CATEGORIES */}
          {states.length > 0 && (
            <div className="mt-6 flex gap-3 overflow-x-auto pb-2">

              <button
                onClick={() => setSelectedState("All")}
                className={`shrink-0 rounded-2xl px-5 py-3 text-sm font-black transition ${
                  selectedState === "All"
                    ? "bg-[#3426a8] text-white"
                    : "bg-white text-slate-500 ring-1 ring-slate-200"
                }`}
              >
                All Stores
                <span className="ml-2 opacity-60">
                  {stores.length}
                </span>
              </button>

              {states.map((state) => (
                <button
                  key={state}
                  onClick={() =>
                    setSelectedState(state)
                  }
                  className={`shrink-0 rounded-2xl px-5 py-3 text-sm font-black transition ${
                    selectedState === state
                      ? "bg-[#3426a8] text-white"
                      : "bg-white text-slate-500 ring-1 ring-slate-200"
                  }`}
                >
                  📍 {state}

                  <span className="ml-2 opacity-60">
                    {storesByState[state]}
                  </span>
                </button>
              ))}

            </div>
          )}

          {/* NO REGISTERED STORES */}
          {stores.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">

              <div className="text-5xl">
                🏪
              </div>

              <h3 className="mt-4 text-xl font-black">
                No registered stores yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Stores will appear here after they register,
                are approved and become active on Spectwala.
              </p>

            </div>
          ) : (
            <div className="mt-6">

              {selectedState !== "All" && (
                <div className="mb-4 flex items-center gap-2">

                  <h3 className="text-xl font-black">
                    Stores in {selectedState}
                  </h3>

                  <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-[#3426a8]">
                    {stateStores.length}
                  </span>

                </div>
              )}

              <div className="flex gap-5 overflow-x-auto pb-3">

                {stateStores.map((s) => (
                  <a
                    key={s.id}
                    href={`/store/${s.id}`}
                    className="min-w-[220px] rounded-3xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg"
                  >

                    {s.logoUrl ? (
                      <img
                        src={s.logoUrl}
                        className="mx-auto h-20 w-20 rounded-full object-cover ring-4 ring-violet-100"
                        alt={s.storeName}
                      />
                    ) : (
                      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-violet-100 text-3xl">
                        🏪
                      </div>
                    )}

                    <p className="mt-4 truncate font-black">
                      {s.storeName}
                    </p>

                    <p className="mt-1 text-xs font-bold text-[#3426a8]">
                      📍{" "}
                      {s.city ||
                        s.district ||
                        s.state ||
                        "India"}
                    </p>

                    {s.state && (
                      <p className="mt-1 text-xs text-slate-400">
                        {s.state}
                      </p>
                    )}

                    <p className="mt-3 text-xs text-slate-400">
                      {s._count?.products || 0} products
                    </p>

                  </a>
                ))}

              </div>

              {selectedState !== "All" &&
                stateStores.length === 0 && (
                  <div className="rounded-3xl bg-white p-10 text-center text-slate-500">
                    No registered stores found in this state.
                  </div>
                )}

            </div>
          )}

        </section>

        {/* PRODUCTS */}
        <section id="products" className="mt-12 pb-20">

          <div className="flex flex-wrap items-end justify-between gap-4">

            <div>
              <p className="text-xs font-black uppercase tracking-[.25em] text-[#3426a8]">
                Marketplace
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Trending eyewear
              </h2>
            </div>

            <div className="flex gap-2 overflow-x-auto">

              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full px-4 py-2 text-xs font-black ${
                    category === c
                      ? "bg-[#3426a8] text-white"
                      : "bg-white text-slate-500 ring-1 ring-slate-200"
                  }`}
                >
                  {c}
                </button>
              ))}

            </div>

          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {filtered.map((p) => (
              <article
                key={p.id}
                className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1"
              >

                {p.images[0]?.url ? (
                  <img
                    src={p.images[0].url}
                    className="h-56 w-full object-cover"
                    alt={p.name}
                  />
                ) : (
                  <div className="grid h-56 place-items-center bg-slate-100 text-6xl">
                    👓
                  </div>
                )}

                <div className="p-5">

                  {p.seller?.storeName && (
                    <p className="text-xs font-bold text-[#3426a8]">
                      {p.seller.storeName}
                    </p>
                  )}

                  <h3 className="mt-1 font-black">
                    {p.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {p.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between">

                    <b className="text-lg">
                      ₹
                      {Number(
                        p.price
                      ).toLocaleString("en-IN")}
                    </b>

                    <button
                      onClick={() => add(p.id)}
                      disabled={adding === p.id}
                      className="rounded-xl bg-[#3426a8] px-3 py-2 text-xs font-black text-white"
                    >
                      {adding === p.id
                        ? "…"
                        : "Add"}
                    </button>

                  </div>

                </div>

              </article>
            ))}

          </div>

          {!filtered.length && (
            <div className="mt-8 rounded-3xl bg-white p-12 text-center text-slate-500">
              No published products match your search.
            </div>
          )}

        </section>

      </div>
    </main>
  );
}