import Link from "next/link";
import { repo } from "@/services/repository";
import { productGapReport, componentGapReport, aggregateCoverage } from "@/services/gaps";
import { Container, Section, Badge, Metric } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { ScoreBar } from "@/components/viz/charts";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Research-Gap Engine — Evidence Coverage per Product and Component", description: "Automatically identified missing fields for every coconut component and product: missing data count, evidence coverage %, last researched date, fields requiring update, supplier quotation or field validation.", path: "/research/gaps" });

export default async function GapsPage() {
  const [products, components] = await Promise.all([repo.products(), repo.components()]);
  const reports = [...products.map(productGapReport), ...components.map(componentGapReport)].sort((a, b) => a.coveragePct - b.coveragePct);
  const agg = aggregateCoverage(reports);
  const tone = (s: string) => s === "VERIFIED" ? "green" : s === "RESEARCH_REQUIRED" ? "neutral" : "fibre";
  return (
    <>
      <PageIntro overline="Insights" title="Research-gap engine." lede="The platform becomes more accurate by exposing what it does not know. For every product and component the engine lists missing fields, coverage, last researched date and what each gap needs — a citation, a measurement, a supplier quotation or field validation." breadcrumbs={[{ label: "Research", href: "/research" }, { label: "Gaps" }]}>
        <div className="mt-10 grid gap-8 sm:grid-cols-4 text-ivory-50"><Metric label="Fields tracked" value={agg.totalFields} dark /><Metric label="Research required" value={agg.missing} dark /><Metric label="Evidence coverage" value={`${agg.coveragePct}%`} dark /><Metric label="Verified / sourced" value={`${agg.verifiedPct}% / ${agg.sourcedPct}%`} dark sub={`${agg.verified} verified from primary documents · ${agg.sourced} source-backed`} /></div>
      </PageIntro>
      <Section surface="ivory"><Container>
        <ul className="space-y-6">
          {reports.map((r) => (
            <li key={r.entityId} id={r.entityId} className="rounded-[var(--radius-media)] border hairline bg-cocos p-6">
              <div className="grid gap-4 md:grid-cols-[1fr_260px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><Badge>{r.entityType}</Badge><Badge tone={r.contentStatus === "DATA_VERIFIED" ? "green" : r.contentStatus === "RESEARCH_REQUIRED" ? "danger" : "fibre"}>{r.contentStatus.replace(/_/g, " ")}</Badge></div>
                  <Link href={r.entityType === "product" ? `/products/${products.find((p) => p.id === r.entityId)?.slug}` : `/explore/${components.find((c) => c.id === r.entityId)?.slug}`} className="t-h3 mt-2 block underline-offset-4 hover:underline">{r.entityName}</Link>
                  <p className="t-caption mt-1">{r.missingCount} fields research required · last researched {r.lastResearchedAt ?? "—"}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">{r.fields.map((f) => <span key={f.field} className="inline-flex items-center gap-1.5 text-[0.75rem]"><Badge tone={tone(f.status)}>{f.field}</Badge></span>)}</div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3 text-[0.8rem]">
                    <div><p className="t-overline text-neutral-500">Needs quotation</p><p>{r.requiringQuotation.join(", ") || "—"}</p></div>
                    <div><p className="t-overline text-neutral-500">Needs field validation</p><p>{r.requiringFieldValidation.join(", ") || "—"}</p></div>
                    <div><p className="t-overline text-neutral-500">Needs update / citation</p><p>{r.requiringUpdate.join(", ") || "—"}</p></div>
                  </div>
                </div>
                <div><p className="t-overline text-neutral-500">Coverage</p><p className="t-metric text-3xl">{r.coveragePct}%</p><ScoreBar value={r.coveragePct} label="coverage" /><p className="t-caption mt-2">Verified {r.verifiedPct}% · sourced {r.sourcedPct}%{r.expertReviewed ? " · expert reviewed" : ""}</p><ScoreBar value={r.sourcedPct} label="verified or sourced" tone="var(--color-ev-verified)" /></div>
              </div>
            </li>
          ))}
        </ul>
      </Container></Section>
    </>
  );
}
