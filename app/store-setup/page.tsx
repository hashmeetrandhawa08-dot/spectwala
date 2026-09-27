"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const input = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3426a8] focus:ring-4 focus:ring-[#3426a8]/10";

type Store = { id?: string; storeName?: string; logoUrl?: string | null; description?: string | null; gstNumber?: string | null; panNumber?: string | null; address?: string | null; state?: string | null; district?: string | null; city?: string | null; taluka?: string | null; pincode?: string | null };

type Product = { id: string; name: string; price: string | number; stock: number; description?: string | null; images: { url: string }[]; category?: { name: string } };

export default function StoreSetupPage() {
  const [store, setStore] = useState<Store>({ state: "Maharashtra" });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [product, setProduct] = useState({ name: "", category: "Frames", price: "", stock: "", description: "" });
  const [productFile, setProductFile] = useState<File | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const r = await fetch("/api/store/setup", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed to load store.");
      if (d.store) setStore(d.store);
      const p = await fetch("/api/store/products", { cache: "no-store" });
      const pd = await p.json();
      setProducts(pd.products || []);
    } catch (e) { setMessage(e instanceof Error ? e.message : "Failed to load store."); }
    finally { setLoading(false); }
  }

  async function upload(file: File) {
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const d = await r.json(); if (!r.ok || !d.success) throw new Error(d.error || "Upload failed.");
    return d.url as string;
  }

  async function saveStore(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMessage("");
    try {
      let logoUrl = store.logoUrl || null;
      if (logoFile) logoUrl = await upload(logoFile);
      const r = await fetch("/api/store/setup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...store, logoUrl }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Failed to save store.");
      setStore(d.store); setMessage("Store profile saved successfully.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Failed to save store."); }
    finally { setSaving(false); }
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMessage("");
    try {
      const urls = productFile ? [await upload(productFile)] : [];
      const r = await fetch("/api/store/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...product, price: Number(product.price), stock: Number(product.stock), images: urls }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Failed to add product.");
      setProducts((x) => [d.product, ...x]); setProduct({ name: "", category: "Frames", price: "", stock: "", description: "" }); setProductFile(null); setMessage("Product added to your store.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Failed to add product."); }
    finally { setSaving(false); }
  }

  if (loading) return <main className="min-h-screen bg-[#f7f6ff] p-10 text-center font-bold">Loading your store...</main>;

  return (
    <main className="min-h-screen bg-[#f7f6ff] text-[#11152c]">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/shop" className="text-2xl font-black tracking-tight text-[#3426a8]">SPECTWALA</Link>
          <div className="flex gap-2"><Link href="/store-dashboard" className="rounded-xl bg-[#11152c] px-4 py-2 text-sm font-bold text-white">Orders</Link><Link href="/shop" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold">View Marketplace</Link></div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-8 rounded-[2rem] bg-gradient-to-br from-[#17145b] via-[#3426a8] to-[#7c3aed] p-8 text-white shadow-2xl md:p-12">
          <p className="text-sm font-black uppercase tracking-[.25em] text-white/70">Professional Store Studio</p>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">Build your Spectwala store.</h1>
          <p className="mt-4 max-w-2xl text-white/75">Create a premium profile, upload your logo and publish optical products for customers to discover and order.</p>
        </div>

        {message && <div className="mb-6 rounded-2xl border border-[#cfc9ff] bg-[#f0efff] p-4 font-semibold text-[#3426a8]">{message}</div>}

        <form onSubmit={saveStore} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-[#3426a8] to-[#8b5cf6] shadow-xl ring-1 ring-slate-200">
              {store.logoUrl ? <img src={store.logoUrl} alt="Store logo" className="h-full w-full object-cover" /> : <span className="text-4xl">👓</span>}
            </div>
            <div className="flex-1"><p className="text-xs font-black uppercase tracking-widest text-[#3426a8]">01 · Store Identity</p><h2 className="mt-1 text-2xl font-black">Your store profile</h2><p className="mt-1 text-sm text-slate-500">This is the first thing customers see.</p><input className="mt-4 text-sm" type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} /></div>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <label className="md:col-span-2"><span className="mb-2 block text-sm font-bold">Store Name *</span><input required className={input} value={store.storeName || ""} onChange={(e) => setStore({ ...store, storeName: e.target.value })} placeholder="Vision Point Opticals" /></label>
            <label className="md:col-span-2"><span className="mb-2 block text-sm font-bold">Store Bio</span><textarea className={input} rows={3} value={store.description || ""} onChange={(e) => setStore({ ...store, description: e.target.value })} placeholder="Premium eyewear, lenses and eye-care products..." /></label>
          </div>

          <div className="my-10 border-t border-slate-100 pt-8"><p className="text-xs font-black uppercase tracking-widest text-[#3426a8]">02 · Store Location</p><h2 className="mt-1 text-2xl font-black">Where customers can find you</h2></div>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="md:col-span-2"><span className="mb-2 block text-sm font-bold">Store Address</span><textarea className={input} rows={3} value={store.address || ""} onChange={(e) => setStore({ ...store, address: e.target.value })} placeholder="Complete store address" /></label>
            {(["state","district","city","taluka","pincode"] as const).map((key) => <label key={key}><span className="mb-2 block text-sm font-bold">{key[0].toUpperCase()+key.slice(1)}</span><input className={input} value={store[key] || ""} onChange={(e) => setStore({ ...store, [key]: e.target.value })} placeholder={key === "state" ? "Maharashtra" : key[0].toUpperCase()+key.slice(1)} /></label>)}
          </div>
          <div className="mt-8"><button disabled={saving} className="rounded-xl bg-[#3426a8] px-7 py-3 font-black text-white shadow-lg hover:bg-[#291c91] disabled:opacity-50">{saving ? "Saving..." : "Save Store Profile →"}</button></div>
        </form>

        <section className="mt-10 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <form onSubmit={addProduct} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl md:p-8">
            <p className="text-xs font-black uppercase tracking-widest text-[#3426a8]">03 · Product Studio</p><h2 className="mt-1 text-2xl font-black">Add products</h2><p className="mt-2 text-sm text-slate-500">Upload a product image and publish it to your storefront.</p>
            <div className="mt-6 space-y-4">
              <input required className={input} placeholder="Product name" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} />
              <select className={input} value={product.category} onChange={(e) => setProduct({ ...product, category: e.target.value })}><option>Frames</option><option>Sunglasses</option><option>Contact Lenses</option><option>Lenses</option><option>Accessories</option><option>Eye Care</option><option>Other</option></select>
              <div className="grid grid-cols-2 gap-4"><input required type="number" min="1" step="0.01" className={input} placeholder="Price ₹" value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} /><input required type="number" min="0" className={input} placeholder="Stock" value={product.stock} onChange={(e) => setProduct({ ...product, stock: e.target.value })} /></div>
              <textarea className={input} rows={4} placeholder="Product description" value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} />
              <input type="file" accept="image/*" onChange={(e) => setProductFile(e.target.files?.[0] || null)} />
              <button disabled={saving} className="w-full rounded-xl bg-[#11152c] px-6 py-3 font-black text-white disabled:opacity-50">{saving ? "Publishing..." : "Publish Product +"}</button>
            </div>
          </form>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl md:p-8"><div className="flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-[#3426a8]">Your Catalogue</p><h2 className="mt-1 text-2xl font-black">Products</h2></div><span className="rounded-full bg-[#f0efff] px-3 py-1 text-sm font-bold text-[#3426a8]">{products.length}</span></div>
            {products.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">Your products will appear here.</div> : <div className="mt-6 grid gap-4 sm:grid-cols-2">{products.map((p) => <div key={p.id} className="overflow-hidden rounded-2xl border border-slate-200"><div className="aspect-[4/3] bg-slate-100">{p.images[0] ? <img src={p.images[0].url} alt={p.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-5xl">👓</div>}</div><div className="p-4"><p className="font-black">{p.name}</p><p className="mt-1 text-xs text-slate-500">{p.category?.name || "Other"} · {p.stock} in stock</p><p className="mt-2 text-lg font-black text-[#3426a8]">₹{Number(p.price).toLocaleString("en-IN")}</p></div></div>)}</div>}
          </div>
        </section>
      </div>
    </main>
  );
}
