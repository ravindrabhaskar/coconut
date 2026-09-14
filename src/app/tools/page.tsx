import { Container, Section, SectionHeader, Callout } from "@/components/ui/primitives";
import { HubGrid } from "@/components/ui/hub";
import { PageIntro } from "@/components/layout/chrome";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Tools — Coconut Factory Planning, Mass Balance, Financial Model, Opportunity Finder", description: "One hub for every calculator: factory planner, mass balance, financial model, land & building, manpower, opportunity finder, business builder and product comparison. All tools share one Scenario so you never retype assumptions.", path: "/tools" });

export default function ToolsHub() {
  return (
    <>
      <PageIntro overline="Tools" title="Every calculator, one scenario." lede="The tools read and write the same Scenario (product, capacity, prices, yields, location) so a mass balance flows into the factory planner and then into the financial model. Every output carries an evidence badge." breadcrumbs={[{ label: "Tools" }]} />
      <Section surface="ivory">
        <Container>
          <SectionHeader overline="Plan a factory" title="Engineering and economics." className="mb-8" />
          <HubGrid items={[
            { title: "Mass balance", href: "/tools/mass-balance", body: "Nuts or kg in → husk, shell, kernel, water → products, by-products, losses. Sensitivity and economics overlay.", meta: "Writes scenario.product · capacity · yield" },
            { title: "Factory planner", href: "/tools/factory-planner", body: "Product-specific zones, machines, utilities, manpower, conceptual blueprint with material flow and hygiene overlays.", meta: "Reads scenario · writes CAPEX basis" },
            { title: "Land & building", href: "/tools/land-calculator", body: "Site, built-up, production floor, warehouse, utilities and circulation areas with the derivation shown.", meta: "Same engine as the planner" },
            { title: "Manpower", href: "/tools/manpower", body: "Roles, skills and headcount per scale model with shift and automation factors.", meta: "Per engineering model" },
            { title: "Financial model", href: "/tools/financial-model", body: "Revenue to payback in three scenarios; every input labelled; formulas shown; price→economics waterfall.", meta: "Reads scenario prices & costs" },
          ]} />
          <SectionHeader overline="Decide" title="Which business, which route." className="mt-16 mb-8" />
          <HubGrid items={[
            { title: "Opportunity finder", href: "/tools/opportunity-finder", body: "Ten inputs → an explained shortlist with reasons and cautions. Screening, not advice.", meta: "Strategic screening tool" },
            { title: "Business builder", href: "/tools/business-builder", body: "Capital × market × product → indicative entry route, validation stage, capital allocation, risks, next milestone.", meta: "No guaranteed returns" },
            { title: "Location finder", href: "/tools/location-finder", body: "Pick a product or a need profile; states re-rank on transparent weights with strengths and weaknesses explained.", meta: "Real state boundaries · EXPERT JUDGMENT dims" },
            { title: "Compare products", href: "/tools/compare", body: "2–4 products on raw material, complexity, CAPEX, working capital, margin, demand, export, regulation, risk, evidence.", meta: "Evidence badges per cell" },
          ]} />
          <div className="mt-12"><Callout tone="neutral" title="Not yet built (roadmap)">Machine comparison by capacity, freight calculator, export opportunity finder, scheme finder (see Business → Government schemes for the verified scheme register), factory comparison and scenario sharing are scheduled in docs/07-audit-and-ia-v2.md.</Callout></div>
        </Container>
      </Section>
    </>
  );
}
