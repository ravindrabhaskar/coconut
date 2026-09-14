import { repo } from "@/services/repository";
import { Container, Section, SectionHeader, Callout } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { IndiaAnalysis } from "@/components/features/india-analysis";
import { FreshnessChip, EvidenceBadge } from "@/components/ui/evidence";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "India Coconut Location Analysis — State Comparison & Scenarios", description: "Interactive India map comparing coconut-producing states on raw material, land, labour, electricity, water, road, rail, port, market access, processing ecosystem, suppliers, government support and export connectivity — with transparent weights and scenario comparison.", path: "/india" });

export default async function IndiaPage() {
  const [states, research, sources] = await Promise.all([repo.states(), repo.research(), repo.sources()]);
  const stats = research.find((r) => r.id === "rd-india-statistics");
  return (
    <>
      <PageIntro overline="Markets · India" title="Where should the factory be?" lede="Tamil Nadu, Kerala, Karnataka, Andhra Pradesh, Telangana, Odisha, Maharashtra, West Bengal — scored on thirteen dimensions with visible weights. Switch scenarios (near farms, near market, near Hyderabad, near port, hybrid) and watch the ranking change. No location is declared best." breadcrumbs={[{ label: "Locations", href: "/locations" }, { label: "India" }]} />
      <Section surface="ivory"><Container><IndiaAnalysis states={states} /></Container></Section>
      {stats && (
        <Section surface="white">
          <Container>
            <SectionHeader overline="Production statistics" title="Units and years, always." lede={stats.summary} />
            <div className="grid gap-8 md:grid-cols-2">
              <div className="prose-coconut">{stats.detail.map((d, i) => <p key={i}>{d}</p>)}</div>
              <div><p className="t-overline text-neutral-500 mb-3">Source records</p><ul className="space-y-3">{stats.keyFacts.map((f, i) => <li key={i} className="border-t hairline pt-3 text-[0.9rem]"><p>{f.fact}</p>{f.quantity && <p className="mt-1"><EvidenceBadge q={f.quantity} sources={sources} /> <span className="t-caption">{f.quantity.notes}</span></p>}<div className="mt-2"><FreshnessChip year={f.quantity?.year} unit={f.quantity?.unit} sourceName={f.sourceIds.map((id) => sources.find((s) => s.id === id)?.name.split(" ")[0]).join("/")} researchedAt={stats.researchDate} lastVerifiedAt={f.quantity?.lastVerifiedAt} /></div></li>)}</ul></div>
            </div>
            <div className="mt-8"><Callout tone="warning" title="Tonnes ≠ nuts">A figure in tonnes (FAOSTAT) cannot be compared with a figure in million nuts (CDB) without an explicit, variety-specific average nut mass. The platform stores both with their unit and never mixes them.</Callout></div>
          </Container>
        </Section>
      )}
    </>
  );
}
