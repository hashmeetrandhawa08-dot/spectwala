"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid login credentials.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#3426a8] text-3xl">
            👁️
          </div>

          <h1 className="mt-5 text-3xl font-black text-slate-900">
            Spectwala Admin
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to manage registrations.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl">

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="text-sm font-bold text-slate-700">
                Admin Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@spectwala.com"
                required
                autoComplete="email"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#3426a8] focus:ring-2 focus:ring-[#3426a8]/10"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter admin password"
                required
                autoComplete="current-password"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#3426a8] focus:ring-2 focus:ring-[#3426a8]/10"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#3426a8] py-3.5 font-bold text-white transition hover:bg-[#291c91] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Spectwala Administration
        </p>

      </div>
    </main>
  );
}