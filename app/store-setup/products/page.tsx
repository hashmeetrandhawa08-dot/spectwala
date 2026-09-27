"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: string | number;
  stock: number;
  category?: {
    name: string;
  };
  images?: {
    url: string;
  }[];
};

export default function StoreProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [category, setCategory] = useState("Frames");
  const [imageUrl, setImageUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const response = await fetch(
        "/api/store/products"
      );

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setError(data.error || "Failed to load products.");
        return;
      }

      setProducts(data.products || []);
    } catch (error) {
      console.error(error);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  async function uploadImage(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Image upload failed.");
        return;
      }

      setImageUrl(data.url);

      setSuccess("Product image uploaded.");
    } catch (error) {
      console.error(error);
      setError("Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function createProduct(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "/api/store/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            price,
            stock,
            category,
            imageUrl,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setError(
          data.error || "Failed to create product."
        );
        return;
      }

      setProducts((current) => [
        data.product,
        ...current,
      ]);

      setName("");
      setDescription("");
      setPrice("");
      setStock("0");
      setImageUrl("");

      setSuccess(
        "Product added to your store."
      );
    } catch (error) {
      console.error(error);
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">

          <div className="text-xl font-black text-[#3426a8]">
            👓 SPECTWALA
          </div>

          <button
            onClick={() =>
              router.push("/store-setup")
            }
            className="text-sm font-bold text-[#3426a8]"
          >
            ← Store Setup
          </button>

        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-12">

        <div className="mb-8">
          <p className="font-bold uppercase tracking-widest text-[#3426a8]">
            Store Products
          </p>

          <h1 className="mt-2 text-3xl font-black">
            Add products to your store
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">

          {/* ADD PRODUCT */}
          <form
            onSubmit={createProduct}
            className="h-fit rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
          >

            <h2 className="text-xl font-black">
              Add Product
            </h2>

            <div className="mt-6 space-y-5">

              <div>
                <label className="text-sm font-bold">
                  Product Name *
                </label>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Example: Premium Frame"
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-bold">
                  Category *
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                >
                  <option>Frames</option>
                  <option>Goggles</option>
                  <option>Lenses</option>
                  <option>Accessories</option>
                  <option>Instruments</option>
                  <option>Kids</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  rows={4}
                  placeholder="Product details..."
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="text-sm font-bold">
                    Price *
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value)
                    }
                    placeholder="899"
                    required
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">
                    Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) =>
                      setStock(e.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </div>

              </div>

              <div>
                <label className="text-sm font-bold">
                  Product Image
                </label>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={uploadImage}
                  disabled={uploading}
                  className="mt-2 w-full text-sm"
                />

                {uploading && (
                  <p className="mt-2 text-sm font-bold text-[#3426a8]">
                    Uploading...
                  </p>
                )}

                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Product"
                    className="mt-4 h-32 w-full rounded-xl object-cover"
                  />
                )}
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={saving || uploading}
                className="w-full rounded-xl bg-[#3426a8] py-3.5 font-black text-white disabled:opacity-50"
              >
                {saving
                  ? "Adding..."
                  : "Add Product"}
              </button>

            </div>
          </form>

          {/* PRODUCTS */}
          <div>

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black">
                Your Products
              </h2>

              <span className="rounded-full bg-[#eeecff] px-4 py-2 text-sm font-bold text-[#3426a8]">
                {products.length} Products
              </span>
            </div>

            {products.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">

                <div className="text-5xl">
                  👓
                </div>

                <h3 className="mt-4 font-black">
                  No products yet
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Add your first product using the
                  form.
                </p>

              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">

                {products.map((product) => (
                  <div
                    key={product.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >

                    {product.images?.[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-[#f5f3ff] text-6xl">
                        👓
                      </div>
                    )}

                    <div className="p-5">

                      <p className="text-xs font-bold uppercase text-[#3426a8]">
                        {product.category?.name}
                      </p>

                      <h3 className="mt-2 font-black">
                        {product.name}
                      </h3>

                      {product.description && (
                        <p className="mt-2 text-sm text-slate-500">
                          {product.description}
                        </p>
                      )}

                      <div className="mt-5 flex items-center justify-between">

                        <strong className="text-xl">
                          ₹{String(product.price)}
                        </strong>

                        <span className="text-sm text-slate-500">
                          Stock: {product.stock}
                        </span>

                      </div>

                    </div>
                  </div>
                ))}

              </div>
            )}

          </div>

        </div>

      </section>
    </main>
  );
}