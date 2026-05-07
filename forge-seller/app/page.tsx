"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ProductGrid } from "@/components/ProductGrid";
import { UploadPortal } from "@/components/UploadPortal";
import { ModelViewerModal } from "@/components/ModelViewerModal";
import type { Product } from "@/types";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [session, setSession] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(!!data.session);
      if (data.session) await loadProducts();
      setLoading(false);
    };
    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sessionData) => {
      setSession(!!sessionData?.session);
      if (sessionData?.session) loadProducts();
      if (!sessionData?.session) setProducts([]);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select(`*, assets(*)`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error.message);
      return;
    }

    const normalized = (data || []).map((item: any) => ({
      ...item,
      asset: Array.isArray(item.assets) ? item.assets[0] : undefined
    }));

    setProducts(normalized);
  }

  async function handleLogin() {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: "demo-password"
    });

    if (error) {
      setAuthError(error.message);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setProducts([]);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/90 p-8 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">The Forge</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Manufacturer Command Center</h1>
            <p className="mt-3 max-w-2xl text-slate-400">
              Upload orthographic garment views and track AI-powered 3D digital twin reconstruction.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            {session ? (
              <button
                onClick={handleLogout}
                className="rounded-2xl bg-saturn-accent px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-500"
              >
                Logout
              </button>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email address"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 placeholder:text-slate-500 sm:w-auto"
                />
                <button
                  onClick={handleLogin}
                  className="rounded-2xl bg-saturn-accent px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-500"
                >
                  Sign In
                </button>
              </div>
            )}
            {authError ? <p className="text-sm text-rose-400">{authError}</p> : null}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="rounded-3xl border border-slate-700 bg-slate-950/70 p-10 text-center text-slate-400">Loading dashboard…</div>
      ) : session ? (
        <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <UploadPortal
            onProductCreated={(product) => setProducts((current) => [product, ...current])}
          />
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Product grid</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Digital Twin Pipeline</h2>
              <p className="mt-2 text-slate-400">Monitor reconstruction status and inspect completed GLB assets in real time.</p>
            </section>
            <ProductGrid products={products} onOpenProduct={setSelectedProduct} />
          </div>
          <ModelViewerModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-10 text-slate-300">
          <p className="text-lg font-semibold text-white">Please sign in to view your product command center.</p>
          <p className="mt-3 text-slate-400">Use your Supabase credentials to log in and access your manufacturer dashboard.</p>
        </div>
      )}
    </main>
  );
}
