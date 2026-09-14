/**
 * Renderer contract for the exploded coconut.
 * The page passes data-driven layers; a renderer (SVG today, WebGL/GLB later) draws them and reports interaction.
 * Replacing the renderer must not require touching the page or the data.
 */
export interface CoconutLayer {
  id: string;            // component id
  slug: string;          // route slug
  name: string;
  short: string;         // 1-line description
  colorToken: string;    // design token name
  order: number;         // 1 = outermost
  products: { name: string; href: string }[];
  massShareLabel?: string;
}

export interface CoconutRendererProps {
  layers: CoconutLayer[];
  exploded: boolean;
  activeId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  reducedMotion: boolean;
  className?: string;
}

export type CoconutRendererKind = "svg" | "webgl";
