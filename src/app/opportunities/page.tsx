import Link from "next/link";
import { repo } from "@/services/repository";
import { scoreOpportunity } from "@/lib/calc/scoring";
import { Container, Section, Badge, LinkButton, Arrow, Callout } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { ScoreBar } from "@/components/viz/charts";
import { EvidenceBadge } from "@/components/ui/evidence";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Coconut Business Opportunities — Database & Strategic Assessment", description: "Opportunity database across food, beverage, horticulture, coir, shell, industrial, export and waste-to-value, each with a transparent 0–100 strategic assessment across fifteen weighted criteria and an auto-generated business model canvas.", path: "/opportunities" });

export default async function OpportunitiesPage() {
  const [opps, products, industries, sources] = await Promise.all([repo.opportunities(), repo.products(), repo.industries(), repo.sources()]);
  const scored = opps.map((o) => ({ o, s: scoreOpportunity(o), p: products.find((p) => p.id === o.productId), ind: industries.find((i) => i.id === o.industryId) })).sort((a, b) => b.s.total - a.s.total);
  return (
    <>
      <PageIntro overline="Business opportunities" title="Opportunity database." lede="Each opportunity records business model, route to market, capital and working-capital intensity, margin, demand, competition, difficulty, shelf life, scalability, export and brand potential, regulation, risk, defensibility and evidence quality — and a Strategic Assessment you can inspect criterion by criterion." breadcrumbs={[{ label: "Business", href: "/business" }, { label: "Opportunities" }]}>
        <div className="mt-8 flex flex-wrap gap-3"><LinkButton href="/tools/opportunity-finder" variant="light">Which coconut business is right for me? <Arrow /></LinkButton><LinkButton href="/tools/business-builder" variant="outline-light">Build your coconut business</LinkButton></div>
      </PageIntro>
      <Section surface="ivory">
        <Container>
          <Callout tone="neutral" title="Strategic assessment">Score = Σ (criterion score ÷ 10 × weight) × 100, weights normalised. Scores are EXPERT JUDGMENT unless a criterion cites evidence. This is a screening heuristic — not objective truth and not investment advice.</Callout>
          <ol className="mt-10 space-y-4">
            {scored.map(({ o, s, p, ind }) => (
              <li key={o.id} className="grid gap-4 rounded-[var(--radius-media)] border hairline bg-cocos p-6 md:grid-cols-[1fr_260px]">
                <div>
                  <div className="flex flex-wrap gap-1.5"><Badge tone="green">{ind?.name}</Badge><Badge>{o.capitalIntensity} capital</Badge><Badge>{o.workingCapitalIntensity} working capital</Badge><Badge>{o.difficulty.replace("_", " ")} difficulty</Badge><Badge tone={o.evidenceQuality === "weak" ? "amber" : "neutral"}>{o.evidenceQuality} evidence</Badge></div>
                  <Link href={`/opportunities/${o.slug}`} className="t-h3 mt-3 block underline-offset-4 hover:underline">{o.name}</Link>
                  <p className="mt-2 text-[0.92rem] text-neutral-700">{o.summary}</p>
                  <p className="t-caption mt-2">Business model: {o.businessModel} · Route: {o.routeToMarket.join(" / ")}{p && <> · <Link href={`/products/${p.slug}`} className="underline">{p.name}</Link></>}</p>
                  <p className="t-caption mt-1">CAPEX: <EvidenceBadge q={o.capex} sources={sources} compact /> · Working capital: <EvidenceBadge q={o.workingCapital} sources={sources} compact /></p>
                </div>
                <div><p className="t-overline text-neutral-500">Strategic assessment</p><p className="t-metric text-4xl mt-1">{s.total}<span className="t-caption text-base">/100</span></p><ScoreBar value={s.total} label={`${o.name} score`} /><p className="t-caption mt-2">Criteria evidence coverage {Math.round(s.evidenceCoverage * 100)}%</p></div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>
    </>
  );
}
