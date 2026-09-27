"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const params = useSearchParams();

  const error = params.get("error");
  const next = params.get("next") || "/shop";

  const messages: Record<string, string> = {
    google_cancelled: "Google login was cancelled.",
    oauth_state: "Login session expired. Please try again.",
    oauth_config: "Google login is not configured correctly.",
    token_exchange: "Google login could not be completed.",
    profile: "Could not read your Google profile.",
    email_not_verified: "Your Google email is not verified.",
    suspended: "This account is suspended.",
    google_login: "Google login failed. Please try again.",
  };

  return (
    <main className="min-h-screen bg-[#f5f3ff] px-5 py-10 text-[#11152c]">
      <div className="mx-auto flex min-h-[90vh] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] bg-white shadow-2xl md:grid-cols-2">

          {/* LEFT */}
          <div className="relative hidden min-h-[620px] overflow-hidden bg-gradient-to-br from-[#110d42] via-[#3426a8] to-[#8b5cf6] p-10 text-white md:flex md:flex-col md:justify-between">

            <div>
              <div className="text-2xl font-black tracking-tight">
                SPECTWALA
              </div>

              <p className="mt-2 text-sm text-white/60">
                Premium optical marketplace
              </p>
            </div>

            <div>
              <div className="text-7xl">👓</div>

              <h1 className="mt-8 text-5xl font-black leading-tight">
                See better.
                <br />
                Shop smarter.
              </h1>

              <p className="mt-5 max-w-md text-lg leading-8 text-white/70">
                Discover eyewear, optical products and trusted stores
                through the Spectwala marketplace.
              </p>
            </div>

            <div className="text-sm text-white/50">
              Secure Google authentication
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex min-h-[620px] items-center justify-center p-7 sm:p-12">
            <div className="w-full max-w-md">

              <Link
                href="/shop"
                className="text-sm font-bold text-[#3426a8]"
              >
                ← Back to Spectwala
              </Link>

              <div className="mt-10">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#3426a8] text-3xl shadow-lg">
                  👓
                </div>

                <h1 className="text-4xl font-black">
                  Welcome back
                </h1>

                <p className="mt-3 leading-7 text-slate-500">
                  Login with Google to shop from Spectwala stores,
                  manage your cart and track your orders.
                </p>
              </div>

              {error && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                  {messages[error] || "Login failed. Please try again."}
                </div>
              )}

              <a
                href={`/api/auth/google?next=${encodeURIComponent(next)}`}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 font-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span className="text-xl font-black">G</span>
                Continue with Google
              </a>

              <div className="mt-6 rounded-2xl bg-[#f5f3ff] p-5">
                <p className="font-black text-[#3426a8]">
                  Customer account
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Browse stores, search products, add items to your cart,
                  checkout and track your orders.
                </p>
              </div>

              <p className="mt-8 text-center text-xs text-slate-400">
                By continuing, you agree to use Spectwala's marketplace
                services.
              </p>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}