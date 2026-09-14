"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { useRef } from "react";
import type { Group, Mesh, Object3D } from "three";
import type { CoconutRendererProps } from "./types";

const LAYER_MESH: Record<string, string> = { "cmp-outer-husk": "exocarp", "cmp-fibrous-husk": "mesocarp", "cmp-hard-shell": "endocarp", "cmp-kernel": "kernel", "cmp-coconut-water": "water" };
const EXPLODE_Y: Record<string, number> = { peduncle: 1.6, exocarp: 1.1, mesocarp: 0.6, endocarp: 0.1, kernel: -0.4, water: -0.9 };

function Model({ glb, layers, exploded, activeId, onHover, onSelect, reducedMotion }: CoconutRendererProps & { glb: string }) {
  const { scene } = useGLTF(glb);
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    g.traverse((o: Object3D) => {
      const target = exploded ? (EXPLODE_Y[o.name] ?? 0) : 0;
      const k = reducedMotion ? 1 : Math.min(1, dt * 3);
      o.position.y += (target - o.position.y) * k;
      const m = o as Mesh;
      if (m.isMesh && m.material && "opacity" in m.material) {
        const layerId = Object.keys(LAYER_MESH).find((id) => LAYER_MESH[id] === o.name);
        const dim = activeId && layerId && activeId !== layerId;
        (m.material as { opacity: number; transparent: boolean }).transparent = true;
        (m.material as { opacity: number }).opacity += ((dim ? 0.35 : 1) - (m.material as { opacity: number }).opacity) * k;
      }
    });
  });
  const layerFor = (name: string) => layers.find((l) => LAYER_MESH[l.id] === name);
  return (
    <group ref={ref}
      onPointerOver={(e) => { const l = layerFor(e.object.name); if (l) onHover(l.id); }}
      onPointerOut={() => onHover(null)}
      onClick={(e) => { const l = layerFor(e.object.name); if (l) onSelect(l.id); }}>
      <primitive object={scene} />
    </group>
  );
}

export function CoconutScene(props: CoconutRendererProps & { glb: string }) {
  return (
    <Canvas camera={{ position: [0, 0.6, 4.2], fov: 38 }} dpr={[1, 1.75]} gl={{ antialias: true, powerPreference: "high-performance" }}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 3]} intensity={1.2} castShadow />
      <Environment preset="studio" />
      <Model {...props} />
      <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={0.9} maxPolarAngle={2.1} />
    </Canvas>
  );
}
