"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/components/ui/primitives";

export interface TreeNode { id: string; name: string; href?: string; children?: TreeNode[]; tone?: string; note?: string }

/**
 * ProductTree — horizontal branching tree on desktop (branches draw outward when scrolled into view),
 * vertical expandable tree on mobile. Data-driven; nodes navigate to their entity.
 */
export function ProductTree({ root, dark, title }: { root: TreeNode; dark?: boolean; title?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) setVisible(true); }, { threshold: 0.2 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  // Layout: compute positions
  const NODE_H = 30, GAP = 10, COL_W = 230;
  type Pos = { node: TreeNode; x: number; y: number; depth: number; parent?: Pos };
  const positions: Pos[] = [];
  let cursor = 0;
  const layout = (n: TreeNode, depth: number, parent?: Pos): Pos => {
    const children = n.children ?? [];
    if (!children.length) {
      const p: Pos = { node: n, x: depth * COL_W, y: cursor, depth, parent };
      cursor += NODE_H + GAP; positions.push(p); return p;
    }
    const placeholder: Pos = { node: n, x: depth * COL_W, y: 0, depth, parent };
    positions.push(placeholder);
    const kids = children.map((c) => layout(c, depth + 1, placeholder));
    placeholder.y = (kids[0].y + kids[kids.length - 1].y) / 2;
    return placeholder;
  };
  layout(root, 0);
  const width = (Math.max(...positions.map((p) => p.depth)) + 1) * COL_W;
  const height = cursor;
  const stroke = dark ? "rgba(169,197,142,0.6)" : "rgba(79,127,58,0.6)";

  return (
    <div ref={ref}>
      {title && <p className={cx("t-overline mb-4", dark ? "text-leaf-300" : "text-leaf-500")}>{title}</p>}
      {/* Desktop SVG */}
      <div className="hidden md:block scroll-x">
        <svg width={width} height={height + 10} viewBox={`0 0 ${width} ${height + 10}`} className="max-w-none" role="img" aria-label={`Product tree from ${root.name}`}>
          {positions.filter((p) => p.parent).map((p, i) => {
            const a = p.parent!;
            const x1 = a.x + 200, y1 = a.y + NODE_H / 2, x2 = p.x, y2 = p.y + NODE_H / 2;
            const d = `M ${x1} ${y1} C ${x1 + 18} ${y1}, ${x2 - 18} ${y2}, ${x2} ${y2}`;
            return <path key={i} d={d} fill="none" stroke={stroke} strokeWidth="1.5" className={visible ? "anim-draw" : ""} style={{ animationDelay: `${p.depth * 250 + i * 25}ms`, strokeDashoffset: visible ? undefined : 1000, strokeDasharray: 1000 }} />;
          })}
          {positions.map((p, i) => (
            <g key={i} transform={`translate(${p.x},${p.y})`} opacity={visible ? 1 : 0} style={{ transition: `opacity 500ms ease ${p.depth * 250}ms` }}>
              {p.node.href ? (
                <Link href={p.node.href}>
                  <rect width="200" height={NODE_H} rx="3" fill={p.depth === 0 ? "var(--color-leaf-500)" : dark ? "rgba(255,255,255,0.06)" : "var(--color-cocos)"} stroke={p.depth === 0 ? "none" : dark ? "rgba(255,255,255,0.18)" : "var(--color-neutral-300)"} className="hover:stroke-leaf-500" />
                  <text x="12" y="19" fontSize="12.5" fontWeight={p.depth <= 1 ? 600 : 500} fill={p.depth === 0 ? "#fff" : "currentColor"} fontFamily="var(--font-sans)">{p.node.name}</text>
                </Link>
              ) : (
                <>
                  <rect width="200" height={NODE_H} rx="3" fill={p.depth === 0 ? "var(--color-leaf-500)" : dark ? "rgba(255,255,255,0.06)" : "var(--color-cocos)"} stroke={p.depth === 0 ? "none" : dark ? "rgba(255,255,255,0.18)" : "var(--color-neutral-300)"} strokeDasharray={p.node.note ? "3 3" : undefined} />
                  <text x="12" y="19" fontSize="12.5" fontWeight={p.depth <= 1 ? 600 : 500} fill={p.depth === 0 ? "#fff" : "currentColor"} fontFamily="var(--font-sans)">{p.node.name}</text>
                </>
              )}
            </g>
          ))}
        </svg>
      </div>
      {/* Mobile vertical expandable tree */}
      <div className="md:hidden">
        <MobileNode node={root} depth={0} dark={dark} />
      </div>
    </div>
  );
}

function MobileNode({ node, depth, dark }: { node: TreeNode; depth: number; dark?: boolean }) {
  const kids = node.children ?? [];
  const label = node.href ? <Link href={node.href} className="underline-offset-4 hover:underline">{node.name}</Link> : <span>{node.name}{node.note && <span className="t-caption ml-2">{node.note}</span>}</span>;
  if (!kids.length) return <div className={cx("border-l py-1.5 pl-4 text-[0.95rem]", dark ? "border-ivory-100/20" : "border-neutral-300")} style={{ marginLeft: depth * 12 }}>{label}</div>;
  return (
    <details open={depth < 1} className={cx("border-l pl-4", dark ? "border-ivory-100/20" : "border-neutral-300")} style={{ marginLeft: depth * 12 }}>
      <summary className="tap cursor-pointer list-none py-2 font-semibold">{label} <span className="t-caption">({kids.length})</span></summary>
      {kids.map((k) => <MobileNode key={k.id} node={k} depth={depth + 1} dark={dark} />)}
    </details>
  );
}
