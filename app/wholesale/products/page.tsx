"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

type Product = {
  id: string;
  sku?: string | null;
  brand?: string | null;
  name: string;
  stock: number;
  price?: string | number;
  wholesalePrice?: string | number;
  images?: {
    url: string;
  }[];
  category?: {
    name: string;
  } | null;
};

type FormState = {
  sku: string;
  brand: string;
  name: string;
  category: string;
  price: string;
  wholesalePrice: string;
  stock: string;
  image: string;
  description: string;
};

const emptyForm: FormState = {
  sku: "",
  brand: "",
  name: "",
  category: "",
  price: "",
  wholesalePrice: "",
  stock: "",
  image: "",
  description: "",
};

export default function WholesaleProducts() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [form, setForm] =
    useState<FormState>(emptyForm);

  const [manualMessage, setManualMessage] =
    useState("");

  const [importMessage, setImportMessage] =
    useState("");

  const [importError, setImportError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [importing, setImporting] =
    useState(false);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  async function loadProducts() {
    try {
      setLoading(true);

      const response =
        await fetch(
          "/api/wholesale/products"
        );

      if (response.status === 401) {
        location.href =
          "/login?role=wholesaler";

        return;
      }

      const data =
        await response.json();

      setProducts(
        data.products || []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function addManualProduct(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setManualMessage("");

    const response =
      await fetch(
        "/api/wholesale/products",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            sku: form.sku,
            brand: form.brand,
            category:
              form.category ||
              "Optical wholesale",
            price: form.price,
            wholesalePrice:
              form.wholesalePrice,
            stock: form.stock,
            description:
              form.description,
            images: form.image
              ? [form.image]
              : [],
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      setManualMessage(
        data.error ||
          "Unable to save product."
      );

      return;
    }

    setManualMessage(
      data.updated
        ? "Product updated successfully ✓"
        : "Product published successfully ✓"
    );

    setForm(emptyForm);

    await loadProducts();
  }

  function chooseFile(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0] || null;

    setSelectedFile(file);
    setImportMessage("");
    setImportError("");
  }

  async function importFile() {
    if (!selectedFile) {
      setImportError(
        "Please choose a CSV or Excel file first."
      );

      return;
    }

    setImporting(true);
    setImportMessage("");
    setImportError("");

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        selectedFile
      );

      const response =
        await fetch(
          "/api/wholesale/products",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        if (
          Array.isArray(
            data.errors
          ) &&
          data.errors.length
        ) {
          const firstErrors =
            data.errors
              .slice(0, 8)
              .map(
                (item: {
                  row: number;
                  error: string;
                }) =>
                  `Row ${item.row}: ${item.error}`
              )
              .join("\n");

          setImportError(
            `${data.error || "Import failed."}\n${firstErrors}`
          );
        } else {
          setImportError(
            data.error ||
              "Import failed."
          );
        }

        return;
      }

      setImportMessage(
        `Import complete ✓ ${data.imported} products processed — ${data.created} created, ${data.updated} updated.`
      );

      setSelectedFile(null);

      const fileInput =
        document.getElementById(
          "bulk-product-file"
        ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      await loadProducts();
    } catch (error) {
      console.error(error);

      setImportError(
        "Something went wrong while importing the file."
      );
    } finally {
      setImporting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#08101b] p-5 text-white">

      <div className="mx-auto max-w-7xl py-8">

        <a
          href="/wholesale"
          className="font-black"
        >
          ← Wholesale dashboard
        </a>

        <div className="mt-7">

          <p className="text-xs font-black uppercase tracking-[.25em] text-cyan-300">
            Product management
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Wholesale catalogue
          </h1>

          <p className="mt-2 max-w-2xl text-white/45">
            Add products manually or import
            your complete catalogue from a
            CSV or Excel file.
          </p>

        </div>

        {/* BULK IMPORT */}

        <section className="mt-8 rounded-3xl bg-gradient-to-br from-cyan-500/15 to-blue-500/10 p-7 ring-1 ring-cyan-300/20">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-xs font-black uppercase tracking-[.25em] text-cyan-300">
                One-click bulk import
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Import CSV / Excel
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                Upload your supplier catalogue
                and Spectwala will create new
                products or update existing
                products automatically using SKU.
              </p>

            </div>

            <div className="rounded-2xl bg-white/5 p-5 text-sm ring-1 ring-white/10">

              <p className="font-black">
                Supported files
              </p>

              <p className="mt-2 text-white/45">
                CSV · XLSX · XLS
              </p>

              <p className="mt-1 text-white/35">
                Maximum 2,000 products
              </p>

            </div>

          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">

            <label
              htmlFor="bulk-product-file"
              className="flex cursor-pointer items-center rounded-2xl border border-dashed border-white/20 bg-white/5 px-5 py-5 transition hover:bg-white/10"
            >

              <div className="mr-4 grid h-12 w-12 place-items-center rounded-xl bg-cyan-300 text-2xl text-[#08101b]">
                📊
              </div>

              <div className="min-w-0">

                <p className="font-black">
                  {selectedFile
                    ? selectedFile.name
                    : "Choose CSV or Excel file"}
                </p>

                <p className="mt-1 truncate text-xs text-white/40">
                  {selectedFile
                    ? `${(
                        selectedFile.size /
                        1024
                      ).toFixed(1)} KB`
                    : "Click to browse your computer"}
                </p>

              </div>

              <input
                id="bulk-product-file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={chooseFile}
                className="hidden"
              />

            </label>

            <button
              type="button"
              onClick={importFile}
              disabled={
                importing ||
                !selectedFile
              }
              className="rounded-2xl bg-cyan-300 px-7 py-4 font-black text-[#08101b] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {importing
                ? "IMPORTING..."
                : "IMPORT PRODUCTS"}
            </button>

          </div>

          <div className="mt-5 rounded-2xl bg-black/20 p-5">

            <p className="text-xs font-black uppercase tracking-[.2em] text-white/40">
              Recommended columns
            </p>

            <p className="mt-3 text-sm leading-7 text-white/60">
              SKU · Brand · Product Name ·
              Category · Description · Retail Price ·
              Wholesale Price · Stock · Image URL
            </p>

            <p className="mt-3 text-xs leading-5 text-white/35">
              Column names are flexible. For example,
              "Product Name", "product_name" and
              "Name" are understood as the product name.
            </p>

          </div>

          {importMessage && (
            <div className="mt-5 rounded-2xl bg-emerald-400/10 p-4 text-sm font-bold text-emerald-300 ring-1 ring-emerald-300/20">
              {importMessage}
            </div>
          )}

          {importError && (
            <div className="mt-5 whitespace-pre-line rounded-2xl bg-red-400/10 p-4 text-sm font-bold text-red-300 ring-1 ring-red-300/20">
              {importError}
            </div>
          )}

        </section>

        {/* MANUAL PRODUCT */}

        <div className="mt-8 grid gap-7 lg:grid-cols-[380px_1fr]">

          <form
            onSubmit={addManualProduct}
            className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10"
          >

            <p className="text-xs font-black uppercase tracking-[.25em] text-cyan-300">
              Manual entry
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Add product
            </h2>

            <div className="mt-6 space-y-4">

              <input
                placeholder="SKU / Product code"
                value={form.sku}
                onChange={(e) =>
                  setForm({
                    ...form,
                    sku: e.target.value,
                  })
                }
                className="w-full rounded-xl bg-white/10 px-4 py-3 outline-none ring-cyan-300 focus:ring-1"
              />

              <input
                placeholder="Brand"
                value={form.brand}
                onChange={(e) =>
                  setForm({
                    ...form,
                    brand: e.target.value,
                  })
                }
                className="w-full rounded-xl bg-white/10 px-4 py-3 outline-none ring-cyan-300 focus:ring-1"
              />

              <input
                required
                placeholder="Product name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                className="w-full rounded-xl bg-white/10 px-4 py-3 outline-none ring-cyan-300 focus:ring-1"
              />

              <input
                placeholder="Category"
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                  })
                }
                className="w-full rounded-xl bg-white/10 px-4 py-3 outline-none ring-cyan-300 focus:ring-1"
              />

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Retail price"
                value={form.price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price: e.target.value,
                  })
                }
                className="w-full rounded-xl bg-white/10 px-4 py-3 outline-none ring-cyan-300 focus:ring-1"
              />

              <input
                required
                type="number"
                min="0"
                step="0.01"
                placeholder="Wholesale price"
                value={
                  form.wholesalePrice
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    wholesalePrice:
                      e.target.value,
                  })
                }
                className="w-full rounded-xl bg-white/10 px-4 py-3 outline-none ring-cyan-300 focus:ring-1"
              />

              <input
                type="number"
                min="0"
                step="1"
                placeholder="Stock"
                value={form.stock}
                onChange={(e) =>
                  setForm({
                    ...form,
                    stock: e.target.value,
                  })
                }
                className="w-full rounded-xl bg-white/10 px-4 py-3 outline-none ring-cyan-300 focus:ring-1"
              />

              <input
                placeholder="Image URL"
                value={form.image}
                onChange={(e) =>
                  setForm({
                    ...form,
                    image: e.target.value,
                  })
                }
                className="w-full rounded-xl bg-white/10 px-4 py-3 outline-none ring-cyan-300 focus:ring-1"
              />

              <textarea
                rows={4}
                placeholder="Product description"
                value={
                  form.description
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    description:
                      e.target.value,
                  })
                }
                className="w-full rounded-xl bg-white/10 px-4 py-3 outline-none ring-cyan-300 focus:ring-1"
              />

              {manualMessage && (
                <p className="text-sm font-bold text-cyan-300">
                  {manualMessage}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-cyan-300 py-3 font-black text-[#08101b] hover:bg-cyan-200"
              >
                Publish / Update Product
              </button>

            </div>

          </form>

          {/* INVENTORY */}

          <div>

            <div className="flex items-end justify-between gap-4">

              <div>

                <p className="text-xs font-black uppercase tracking-[.2em] text-white/35">
                  Your inventory
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Wholesale catalogue
                </h2>

              </div>

              <div className="rounded-xl bg-white/5 px-4 py-2 text-sm font-black">
                {products.length} products
              </div>

            </div>

            {loading ? (
              <div className="mt-5 rounded-3xl bg-white/5 p-10 text-center text-white/45">
                Loading catalogue...
              </div>
            ) : products.length === 0 ? (
              <div className="mt-5 rounded-3xl border border-dashed border-white/10 p-10 text-center">

                <div className="text-5xl">
                  📦
                </div>

                <p className="mt-4 font-black">
                  No products yet
                </p>

                <p className="mt-2 text-sm text-white/40">
                  Upload your supplier CSV
                  or Excel file to add
                  products in bulk.
                </p>

              </div>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">

                {products.map(
                  (product) => (
                    <div
                      key={product.id}
                      className="overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10"
                    >

                      {product.images?.[0]
                        ?.url ? (
                        <img
                          src={
                            product
                              .images[0]
                              .url
                          }
                          className="h-44 w-full object-cover"
                          alt={
                            product.name
                          }
                        />
                      ) : (
                        <div className="grid h-44 place-items-center bg-white/5 text-5xl">
                          👓
                        </div>
                      )}

                      <div className="p-5">

                        <div className="flex items-start justify-between gap-3">

                          <div>

                            <p className="font-black">
                              {
                                product.name
                              }
                            </p>

                            {product.brand && (
                              <p className="mt-1 text-xs font-bold text-cyan-300">
                                {
                                  product.brand
                                }
                              </p>
                            )}

                          </div>

                          {product.sku && (
                            <span className="rounded-lg bg-white/10 px-2 py-1 font-mono text-[10px] text-white/50">
                              {
                                product.sku
                              }
                            </span>
                          )}

                        </div>

                        <p className="mt-1 text-xs text-white/35">
                          {
                            product
                              .category
                              ?.name ||
                            "Optical wholesale"
                          }
                        </p>

                        <p className="mt-3 text-sm text-white/45">

                          ₹
                          {Number(
                            product.wholesalePrice ||
                              product.price ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}

                          {" · "}

                          {
                            product.stock
                          }{" "}
                          units

                        </p>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

        </div>

      </div>
    </main>
  );
}