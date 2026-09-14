import Link from "next/link";
import { Container, Section, SectionHeader, Callout } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Circular Coconut Economy — Sustainability Tied to Operations and Economics", description: "Waste reduction, by-product recovery, biomass, renewable energy, water reuse, packaging, carbon impact, farmer welfare, sustainable sourcing and circular economy — each connected to a measurable operational or economic outcome, with evidence status.", path: "/sustainability" });

const THEMES: { title: string; outcome: string; how: string; evidence: string; link?: string }[] = [
  { title: "Waste reduction", outcome: "Lower disposal cost; new revenue lines", how: "Husk → fibre/pith; shell → charcoal/powder; residue → flour/feed; mature water → beverage/vinegar where validated.", evidence: "Recovery rates per stream are ESTIMATES in the mass-balance models; disposal costs are RESEARCH REQUIRED.", link: "/zero-waste" },
  { title: "By-product recovery", outcome: "Contribution margin per nut rises without more raw material", how: "Design plants so each line's by-product is another line's feedstock (integrated model).", evidence: "Integration economics presented as strategic analysis, not verified returns.", link: "/research/integrated-zero-waste-model" },
  { title: "Biomass & renewable energy", outcome: "Purchased fuel replaced by shell/husk; lower thermal cost per kg", how: "Biomass boilers for dryers; carbonisation heat recovery for kilns.", evidence: "Thermal energy per kg product is RESEARCH REQUIRED per dryer; shell calorific value citation pending.", link: "/technology" },
  { title: "Water reuse", outcome: "Lower water purchase and effluent volume; consent compliance", how: "Recycling in pith washing; CIP water recovery in milk lines; ETP sized to load.", evidence: "Water per kg pith washed is the largest single research gap in the husk chain.", link: "/products/cocopeat" },
  { title: "Packaging", outcome: "Lower material cost per kg where bulk packs replace retail packs; shelf-life protection avoids returns", how: "Match packaging to channel; nitrogen flush only where shelf-life economics justify it.", evidence: "Packaging cost per kg is RESEARCH REQUIRED per format.", link: "/tools/financial-model" },
  { title: "Carbon impact", outcome: "Potential carbon-credit revenue (biochar) — unvalidated in India", how: "Biochar from residues; avoided fossil fuel via biomass.", evidence: "Commercial validation of biochar demand and credits is RESEARCH REQUIRED; no claim is made.", link: "/products/biochar" },
  { title: "Farmer welfare & sustainable sourcing", outcome: "Supply security and quality consistency for the processor; price transparency for the farmer", how: "Direct/FPO procurement with grade-based pricing; digital weighment and prompt payment.", evidence: "Procurement models documented; price effects on farmers are RESEARCH REQUIRED via field interviews.", link: "/research/procurement-models" },
  { title: "Circular economy", outcome: "Multi-stream revenue from one raw material; reduced commodity exposure", how: "Sequenced integration: one anchor product, then co-products, then a third stream.", evidence: "Phase roadmap; strategic scenario, not forecast.", link: "/roadmap" },
];

export default function SustainabilityPage() {
  return (
    <>
      <PageIntro overline="Insights" title="Circular coconut economy." lede="Sustainability here means an operational or economic outcome you can measure — fuel saved, water recycled, disposal cost avoided, contribution per nut — not a slogan. Where evidence is missing, the page says so." breadcrumbs={[{ label: "Sustainability" }]} />
      <Section surface="ivory"><Container>
        <SectionHeader overline="Themes" title="Every theme tied to a number that can be measured." />
        <ul className="grid gap-6 md:grid-cols-2">{THEMES.map((t) => <li key={t.title} className="border-t hairline pt-4"><p className="t-h4">{t.title}</p><p className="mt-2 text-[0.92rem]"><span className="t-overline text-leaf-500 mr-2">Outcome</span>{t.outcome}</p><p className="mt-1 text-[0.9rem] text-neutral-700"><span className="t-overline text-neutral-500 mr-2">How</span>{t.how}</p><p className="mt-1 t-caption"><span className="t-overline mr-2">Evidence</span>{t.evidence}</p>{t.link && <Link href={t.link} className="t-caption underline mt-1 inline-block">Related →</Link>}</li>)}</ul>
        <div className="mt-12"><Callout tone="neutral" title="Why no headline figures">Carbon, water and waste figures depend on plant design, fuel and process. Publishing generic per-tonne numbers would be inventing data. Measure at pilot; promote to VERIFIED with a source and date.</Callout></div>
      </Container></Section>
    </>
  );
}
