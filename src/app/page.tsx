import Link from "next/link";
import { repo } from "@/services/repository";
import { productGapReport, componentGapReport, aggregateCoverage } from "@/services/gaps";
import { planFactory } from "@/lib/calc/factoryPlanner";
import { scoreLocation } from "@/lib/calc/scoring";
import { formatQuantity, EVIDENCE_LABEL } from "@/lib/format";
import { Container, Section, SectionHeader, LinkButton, Arrow, Overline, Badge } from "@/components/ui/primitives";
import { Journey } from "@/components/ui/hub";
import { AnatomyImage } from "@/components/viz/coconut/anatomy-image";
import { IndiaMapPreview } from "@/components/viz/india-map-preview";
import { EvidenceBadge } from "@/components/ui/evidence";
import type { CoconutLayer } from "@/components/viz/coconut/types";
import type { EvidenceType } from "@/domain/types";
import { pageMetadata } from "@/lib/seo/site";
import { num, inr } from "@/lib/format";

export const metadata = pageMetadata({ title: "COCONUT — The operating system for the coconut processing industry", description: "Explore products, processing technologies, machinery, factory economics, markets and verified industry data in one connected platform. Every important number carries its evidence.", path: "/" });

const JOURNEY = [
  { label: "Coconut", href: "/explore", note: "Anatomy, components, composition" },
  { label: "Component", href: "/explore", note: "Kernel · water · husk · fibre · pith · shell" },
  { label: "Product", href: "/products", note: "What each stream becomes" },
  { label: "Process", href: "/processing", note: "Unit operations, yields, QC" },
  { label: "Machine", href: "/machinery", note: "Capacity, power, footprint" },
  { label: "Factory", href: "/factory", note: "Layout, utilities, CAPEX/OPEX" },
  { label: "Market", href: "/markets", note: "Customers, export, prices" },
  { label: "Evidence", href: "/research", note: "Every number, traced" },
];

const AUDIENCES: [string, string, string][] = [
  ["Entrepreneurs", "Evaluate a factory opportunity end to end.", "/tools/opportunity-finder"],
  ["Processors", "Compare products, routes and machines.", "/tools/compare"],
  ["Factory owners", "Add a line: mass balance, layout, utilities.", "/factory"],
  ["Consultants", "Build scenarios clients can inspect.", "/tools"],
  ["Investors", "Read economics with the evidence behind each number.", "/business"],
  ["Researchers", "Trace data to primary sources and gaps.", "/research"],
  ["Machine suppliers", "See where equipment sits in each line.", "/machinery"],
  ["Government & industry", "Geography and statistics with year, unit and source.", "/locations"],
];

export default async function HomePage() {
  const [components, products, states, scaleModels, sources, countries, customers, research, schemes] = await Promise.all([
    repo.components(), repo.products(), repo.states(), repo.scaleModels(), repo.sources(), repo.countries(), repo.customerSegments(), repo.research(), repo.schemes(),
  ]);
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const layers: CoconutLayer[] = components.filter((c) => c.explodedOrder).map((c) => ({
    id: c.id, slug: c.slug, name: c.name.replace(/ \(.*\)/, ""), short: c.summary, colorToken: c.colorToken, order: c.explodedOrder!,
    products: [...c.primaryOutputProductIds, ...c.secondaryOutputProductIds].map((id) => byId[id]).filter(Boolean).slice(0, 6).map((p) => ({ name: p.name, href: `/products/${p.slug}` })),
    massShareLabel: c.massShare ? `≈ ${formatQuantity(c.massShare)} of nut mass (${c.massShare.evidence.toLowerCase().replace("_", " ")})` : undefined,
  }));

  // Section 5 — live factory demo from a real engineering scale model (VCO 200 l/day)
  const demoModel = scaleModels.find((m) => m.id === "fsm-vco-200lpd") ?? scaleModels[0];
  const demoProduct = products.find((p) => p.id === demoModel.productId)!;
  const demo = planFactory(demoModel, { automation: "semi_automatic", shifts: 1, location: "near_farms", targetMarket: "B2B" });

  // Section 8 — live credibility numbers
  const agg = aggregateCoverage([...products.map(productGapReport), ...components.map(componentGapReport)]);
  const legend: EvidenceType[] = ["VERIFIED_FACT", "SOURCE_BACKED", "ESTIMATE", "EXPERT_JUDGMENT", "RESEARCH_REQUIRED"];

  const mapStates = states.map((s) => ({ id: s.id, name: s.name, slug: s.slug, code: s.code, score: scoreLocation(s.dimensions).total }));
  const featured = ["prd-desiccated-coconut", "prd-virgin-coconut-oil", "prd-coconut-milk", "prd-cocopeat", "prd-activated-carbon", "prd-coconut-flour", "prd-coconut-water", "prd-shell-charcoal"].map((id) => byId[id]).filter(Boolean);

  return (
    <>
      {/* 1 — HERO */}
      <section className="surface-dark -mt-16 pt-24 pb-14 md:pt-28 md:pb-20">
        <Container className="relative z-[1]">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end">
            <div>
              <Overline className="text-leaf-300 mb-6">One coconut. An entire industry.</Overline>
              <h1 className="t-h1 text-ivory-50 max-w-[16ch]">The operating system for the coconut processing industry.</h1>
              <p className="t-body-lg mt-6 max-w-[54ch] text-ivory-100/75">Explore products, processing technologies, machinery, factory economics, markets and verified industry data in one connected platform — where every important number shows its evidence.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <LinkButton href="/explore" variant="light">Explore the coconut value chain <Arrow /></LinkButton>
                <LinkButton href="/factory" variant="outline-light">Plan a factory</LinkButton>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 text-ivory-50 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {[["Components", components.length], ["Products", products.length], ["Engineering models", scaleModels.length], ["Export markets", countries.filter((c) => c.productIds.length).length], ["Customer segments", customers.length], ["Sources on file", sources.length], ["Fields with evidence", `${agg.coveragePct}%`], ["Verified / sourced", `${agg.sourcedPct}%`]].map(([k, v]) => (
                <div key={String(k)} className="border-t border-ivory-100/20 pt-2"><dt className="t-overline text-ivory-100/50">{k}</dt><dd className="t-metric mt-1 text-2xl">{v}</dd></div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      {/* 2 — INTERACTIVE VALUE CHAIN */}
      <Section surface="ivory" padded={false} className="py-14">
        <Container>
          <SectionHeader overline="The chain" title="Coconut → component → product → process → machine → factory → market." lede="Every page on the platform sits somewhere on this chain and links to its neighbours through the knowledge graph." className="mb-8" />
          <Journey steps={JOURNEY} />
        </Container>
      </Section>

      {/* 3 — ANATOMY */}
      <Section surface="white">
        <Container>
          <SectionHeader overline="Anatomy" title="Six layers. Six material streams." lede="Select a layer to see what it is, how it is separated, and which products grow from it. The full interactive exploded model lives on the Explore page." />
          <AnatomyImage layers={layers} />
        </Container>
      </Section>

      {/* 4 — PRODUCT OPPORTUNITIES (compact table, no cards) */}
      <Section surface="white">
        <Container>
          <SectionHeader overline="Products" title="What the coconut becomes." lede="Raw material, indicative investment, yield, market and modelled factory scale — with evidence badges, not marketing numbers." className="mb-8" />
          <div className="overflow-x-auto">
            <table className="table-data">
              <thead><tr><th>Product</th><th>Raw material</th><th>Yield</th><th>Investment (CAPEX)</th><th>Market</th><th>Factory scale modelled</th></tr></thead>
              <tbody>
                {featured.map((p) => {
                  const y = p.yieldQuantities[0];
                  const m = scaleModels.find((x) => x.productId === p.id);
                  return (
                    <tr key={p.id}>
                      <td><Link href={`/products/${p.slug}`} className="font-medium underline-offset-4 hover:underline">{p.name}</Link></td>
                      <td className="t-caption">{p.sourceComponentIds.map((id) => components.find((c) => c.id === id)?.name.replace(/ \(.*\)/, "")).join(", ")}</td>
                      <td className="t-data whitespace-nowrap">{y ? <>{formatQuantity(y)} <EvidenceBadge q={y} sources={sources} compact /></> : "—"}</td>
                      <td><EvidenceBadge q={p.capex} sources={sources} /></td>
                      <td>{p.marketTags.map((t) => <Badge key={t} className="mr-1">{t}</Badge>)}</td>
                      <td className="t-caption">{m ? <Link href={`/build/${p.slug}`} className="underline underline-offset-4">{m.name.split("—")[1]?.trim() ?? m.name}</Link> : "research required"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-6"><LinkButton href="/products" variant="ghost">All {products.length} products <Arrow /></LinkButton></p>
        </Container>
      </Section>

      {/* 5 — FACTORY PLANNING DEMO (live from a scale model) */}
      <Section surface="dark">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <SectionHeader overline="Factory planning" title={<span className="text-ivory-50">Choose a product and a capacity. The platform derives the plant.</span>} lede={<span className="text-ivory-100/70">Below is a live run of the planner on the {demoProduct.name} engineering model — {formatQuantity(demoModel.capacity)}. Every figure is CALCULATED from labelled assumptions; costs stay RESEARCH REQUIRED until quotations exist.</span>} className="mb-6" />
              <LinkButton href={`/build/${demoProduct.slug}`} variant="light">Open this plan <Arrow /></LinkButton>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 text-ivory-50 sm:grid-cols-3">
              {[
                ["Raw material / day", demoModel.rawMaterialPerDay.value !== undefined ? `${num(demoModel.rawMaterialPerDay.value)} ${demoModel.rawMaterialPerDay.unit}` : "research required"],
                ["Machines in line", String(demoProduct.machineIds.length)],
                ["Connected load", demo.powerKw !== undefined ? `${num(demo.powerKw)} kW` : "research required"],
                ["Water", demo.waterKlPerDay !== undefined ? `${num(demo.waterKlPerDay, 1)} kL/day` : "research required"],
                ["Built-up area", demo.builtUpSqm !== undefined ? `${num(demo.builtUpSqm)} m²` : "research required"],
                ["Manpower", demo.manpower !== undefined ? `${demo.manpower} persons` : "research required"],
                ["Investment", demo.capexInr !== undefined ? inr(demo.capexInr) : "RESEARCH REQUIRED"],
                ["Operating cost", "your inputs → Financial model"],
                ["Output / revenue / profitability", "computed, 3 scenarios"],
              ].map(([k, v]) => <div key={k} className="border-t border-ivory-100/20 pt-2"><dt className="t-overline text-ivory-100/50">{k}</dt><dd className="t-metric mt-1 text-lg leading-tight">{v}</dd></div>)}
            </dl>
          </div>
        </Container>
      </Section>

      {/* 6 — INDIA SUPPLY INTELLIGENCE */}
      <Section surface="charcoal">
        <Container>
          <SectionHeader overline="Locations" title={<span className="text-ivory-50">India supply intelligence.</span>} lede={<span className="text-ivory-100/70">State production, processing hubs and ports, scored with transparent weights. State boundaries from DataMeet (MIT); district clusters are on the roadmap.</span>} />
          <div className="text-ivory-50"><IndiaMapPreview states={mapStates} /></div>
          <p className="mt-8"><LinkButton href="/india" variant="outline-light">Full location analysis <Arrow /></LinkButton></p>
        </Container>
      </Section>

      {/* 7 — MARKET & EXPORT INTELLIGENCE */}
      <Section surface="ivory">
        <Container>
          <SectionHeader overline="Markets" title="Products, markets, customers, exports, pricing, trade." lede="Demand modelled as customer segments with specifications; trade as export markets with requirements; prices only as dated, sourced records." className="mb-8" />
          <div className="grid gap-px overflow-hidden rounded-[var(--radius-media)] border hairline bg-neutral-200 sm:grid-cols-2 lg:grid-cols-4">
            {[["Customers", `${customers.length} segments`, "/customers"], ["Export markets", `${countries.filter((c) => c.productIds.length).length} markets with requirements`, "/export"], ["Price intelligence", "dated records only — register empty until captured", "/markets/prices"], ["Government schemes", `${schemes.length} programmes · ${schemes.filter((s) => s.subsidy.evidence === "VERIFIED_FACT").length} verified`, "/business/schemes"]].map(([t, b, h]) => (
              <Link key={h} href={h} className="group block bg-cocos p-6 hover:bg-ivory-100"><p className="t-h4 group-hover:underline underline-offset-4">{t}</p><p className="t-caption mt-2">{b}</p></Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* 8 — DATA CREDIBILITY */}
      <Section surface="white">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
            <div>
              <SectionHeader overline="Data credibility" title="Estimates are never presented as facts." lede={`${agg.totalFields} tracked fields today: ${agg.verified} verified from primary documents, ${agg.sourced} source-backed, ${agg.missing} still research required. The gap engine publishes what the platform does not yet know.`} className="mb-6" />
              <div className="flex flex-wrap gap-2">{legend.map((e) => <EvidenceBadge key={e} q={{ unit: "text", evidence: e, value: e === "RESEARCH_REQUIRED" ? undefined : 1, notes: `${EVIDENCE_LABEL[e]} — click any badge on the platform for its provenance.`, researchedAt: "2026-09-14", ...(e === "VERIFIED_FACT" ? { sourceIds: ["src-codex-177"], lastVerifiedAt: "2026-09-14", verifiedBy: "Platform desk research — primary document read" } : {}) }} sources={sources} />)}</div>
              <div className="mt-6 flex flex-wrap gap-3"><LinkButton href="/methodology" variant="ghost">Methodology</LinkButton><LinkButton href="/research/gaps" variant="ghost">Research gaps</LinkButton><LinkButton href="/sources" variant="ghost">Sources</LinkButton></div>
            </div>
            <div>
              <p className="t-overline text-neutral-500 mb-3">Verified this cycle from primary documents</p>
              <ul className="space-y-2 text-[0.92rem]">
                <li className="border-t hairline pt-2"><strong>Desiccated coconut</strong> — FSSAI 2.3.45 (moisture ≤3.0%) vs Codex STAN 177 (≤4%); acidity, oil, ash, sieve sizes.</li>
                <li className="border-t hairline pt-2"><strong>Virgin coconut oil</strong> — FSSAI 2.2.1(1A) v5 2025: moisture, FFA/acid value, PV, iodine, Polenske; Codex STAN 210 fatty acids.</li>
                <li className="border-t hairline pt-2"><strong>Coconut milk, cream, milk powder</strong> — FSSAI 2.3.51 / 2.3.63 and Codex STAN 240 composition tables.</li>
                <li className="border-t hairline pt-2"><strong>PMFME scheme</strong> — 35% credit-linked subsidy, ₹10 lakh ceiling (PIB, Sep 2025).</li>
              </ul>
              <p className="t-caption mt-3">{research.length} research records · primary PDFs stored in <code className="t-data">research/</code>.</p>
            </div>
          </div>
        </Container>
      </Section>

      {/* 9 — WHO IT IS FOR */}
      <Section surface="ivory">
        <Container>
          <SectionHeader overline="Who it is for" title="The same dataset, eight ways in." className="mb-8" />
          <ul className="grid gap-px overflow-hidden rounded-[var(--radius-media)] border hairline bg-neutral-200 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCES.map(([who, what, href]) => <li key={who} className="bg-cocos hover:bg-ivory-100"><Link href={href} className="group block p-5"><p className="t-h4 group-hover:underline underline-offset-4">{who}</p><p className="t-caption mt-1">{what}</p></Link></li>)}
          </ul>
        </Container>
      </Section>

      {/* 10 — FINAL CTA */}
      <section className="surface-dark py-[var(--spacing-section)]">
        <Container className="relative z-[1]">
          <p className="t-h1 max-w-[18ch] text-ivory-50">Start with a product. Or plan your factory.</p>
          <p className="mt-5 max-w-[52ch] text-ivory-100/70">Do not buy machinery until you validate the customer. Do not assume demand, margins, subsidies or exports. The platform is built to make that discipline easy.</p>
          <div className="mt-8 flex flex-wrap gap-3"><LinkButton href="/products" variant="light">Start with a product <Arrow /></LinkButton><LinkButton href="/factory" variant="outline-light">Plan your factory</LinkButton></div>
        </Container>
      </section>
    </>
  );
}
