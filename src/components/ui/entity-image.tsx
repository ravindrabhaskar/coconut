import Image from "next/image";
import type { ReactNode } from "react";
import { resolveImage, type ImageKind } from "@/lib/images";
import { cx } from "./primitives";

/**
 * EntityImage — renders the real image for an entity when one exists in public/images/<kind>/<slug>.*,
 * otherwise renders the supplied synthetic fallback (SVG) with an honest "photography pending" caption.
 * Server component: file lookup happens at build/request time.
 */
export function EntityImage({ kind, slug, alt, fallback, className, priority, sizes = "(min-width: 1024px) 640px, 100vw", caption }: { kind: ImageKind; slug: string; alt: string; fallback: ReactNode; className?: string; priority?: boolean; sizes?: string; caption?: string }) {
  const img = resolveImage(kind, slug);
  if (!img) return <>{fallback}</>;
  return (
    <figure className={cx("overflow-hidden rounded-[var(--radius-media)] border hairline bg-white", className)}>
      <Image src={img.src} alt={alt} width={img.width} height={img.height} priority={priority} sizes={sizes} className="h-auto w-full" />
      {(caption || img.caption || img.credit) && (
        <figcaption className="t-caption px-4 py-2">{img.caption ?? caption}{img.credit ? ` · ${img.credit}` : ""}{img.licence ? ` · ${img.licence}` : ""}</figcaption>
      )}
    </figure>
  );
}
