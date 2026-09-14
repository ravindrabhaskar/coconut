import { repo } from "@/services/repository";
import { scoreOpportunity } from "@/lib/calc/scoring";
import { Container, Section, SectionHeader, Badge, DisciplineRule } from "@/components/ui/primitives";
import { HubGrid } from "@/components/ui/hub";
import { PageIntro } from "@/components/layout/chrome";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Business — Coconut Opportunities, Investment Ranges, Schemes & Roadmap", description: "The entrepreneur and investor hub: opportunity explorer with transparent scoring, small/medium/industrial scale, margin and ROI comparison, customer segments, raw-material requirements, risk factors, business-model comparison, government schemes and funding, validation plan.", path: "/business" });

export default async function BusinessHub() {
  const [opps, products, schemes, levels] = await Promise.all([repo.opportunities(), repo.products(), repo.schemes(), repo.businessLevels()]);
  const scored = opps.map((o) => ({ o, s: scoreOpportunity(o), p: products.find((p) => p.id === o.productId) })).sort((a, b) => b.s.total - a.s.total);
  const byIntensity = (k: "low" | "medium" | "high") => scored.filter((x) => x.o.capitalIntensity === k);
  return (
    <>
      <PageIntro overline="Business" title="Decide, then execute." lede="Opportunities scored transparently, sorted by capital intensity; schemes that are actually verified; and the discipline to validate before spending." breadcrumbs={[{ label: "Business" }]} />
      <Section surface="ivory">
        <Container>
          <SectionHeader overline="Opportunity explorer" title="By capital intensity." lede="Low = micro/contract routes; medium = small factory; high = industrial plant (kilns, aseptic lines). Scores are EXPERT JUDGMENT heuristics — open any opportunity to inspect criteria, weights and reasons." className="mb-8" />
          {(["low", "medium", "high"] as const).map((k) => (
            <div key={k} className="mb-10">
              <p className="t-overline text-neutral-500 mb-3">{k === "low" ? "Low capital — micro / contract" : k === "medium" ? "Medium capital — small factory" : "High capital — industrial plant"}</p>
              <HubGrid items={byIntensity(k).map(({ o, s, p }) => ({ title: o.name, href: `/opportunities/${o.slug}`, body: o.summary, badge: [<Badge key="s" tone="green">{s.total}/100</Badge>, <Badge key="m">{o.marginPotential} margin</Badge>, <Badge key="r">{o.riskLevel} risk</Badge>], meta: p ? `${p.name} · ${o.routeToMarket[0]}` : undefined }))} />
            </div>
          ))}
          <SectionHeader overline="Execute" title="From decision to plant." className="mt-6 mb-8" />
          <HubGrid columns={4} items={[
            { title: "Which business is right for me?", href: "/tools/opportunity-finder", body: "Ten inputs, explained shortlist." },
            { title: "Business builder", href: "/tools/business-builder", body: "Capital × market → entry route." },
            { title: "Government schemes", href: "/business/schemes", body: `${schemes.length} programmes; ${schemes.filter((s) => s.subsidy.evidence === "VERIFIED_FACT").length} with verified terms.` },
            { title: "Customer segments", href: "/customers", body: "Who buys, why, specs, terms." },
            { title: "Compare products", href: "/tools/compare", body: "Margin, ROI basis, risk, evidence." },
            { title: "Risk register", href: "/research#risks", body: "21 risks with mitigation." },
            { title: "90-day validation plan", href: "/90-day-plan", body: "Before any machine or land." },
            { title: "Roadmap & discipline rules", href: "/roadmap", body: "Phases 1–5; Year 1–10 scenario." },
          ]} />
          <div className="mt-14 grid gap-4 md:grid-cols-2">{levels.slice(0, 5).map((l) => <div key={l.id} className="border-t hairline pt-3"><p className="t-h4">{l.name}</p><p className="t-caption mt-1">{l.characteristics.join(" · ")}</p></div>)}</div>
        </Container>
      </Section>
      <section className="surface-dark py-14"><Container className="relative z-[1] grid gap-4 md:grid-cols-2"><DisciplineRule>Do not assume demand. Do not assume margins.</DisciplineRule><DisciplineRule>Do not assume subsidies. Do not assume exports.</DisciplineRule></Container></section>
    </>
  );
}
