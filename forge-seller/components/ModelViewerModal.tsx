"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF } from "@react-three/drei";
import { Product } from "@/types";

interface ModelViewerModalProps {
  product: Product | null;
  onClose: () => void;
}

function Model({ url }: { url: string }) {
  const gltf = useGLTF(url, true);
  return <primitive object={gltf.scene} dispose={null} />;
}

export function ModelViewerModal({ product, onClose }: ModelViewerModalProps) {
  const modelUrl = useMemo(() => product?.asset?.model_3d_url ?? "", [product]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl shadow-slate-950/80">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">3D Preview</p>
            <h2 className="text-xl font-semibold text-white">{product.name}</h2>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700">
            Close
          </button>
        </div>

        <div className="h-[72vh] w-full bg-slate-900">
          {modelUrl ? (
            <Canvas camera={{ position: [0, 1.5, 4], fov: 40 }}>
              <Stage environment="city" intensity={0.9} contactShadow={false}>
                <Model url={modelUrl} />
              </Stage>
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            </Canvas>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              Model asset not available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
