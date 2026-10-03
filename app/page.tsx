import type { ReactNode } from "react";

const ArrowRight = ({ className = "" }: { className?: string }) => (
  <span className={className}>→</span>
);
export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07051b] text-white">
      <style>{`
        @keyframes float {
          0%,100% {
            transform: translateY(0) rotate(0deg)
          }
          50% {
            transform: translateY(-18px) rotate(3deg)
          }
        }

        @keyframes glow {
          0%,100% {
            opacity: .35;
            transform: scale(1)
          }
          50% {
            opacity: .7;
            transform: scale(1.12)
          }
        }

        @keyframes rise {
          from {
            opacity: 0;
            transform: translateY(25px)
          }
          to {
            opacity: 1;
            transform: none
          }
        }

        .float {
          animation: float 7s ease-in-out infinite;
        }

        .glow {
          animation: glow 6s ease-in-out infinite;
        }

        .rise {
          animation: rise .8s ease-out both;
        }
      `}</style>

      <div className="fixed inset-0 -z-0 overflow-hidden">
        <div className="glow absolute left-[8%] top-20 h-72 w-72 rounded-full bg-violet-600/30 blur-[100px]" />

        <div className="glow absolute right-[5%] top-[35%] h-96 w-96 rounded-full bg-fuchsia-500/20 blur-[120px]" />

        <div className="absolute inset-0 opacity-[.06] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:70px_70px]" />
      </div>

      {/* HEADER */}
      <header className="relative z-20 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-5">
          <a href="/" className="mr-auto flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              👓
            </span>

            <span className="text-xl font-black tracking-[.18em]">
              SPECTWALA
            </span>
          </a>

          <nav className="hidden gap-7 text-sm font-bold text-white/65 md:flex">
            <a href="#about" className="hover:text-white">
              About
            </a>

            <a href="#how" className="hover:text-white">
              How it works
            </a>

            <a href="#business" className="hover:text-white">
              For professionals
            </a>
          </nav>

          <a
            href="/login"
            className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
          >
            Login
          </a>

          <a
            href="/register"
            className="hidden rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#17113e] shadow-xl transition hover:-translate-y-0.5 sm:block"
          >
            Register
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-20 md:grid-cols-[1.05fr_.95fr] md:pt-28">
        <div className="rise">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[.22em] text-white/70">
            <span>✦</span>
            India&apos;s optical network
          </div>

          <h1 className="mt-7 text-5xl font-black leading-[.98] tracking-[-.04em] sm:text-6xl md:text-8xl">
            A better way
            <br />
            <span className="bg-gradient-to-r from-white via-violet-200 to-fuchsia-300 bg-clip-text text-transparent">
              to see.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/60">
            Spectwala connects customers, optical stores, wholesale businesses
            and eye-care organisations in one beautifully designed network.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="/login"
              className="rounded-2xl bg-white px-6 py-4 font-black text-[#17113e] shadow-2xl transition hover:-translate-y-1"
            >
              Enter Spectwala →
            </a>

            <a
              href="/register"
              className="rounded-2xl border border-white/20 bg-white/5 px-6 py-4 font-black text-white backdrop-blur transition hover:-translate-y-1 hover:bg-white/10"
            >
              Join the network
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/45">
            <span>✓ Verified professionals</span>
            <span>⌂ Real stores</span>
            <span>◉ Eye-care community</span>
          </div>
        </div>

        {/* HERO VISUAL */}
        <div className="relative min-h-[480px]">
          <div className="float absolute right-0 top-8 w-[88%] rounded-[38px] border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur-xl">
            <div className="rounded-[30px] bg-gradient-to-br from-white to-violet-50 p-6 text-[#17113e]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black tracking-[.2em] text-violet-600">
                    SPECTWALA
                  </p>

                  <p className="mt-1 text-xl font-black">
                    Your optical world
                  </p>
                </div>

                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100">
                  👓
                </div>
              </div>

              <div className="mt-6 rounded-3xl bg-gradient-to-br from-[#1b1552] to-[#7957e9] p-6 text-white">
                <p className="text-xs font-bold text-white/60">
                  DISCOVER
                </p>

                <p className="mt-2 text-3xl font-black">
                  Stores. Products.
                  <br />
                  Eye care.
                </p>

                <div className="mt-5 flex gap-2">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs">
                    Verified stores
                  </span>

                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs">
                    Eye camps
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {["◯", "◯", "◯"].map((x, i) => (
                  <div
                    key={i}
                    className="h-24 rounded-2xl bg-violet-100/80"
                  />
                ))}
              </div>
            </div>
          </div>

          <div
            className="float absolute bottom-3 left-0 grid h-32 w-32 place-items-center rounded-[32px] border border-white/15 bg-white/10 text-6xl shadow-xl backdrop-blur-xl"
            style={{ animationDelay: "-2s" }}
          >
            👓
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="relative z-10 border-y border-white/10 bg-white/[.03] px-5 py-20"
      >
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[.25em] text-violet-300">
            One network
          </p>

          <h2 className="mt-3 text-4xl font-black md:text-5xl">
            Built for the whole optical ecosystem.
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <Card
              icon={<span>👤</span>}
              title="Customers"
              text="Discover verified optical stores, products and community eye camps."
            />

            <Card
              icon={<span>🏪</span>}
              title="Businesses"
              text="Create a premium digital presence and manage your optical business."
            />

            <Card
              icon={<span>📦</span>}
              title="Wholesale"
              text="Run a separate B2B catalogue and receive wholesale orders privately."
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how"
        className="relative z-10 mx-auto max-w-7xl px-5 py-20"
      >
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <p className="text-xs font-black uppercase tracking-[.25em] text-violet-300">
              How it works
            </p>

            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              Simple on the outside.
              <br />
              Powerful underneath.
            </h2>
          </div>

          <div className="space-y-5">
            <Step
              n="01"
              title="Choose your path"
              text="Customer, optical store, wholesale business or eye-camp organisation."
            />

            <Step
              n="02"
              title="Get verified when required"
              text="Professional and organisation accounts go through Spectwala approval."
            />

            <Step
              n="03"
              title="Get your own experience"
              text="Every approved role receives a focused dashboard built for its work."
            />
          </div>
        </div>
      </section>

      {/* PROFESSIONALS */}
      <section
        id="business"
        className="relative z-10 mx-auto max-w-7xl px-5 pb-24"
      >
        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-violet-700/60 to-fuchsia-600/30 p-8 md:p-12">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[.25em] text-white/60">
              For professionals
            </p>

            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              Put your optical business where customers can find it.
            </h2>

            <p className="mt-5 text-white/65">
              Register your organisation, get approved, create your profile
              and start building your presence on Spectwala.
            </p>

            <a
              href="/register"
              className="mt-8 inline-flex rounded-2xl bg-white px-6 py-4 font-black text-[#20154d]"
            >
              Register now
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 px-5 py-8 text-center text-sm text-white/35">
        © {new Date().getFullYear()} Spectwala · Optical marketplace &
        eye-care network
      </footer>
    </main>
  );
}

function Card({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[.04] p-7 transition hover:-translate-y-1 hover:bg-white/[.07]">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/15 text-violet-200">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-black">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-white/50">
        {text}
      </p>
    </div>
  );
}

function Step({
  n,
  title,
  text,
}: {
  n: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-5 rounded-3xl border border-white/10 bg-white/[.035] p-6">
      <span className="text-sm font-black text-violet-300">
        {n}
      </span>

      <div>
        <h3 className="font-black">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-white/50">
          {text}
        </p>
      </div>
    </div>
  );
}