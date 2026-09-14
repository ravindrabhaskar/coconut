import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { repo } from "@/services/repository";
import { scoreOpportunity } from "@/lib/calc/scoring";
import { Container, Section, Badge, BulletList, KeyValue, LinkButton, Arrow, Callout } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { ScoreBar } from "@/components/viz/charts";
import { Qty } from "@/components/ui/evidence";
import { SourceList } from "@/components/entity/blocks";
import { EVIDENCE_COLOR, EVIDENCE_SHORT } from "@/lib/format";
import { pageMetadata } from "@/lib/seo/site";

export async function generateStaticParams() { return (await repo.opportunities()).map((o) => ({ slug: o.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const o = await repo.opportunityBySlug(slug); if (!o) return {};
  return pageMetadata({ title: `${o.name} — Strategic Assessment & Business Model Canvas`, description: o.summary, path: `/opportunities/${o.slug}`, type: "article" });
}

export default async function OpportunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const o = await repo.opportunityBySlug(slug);
  if (!o) notFound();
  const [product, customers, sources, industries] = await Promise.all([repo.productById(o.productId), repo.customerSegments(), repo.sources(), repo.industries()]);
  const s = scoreOpportunity(o);
  const canvas = o.canvas;
  const cells: [string, string[]][] = [["Key partners", canvas.keyPartners], ["Key activities", canvas.keyActivities], ["Value proposition", canvas.valueProposition], ["Customer relationships", canvas.customerRelationships], ["Customer segments", canvas.customerSegments], ["Key resources", canvas.keyResources], ["Channels", canvas.channels], ["Cost structure", canvas.costStructure], ["Revenue streams", canvas.revenueStreams]];
  const lv = (k: string, v: string) => ({ k, v: <Badge>{v.replace("_", " ")}</Badge> });
  return (
    <>
      <PageIntro overline={`Opportunity · ${industries.find((i) => i.id === o.industryId)?.name ?? ""}`} title={o.name} lede={o.summary} breadcrumbs={[{ label: "Business", href: "/business" }, { label: "Opportunities", href: "/opportunities" }, { label: o.name }]}>
        <div className="mt-8 grid gap-6 md:grid-cols-[220px_1fr] md:items-end text-ivory-50"><div><p className="t-overline text-leaf-300">Strategic assessment</p><p className="t-metric text-6xl">{s.total}<span className="text-lg text-ivory-100/60">/100</span></p></div><div><ScoreBar value={s.total} label="Strategic score" dark /><p className="t-caption mt-2 text-ivory-100/60">Criteria with evidence: {Math.round(s.evidenceCoverage * 100)}% · Screening heuristic — not investment advice</p></div></div>
      </PageIntro>
      <Section surface="ivory">
        <Container>
          <h2 className="t-h3 mb-6">Criteria, scores, weights, reasons and assumptions</h2>
          <div className="overflow-x-auto"><table className="table-data"><thead><tr><th>Criterion</th><th>Score /10</th><th>Weight</th><th>Contribution</th><th>Reason</th><th>Evidence</th></tr></thead><tbody>
            {o.criteria.map((c) => { const n = s.normalisedWeights.find((w) => w.criterion === c.criterion)!; return <tr key={c.criterion}><td className="font-medium">{c.criterion}</td><td className="t-data">{c.score}</td><td className="t-data">{(n.weight * 100).toFixed(0)}%</td><td className="t-data">{n.contribution.toFixed(1)}</td><td className="text-[0.85rem] max-w-[36ch]">{c.reason || "—"}{c.assumptions && <span className="t-caption block">Assumption: {c.assumptions}</span>}</td><td><span className="t-badge" style={{ color: EVIDENCE_COLOR[c.evidence] }}>{EVIDENCE_SHORT[c.evidence]}</span></td></tr>; })}
          </tbody></table></div>

          <div className="mt-14 grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="t-h3 mb-4">Profile</h2>
              <KeyValue rows={[{ k: "Business model", v: o.businessModel }, { k: "Route to market", v: o.routeToMarket.join(" / ") }, { k: "CAPEX", v: <Qty q={o.capex} sources={sources} /> }, { k: "Working capital", v: <Qty q={o.workingCapital} sources={sources} /> }, lv("Margin potential", o.marginPotential), lv("Demand", o.demand), lv("Competition", o.competition), lv("Difficulty", o.difficulty), lv("Shelf life", o.shelfLife), lv("Scalability", o.scalability), lv("Export potential", o.exportPotential), lv("Brand potential", o.brandPotential), lv("Capital intensity", o.capitalIntensity), lv("Working-capital intensity", o.workingCapitalIntensity), lv("Regulatory complexity", o.regulatoryComplexity), lv("Risk", o.riskLevel), lv("Defensibility", o.defensibility), lv("Evidence quality", o.evidenceQuality)]} />
            </div>
            <div>
              <h2 className="t-h3 mb-4">Technical requirement & customers</h2>
              <BulletList items={o.technicalRequirement} />
              <p className="t-overline text-neutral-500 mt-6 mb-2">Customer segments</p>
              <ul className="flex flex-wrap gap-2">{o.customerSegmentIds.map((id) => customers.find((c) => c.id === id)).filter(Boolean).map((c) => <li key={c!.id}><Link href={`/customers/${c!.slug}`} className="t-nav rounded-full border border-neutral-300 px-3 py-1.5 hover:border-coconut-800 tap">{c!.name}</Link></li>)}</ul>
              {product && <div className="mt-8"><LinkButton href={`/build/${product.slug}`}>Plan this industry — {product.name} <Arrow /></LinkButton></div>}
            </div>
          </div>

          <h2 className="t-h3 mt-16 mb-6">Business Model Canvas — generated from the opportunity record</h2>
          <div className="grid gap-px overflow-hidden rounded-[var(--radius-media)] border hairline bg-neutral-200 sm:grid-cols-2 lg:grid-cols-5">
            {cells.map(([t, items]) => <div key={t} className="bg-cocos p-4"><p className="t-overline text-neutral-500 mb-2">{t}</p><ul className="space-y-1 text-[0.85rem]">{items.map((i) => <li key={i}>{i}</li>)}</ul></div>)}
          </div>
          <div className="mt-10"><Callout tone="warning" title="Strategic screening tool — not investment advice">Scores and levels are judgments recorded for transparency and challenge. Validate every assumption in the field before committing capital (see the 90-day plan).</Callout></div>
          <div className="mt-10"><p className="t-overline text-neutral-500 mb-3">Sources</p><SourceList ids={o.sourceIds} sources={sources} /></div>
        </Container>
      </Section>
    </>
  );
}
