import { repo } from "@/services/repository";
import { Container, Section, SectionHeader, Prose, KeyValue } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { EvidenceBadge } from "@/components/ui/evidence";
import { EVIDENCE_LABEL } from "@/lib/format";
import type { EvidenceType } from "@/domain/types";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Methodology — How Evidence Is Labelled, Calculated and Verified", description: "The six evidence labels (verified fact, estimate, assumption, calculated, expert judgment, research required), what each quantity record stores, source standards, data freshness rules and the promotion path from research required to verified.", path: "/methodology" });

const FIELDS = ["value", "unit", "minimum", "maximum", "currency", "geography", "product / scale", "basis", "evidence type", "source(s)", "publication date", "research date", "last verified date", "notes", "calculation formula", "confidence level", "year (for statistics)"];

export default async function MethodologyPage() {
  const [research, sources] = await Promise.all([repo.research(), repo.sources()]);
  const doc = research.find((r) => r.id === "rd-evidence-methodology");
  const samples: EvidenceType[] = ["VERIFIED_FACT", "SOURCE_BACKED", "ESTIMATE", "ASSUMPTION", "CALCULATED", "EXPERT_JUDGMENT", "RESEARCH_REQUIRED"];
  return (
    <>
      <PageIntro overline="Insights" title="Methodology." lede="Every important number on this platform can be clicked to reveal where it came from, whether it is sourced or assumed, the formula used, when it was researched, its scope and its limitations." breadcrumbs={[{ label: "Methodology" }]} />
      <Section surface="ivory"><Container>
        <SectionHeader overline="Evidence labels" title="Six labels. Click any badge." />
        <div className="flex flex-wrap gap-3 mb-10">{samples.map((e) => <EvidenceBadge key={e} q={{ unit: "text", evidence: e, value: e === "RESEARCH_REQUIRED" ? undefined : 1, notes: `Example of a ${EVIDENCE_LABEL[e]} badge.`, researchedAt: "2026-09-14", ...(e === "VERIFIED_FACT" ? { sourceIds: ["src-codex-177"], lastVerifiedAt: "2026-09-14", verifiedBy: "Platform desk research — primary document read" } : e === "SOURCE_BACKED" ? { sourceIds: ["src-cdb"] } : {}), ...(e === "CALCULATED" ? { formula: "a × b ÷ c" } : {}) }} sources={sources} />)}</div>
        {doc && <Prose paragraphs={doc.detail} />}
        <div className="mt-14 grid gap-12 md:grid-cols-2">
          <div><p className="t-overline text-neutral-500 mb-3">Every numerical record supports</p><ul className="grid grid-cols-2 gap-1 t-data text-[0.8rem]">{FIELDS.map((f) => <li key={f}>· {f}</li>)}</ul></div>
          <KeyValue rows={[{ k: "Sources prioritised", v: "Government of India, Coconut Development Board, Ministry of Agriculture, APEDA, DGFT, FSSAI, MSME/Udyam, MoFPI, Coir Board, state governments, ICAR, agricultural universities, research institutions, peer-reviewed papers, official company reports, credible technical publications, machine supplier specifications (identified), credible industry databases." }, { k: "Not used as primary sources", v: "Random blogs, marketplaces, unattributed AI text." }, { k: "Data freshness", v: "Time-sensitive figures carry YEAR, UNIT, SOURCE, RESEARCH DATE and LAST VERIFIED DATE. Staleness rules by data kind (review / stale): prices 30 / 90 days; quotations 90 / 180; schemes 180 / 365; market 180 / 365; statistics 365 / 730; regulations 365 / 1,095; compositions 1,095 / 1,825. Every badge shows the freshness state." }, { k: "Primary documents on file", v: "Codex STAN 177, 240, 210; FSSAI Chapter 2.2 (v5, 01.08.2025) and Chapter 2.3 (v1, 01.09.2023); PIB PMFME backgrounder (Sep 2025) — stored under research/ and cited by section." }, { k: "Never invented", v: "Market size, machine price, land requirement, machine capacity, production yield, selling price, margin, factory cost, subsidy, export price, company revenue, customer volume, ROI, payback, productivity, energy, water — displayed as RESEARCH REQUIRED when unknown." }, { k: "Calculations", v: "Finance, mass balance, scoring and planning run in tested domain functions (src/lib/calc) with explicit units; UI never computes from display strings." }]} />
        </div>
      </Container></Section>
    </>
  );
}
