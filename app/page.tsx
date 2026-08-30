"use client";

import Link from "next/link";

const registrationTypes = [
  {
    title: "Optometrist",
    icon: "👓",
    description:
      "Register as an optometrist and join the Spectwala professional eye-care network.",
    href: "/register/optometrist",
  },
  {
    title: "Optical Store",
    icon: "🏪",
    description:
      "Register your optical store and connect with customers and eye-care professionals.",
    href: "/register/optician",
  },
  {
    title: "Eye Hospital / Ophthalmologist",
    icon: "👁️",
    description:
      "Register your eye hospital, clinic or ophthalmology practice.",
    href: "/register/ophthalmologist",
  },
  {
    title: "Manufacturer",
    icon: "🏭",
    description:
      "Register your optical or eye-care product manufacturing company.",
    href: "/register/manufacturer",
  },
  {
    title: "Eye Camp Organisation",
    icon: "❤️",
    description:
      "Register your organisation and coordinate eye camps with Spectwala.",
    href: "/register/eye-camp",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">

      {/* NAVBAR */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3426a8] text-2xl">
              👁️
            </div>

            <div>
              <h1 className="text-xl font-black tracking-tight">
                SPECTWALA
              </h1>

              <p className="text-xs text-slate-500">
                Eye Care Network
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              Login
            </Link>

            <Link
              href="#register"
              className="rounded-lg bg-[#3426a8] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#281d88]"
            >
              Register
            </Link>
          </div>

        </div>
      </header>


      {/* HERO */}
      <section className="border-b border-slate-200 bg-gradient-to-br from-[#f7f7ff] via-white to-[#f0efff]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2">

          <div>

            <div className="mb-5 inline-flex rounded-full border border-[#d9d5ff] bg-white px-4 py-2 text-sm font-bold text-[#3426a8]">
              👁️ India's Eye Care Network
            </div>

            <h2 className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
              Connecting the
              <span className="text-[#3426a8]"> Eye Care </span>
              Community.
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Spectwala brings together optometrists, optical stores,
              manufacturers, eye hospitals and eye-care organisations
              on one platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <Link
                href="#register"
                className="rounded-xl bg-[#3426a8] px-7 py-3.5 font-bold text-white shadow-lg shadow-[#3426a8]/20 transition hover:-translate-y-0.5 hover:bg-[#281d88]"
              >
                Register With Spectwala
              </Link>

              <Link
                href="#about"
                className="rounded-xl border border-slate-300 bg-white px-7 py-3.5 font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Learn More
              </Link>

            </div>

          </div>


          {/* HERO CARD */}
          <div className="relative">

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">

              <p className="text-sm font-bold uppercase tracking-widest text-[#3426a8]">
                Spectwala Network
              </p>

              <h3 className="mt-3 text-3xl font-black">
                One platform.
                <br />
                Complete eye-care ecosystem.
              </h3>

              <div className="mt-8 grid grid-cols-2 gap-4">

                <div className="rounded-2xl bg-[#f5f4ff] p-5">
                  <div className="text-3xl">👓</div>
                  <p className="mt-3 font-bold">Optometrists</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Professional network
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f5f4ff] p-5">
                  <div className="text-3xl">🏪</div>
                  <p className="mt-3 font-bold">Optical Stores</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Digital store presence
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f5f4ff] p-5">
                  <div className="text-3xl">🏥</div>
                  <p className="mt-3 font-bold">Eye Hospitals</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Patient connections
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f5f4ff] p-5">
                  <div className="text-3xl">🏭</div>
                  <p className="mt-3 font-bold">Manufacturers</p>
                  <p className="mt-1 text-sm text-slate-500">
                    B2B opportunities
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* REGISTRATION */}
      <section
        id="register"
        className="mx-auto max-w-7xl px-6 py-20"
      >

        <div className="mx-auto max-w-2xl text-center">

          <p className="font-bold uppercase tracking-widest text-[#3426a8]">
            Join Spectwala
          </p>

          <h2 className="mt-3 text-3xl font-black md:text-4xl">
            Register with Spectwala
          </h2>

          <p className="mt-4 text-slate-600">
            Choose the registration type that best describes you
            or your organisation.
          </p>

        </div>


        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {registrationTypes.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#c9c4ff] hover:shadow-xl"
            >

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0efff] text-3xl">
                {item.icon}
              </div>

              <h3 className="mt-5 text-xl font-black">
                {item.title}
              </h3>

              <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-500">
                {item.description}
              </p>

              <Link
                href={item.href}
                className="mt-6 block w-full rounded-xl bg-[#3426a8] py-3 text-center text-sm font-bold text-white transition hover:bg-[#281d88]"
              >
                Start Registration →
              </Link>

            </div>
          ))}

        </div>

      </section>


      {/* ABOUT */}
      <section
        id="about"
        className="border-y border-slate-200 bg-slate-50"
      >

        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="grid gap-12 md:grid-cols-3">

            <div>
              <div className="text-4xl">🤝</div>

              <h3 className="mt-4 text-xl font-black">
                Professional Network
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Connect with optometrists, optical stores,
                hospitals and manufacturers.
              </p>
            </div>

            <div>
              <div className="text-4xl">🏪</div>

              <h3 className="mt-4 text-xl font-black">
                Digital Store Presence
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Verified businesses can build their presence
                on the Spectwala platform.
              </p>
            </div>

            <div>
              <div className="text-4xl">❤️</div>

              <h3 className="mt-4 text-xl font-black">
                Better Eye Care Access
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Help connect people with trusted eye-care
                professionals and services.
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">

          <div>
            © {new Date().getFullYear()} Spectwala. All rights reserved.
          </div>

          <div className="flex gap-5">
            <Link href="/login" className="hover:text-[#3426a8]">
              Login
            </Link>

            <Link href="#register" className="hover:text-[#3426a8]">
              Register
            </Link>
          </div>

        </div>

      </footer>

    </main>
  );
}