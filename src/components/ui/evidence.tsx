"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Quantity, Source } from "@/domain/types";
import { EVIDENCE_COLOR, EVIDENCE_LABEL, EVIDENCE_SHORT, formatQuantity, unitLabel } from "@/lib/format";
import { freshness, FRESHNESS_LABEL, inferDataKind } from "@/lib/freshness";
import { cx } from "./primitives";

/**
 * EvidenceBadge — click to open a provenance popover explaining where a number came from.
 * Colour is never the only signal: the label text is always present.
 */
export function EvidenceBadge({ q, sources = [], compact, className }: { q: Quantity; sources?: Pick<Source, "id" | "name" | "url" | "organisation" | "publicationDate" | "evidenceStrength">[]; compact?: boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc); document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);
  const color = EVIDENCE_COLOR[q.evidence];
  const rr = q.evidence === "RESEARCH_REQUIRED";
  const srcs = (q.sourceIds ?? []).map((sid) => sources.find((s) => s.id === sid)).filter(Boolean) as typeof sources;
  const fresh = freshness(q);

  return (
    <div ref={ref} className={cx("relative inline-block", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={cx("t-badge inline-flex items-center gap-1.5 rounded-[var(--radius-data)] border px-1.5 py-0.5 transition-colors hover:brightness-110 tap min-h-[24px] min-w-0", rr && "border-dashed")}
        style={{ borderColor: color, color }}
        title={`Evidence: ${EVIDENCE_LABEL[q.evidence]} — click for details`}
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: color }} aria-hidden="true" />
        {compact ? EVIDENCE_SHORT[q.evidence].split(" ")[0] : EVIDENCE_SHORT[q.evidence]}
      </button>
      {open && (
        <div id={id} role="dialog" aria-label="Evidence details" className="absolute left-0 z-40 mt-2 w-[min(22rem,90vw)] rounded-[var(--radius-control)] border border-neutral-200 bg-cocos p-4 text-left text-neutral-900 shadow-xl">
          <p className="t-overline" style={{ color }}>{EVIDENCE_LABEL[q.evidence]}</p>
          <p className="t-metric mt-1 text-xl">{formatQuantity(q, { compact: false })}</p>
          {q.label && <p className="t-caption">{q.label}</p>}
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[0.8rem]">
            <Row k="Unit" v={unitLabel(q.unit) || q.unit} />
            {q.min !== undefined && q.max !== undefined && <Row k="Range" v={`${q.min}–${q.max}`} />}
            {q.basis && <Row k="Basis" v={q.basis} />}
            {q.scale && <Row k="Scale" v={q.scale} />}
            {q.geography && <Row k="Geography" v={q.geography} />}
            {q.year !== undefined && <Row k="Year" v={String(q.year)} />}
            {q.formula && <Row k="Formula" v={<code className="t-data">{q.formula}</code>} />}
            {q.confidence && <Row k="Confidence" v={q.confidence} />}
            {q.publishedAt && <Row k="Published" v={q.publishedAt} />}
            {q.researchedAt && <Row k="Researched" v={q.researchedAt} />}
            {q.lastVerifiedAt && <Row k="Last verified" v={q.lastVerifiedAt} />}
            {q.verifiedBy && <Row k="Verified by" v={q.verifiedBy} />}
            {q.reviewedAt && <Row k="Reviewed" v={q.reviewedAt} />}
            {!rr && <Row k="Freshness" v={<span className={fresh.state === "potentially_stale" ? "text-danger" : fresh.state === "review_suggested" ? "text-amber-500" : ""}>{FRESHNESS_LABEL[fresh.state]}{fresh.ageDays !== undefined ? ` (${fresh.ageDays} d, ${inferDataKind(q)} rule)` : ""}</span>} />}
            {!q.lastVerifiedAt && !rr && <Row k="Last verified" v={<span className="text-amber-500">Not yet verified</span>} />}
          </dl>
          {q.notes && <p className="mt-3 text-[0.8rem] leading-snug text-neutral-700">{q.notes}</p>}
          {rr && !q.notes && <p className="mt-3 text-[0.8rem] text-neutral-700">No reliable value is held. It has not been invented.</p>}
          {srcs.length > 0 && (
            <div className="mt-3 border-t hairline pt-2">
              <p className="t-overline text-neutral-500">Sources</p>
              <ul className="mt-1 space-y-1">
                {srcs.map((s) => (
                  <li key={s.id} className="text-[0.8rem]">
                    {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline decoration-neutral-300 hover:decoration-leaf-500">{s.name}</a> : s.name}
                    <span className="t-caption"> — {s.organisation} · {s.evidenceStrength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {q.evidence === "SOURCE_BACKED" && <p className="mt-3 t-caption">Source-backed: an authoritative source is attached, but the exact figure/section has not been independently re-verified. Confirm before contractual use.</p>}
          {q.evidence !== "VERIFIED_FACT" && q.evidence !== "SOURCE_BACKED" && !rr && <p className="mt-3 t-caption">Limitations: not yet promoted to a verified fact; treat as planning input and confirm before contractual use.</p>}
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (<><dt className="text-neutral-500">{k}</dt><dd className="min-w-0 break-words">{v}</dd></>);
}

/** Value + unit + badge in one line. */
export function Qty({ q, sources, label, big, className }: { q: Quantity; sources?: Parameters<typeof EvidenceBadge>[0]["sources"]; label?: string; big?: boolean; className?: string }) {
  const rr = q.evidence === "RESEARCH_REQUIRED" || q.value === undefined;
  return (
    <span className={cx("inline-flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      {label && <span className="t-caption">{label}</span>}
      <span className={cx("t-metric", big ? "text-2xl md:text-3xl" : "text-[0.95rem]", rr && "text-neutral-500")}>{rr ? "—" : formatQuantity(q)}</span>
      <EvidenceBadge q={q} sources={sources} compact={!rr} />
    </span>
  );
}

export function FreshnessChip({ year, unit, researchedAt, lastVerifiedAt, sourceName }: { year?: number; unit?: string; researchedAt?: string; lastVerifiedAt?: string; sourceName?: string }) {
  return (
    <span className="t-data inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[var(--radius-data)] border border-neutral-200 bg-neutral-50 px-2 py-1 text-neutral-700">
      {year !== undefined && <span>YEAR {year}</span>}
      {unit && <span>UNIT {unit}</span>}
      {sourceName && <span>SOURCE {sourceName}</span>}
      {researchedAt && <span>RESEARCHED {researchedAt}</span>}
      <span>LAST VERIFIED {lastVerifiedAt ?? "—"}</span>
    </span>
  );
}
