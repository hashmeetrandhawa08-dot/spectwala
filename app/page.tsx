export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f6fc] text-[#11152c]">

      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-4">

          {/* LOGO */}

          <a
            href="/"
            className="mr-auto text-2xl font-black tracking-tight text-[#3426a8]"
          >
            SPECTWALA
          </a>

          {/* NAVIGATION */}

          <nav className="hidden items-center gap-7 md:flex">

            <a
              href="/"
              className="text-sm font-black text-[#3426a8]"
            >
              Home
            </a>

            <a
              href="/shop"
              className="text-sm font-bold text-slate-600 transition hover:text-[#3426a8]"
            >
              Marketplace
            </a>

            <a
              href="/shop#stores"
              className="text-sm font-bold text-slate-600 transition hover:text-[#3426a8]"
            >
              Stores
            </a>

          </nav>

          {/* CUSTOMER LOGIN */}

          <a
            href="/login?next=/shop"
            className="hidden rounded-xl border-2 border-[#3426a8] px-4 py-2.5 text-sm font-black text-[#3426a8] transition hover:bg-[#3426a8] hover:text-white sm:block"
          >
            Customer Login
          </a>

          {/* CART */}

          <a
            href="/cart"
            className="rounded-xl bg-[#3426a8] px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-purple-200 transition hover:bg-[#241b83]"
          >
            🛒 Cart
          </a>

        </div>

      </header>


      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="relative overflow-hidden bg-gradient-to-br from-[#100d3f] via-[#3426a8] to-[#8b5cf6] text-white">

        {/* Background decoration */}

        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-purple-300/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:py-28">

          {/* HERO LEFT */}

          <div>

            <p className="text-xs font-black uppercase tracking-[0.35em] text-white/60">
              PREMIUM OPTICAL MARKETPLACE
            </p>

            <h1 className="mt-5 text-5xl font-black leading-[1.05] md:text-7xl">
              See better.
              <br />
              Shop smarter.
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-white/70">
              Discover eyewear, sunglasses, lenses and optical
              products from Spectwala stores.
            </p>


            {/* CUSTOMER ACTIONS */}

            <div className="mt-9 flex flex-wrap gap-4">

              <a
                href="/login?next=/shop"
                className="rounded-2xl bg-white px-7 py-4 text-sm font-black text-[#3426a8] shadow-2xl transition hover:-translate-y-1"
              >
                👤 Customer Login with Google
              </a>

              <a
                href="/shop"
                className="rounded-2xl border border-white/30 bg-white/10 px-7 py-4 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
              >
                🛍️ Shop Marketplace
              </a>

            </div>

            <p className="mt-5 text-xs font-semibold text-white/50">
              Login to add products to your cart and place orders.
            </p>

          </div>


          {/* HERO RIGHT */}

          <div className="relative">

            <div className="relative mx-auto max-w-md rounded-[40px] border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">

              <div className="rounded-[30px] bg-white p-6 text-[#11152c]">

                {/* STORE HEADER */}

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs font-black uppercase tracking-widest text-[#3426a8]">
                      SPECTWALA
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-500">
                      Optical marketplace
                    </p>

                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f0efff] text-3xl">
                    👓
                  </div>

                </div>


                {/* PRODUCT VISUAL */}

                <div className="mt-8 flex aspect-square items-center justify-center rounded-3xl bg-gradient-to-br from-[#f1efff] to-[#e5e0ff]">

                  <div className="text-[130px] drop-shadow-xl">
                    👓
                  </div>

                </div>


                {/* PRODUCT INFO */}

                <div className="mt-6">

                  <p className="text-xs font-bold text-[#3426a8]">
                    VERIFIED STORE
                  </p>

                  <h3 className="mt-1 text-2xl font-black">
                    Premium Eyewear
                  </h3>

                  <div className="mt-4 flex items-center justify-between">

                    <p className="text-xl font-black">
                      Explore collection
                    </p>

                    <span className="rounded-xl bg-[#3426a8] px-4 py-2 text-sm font-black text-white">
                      →
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          CUSTOMER LOGIN SECTION
      ========================================================= */}

      <section className="mx-auto max-w-7xl px-5 py-16">

        <div className="overflow-hidden rounded-[32px] bg-white shadow-xl">

          <div className="grid md:grid-cols-2">

            {/* LEFT */}

            <div className="bg-[#f0efff] p-8 md:p-12">

              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#3426a8]">
                FOR CUSTOMERS
              </p>

              <h2 className="mt-4 text-4xl font-black leading-tight">
                Your optical shopping
                <br />
                starts here.
              </h2>

              <p className="mt-5 max-w-lg leading-7 text-slate-600">
                Login with your Google account and discover
                products uploaded directly by Spectwala sellers.
              </p>


              {/* SEARCH */}

              <div className="mt-8 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#3426a8] text-white">
                  🔍
                </div>

                <div>

                  <p className="font-black">
                    Search products
                  </p>

                  <p className="text-sm text-slate-500">
                    Find eyewear from real stores.
                  </p>

                </div>

              </div>


              {/* CART */}

              <div className="mt-4 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#3426a8] text-white">
                  🛒
                </div>

                <div>

                  <p className="font-black">
                    Add to cart
                  </p>

                  <p className="text-sm text-slate-500">
                    Save products and checkout easily.
                  </p>

                </div>

              </div>


              {/* ORDERS */}

              <div className="mt-4 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#3426a8] text-white">
                  📦
                </div>

                <div>

                  <p className="font-black">
                    Track orders
                  </p>

                  <p className="text-sm text-slate-500">
                    See your orders in one place.
                  </p>

                </div>

              </div>

            </div>


            {/* RIGHT LOGIN */}

            <div className="flex items-center justify-center p-8 md:p-12">

              <div className="w-full max-w-md text-center">

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#3426a8] text-4xl shadow-xl">
                  👤
                </div>

                <h2 className="mt-6 text-3xl font-black">
                  Customer Login
                </h2>

                <p className="mt-3 leading-7 text-slate-500">
                  Sign in with Google to shop from
                  Spectwala stores.
                </p>


                {/* GOOGLE */}

                <a
                  href="/login?next=/shop"
                  className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                >

                  <span className="text-xl font-black">
                    G
                  </span>

                  Continue with Google

                </a>


                {/* MARKETPLACE */}

                <a
                  href="/shop"
                  className="mt-4 block w-full rounded-2xl bg-[#3426a8] px-6 py-4 text-sm font-black text-white shadow-lg transition hover:bg-[#241b83]"
                >
                  Browse Marketplace
                </a>

                <p className="mt-5 text-xs leading-5 text-slate-400">
                  Browse the marketplace without logging in.
                  Login is required when you want to add
                  products to your cart or place an order.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          MARKETPLACE
      ========================================================= */}

      <section className="mx-auto max-w-7xl px-5 pb-20">

        <div className="text-center">

          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#3426a8]">
            SPECTWALA MARKETPLACE
          </p>

          <h2 className="mt-3 text-4xl font-black">
            Everything in one place
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-500">
            Browse products from actual Spectwala sellers,
            visit their stores and purchase directly through
            the marketplace.
          </p>

        </div>


        <div className="mt-10 grid gap-5 md:grid-cols-3">

          {/* STORES */}

          <a
            href="/shop#stores"
            className="group rounded-[28px] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0efff] text-3xl">
              🏪
            </div>

            <h3 className="mt-6 text-2xl font-black">
              Real optical stores
            </h3>

            <p className="mt-3 leading-7 text-slate-500">
              Explore stores created by approved Spectwala
              professionals.
            </p>

            <span className="mt-5 inline-block font-black text-[#3426a8]">
              Explore stores →
            </span>

          </a>


          {/* PRODUCTS */}

          <a
            href="/shop"
            className="group rounded-[28px] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0efff] text-3xl">
              👓
            </div>

            <h3 className="mt-6 text-2xl font-black">
              Optical products
            </h3>

            <p className="mt-3 leading-7 text-slate-500">
              Discover products actually uploaded by
              Spectwala sellers.
            </p>

            <span className="mt-5 inline-block font-black text-[#3426a8]">
              Shop products →
            </span>

          </a>


          {/* ORDERS */}

          <a
            href="/orders"
            className="group rounded-[28px] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0efff] text-3xl">
              📦
            </div>

            <h3 className="mt-6 text-2xl font-black">
              Track your orders
            </h3>

            <p className="mt-3 leading-7 text-slate-500">
              Keep your purchases organized and check
              order status from one place.
            </p>

            <span className="mt-5 inline-block font-black text-[#3426a8]">
              My orders →
            </span>

          </a>

        </div>

      </section>


      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}

      <section className="border-y border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-5 py-20">

          <div className="text-center">

            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#3426a8]">
              HOW IT WORKS
            </p>

            <h2 className="mt-3 text-4xl font-black">
              Simple optical shopping
            </h2>

          </div>


          <div className="mt-10 grid gap-5 md:grid-cols-4">

            <Step
              number="01"
              icon="👤"
              title="Login"
              text="Sign in securely using your Google account."
            />

            <Step
              number="02"
              icon="🔍"
              title="Discover"
              text="Search products from Spectwala stores."
            />

            <Step
              number="03"
              icon="🛒"
              title="Add to cart"
              text="Choose products and continue to checkout."
            />

            <Step
              number="04"
              icon="📦"
              title="Order"
              text="Place your order and track it from My Orders."
            />

          </div>

        </div>

      </section>


      {/* =========================================================
          PROFESSIONAL / SELLER SECTION
      ========================================================= */}

      <section className="bg-[#f7f6fc]">

        <div className="mx-auto max-w-7xl px-5 py-20">

          <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-[#100d3f] via-[#3426a8] to-[#8b5cf6] p-8 text-white shadow-2xl md:p-12">

            <div className="flex flex-col justify-between gap-10 md:flex-row md:items-center">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.3em] text-white/50">
                  FOR OPTICAL PROFESSIONALS
                </p>

                <h2 className="mt-4 text-4xl font-black">
                  Build your Spectwala store.
                </h2>

                <p className="mt-4 max-w-xl leading-7 text-white/70">
                  Approved professionals can create their own
                  store, upload products and receive customer
                  orders through Spectwala.
                </p>

              </div>


              <a
                href="/register"
                className="shrink-0 rounded-2xl bg-white px-7 py-4 text-center text-sm font-black text-[#3426a8] shadow-xl transition hover:-translate-y-1"
              >
                Register as Professional →
              </a>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="bg-[#100d3f] text-white">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-5 py-12 md:flex-row md:items-center">

          <div>

            <p className="text-2xl font-black">
              SPECTWALA
            </p>

            <p className="mt-2 text-sm text-white/50">
              Premium optical marketplace.
            </p>

          </div>


          <div className="flex flex-wrap gap-5 text-sm font-bold text-white/60">

            <a
              href="/"
              className="transition hover:text-white"
            >
              Home
            </a>

            <a
              href="/shop"
              className="transition hover:text-white"
            >
              Marketplace
            </a>

            <a
              href="/login?next=/shop"
              className="transition hover:text-white"
            >
              Customer Login
            </a>

            <a
              href="/cart"
              className="transition hover:text-white"
            >
              Cart
            </a>

            <a
              href="/orders"
              className="transition hover:text-white"
            >
              Orders
            </a>

          </div>

        </div>

      </footer>

    </main>
  );
}


/* =========================================================
   STEP COMPONENT
========================================================= */

function Step({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-[#f7f6fc] p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eeeaff] text-2xl">
          {icon}
        </div>

        <span className="text-xs font-black text-slate-300">
          {number}
        </span>

      </div>

      <h3 className="mt-5 text-xl font-black">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>

    </div>
  );
}