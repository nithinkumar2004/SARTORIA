"use client";

import { Product } from "@/types";
import { Activity, CheckCircle2, Loader2, XCircle } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  onOpenProduct: (product: Product) => void;
}

const statusStyles = {
  pending: "bg-slate-800 text-slate-200",
  processing: "bg-amber-500/15 text-amber-300",
  completed: "bg-emerald-500/15 text-emerald-300",
  failed: "bg-rose-500/15 text-rose-300"
};

const statusIcons = {
  pending: Activity,
  processing: Loader2,
  completed: CheckCircle2,
  failed: XCircle
};

export function ProductGrid({ products, onOpenProduct }: ProductGridProps) {
  if (!products.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
        No products yet. Upload a garment to start the AI reconstruction pipeline.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {products.map((product) => {
        const StatusIcon = statusIcons[product.status] ?? Activity;
        return (
          <article key={product.id} className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-lg shadow-slate-950/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{product.category}</p>
                <h3 className="mt-3 text-xl font-semibold text-white">{product.name}</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusStyles[product.status]}`}>
                {product.status}
              </span>
            </div>
            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-slate-300">
                <StatusIcon className="h-5 w-5" />
                <p className="text-sm">Created {new Date(product.created_at).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => onOpenProduct(product)}
                disabled={product.status !== "completed"}
                className="rounded-2xl bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Inspect
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
