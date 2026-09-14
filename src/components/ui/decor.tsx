import { cx } from "./primitives";

/**
 * Decorative tropical motifs (reference-driven: palm fronds at section corners, soft green blobs behind
 * circular image crops). Pure SVG/CSS — aria-hidden, pointer-events off, never carries information.
 */
export function PalmFrond({ className, flip, tone = "leaf" }: { className?: string; flip?: boolean; tone?: "leaf" | "lime" | "ink" }) {
  const color = tone === "lime" ? "var(--color-lime-500)" : tone === "ink" ? "var(--color-ivory-50)" : "var(--color-leaf-500)";
  return (
    <svg aria-hidden="true" viewBox="0 0 320 320" className={cx("pointer-events-none absolute", flip && "-scale-x-100", className)} fill="none">
      <g stroke={color} strokeLinecap="round">
        <path d="M18 302 C 90 210, 170 130, 300 26" strokeWidth="3.5" />
        {Array.from({ length: 16 }).map((_, i) => {
          const t = 0.08 + i * 0.058;
          // point on the rachis curve (quadratic approx of the bezier above)
          const x = 18 + (300 - 18) * t, y = 302 - (302 - 26) * (t * t * 0.55 + t * 0.45);
          const len = 70 - Math.abs(i - 8) * 5;
          return <g key={i}><path d={`M${x} ${y} q ${len * 0.35} ${-len * 0.9} ${len * 0.9} ${-len * 0.95}`} strokeWidth="2.2" opacity={0.9} /><path d={`M${x} ${y} q ${len * 0.9} ${len * 0.15} ${len * 1.05} ${len * 0.55}`} strokeWidth="2.2" opacity={0.8} /></g>;
        })}
      </g>
    </svg>
  );
}

/** Soft green organic shape used behind circular image crops. */
export function Blob({ className, tone = "lime" }: { className?: string; tone?: "lime" | "leaf" | "aqua" }) {
  const fill = tone === "lime" ? "var(--g-accent)" : tone === "aqua" ? "var(--g-aqua)" : "var(--color-leaf-200)";
  return <span aria-hidden="true" className={cx("pointer-events-none absolute block", className)} style={{ background: fill, borderRadius: "62% 38% 55% 45% / 48% 60% 40% 52%" }} />;
}

/** Circular image crop with a blob accent — the reference "photo in a circle with green blob" card visual. */
export function CircleFrame({ children, className, blobClassName }: { children: React.ReactNode; className?: string; blobClassName?: string }) {
  return (
    <div className={cx("relative", className)}>
      <Blob className={cx("-inset-3 -z-[1] opacity-90", blobClassName)} />
      <div className="relative aspect-square overflow-hidden rounded-full border-4 border-cocos shadow-[var(--shadow-card-hover)]">{children}</div>
    </div>
  );
}
