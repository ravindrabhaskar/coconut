import { Suspense } from "react";
import { repo } from "@/services/repository";
import { productGapReport } from "@/services/gaps";
import { scoreOpportunity } from "@/lib/calc/scoring";
import { Container, Section } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { CompareTool, type CompareRow } from "@/components/features/compare";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Compare Coconut Products — Side by Side", description: "Compare 2–4 coconut products on raw material, complexity, CAPEX, working capital, margin, demand, competition, shelf life, export, regulation, technology, scale, moat, risk and evidence strength.", path: "/tools/compare" });

export default async function ComparePage() {
  const [products, components, opportunities, sources] = await Promise.all([repo.products(), repo.components(), repo.opportunities(), repo.sources()]);
  const rows: CompareRow[] = products.map((p) => {
    const o = opportunities.find((x) => x.id === p.opportunityId);
    return {
      id: p.id, name: p.name, slug: p.slug, level: p.businessLevel,
      component: p.sourceComponentIds.map((id) => components.find((c) => c.id === id)?.name.replace(/ \(.*\)/, "")).join(", "),
      complexity: o?.difficulty ?? components.find((c) => c.id === p.sourceComponentIds[0])?.processingComplexity ?? "research_required",
      capex: p.capex, workingCapital: p.workingCapital, marginPotential: o?.marginPotential ?? "research_required", demand: o?.demand ?? "research_required", competition: o?.competition ?? "research_required",
      shelfLife: p.shelfLife, exportPotential: o?.exportPotential ?? (p.exportCountryIds.length > 3 ? "high" : p.exportCountryIds.length ? "medium" : "low"), regulatoryComplexity: o?.regulatoryComplexity ?? (p.regulationIds.length > 5 ? "high" : "medium"),
      technology: p.technology[0] ?? "—", scalability: o?.scalability ?? "research_required", moat: o?.defensibility ?? "research_required", riskLevel: o?.riskLevel ?? "research_required", evidenceStrength: o?.evidenceQuality ?? "unrated",
      score: o ? scoreOpportunity(o).total : undefined, coveragePct: productGapReport(p).coveragePct,
    };
  });
  return (
    <>
      <PageIntro overline="Tool" title="Compare products." lede="Side-by-side comparison across the dimensions that decide whether a coconut business works. Levels are EXPERT JUDGMENT from the opportunity database; quantities carry evidence badges." breadcrumbs={[{ label: "Tools", href: "/tools" }, { label: "Compare" }]} />
      <Section surface="ivory"><Container><Suspense fallback={<p className="t-caption">Loading comparison…</p>}><CompareTool rows={rows} sources={sources} /></Suspense></Container></Section>
    </>
  );
}
