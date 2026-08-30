import Link from "next/link";

const registrationOptions = [
  {
    icon: "🏪",
    title: "Optician / Optical Store",
    description:
      "Register your optical store, showcase your business and become part of the Spectwala network.",
    href: "/register/optician",
  },
  {
    icon: "👓",
    title: "Optometrist",
    description:
      "Register as an optometrist and connect with customers, optical stores and eyecare professionals.",
    href: "/register/optometrist",
  },
  {
    icon: "🏭",
    title: "Manufacturer",
    description:
      "Register your optical or eyecare manufacturing business and connect with the B2B network.",
    href: "/register/manufacturer",
  },
  {
    icon: "👁️",
    title: "Eye Hospital / Ophthalmologist",
    description:
      "Register your eye hospital, clinic or ophthalmology practice with Spectwala.",
    href: "/register/hospital",
  },
  {
    icon: "❤️",
    title: "Eye Camp Organisation",
    description:
      "Register an organisation or institution interested in organising an Eye Camp with Spectwala.",
    href: "/register/eye-camp",
  },
];

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <Link
            href="/"
            className="text-xl font-black tracking-tight text-[#3426a8]"
          >
            👓 SPECTWALA
          </Link>

          <Link
            href="/"
            className="text-sm font-bold text-[#3426a8] hover:underline"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-br from-[#17145b] via-[#3426a8] to-[#5c32c9] px-5 py-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-bold uppercase tracking-widest text-[#ffd84d]">
            Join Spectwala
          </p>

          <h1 className="mt-3 text-4xl font-black md:text-5xl">
            Choose your registration
          </h1>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-white/75">
            Select the option that best describes you or your organisation.
            Complete the registration form and our team will verify your
            information.
          </p>
        </div>
      </section>

      {/* REGISTRATION OPTIONS */}
      <section className="mx-auto max-w-7xl px-5 py-14">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {registrationOptions.map((option) => (
            <div
              key={option.href}
              className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eeecff] text-3xl">
                {option.icon}
              </div>

              <h2 className="mt-6 text-xl font-black text-slate-900">
                {option.title}
              </h2>

              <p className="mt-3 flex-1 text-sm leading-6 text-slate-500">
                {option.description}
              </p>

              <Link
                href={option.href}
                className="mt-7 rounded-xl bg-[#3426a8] px-5 py-3 text-center text-sm font-black text-white transition hover:bg-[#241b82]"
              >
                Register Now →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-black text-slate-900">
            Already registered?
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Login to manage your Spectwala account and business profile.
          </p>

          <Link
            href="/login"
            className="mt-5 inline-block rounded-xl border border-[#3426a8] px-6 py-3 text-sm font-bold text-[#3426a8] transition hover:bg-[#3426a8] hover:text-white"
          >
            Login
          </Link>
        </div>
      </section>
    </main>
  );
}