"use client";

/**
 * WebGL / GLB renderer contract.
 *
 * This renderer is only activated when a production-quality GLB model is available and configured via
 * NEXT_PUBLIC_COCONUT_GLB (public path). Per the platform brief we never ship poor procedural 3D:
 * without a model this component renders nothing and the page falls back to the layered SVG renderer.
 *
 * Model requirements (for the technical illustrator / 3D artist):
 *  - Named meshes per layer: "peduncle", "exocarp", "mesocarp", "endocarp", "kernel", "water"
 *  - Draco-compressed, ≤ 3 MB, PBR materials, baked AO
 *  - Layer meshes positioned in assembled state; exploded offsets applied here along +Y
 */

import { Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import type { CoconutRendererProps } from "./types";

const GLB_PATH = process.env.NEXT_PUBLIC_COCONUT_GLB;

export const webglAvailable = () => typeof window !== "undefined" && !!GLB_PATH && !!window.WebGLRenderingContext;

const Scene = dynamic(() => import("./webgl-scene").then((m) => m.CoconutScene), { ssr: false, loading: () => null });

export function WebglCoconutRenderer(props: CoconutRendererProps) {
  const ok = useMemo(() => webglAvailable(), []);
  if (!ok || !GLB_PATH) return null;
  return (
    <div className={props.className} style={{ minHeight: 480 }}>
      <Suspense fallback={null}>
        <Scene {...props} glb={GLB_PATH} />
      </Suspense>
    </div>
  );
}
