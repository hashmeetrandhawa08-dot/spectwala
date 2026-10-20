
"use client";

import { useEffect, useState } from "react";

type Document = {
  id: string;
  documentType: string;
  url: string;
  fileName: string | null;
};

type Registration = {
  id: string;
  type: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  name: string | null;
  email: string | null;
  phone: string | null;
  formData: Record<string, unknown>;
  rejectionReason: string | null;
  createdAt: string;
  documents: Document[];
};

export default function AdminDashboardPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Registration | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  async function loadRegistrations() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/registrations", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch registrations.");
      }

      setRegistrations(data.registrations || []);
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load registrations."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRegistrations();
  }, []);

  async function updateRegistration(
    id: string,
    status: "APPROVED" | "REJECTED"
  ) {
    if (status === "REJECTED" && !rejectionReason.trim()) {
      alert("Please enter a rejection reason.");
      return;
    }

    try {
      setActionLoading(true);

      const response = await fetch("/api/registrations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status,
          rejectionReason:
            status === "REJECTED" ? rejectionReason.trim() : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update registration.");
      }

      alert(
        status === "APPROVED"
          ? "Registration approved successfully."
          : "Registration rejected successfully."
      );

      setSelected(null);
      setRejectionReason("");

      await loadRegistrations();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update registration."
      );
    } finally {
      setActionLoading(false);
    }
  }

  function formatType(type: string) {
    return type
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("en-IN");
  }

  function isImage(url: string) {
    const cleanUrl = url.split("?")[0].toLowerCase();

    return (
      cleanUrl.endsWith(".jpg") ||
      cleanUrl.endsWith(".jpeg") ||
      cleanUrl.endsWith(".png") ||
      cleanUrl.endsWith(".webp")
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-7xl">
        {/* DASHBOARD HEADER */}
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-[#3426a8]">
            Spectwala Admin
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-900">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-slate-500">
            Manage registrations, customer payments, and seller payouts.
          </p>
        </div>

        {/* DASHBOARD NAVIGATION */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* REGISTRATION MANAGEMENT */}
          <a
            href="/admin/dashboard"
            className="rounded-2xl border-2 border-[#3426a8] bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#f0efff] text-2xl">
                📋
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#3426a8]">
                  Registrations
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-900">
                  Registration Management
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Review professional registrations, documents, and approval
              requests.
            </p>

            <p className="mt-4 font-bold text-[#3426a8]">
              Manage Registrations →
            </p>
          </a>

          {/* EXISTING CUSTOMER PAYMENT LOG */}
          <a
            href="/admin/dashboard/payments"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#3426a8] hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-green-50 text-2xl">
                💳
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-green-700">
                  Customer Payments
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-900">
                  Customer Payment Log
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Review customer UPI screenshots, transaction references, order
              totals, and payment status.
            </p>

            <p className="mt-4 font-bold text-[#3426a8]">
              Open Customer Payments →
            </p>
          </a>

          {/* SELLER AND WHOLESALE PAYOUTS */}
          <a
            href="/admin/dashboard/payouts"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-violet-600 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-violet-50 text-2xl">
                🏦
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-violet-700">
                  Seller & Wholesale
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-900">
                  Payout Management
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              View order details and recipient UPI IDs, and record manual
              payouts as paid.
            </p>

            <p className="mt-4 font-bold text-violet-700">
              Manage Payouts →
            </p>
          </a>
        </div>

        {/* REGISTRATION MANAGEMENT */}
        <div className="mb-5">
          <h2 className="text-2xl font-black text-slate-900">
            Registration Management
          </h2>

          <p className="mt-1 text-slate-500">
            Review and manage eye-care professional registrations.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* REGISTRATION TABLE */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="font-semibold text-slate-500">
              Loading registrations...
            </p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-lg font-bold text-slate-700">
              No registrations found
            </p>

            <p className="mt-2 text-sm text-slate-500">
              New registrations will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                      Name
                    </th>

                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                      Type
                    </th>

                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                      Contact
                    </th>

                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                      Submitted
                    </th>

                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {registrations.map((registration) => (
                    <tr
                      key={registration.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-5">
                        <p className="font-bold text-slate-900">
                          {registration.name || "Unnamed"}
                        </p>

                        <p className="mt-1 max-w-[180px] truncate text-xs text-slate-400">
                          ID: {registration.id}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <span className="rounded-full bg-[#f0efff] px-3 py-1 text-xs font-bold text-[#3426a8]">
                          {formatType(registration.type)}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <p className="text-sm text-slate-700">
                          {registration.email || "-"}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {registration.phone || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        {registration.status === "PENDING" && (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                            Pending
                          </span>
                        )}

                        {registration.status === "APPROVED" && (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                            Approved
                          </span>
                        )}

                        {registration.status === "REJECTED" && (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                            Rejected
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-5 text-sm text-slate-500">
                        {formatDate(registration.createdAt)}
                      </td>

                      <td className="px-5 py-5">
                        <button
                          onClick={() => {
                            setSelected(registration);
                            setRejectionReason(
                              registration.rejectionReason || ""
                            );
                          }}
                          className="rounded-lg bg-[#3426a8] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#291c91]"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REFRESH */}
        <div className="mt-5">
          <button
            onClick={() => void loadRegistrations()}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Refresh Registrations
          </button>
        </div>
      </div>

      {/* REGISTRATION REVIEW MODAL */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#3426a8]">
                  Registration Review
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-900">
                  {selected.name || "Unnamed Registration"}
                </h2>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="rounded-full bg-slate-100 px-4 py-2 text-xl font-bold text-slate-500 hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            {/* BASIC INFORMATION */}
            <div className="grid gap-5 p-6 md:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">
                  Registration Type
                </p>

                <p className="mt-1 font-bold text-slate-900">
                  {formatType(selected.type)}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-slate-400">
                  Status
                </p>

                <p className="mt-1 font-bold text-slate-900">
                  {selected.status}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-slate-400">
                  Email
                </p>

                <p className="mt-1 font-bold text-slate-900">
                  {selected.email || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-slate-400">
                  Phone
                </p>

                <p className="mt-1 font-bold text-slate-900">
                  {selected.phone || "-"}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Registration ID
                </p>

                <p className="mt-1 break-all font-mono text-sm text-slate-700">
                  {selected.id}
                </p>
              </div>
            </div>

            {/* FORM DATA */}
            <div className="border-t border-slate-200 p-6">
              <h3 className="text-lg font-black text-slate-900">
                Submitted Information
              </h3>

              <div className="mt-4 rounded-xl bg-slate-50 p-5">
                {Object.entries(selected.formData || {}).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="border-b border-slate-200 py-3 last:border-0"
                    >
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        {key}
                      </p>

                      <p className="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-slate-800">
                        {typeof value === "object" && value !== null
                          ? JSON.stringify(value, null, 2)
                          : String(value ?? "-")}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* UPLOADED DOCUMENTS */}
            <div className="border-t border-slate-200 p-6">
              <h3 className="text-lg font-black text-slate-900">
                Uploaded Documents
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Documents submitted with this registration.
              </p>

              {selected.documents && selected.documents.length > 0 ? (
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  {selected.documents.map((document) => {
                    const image = isImage(document.url);

                    return (
                      <div
                        key={document.id}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                      >
                        {image ? (
                          <div className="flex h-72 items-center justify-center bg-white p-3">
                            <img
                              src={document.url}
                              alt={document.documentType}
                              className="h-full w-full rounded-xl object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex h-72 flex-col items-center justify-center bg-slate-100">
                            <div className="text-6xl">📄</div>

                            <p className="mt-3 text-sm font-bold text-slate-500">
                              PDF Document
                            </p>
                          </div>
                        )}

                        <div className="p-5">
                          <p className="font-bold text-slate-900">
                            {document.documentType}
                          </p>

                          {document.fileName && (
                            <p className="mt-1 truncate text-xs text-slate-500">
                              {document.fileName}
                            </p>
                          )}

                          <a
                            href={document.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex rounded-lg bg-[#3426a8] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#291c91]"
                          >
                            {image ? "Open Image" : "Open Document"}
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                  No documents uploaded with this registration.
                </div>
              )}
            </div>

            {/* REJECTION REASON */}
            <div className="border-t border-slate-200 p-6">
              <label className="text-sm font-bold text-slate-700">
                Rejection Reason
              </label>

              <textarea
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Required only when rejecting..."
                rows={4}
                className="mt-2 w-full rounded-xl border border-slate-300 p-4 text-sm outline-none focus:border-[#3426a8]"
              />
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col gap-3 border-t border-slate-200 p-6 sm:flex-row sm:justify-end">
              <button
                onClick={() => setSelected(null)}
                disabled={actionLoading}
                className="rounded-xl border border-slate-300 px-6 py-3 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  void updateRegistration(selected.id, "REJECTED")
                }
                disabled={actionLoading}
                className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "Reject"}
              </button>

              <button
                onClick={() =>
                  void updateRegistration(selected.id, "APPROVED")
                }
                disabled={actionLoading}
                className="rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
