import Link from "next/link";
import { repo } from "@/services/repository";
import { freshness, FRESHNESS_LABEL } from "@/lib/freshness";
import { Container, Section, Badge, BulletList, Callout, Chip } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { Qty } from "@/components/ui/evidence";
import { SourceList } from "@/components/entity/blocks";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Government Schemes for Coconut Processing — Verified Register", description: "PMFME, Coconut Development Board, Coir Board, PMEGP and state incentives: eligibility, benefit, subsidy, maximum amount, geography, applicable products, official source, effective date and last-verified date. Stale or unverified terms are flagged, never assumed.", path: "/business/schemes" });

export default async function SchemesPage({ searchParams }: { searchParams: Promise<{ level?: string; product?: string; state?: string }> }) {
  const sp = await searchParams;
  const [schemes, products, states, sources] = await Promise.all([repo.schemes(), repo.products(), repo.states(), repo.sources()]);
  const list = schemes.filter((s) => (!sp.level || s.level === sp.level) && (!sp.product || s.applicableProductIds.includes(sp.product) || s.applicableProductIds.length === 0) && (!sp.state || s.geography.includes(sp.state) || s.geography.includes("India")));
  const qs = (patch: Record<string, string | undefined>) => { const u = new URLSearchParams(); Object.entries({ ...sp, ...patch }).forEach(([k, v]) => { if (v) u.set(k, v); }); const q = u.toString(); return `/business/schemes${q ? `?${q}` : ""}`; };
  const verified = schemes.filter((s) => s.subsidy.evidence === "VERIFIED_FACT").length;
  return (
    <>
      <PageIntro overline="Business" title="Government schemes." lede={`${schemes.length} programmes registered; ${verified} with terms verified from an official document. Everything else shows RESEARCH REQUIRED until its guidelines are read and dated. Never plan on a subsidy that is not verified.`} breadcrumbs={[{ label: "Business", href: "/business" }, { label: "Schemes" }]} />
      <Section surface="ivory" padded={false} className="py-8"><Container>
        <div className="flex flex-wrap gap-2"><span className="t-overline self-center text-neutral-500 mr-2">Level</span><Chip href={qs({ level: undefined })} active={!sp.level}>All</Chip>{["central", "board", "state"].map((l) => <Chip key={l} href={qs({ level: l })} active={sp.level === l}>{l}</Chip>)}</div>
        <div className="mt-3 flex flex-wrap gap-2"><span className="t-overline self-center text-neutral-500 mr-2">State</span><Chip href={qs({ state: undefined })} active={!sp.state}>All</Chip>{states.map((s) => <Chip key={s.id} href={qs({ state: s.id })} active={sp.state === s.id}>{s.name}</Chip>)}</div>
        <div className="mt-3 flex flex-wrap gap-2"><span className="t-overline self-center text-neutral-500 mr-2">Product</span><Chip href={qs({ product: undefined })} active={!sp.product}>All</Chip>{products.filter((p) => schemes.some((s) => s.applicableProductIds.includes(p.id))).map((p) => <Chip key={p.id} href={qs({ product: p.id })} active={sp.product === p.id}>{p.name}</Chip>)}</div>
      </Container></Section>
      <Section surface="white" padded={false} className="pb-24 pt-4"><Container>
        <ul className="space-y-6">
          {list.map((s) => {
            const f = freshness(s.subsidy);
            const isVerified = s.subsidy.evidence === "VERIFIED_FACT";
            return (
              <li key={s.id} id={s.slug} className="scroll-mt-24 rounded-[var(--radius-media)] border hairline bg-cocos p-6">
                <div className="flex flex-wrap items-center gap-2"><Badge tone={s.level === "central" ? "green" : s.level === "board" ? "fibre" : "neutral"}>{s.level}</Badge><Badge tone={isVerified ? "green" : "amber"}>{isVerified ? "terms verified" : "terms research required"}</Badge>{isVerified && <Badge tone={f.state === "current" ? "neutral" : "amber"}>{FRESHNESS_LABEL[f.state]}</Badge>}{s.effectiveTo && new Date(s.effectiveTo) < new Date("2026-09-14") && <Badge tone="danger">ended {s.effectiveTo} — check successor</Badge>}</div>
                <h2 className="t-h3 mt-3">{s.name}</h2>
                <p className="t-caption mt-1">{s.authority} · {s.geography.map((g) => states.find((x) => x.id === g)?.name ?? g).join(", ")}{s.effectiveFrom ? ` · effective ${s.effectiveFrom}` : ""}{s.effectiveTo ? ` to ${s.effectiveTo}` : ""}</p>
                <p className="mt-3 text-[0.92rem] text-neutral-700">{s.summary}</p>
                <div className="mt-5 grid gap-6 md:grid-cols-[1fr_1fr_260px]">
                  <div><p className="t-overline text-neutral-500 mb-2">Eligibility</p><BulletList items={s.eligibility} /></div>
                  <div><p className="t-overline text-neutral-500 mb-2">Benefit</p><BulletList items={s.benefit} /></div>
                  <div className="space-y-4"><div><p className="t-overline text-neutral-500">Subsidy</p><Qty q={s.subsidy} sources={sources} big /></div><div><p className="t-overline text-neutral-500">Maximum amount</p><Qty q={s.maximumAmount} sources={sources} big /></div></div>
                </div>
                {s.applicableProductIds.length > 0 && <p className="t-caption mt-4">Applicable products: {s.applicableProductIds.map((id) => products.find((p) => p.id === id)).filter(Boolean).map((p, i) => <span key={p!.id}>{i > 0 && ", "}<Link href={`/products/${p!.slug}`} className="underline">{p!.name}</Link></span>)}</p>}
                {s.notes && <p className="t-caption mt-2">{s.notes}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-4 t-caption">{s.officialUrl && <a href={s.officialUrl} target="_blank" rel="noopener noreferrer" className="underline">Official source ↗</a>}<span>Last verified: {s.subsidy.lastVerifiedAt ?? "—"}</span></div>
                <details className="mt-3"><summary className="t-caption cursor-pointer">Sources</summary><div className="mt-2"><SourceList ids={s.sourceIds} sources={sources} /></div></details>
              </li>
            );
          })}
        </ul>
        <div className="mt-10"><Callout tone="warning" title="DO NOT ASSUME SUBSIDIES">Scheme terms change and schemes end. Confirm the current guideline document, your eligibility category and the sanction process with the State Nodal Agency before including any subsidy in a financial model.</Callout></div>
      </Container></Section>
    </>
  );
}
