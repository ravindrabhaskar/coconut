import Link from "next/link";
import { repo } from "@/services/repository";
import { aggregateCoverage, productGapReport, componentGapReport } from "@/services/gaps";
import { Container, Section, SectionHeader, Prose, Metric } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "About — An Operating System for the Coconut Industry", description: "What this platform is, who it serves, how it is built (database-driven knowledge graph, evidence-labelled data, tested calculators) and what it refuses to do.", path: "/about" });

export default async function AboutPage() {
  const [components, products, machines, processes, sources, research, opportunities] = await Promise.all([repo.components(), repo.products(), repo.machines(), repo.processes(), repo.sources(), repo.research(), repo.opportunities()]);
  const agg = aggregateCoverage([...products.map(productGapReport), ...components.map(componentGapReport)]);
  return (
    <>
      <PageIntro overline="About" title="Not a website about coconuts." lede="An operating system for understanding and building the coconut industry: one coconut, every component, every material stream, every product, every process, every machine, every factory, every customer, every market, every business model, every opportunity, every risk — from farm to global industry." breadcrumbs={[{ label: "About" }]} />
      <Section surface="ivory"><Container>
        <div className="grid gap-8 sm:grid-cols-3 lg:grid-cols-6 mb-16"><Metric label="Components" value={components.length} /><Metric label="Products" value={products.length} /><Metric label="Processes" value={processes.length} /><Metric label="Machines" value={machines.length} /><Metric label="Opportunities" value={opportunities.length} /><Metric label="Evidence coverage" value={`${agg.coveragePct}%`} sub={`${agg.verifiedPct}% verified · ${sources.length} sources · ${research.length} research records`} /></div>
        <SectionHeader overline="Who it serves" title="Student, farmer, entrepreneur, processor, factory owner, investor, researcher, buyer." lede="Three depths on every page — Understand, Business, Industrial — so a student and a plant engineer read the same entity without one overwhelming the other." />
        <div className="grid gap-12 md:grid-cols-2">
          <Prose paragraphs={["The platform is built around data. Components, products, processes, machines, customers, markets, regulations, risks, opportunities, sources and research are entities in a relational knowledge graph. A product added to the database automatically receives its page, its planning chain, its machinery links, its related-entity blocks, its search entry and its sitemap entry.", "Every quantity is a typed record with unit and evidence label. Missing data renders as RESEARCH REQUIRED. Finance, mass balance, scoring and factory planning run in tested domain functions, never in display code.", "The research-gap engine measures what the platform does not yet know, so accuracy compounds instead of hiding."]} />
          <Prose paragraphs={["What it refuses to do: invent market sizes, machine prices, yields, selling prices, margins, subsidies, export prices, company data, ROI or payback; imply that a high-priced product is high-margin; assume every product can run at every scale; use one factory model for every product; fabricate supplier or competitor names; present AI as magic; give investment advice.", "Philosophy: ONE COCONUT. AN ENTIRE INDUSTRY. Nothing from the coconut should be treated as waste if it can be economically valued.", "Architecture: Next.js App Router, TypeScript, Tailwind design tokens, layered SVG technical illustration with a swappable WebGL/GLB renderer, PostgreSQL schema via Drizzle with a typed static content fallback, tested calculation libraries, evidence-first UI."]} />
        </div>
        <p className="mt-12 t-caption">Read the <Link href="/methodology" className="underline">methodology</Link>, browse the <Link href="/sources" className="underline">sources</Link>, or inspect the <Link href="/research/gaps" className="underline">research gaps</Link>.</p>
      </Container></Section>
    </>
  );
}
