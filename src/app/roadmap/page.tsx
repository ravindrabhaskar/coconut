import Link from "next/link";
import { repo } from "@/services/repository";
import { Container, Section, SectionHeader, DisciplineRule, BulletList, Callout } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Roadmap — Discipline Rules, Phases 1–5 and Year 1–10 Strategic Scenario", description: "Discipline rules before capital; five phases from one product to an integrated coconut platform; a Year 1–10 strategic scenario across products, factories, farmers, employees, cities, countries, export share, technology, brand, capacity and revenue — never a guaranteed forecast.", path: "/roadmap" });

const PHASES = [
  { n: 1, title: "One product", why: "Prove one product with real customers before anything else; learn procurement, process, quality and economics on a single line.", capital: "Minimum viable: contract manufacture or micro unit; keep ≥30% of capital as working capital and reserve.", customers: "5–10 repeat B2B accounts or proven B2C repeat purchase.", operations: "Single shift, semi-automatic, one process line, outsourced QC where possible.", team: "Founder + supervisor + 5–15 workers + part-time accounts.", infra: "Leased shed near supply; no land purchase.", risks: "Utilisation, single-customer dependence, quality rejections.", validation: "Break-even utilisation < 60% achieved for 3 consecutive months (EXPERT JUDGMENT threshold)." },
  { n: 2, title: "Three products", why: "Add co-products whose raw material the first line already produces (flour with milk/VCO; fibre with cocopeat; charcoal with DC).", capital: "Incremental equipment only; by-product credit funds part of the addition.", customers: "Distinct customer segments per product to diversify demand.", operations: "Shared front end, separate back ends; QC lab in-house.", team: "Add production supervisor, QC chemist, sales executive.", infra: "Expand within the same site; utilities upgrade.", risks: "Management attention split; hygiene separation; cash strain.", validation: "Each product contribution-positive; combined utilisation of shared equipment > 70%." },
  { n: 3, title: "Five products", why: "Cover two material streams (e.g. kernel + shell, or husk + shell) to reduce commodity exposure.", capital: "Second process family (e.g. kilns or coir line) — significant CAPEX; consents.", customers: "B2B contracts with minimums; first export via merchant exporters.", operations: "Two shifts where demand supports; ERP and batch traceability.", team: "Plant manager, maintenance, procurement lead, compliance.", infra: "Purpose-built site or second site near supply; ETP; boiler.", risks: "Capital intensity, regulatory complexity, working capital.", validation: "Two streams profitable independently; export lots accepted without rejection." },
  { n: 4, title: "10+ products", why: "Full use of the nut; branded lines on top of ingredient volume.", capital: "Brand and distribution investment; automation in bottleneck steps.", customers: "B2B ingredient + B2C brand + direct export.", operations: "Multi-line, demand forecasting, predictive maintenance where justified.", team: "Functional heads (operations, sales, quality, finance); 50–150 people.", infra: "Integrated site with zoning; collection centres in supply belt.", risks: "Complexity, brand spend, distributor dependency.", validation: "Brand margin covers marketing; ingredient volume covers fixed cost." },
  { n: 5, title: "Integrated coconut platform", why: "Procurement → processing → multiple primary products → secondary products → by-products → B2B → B2C → exports, with residues recovered as energy and feed.", capital: "Platform-scale; likely external equity/debt; multi-site.", customers: "Institutional, retail, export, industrial across streams.", operations: "Zero-waste material flows; energy self-sufficiency; traceability end to end.", team: "Professional management; farmer-network organisation.", infra: "Primary processing near farms; finishing and distribution near markets (e.g. Hyderabad); port-adjacent export packing.", risks: "Execution, capital, market cycles across many products.", validation: "Earned by Phases 1–4 — not a starting point." },
];

const YEARS = ["Products", "Factories", "Farmers in network", "Employees", "Cities served", "Countries exported to", "Export share of revenue", "Technology stack", "Brand presence", "Processing capacity", "Revenue"];

export default async function RoadmapPage() {
  const research = await repo.research();
  const rules = research.find((r) => r.id === "rd-discipline-rules");
  const levels = research.find((r) => r.id === "rd-business-levels");
  return (
    <>
      <PageIntro overline="Build" title="Roadmap." lede="Discipline first, then phases, then a ten-year strategic scenario. Nothing here is a forecast." breadcrumbs={[{ label: "Business", href: "/business" }, { label: "Roadmap" }]} />
      <section className="surface-dark py-[var(--spacing-section)]"><Container className="relative z-[1]">
        <SectionHeader overline="Before capital" title={<span className="text-ivory-50">Discipline rules.</span>} />
        <div className="grid gap-5 md:grid-cols-2">{(rules?.detail ?? []).map((r) => <DisciplineRule key={r}>{r}</DisciplineRule>)}</div>
      </Container></section>
      <Section surface="ivory"><Container>
        <SectionHeader overline="Phases" title="From one product to an integrated platform." lede={levels?.summary} />
        <ol className="space-y-8">{PHASES.map((p) => <li key={p.n} className="grid gap-6 rounded-[var(--radius-media)] border hairline bg-cocos p-6 md:grid-cols-[120px_1fr] md:p-8"><div><p className="t-overline text-leaf-500">Phase {p.n}</p><p className="t-h3 mt-1">{p.title}</p></div><dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2 text-[0.88rem]">{([["Why", p.why], ["Capital", p.capital], ["Customers", p.customers], ["Operations", p.operations], ["Team", p.team], ["Infrastructure", p.infra], ["Risks", p.risks], ["Validation to exit phase", p.validation]] as [string, string][]).map(([k, v]) => <div key={k}><dt className="t-overline text-neutral-500">{k}</dt><dd className="mt-0.5">{v}</dd></div>)}</dl></li>)}</ol>
      </Container></Section>
      <Section surface="white"><Container>
        <SectionHeader overline="Strategic scenario — not a forecast" title="Year 1 to Year 10." lede="Dimensions are listed so an entrepreneur can write their own scenario with the platform's tools. The platform does not publish target numbers: any figure here would be an invented projection." />
        <div className="overflow-x-auto"><table className="table-data"><thead><tr><th>Dimension</th><th>Year 1</th><th>Year 3</th><th>Year 5</th><th>Year 10</th><th>How to derive</th></tr></thead><tbody>{YEARS.map((y) => <tr key={y}><td className="font-medium">{y}</td><td className="t-caption">Phase 1</td><td className="t-caption">Phase 2–3</td><td className="t-caption">Phase 3–4</td><td className="t-caption">Phase 4–5</td><td className="t-caption">{y === "Revenue" || y === "Processing capacity" ? "Financial Model × validated prices and utilisation" : y === "Products" ? "Product tree + Compare tool" : y === "Countries exported to" || y === "Export share of revenue" ? "Export explorer + buyer validation" : y === "Factories" ? "Factory Planner per product and site" : "Field validation and 90-day plan outputs"}</td></tr>)}</tbody></table></div>
        <div className="mt-8"><Callout tone="neutral" title="STRATEGIC SCENARIO">Write your Year 1–10 numbers in the <Link href="/tools/financial-model" className="underline">Financial Model</Link> with evidence labels. Then defend each one with a field interview.</Callout></div>
        <div className="mt-8"><BulletList items={["Level 1–5 business levels explain why each phase changes the margin logic — see the research record.", "Phase 5 is an outcome, not a plan."]} /></div>
      </Container></Section>
    </>
  );
}
