"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Opportunity } from "@/domain/types";
import { matchOpportunity, recommendRoute, scoreOpportunity, type FinderProfile } from "@/lib/calc/scoring";
import { Badge, Callout, cx } from "@/components/ui/primitives";
import { ScoreBar } from "@/components/viz/charts";
import { inr } from "@/lib/format";

const CAPITAL = [50000, 100000, 300000, 500000, 1000000, 2500000, 5000000, 10000000, 50000000];
const CAP_LABEL = (n: number) => n >= 1e7 ? `₹${n / 1e7} crore` : `₹${n / 1e5} lakh`;

const SEL = "tap w-full rounded-[var(--radius-control)] border border-neutral-300 bg-white px-3 py-2.5 text-[0.95rem]";

function ProfileField({ label, k, options, p, setP }: { label: string; k: keyof FinderProfile; options: [string, string][]; p: FinderProfile; setP: (p: FinderProfile) => void }) {
  return (
    <label className="block"><span className="t-overline text-neutral-500 block mb-1.5">{label}</span><select className={SEL} value={String(p[k])} onChange={(e) => setP({ ...p, [k]: k === "capitalInr" ? Number(e.target.value) : e.target.value })}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
  );
}

export function OpportunityFinder({ opportunities, industryKind, productNames }: { opportunities: Opportunity[]; industryKind: Record<string, "food" | "industrial" | "other">; productNames: Record<string, { name: string; slug: string }> }) {
  const [p, setP] = useState<FinderProfile>({ capitalInr: 1000000, location: "near_farms", rawMaterialAccess: "moderate", market: "B2B", preference: "either", technicalCapability: "medium", riskTolerance: "medium", desiredScale: "small", marketingCapability: "medium", timeHorizon: "medium" });
  const [step, setStep] = useState(0);
  const matches = useMemo(() => opportunities.map((o) => ({ o, m: matchOpportunity(o, p, industryKind[o.industryId] ?? "other"), s: scoreOpportunity(o) })).sort((a, b) => b.m.fit - a.m.fit), [opportunities, p, industryKind]);

  const questions = (
    <div className="grid gap-4 sm:grid-cols-2">
      <ProfileField p={p} setP={setP} label="Available capital" k="capitalInr" options={CAPITAL.map((c) => [String(c), CAP_LABEL(c)])} />
      <ProfileField p={p} setP={setP} label="Location" k="location" options={[["near_farms", "Near coconut farms"], ["urban", "Urban / consumer market"], ["hyderabad", "Hyderabad"], ["port", "Near a port"], ["other", "Other"]]} />
      <ProfileField p={p} setP={setP} label="Raw-material access" k="rawMaterialAccess" options={[["strong", "Strong (own/contracted supply)"], ["moderate", "Moderate (traders)"], ["weak", "Weak"]]} />
      <ProfileField p={p} setP={setP} label="Market focus" k="market" options={[["B2B", "B2B"], ["B2C", "B2C"], ["Export", "Export"], ["Hybrid", "Hybrid"]]} />
      <ProfileField p={p} setP={setP} label="Food or industrial preference" k="preference" options={[["either", "Either"], ["food", "Food"], ["industrial", "Industrial"]]} />
      <ProfileField p={p} setP={setP} label="Technical capability" k="technicalCapability" options={[["low", "Low"], ["medium", "Medium"], ["high", "High"]]} />
      <ProfileField p={p} setP={setP} label="Risk tolerance" k="riskTolerance" options={[["low", "Low"], ["medium", "Medium"], ["high", "High"]]} />
      <ProfileField p={p} setP={setP} label="Desired scale" k="desiredScale" options={[["micro", "Micro"], ["small", "Small"], ["medium", "Medium"], ["large", "Large"]]} />
      <ProfileField p={p} setP={setP} label="Marketing capability" k="marketingCapability" options={[["low", "Low"], ["medium", "Medium"], ["high", "High"]]} />
      <ProfileField p={p} setP={setP} label="Time horizon" k="timeHorizon" options={[["short", "Short (<2 years)"], ["medium", "Medium (2–5 years)"], ["long", "Long (5+ years)"]]} />
    </div>
  );
  return (
    <div>
      <div className="mb-4 flex gap-2 md:hidden" role="tablist">{["Your profile", "Shortlist"].map((s, i) => <button key={s} role="tab" aria-selected={step === i} onClick={() => setStep(i)} className={cx("tap flex-1 rounded-full border px-2 py-1.5 text-[0.75rem] font-semibold", step === i ? "bg-coconut-950 text-ivory-50 border-coconut-950" : "border-neutral-300")}>{s}</button>)}</div>
      <div className={cx(step !== 0 && "hidden md:block")}>{questions}</div>
      <div className={cx("mt-10", step !== 1 && "hidden md:block")}>
        <Callout tone="warning" title="Strategic screening tool — not investment advice">Fit = 50 ± documented adjustments for capital, market, preference, capability, risk, supply, location, scale and horizon. Reasons and cautions are shown for every result so you can disagree with them.</Callout>
        <ol className="mt-8 space-y-4">
          {matches.map(({ o, m, s }, i) => (
            <li key={o.id} className={cx("rounded-[var(--radius-media)] border p-5", i < 3 ? "border-leaf-500 bg-cocos" : "hairline bg-cocos/60")}>
              <div className="grid gap-4 md:grid-cols-[1fr_200px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">{i < 3 && <Badge tone="green">Shortlist #{i + 1}</Badge>}<Badge>{o.capitalIntensity} capital</Badge><Badge>{o.difficulty.replace("_", " ")} difficulty</Badge></div>
                  <Link href={`/opportunities/${o.slug}`} className="t-h4 mt-2 block underline-offset-4 hover:underline">{o.name}</Link>
                  <p className="t-caption mt-1">{productNames[o.productId]?.name} · strategic score {s.total}/100 · CAPEX {o.capex.value === undefined ? "research required" : inr(o.capex.value)}</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 text-[0.85rem]">
                    <div><p className="t-overline text-leaf-500 mb-1">Why it appeared</p><ul className="list-disc pl-4 space-y-0.5">{m.reasons.length ? m.reasons.map((r) => <li key={r}>{r}</li>) : <li>No strong positive fit signals.</li>}</ul></div>
                    <div><p className="t-overline text-danger mb-1">Cautions</p><ul className="list-disc pl-4 space-y-0.5">{m.cautions.length ? m.cautions.map((r) => <li key={r}>{r}</li>) : <li>None recorded.</li>}</ul></div>
                  </div>
                </div>
                <div><p className="t-overline text-neutral-500">Fit</p><p className="t-metric text-4xl">{m.fit}</p><ScoreBar value={m.fit} label={`${o.name} fit`} /></div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function BusinessBuilder({ products }: { products: { id: string; name: string; slug: string; capex?: number; category: string }[] }) {
  const [capital, setCapital] = useState(1000000);
  const [market, setMarket] = useState<"B2B" | "B2C" | "Export" | "Hybrid">("B2B");
  const [productId, setProductId] = useState<string>(products[0]?.id ?? "");
  const product = products.find((p) => p.id === productId);
  const rec = useMemo(() => recommendRoute(capital, market, product?.capex), [capital, market, product]);
  const sel = "tap w-full rounded-[var(--radius-control)] border border-neutral-300 bg-white px-3 py-2.5 text-[0.95rem]";
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block"><span className="t-overline text-neutral-500 block mb-1.5">Capital</span><select className={sel} value={capital} onChange={(e) => setCapital(Number(e.target.value))}>{CAPITAL.map((c) => <option key={c} value={c}>{CAP_LABEL(c)}</option>)}</select></label>
        <label className="block"><span className="t-overline text-neutral-500 block mb-1.5">Market</span><select className={sel} value={market} onChange={(e) => setMarket(e.target.value as typeof market)}>{["B2B", "B2C", "Export", "Hybrid"].map((m) => <option key={m}>{m}</option>)}</select></label>
        <label className="block"><span className="t-overline text-neutral-500 block mb-1.5">Product / category</span><select className={sel} value={productId} onChange={(e) => setProductId(e.target.value)}>{products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.category})</option>)}</select></label>
      </div>
      <div className="mt-10 rounded-[var(--radius-media)] border border-leaf-500 bg-cocos p-6 md:p-8">
        <p className="t-overline text-leaf-500">Indicative route</p>
        <p className="t-h2 mt-1">{rec.route}</p>
        <ul className="mt-3 list-disc pl-5 text-[0.92rem] space-y-1">{rec.why.map((w) => <li key={w}>{w}</li>)}</ul>
        {product?.capex === undefined && <p className="t-caption mt-2">CAPEX for {product?.name} is RESEARCH REQUIRED — route chosen on capital band only.</p>}
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div><p className="t-overline text-neutral-500 mb-2">Validation stage</p><p className="text-[0.92rem]">{rec.validationStage}</p><p className="t-overline text-neutral-500 mt-5 mb-2">Likely capital allocation (EXPERT JUDGMENT shares)</p><ul className="space-y-1.5">{rec.capitalAllocation.map((a) => <li key={a.item} className="flex items-center gap-3 text-[0.88rem]"><span className="w-40 shrink-0">{a.item}</span><span className="h-2 flex-1 rounded-full bg-neutral-200"><span className="block h-full rounded-full bg-leaf-500" style={{ width: `${a.share * 100}%` }} /></span><span className="t-data w-24 text-right">{Math.round(a.share * 100)}% · {inr(capital * a.share)}</span></li>)}</ul></div>
          <div><p className="t-overline text-neutral-500 mb-2">Working capital</p><p className="text-[0.92rem]">{rec.workingCapitalNote}</p><p className="t-overline text-neutral-500 mt-5 mb-2">Customer validation</p><ul className="list-disc pl-5 text-[0.88rem] space-y-1">{rec.customerValidation.map((c) => <li key={c}>{c}</li>)}</ul><p className="t-overline text-neutral-500 mt-5 mb-2">Main risks</p><ul className="list-disc pl-5 text-[0.88rem] space-y-1">{rec.mainRisks.map((c) => <li key={c}>{c}</li>)}</ul><p className="t-overline text-neutral-500 mt-5 mb-2">Next milestone</p><p className="text-[0.92rem] font-medium">{rec.nextMilestone}</p></div>
        </div>
        <p className="t-caption mt-6">No return is implied or guaranteed. {product && <Link href={`/build/${product.slug}`} className="underline">Open the planning chain for {product.name} →</Link>}</p>
      </div>
    </div>
  );
}
