"use client";

import { useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Product } from "@/types";

interface UploadPortalProps {
  onProductCreated: (product: Product) => void;
}

const STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed"
};

export function UploadPortal({ onProductCreated }: UploadPortalProps) {
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const valid = useMemo(
    () => frontFile && backFile && name.trim().length > 0 && category.trim().length > 0,
    [frontFile, backFile, name, category]
  );

  async function handleUpload() {
    setError(null);
    if (!valid || !frontFile || !backFile) {
      setError("Please provide both garment views, a product name, and category.");
      return;
    }

    setIsUploading(true);

    try {
      const user = await supabase.auth.getUser();
      const sellerId = user.data.user?.id;

      if (!sellerId) {
        throw new Error("You must be authenticated to upload.");
      }

      const frontKey = `uploads/${sellerId}/${Date.now()}-front-${frontFile.name}`;
      const backKey = `uploads/${sellerId}/${Date.now()}-back-${backFile.name}`;

      const frontResult = await supabase.storage.from("garment-uploads").upload(frontKey, frontFile, {
        cacheControl: "3600",
        upsert: false
      });

      if (frontResult.error) throw frontResult.error;

      const backResult = await supabase.storage.from("garment-uploads").upload(backKey, backFile, {
        cacheControl: "3600",
        upsert: false
      });

      if (backResult.error) throw backResult.error;

      const frontUrlResult = await supabase.storage.from("garment-uploads").createSignedUrl(frontKey, 60 * 60);
      const backUrlResult = await supabase.storage.from("garment-uploads").createSignedUrl(backKey, 60 * 60);

      if (frontUrlResult.error || backUrlResult.error) {
        throw frontUrlResult.error ?? backUrlResult.error ?? new Error("Failed to create signed URLs.");
      }

      const productInsert = await supabase.from("products").insert({
        name,
        category,
        status: "pending",
        seller_id: sellerId
      }).select("id, name, category, status, created_at").single();

      if (productInsert.error) throw productInsert.error;

      const product = productInsert.data as Product;

      const assetInsert = await supabase.from("assets").insert({
        product_id: product.id,
        raw_image_front_url: frontUrlResult.data.signedUrl,
        raw_image_back_url: backUrlResult.data.signedUrl,
        model_3d_url: null,
        metadata: { uploaded_at: new Date().toISOString() }
      });

      if (assetInsert.error) throw assetInsert.error;

      onProductCreated({ ...product, seller_id: sellerId, asset: assetInsert.data?.[0] });
      setName("");
      setCategory("");
      setFrontFile(null);
      setBackFile(null);
    } catch (err) {
      setError((err as Error).message ?? "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-700 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Upload Portal</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Front / Back Garment Views</h2>
        </div>
        <span className="rounded-full bg-saturn-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-950">
          {STATUS_LABELS.pending}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex min-h-[180px] flex-col rounded-2xl border border-dashed border-slate-700 bg-slate-900/80 p-4 text-center">
          <span className="mb-3 text-sm uppercase tracking-[0.2em] text-slate-400">Front View</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => setFrontFile(event.target.files?.[0] ?? null)}
          />
          <div className="mt-auto text-sm text-slate-300">
            {frontFile ? frontFile.name : "Drag or click to choose an image"}
          </div>
        </label>
        <label className="flex min-h-[180px] flex-col rounded-2xl border border-dashed border-slate-700 bg-slate-900/80 p-4 text-center">
          <span className="mb-3 text-sm uppercase tracking-[0.2em] text-slate-400">Back View</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => setBackFile(event.target.files?.[0] ?? null)}
          />
          <div className="mt-auto text-sm text-slate-300">
            {backFile ? backFile.name : "Drag or click to choose an image"}
          </div>
        </label>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Product name"
          className="w-full px-4 py-3"
        />
        <input
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="Category (e.g. outerwear)"
          className="w-full px-4 py-3"
        />
      </div>

      {error ? <p className="mt-4 text-sm text-rose-400">{error}</p> : null}

      <button
        type="button"
        onClick={handleUpload}
        disabled={!valid || isUploading}
        className="mt-6 inline-flex items-center justify-center rounded-2xl bg-saturn-accent px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isUploading ? "Uploading..." : "Submit to Forge"}
      </button>
    </section>
  );
}
