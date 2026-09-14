import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { repo } from "@/services/repository";
import { relatedFor, siblings } from "@/services/related";
import { productGapReport } from "@/services/gaps";
import { scoreOpportunity } from "@/lib/calc/scoring";
import { Container, BulletList, Prose, Badge, LinkButton, Arrow, Callout, KeyValue, ResearchRequiredInline } from "@/components/ui/primitives";
import { Breadcrumbs, PrevNext } from "@/components/layout/chrome";
import { TableOfContents, type TocItem } from "@/components/layout/toc";
import { Qty, EvidenceBadge } from "@/components/ui/evidence";
import { EntitySection, TwoCol, SwotGrid, QuantityTable, SourceList, RelatedBlocks, TagRow, MetricRow } from "@/components/entity/blocks";
import { MaterialSwatch, ProcessFlow } from "@/components/viz/illustrations";
import { EntityImage } from "@/components/ui/entity-image";
import { RiskHeatmap, ScoreBar } from "@/components/viz/charts";
import { formatQuantity } from "@/lib/format";
import { pageMetadata, breadcrumbJsonLd, articleJsonLd, faqJsonLd, JsonLd } from "@/lib/seo/site";
import { GraphNav } from "@/components/entity/graph-nav";

export async function generateStaticParams() { return (await repo.products()).map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const p = await repo.productBySlug(slug); if (!p) return {};
  return pageMetadata({ title: p.seoTitle, description: p.seoDescription, path: `/products/${p.slug}`, type: "article" });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await repo.productBySlug(slug);
  if (!p) notFound();
  const [components, sources, processes, machines, customers, countries, certs, regs, risks, products, scaleModels, opportunity, related, nav, levels, categories] = await Promise.all([
    repo.components(), repo.sources(), repo.processes(), repo.machines(), repo.customerSegments(), repo.countries(), repo.certifications(), repo.regulations(), repo.risks(), repo.products(),
    repo.scaleModelsForProduct(p.id), p.opportunityId ? repo.opportunityById(p.opportunityId) : Promise.resolve(null), relatedFor("product", p.id), siblings("product", p.slug), repo.businessLevels(), repo.categories(),
  ]);
  const comps = p.sourceComponentIds.map((id) => components.find((c) => c.id === id)).filter(Boolean) as typeof components;
  const procs = p.processIds.map((id) => processes.find((x) => x.id === id)).filter(Boolean) as typeof processes;
  const mchs = p.machineIds.map((id) => machines.find((x) => x.id === id)).filter(Boolean) as typeof machines;
  const custs = p.customers.map((c) => ({ link: c, seg: customers.find((s) => s.id === c.customerSegmentId) })).filter((x) => x.seg);
  const ctry = p.exportCountryIds.map((id) => countries.find((c) => c.id === id)).filter(Boolean) as typeof countries;
  const certList = p.certificationIds.map((id) => certs.find((c) => c.id === id)).filter(Boolean) as typeof certs;
  const regList = p.regulationIds.map((id) => regs.find((r) => r.id === id)).filter(Boolean) as typeof regs;
  const riskRows = p.risks.map((r) => ({ ...r, risk: risks.find((x) => x.id === r.riskId)! })).filter((r) => r.risk);
  const gap = productGapReport(p);
  const level = levels.find((l) => l.id === p.businessLevel);
  const category = categories.find((c) => c.id === p.categoryId);
  const score = opportunity ? scoreOpportunity(opportunity) : null;
  const intermediates = (p.intermediateProductIds ?? []).map((id) => products.find((x) => x.id === id)).filter(Boolean) as typeof products;
  const mainProcess = procs[0];

  const toc: TocItem[] = [
    { id: "metrics", label: "Key metrics" }, { id: "what", label: "What is it & why it exists" }, { id: "component", label: "Which part of the coconut" }, { id: "raw", label: "Raw material & procurement" },
    { id: "process", label: "Manufacturing process" }, { id: "io", label: "Inputs, outputs, by-products, yield" }, { id: "quality", label: "Quality parameters" },
    { id: "machinery", label: "Machinery", depth: "industrial" }, { id: "utilities", label: "Utilities, manpower, land, building", depth: "industrial" },
    { id: "packaging", label: "Packaging, storage, shelf life, logistics", depth: "business" }, { id: "customers", label: "Customers & use cases", depth: "business" },
    { id: "competition", label: "Competitors & pricing", depth: "business" }, { id: "economics", label: "Cost structure & unit economics", depth: "industrial" },
    { id: "regulation", label: "Regulation, certification, export", depth: "business" }, { id: "risks", label: "Risks", depth: "business" }, { id: "swot", label: "SWOT", depth: "business" },
    { id: "scale", label: "Scalability & technology", depth: "business" }, { id: "score", label: "Strategic assessment", depth: "business" }, { id: "gaps", label: "Research status" }, { id: "sources", label: "Sources" },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Products", path: "/products" }, ...(category ? [{ name: category.name, path: `/products/category/${category.slug}` }] : []), { name: p.name, path: `/products/${p.slug}` }])} />
      <JsonLd data={articleJsonLd({ headline: p.seoTitle, description: p.seoDescription, path: `/products/${p.slug}`, datePublished: p.createdAt, dateModified: p.updatedAt, about: comps.map((c) => c.name) })} />
      <JsonLd data={faqJsonLd(p.faqs ?? [])} />

      {/* PRODUCT HERO */}
      <section className="surface-dark pt-8 pb-14">
        <Container className="relative z-[1]">
          <Breadcrumbs items={[{ label: "Coconut", href: "/explore" }, ...(comps[0] ? [{ label: comps[0].name.replace(/ \(.*\)/, ""), href: `/explore/${comps[0].slug}` }] : []), ...intermediates.map((i) => ({ label: i.name, href: `/products/${i.slug}` })), { label: p.name }]} dark className="mb-8" />
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="flex flex-wrap gap-1.5">{p.marketTags.map((t) => <Badge key={t} tone="dark">{t}</Badge>)}{category && <Badge tone="dark">{category.name}</Badge>}<Badge tone="dark">Level {p.businessLevel.slice(1)}</Badge></div>
              <h1 className="t-h1 mt-5 text-ivory-50">{p.name}</h1>
              <p className="mt-3 t-caption text-ivory-100/60">{p.technicalName}</p>
              <p className="t-body-lg mt-6 max-w-[58ch] text-ivory-100/80">{p.summary}</p>
              <p className="mt-6 t-caption text-ivory-100/60">Source component: {comps.map((c, i) => <span key={c.id}>{i > 0 && ", "}<Link href={`/explore/${c.slug}`} className="underline underline-offset-4">{c.name.replace(/ \(.*\)/, "")}</Link></span>)}{intermediates.length > 0 && <> · via {intermediates.map((i, k) => <span key={i.id}>{k > 0 && ", "}<Link href={`/products/${i.slug}`} className="underline underline-offset-4">{i.name}</Link></span>)}</>}</p>
              <div className="mt-8 flex flex-wrap gap-3"><LinkButton href={`/build/${p.slug}`} variant="light">Plan this industry <Arrow /></LinkButton><LinkButton href={`/tools/compare?ids=${p.id}`} variant="outline-light">Compare</LinkButton></div>
            </div>
            <EntityImage kind="products" slug={p.slug} alt={`${p.name} — product photograph`} priority fallback={<MaterialSwatch productId={p.id} name={p.name} className="w-full" />} />
          </div>
        </Container>
      </section>

      <TwoCol aside={<><TableOfContents items={toc} /><div className="mt-8"><GraphNav type="product" id={p.id} compact /></div></>}>
        {/* KEY METRICS strip (template: Overview → Key metrics) */}
        <section id="metrics" className="border-t hairline py-8">
          <p className="t-overline text-neutral-500 mb-4">Key metrics — evidence-labelled</p>
          <MetricRow items={[{ label: "Yield", q: p.yieldQuantities[0] ?? p.shelfLife }, { label: "CAPEX", q: p.capex }, { label: "Manpower", q: p.manpower }, { label: "Shelf life", q: p.shelfLife }]} sources={sources} />
          <div className="mt-6 lg:hidden"><GraphNav type="product" id={p.id} compact /></div>
        </section>
        <EntitySection id="what" title="What is it, and why does it exist?">
          <Prose paragraphs={p.whatIsIt} />
          <p className="t-overline text-neutral-500 mt-8 mb-3">Why it exists</p>
          <Prose paragraphs={p.whyItExists} />
          {level && <div className="mt-8"><Callout title={level.name}><BulletList items={level.characteristics} /></Callout></div>}
        </EntitySection>

        <EntitySection id="component" title="Which part of the coconut is used?">
          <ul className="grid gap-4 sm:grid-cols-2">{comps.map((c) => <li key={c.id}><Link href={`/explore/${c.slug}`} className="block rounded-[var(--radius-control)] border hairline p-5 hover:border-coconut-800"><span className="t-h4 block">{c.name}</span><span className="t-caption mt-1 block">{c.summary}</span>{c.massShare && <span className="mt-3 block"><Qty q={c.massShare} sources={sources} label="Share of nut mass" /></span>}</Link></li>)}</ul>
          <p className="mt-4 t-caption">Coconut type: <strong>{p.rawMaterial.coconutType}</strong>. Tender and mature nuts are different economies — see <Link href="/research/tender-vs-mature" className="underline">Tender vs Mature</Link>.</p>
        </EntitySection>

        <EntitySection id="raw" title="Raw material — specification, quality, procurement">
          <Prose paragraphs={p.rawMaterial.description} />
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div><p className="t-overline text-neutral-500 mb-2">Specification</p><BulletList items={p.rawMaterial.specification} /></div>
            <div><p className="t-overline text-neutral-500 mb-2">Quality</p><BulletList items={p.rawMaterial.quality} /></div>
            <div><p className="t-overline text-neutral-500 mb-2">Procurement considerations</p><BulletList items={p.rawMaterial.procurement} /></div>
          </div>
        </EntitySection>

        <EntitySection id="process" title="Complete manufacturing process">
          <Prose paragraphs={p.processDescription} />
          {mainProcess ? (
            <div className="mt-8">
              <p className="t-overline text-neutral-500 mb-3">{mainProcess.name} — animated process flow</p>
              <ProcessFlow steps={mainProcess.steps.map((s) => ({ name: s.name, zone: s.hygieneZone, qc: s.qcPoint }))} />
              <details className="mt-6 rounded-[var(--radius-control)] border hairline p-4">
                <summary className="t-nav cursor-pointer tap">Step-by-step detail ({mainProcess.steps.length} steps)</summary>
                <ol className="mt-4 space-y-4">
                  {mainProcess.steps.map((s) => (
                    <li key={s.id} className="grid gap-2 border-t hairline pt-4 md:grid-cols-[3rem_1fr]">
                      <span className="t-data text-neutral-400">{String(s.order).padStart(2, "0")}</span>
                      <div>
                        <p className="font-semibold">{s.name} {s.hygieneZone && <Badge className="ml-2">{s.hygieneZone} zone</Badge>}</p>
                        <p className="mt-1 text-[0.92rem] text-neutral-700">{s.description.join(" ")}</p>
                        <dl className="mt-2 grid gap-x-6 gap-y-1 text-[0.82rem] sm:grid-cols-2"><div><dt className="t-caption inline">In: </dt><dd className="inline">{s.inputs.join(", ")}</dd></div><div><dt className="t-caption inline">Out: </dt><dd className="inline">{s.outputs.join(", ")}</dd></div>{s.losses && <div><dt className="t-caption inline">Loss: </dt><dd className="inline">{s.losses}</dd></div>}{s.qcPoint && <div><dt className="t-caption inline">QC: </dt><dd className="inline">{s.qcPoint}</dd></div>}</dl>
                        {s.machineIds.length > 0 && <p className="mt-2 text-[0.82rem]">Machines: {s.machineIds.map((id) => machines.find((m) => m.id === id)).filter(Boolean).map((m, i) => <span key={m!.id}>{i > 0 && ", "}<Link href={`/machinery/${m!.slug}`} className="underline underline-offset-4">{m!.name}</Link></span>)}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </details>
              <p className="mt-3 t-caption">Full process page: <Link href={`/processing/${mainProcess.slug}`} className="underline">{mainProcess.name}</Link>{procs.length > 1 && <> · also: {procs.slice(1).map((x, i) => <span key={x.id}>{i > 0 && ", "}<Link href={`/processing/${x.slug}`} className="underline">{x.name}</Link></span>)}</>}</p>
            </div>
          ) : <ResearchRequiredInline note="No process linked." />}
        </EntitySection>

        <EntitySection id="io" title="Inputs, outputs, by-products, process loss, yield and mass balance">
          <div className="grid gap-8 md:grid-cols-3">
            <div><p className="t-overline text-neutral-500 mb-2">Inputs</p><BulletList items={p.inputs} /></div>
            <div><p className="t-overline text-neutral-500 mb-2">Outputs</p><BulletList items={p.outputs} /></div>
            <div><p className="t-overline text-neutral-500 mb-2">By-products</p>{p.byProducts.length ? <ul className="space-y-2">{p.byProducts.map((b, i) => <li key={i} className="text-[0.92rem]">{b.productId ? <Link href={`/products/${products.find((x) => x.id === b.productId)?.slug ?? ""}`} className="font-medium underline underline-offset-4">{b.name}</Link> : <span className="font-medium">{b.name}</span>}<span className="t-caption block">{b.note}</span></li>)}</ul> : <ResearchRequiredInline />}</div>
          </div>
          <div className="mt-8"><QuantityTable rows={[...p.yieldQuantities.map((q, i) => ({ label: `Yield ${i + 1}`, q })), ...(mainProcess ? [{ label: "Process loss", q: mainProcess.processLoss }] : [])]} sources={sources} caption="Yield and loss" /></div>
          <p className="mt-4 t-caption">Run the <Link href={`/tools/mass-balance?product=${p.id}`} className="underline">interactive mass balance</Link> to convert nuts into product, by-product and loss masses with sensitivity testing.</p>
        </EntitySection>

        <EntitySection id="quality" title="Quality parameters and specifications customers care about">
          <QuantityTable rows={p.qualityParameters.map((x) => ({ label: `${x.parameter}${x.standard ? ` (${x.standard})` : ""}`, q: x.quantity, note: x.note ?? x.quantity.notes }))} sources={sources} />
        </EntitySection>

        <EntitySection id="machinery" title="Machinery" depth="industrial">
          {mchs.length ? (
            <ul className="grid gap-3 sm:grid-cols-2">{mchs.map((m) => <li key={m.id}><Link href={`/machinery/${m.slug}`} className="block rounded-[var(--radius-control)] border hairline p-4 hover:border-coconut-800"><span className="t-nav block">{m.name}</span><span className="t-caption block">{m.category} · {m.processStage} · {m.automation.replace("_", " ")}</span><span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.8rem]"><span>Capacity: {formatQuantity(m.capacityRange)}</span><span>Power: {formatQuantity(m.power)}</span><span>Cost: <EvidenceBadge q={m.cost} sources={sources} compact /></span></span></Link></li>)}</ul>
          ) : <ResearchRequiredInline />}
          <Callout tone="warning" title="Machine quotations">Machine costs on this platform are RESEARCH REQUIRED until a current supplier quotation is attached. A machine quote never represents total project cost — add civil, electrical, piping, commissioning, spares and working capital.</Callout>
        </EntitySection>

        <EntitySection id="utilities" title="Capacity, power, water, steam/fuel, manpower, land, building and areas" depth="industrial">
          <MetricRow items={[{ label: "Power", q: p.utilities.power }, { label: "Water", q: p.utilities.water }, ...(p.utilities.steam ? [{ label: "Steam", q: p.utilities.steam }] : []), ...(p.utilities.fuel ? [{ label: "Fuel / thermal", q: p.utilities.fuel }] : []), ...(p.utilities.compressedAir ? [{ label: "Compressed air", q: p.utilities.compressedAir }] : [])]} sources={sources} />
          {p.utilities.notes && <div className="mt-4"><BulletList items={p.utilities.notes} /></div>}
          <div className="mt-10"><MetricRow items={[{ label: "Manpower", q: p.manpower }, { label: "Land", q: p.land }, { label: "Building", q: p.building }, { label: "Shelf life", q: p.shelfLife }]} sources={sources} /></div>
          {p.areas.length > 0 && <div className="mt-8"><QuantityTable rows={p.areas.map((a) => ({ label: a.name, q: a.quantity }))} sources={sources} caption="Area breakdown (production, raw-material storage, WIP, packaging, finished goods, QC)" /></div>}
          {scaleModels.length > 0 && <p className="mt-4 t-caption">Engineering scale models: {scaleModels.map((m, i) => <span key={m.id}>{i > 0 && ", "}<Link href={`/tools/factory-planner?product=${p.id}&model=${m.id}`} className="underline">{m.name}</Link></span>)}.</p>}
        </EntitySection>

        <EntitySection id="packaging" title="Packaging formats, storage, shelf life and logistics" depth="business">
          <div className="overflow-x-auto"><table className="table-data"><thead><tr><th>Format</th><th>Typical use</th><th>Note</th></tr></thead><tbody>{p.packaging.map((f, i) => <tr key={i}><td className="font-medium">{f.format}</td><td>{f.typicalUse}</td><td className="t-caption">{f.note ?? f.sizes ?? ""}</td></tr>)}</tbody></table></div>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div><p className="t-overline text-neutral-500 mb-2">Storage</p><BulletList items={p.storage} /></div>
            <div><p className="t-overline text-neutral-500 mb-2">Shelf life</p><Qty q={p.shelfLife} sources={sources} big /></div>
            <div><p className="t-overline text-neutral-500 mb-2">Logistics</p><BulletList items={p.logistics} /></div>
          </div>
        </EntitySection>

        <EntitySection id="customers" title="Customers, why they buy, use cases" depth="business">
          <ul className="space-y-4">{custs.map(({ link, seg }) => <li key={seg!.id} className="grid gap-2 border-t hairline pt-4 md:grid-cols-[220px_1fr]"><Link href={`/customers/${seg!.slug}`} className="t-h4 underline-offset-4 hover:underline">{seg!.name}</Link><div><p className="text-[0.92rem]">{link.whyTheyBuy}</p><p className="t-caption mt-1">Specs they care about: {link.specsTheyCareAbout.join(" · ")}</p></div></li>)}</ul>
          <p className="t-overline text-neutral-500 mt-10 mb-2">Use cases</p><BulletList items={p.useCases} columns={2} />
        </EntitySection>

        <EntitySection id="competition" title="Competitors and pricing (where verified)" depth="business">
          <BulletList items={p.competitors} />
          <div className="mt-6"><QuantityTable rows={p.pricing.map((q, i) => ({ label: `Price indication ${i + 1}`, q }))} sources={sources} caption="Prices are never invented — capture current quotes with date, grade and channel." /></div>
        </EntitySection>

        <EntitySection id="economics" title="Cost structure, unit economics, margins, working capital, break-even, CAPEX, ROI, payback" depth="industrial">
          <p className="t-overline text-neutral-500 mb-2">Cost structure</p>
          <QuantityTable rows={p.costStructure.map((c) => ({ label: c.item, q: c.quantity, note: c.note ?? c.quantity.notes }))} sources={sources} />
          <div className="mt-8"><MetricRow items={[{ label: "CAPEX", q: p.capex }, { label: "Working capital", q: p.workingCapital }, ...(p.breakEven ? [{ label: "Break-even", q: p.breakEven }] : []), ...(p.roi ? [{ label: "ROI", q: p.roi }] : []), ...(p.payback ? [{ label: "Payback", q: p.payback }] : [])]} sources={sources} /></div>
          {p.unitEconomics.length > 0 && <div className="mt-6"><QuantityTable rows={p.unitEconomics.map((q, i) => ({ label: `Unit economics ${i + 1}`, q }))} sources={sources} /></div>}
          <Callout tone="green" title="Compute it with your numbers">Gross margin, contribution, operating and net margin, working-capital cycle, break-even, ROI, ROCE and payback are calculated — not asserted — in the <Link href={`/tools/financial-model?product=${p.id}`} className="underline">Financial Model</Link> with three scenarios. High selling price is not high profitability: see the price-to-economics waterfall there.</Callout>
        </EntitySection>

        <EntitySection id="regulation" title="Regulatory requirements, certifications, export requirements and markets" depth="business">
          <div className="grid gap-8 md:grid-cols-2">
            <div><p className="t-overline text-neutral-500 mb-2">Regulations</p><ul className="space-y-2">{regList.map((r) => <li key={r.id} className="text-[0.92rem]"><span className="font-medium">{r.name}</span> <span className="t-caption">— {r.authority}</span><span className="t-caption block">{r.requirements[0]}</span></li>)}</ul></div>
            <div><p className="t-overline text-neutral-500 mb-2">Certifications</p><ul className="space-y-2">{certList.map((c) => <li key={c.id} className="text-[0.92rem]"><span className="font-medium">{c.name}</span> <span className="t-caption">— {c.purpose}</span><span className="t-caption block">Cost: <EvidenceBadge q={c.costIndication} sources={sources} compact /></span></li>)}</ul></div>
          </div>
          <p className="t-overline text-neutral-500 mt-8 mb-2">Export requirements</p><BulletList items={p.exportRequirements} columns={2} />
          <p className="t-overline text-neutral-500 mt-8 mb-2">Export markets</p>
          {ctry.length ? <TagRow items={ctry.map((c) => ({ label: c.name, href: `/export/${c.slug}`, tone: "green" as const }))} /> : <ResearchRequiredInline />}
          {p.hsCode && <p className="mt-4 t-caption">HS code: {p.hsCode.notes} <EvidenceBadge q={p.hsCode} sources={sources} compact /></p>}
        </EntitySection>

        <EntitySection id="risks" title="Risks — probability, impact, mitigation, early warning, backup" depth="business">
          <RiskHeatmap risks={riskRows.map((r) => ({ id: r.riskId, name: r.risk.name, probability: r.probability, impact: r.impact }))} />
          <div className="mt-8 overflow-x-auto"><table className="table-data"><thead><tr><th>Risk</th><th>P×I</th><th>Mitigation</th><th>Early warning</th><th>Backup plan</th></tr></thead><tbody>{riskRows.map((r) => <tr key={r.riskId}><td className="font-medium">{r.risk.name}<span className="t-caption block">{r.risk.category.replace("_", " ")}</span></td><td className="t-data">{r.probability}×{r.impact}={r.probability * r.impact}</td><td className="text-[0.85rem]">{r.mitigation}</td><td className="text-[0.85rem]">{r.earlyWarning || "—"}</td><td className="text-[0.85rem]">{r.backupPlan || "—"}</td></tr>)}</tbody></table></div>
        </EntitySection>

        <EntitySection id="swot" title="SWOT" depth="business"><SwotGrid swot={p.swot} /></EntitySection>

        <EntitySection id="scale" title="Scalability, scale options, technology and future potential" depth="business">
          <BulletList items={p.scalability} />
          <p className="t-overline text-neutral-500 mt-8 mb-3">Scale options — only those with engineering assumptions are enabled</p>
          <ul className="flex flex-wrap gap-2">{p.scaleOptions.map((s) => s.supported ? <li key={s.id}><Link href={`/build/${p.slug}?scale=${s.id}`} className="t-nav rounded-full border border-leaf-500 bg-leaf-200/40 px-3.5 py-1.5 tap">{s.label} ✓</Link></li> : <li key={s.id}><span className="t-nav rounded-full border border-dashed border-neutral-400 px-3.5 py-1.5 text-neutral-500" title={s.note}>{s.label} — {s.note ? "research required" : "not supported"}</span></li>)}</ul>
          <div className="mt-8 grid gap-8 md:grid-cols-2"><div><p className="t-overline text-neutral-500 mb-2">Technology</p><BulletList items={p.technology} /></div><div><p className="t-overline text-neutral-500 mb-2">Future potential</p><BulletList items={p.futurePotential} /></div></div>
        </EntitySection>

        <EntitySection id="score" title="Strategic assessment (0–100)" depth="business">
          {opportunity && score ? (
            <div>
              <div className="flex flex-wrap items-end gap-6"><div><p className="t-overline text-neutral-500">Strategic score</p><p className="t-metric text-5xl">{score.total}</p></div><div className="flex-1 min-w-[240px]"><ScoreBar value={score.total} label="Strategic score" /><p className="t-caption mt-2">Evidence coverage of criteria: {Math.round(score.evidenceCoverage * 100)}% · Transparent weighted heuristic — screening, not truth.</p></div></div>
              <p className="mt-4"><Link href={`/opportunities/${opportunity.slug}`} className="t-nav underline underline-offset-4">Inspect every criterion, weight, reason and assumption →</Link></p>
            </div>
          ) : <ResearchRequiredInline note="No opportunity record linked yet." />}
        </EntitySection>

        <EntitySection id="gaps" title="Research status">
          <div className="flex flex-wrap items-center gap-3 mb-5"><Badge tone={gap.contentStatus === "DATA_VERIFIED" ? "green" : gap.contentStatus === "RESEARCH_REQUIRED" ? "danger" : "fibre"}>{gap.contentStatus.replace(/_/g, " ")}</Badge><span className="t-data">{gap.coveragePct}% evidence coverage · {gap.verifiedPct}% verified · {gap.missingCount} fields research required</span></div>
          <KeyValue rows={gap.fields.map((f) => ({ k: f.field, v: <span className="inline-flex flex-wrap items-center gap-2"><Badge tone={f.status === "VERIFIED" ? "green" : f.status === "RESEARCH_REQUIRED" ? "neutral" : "fibre"}>{f.status.replace("_", " ")}</Badge>{f.needs && f.needs !== "none" && <span className="t-caption">needs: {f.needs.replace("_", " ")}</span>}</span> }))} />
        </EntitySection>

        <EntitySection id="sources" title="Sources"><SourceList ids={p.sourceIds} sources={sources} /></EntitySection>

        <RelatedBlocks groups={related} />
        <div className="py-10"><PrevNext prev={nav.prev} next={nav.next} label="product" /></div>

        {/* PLAN THIS INDUSTRY */}
        <section className="surface-dark rounded-[var(--radius-media)] p-8 md:p-12 mb-16">
          <div className="relative z-[1]">
            <p className="t-overline text-leaf-300">Next step</p>
            <h2 className="t-h2 mt-2 text-ivory-50">Plan this industry.</h2>
            <p className="mt-4 max-w-[56ch] text-ivory-100/75">Product → raw material → capacity → process → mass balance → land → building → machinery → manpower → utilities → storage → QC → packaging → CAPEX → working capital → operating cost → customers → revenue → break-even → risks → scale.</p>
            <div className="mt-8"><LinkButton href={`/build/${p.slug}`} variant="light">Build {p.name} <Arrow /></LinkButton></div>
          </div>
        </section>
      </TwoCol>
    </>
  );
}
