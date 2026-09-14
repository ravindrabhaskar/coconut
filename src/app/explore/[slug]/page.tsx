import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { repo } from "@/services/repository";
import { relatedFor, siblings } from "@/services/related";
import { componentGapReport } from "@/services/gaps";
import { Container, BulletList, Prose, Badge, LinkButton, Arrow, Callout } from "@/components/ui/primitives";
import { Breadcrumbs, PrevNext } from "@/components/layout/chrome";
import { TableOfContents, type TocItem } from "@/components/layout/toc";
import { Qty } from "@/components/ui/evidence";
import { EntitySection, TwoCol, SwotGrid, QuantityTable, SourceList, RelatedBlocks, TagRow } from "@/components/entity/blocks";
import { ComponentCutaway } from "@/components/viz/illustrations";
import { EntityImage } from "@/components/ui/entity-image";
import { ProductTree, type TreeNode } from "@/components/viz/product-tree";
import { pageMetadata, breadcrumbJsonLd, articleJsonLd, JsonLd } from "@/lib/seo/site";
import { GraphNav } from "@/components/entity/graph-nav";

export async function generateStaticParams() {
  return (await repo.components()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await repo.componentBySlug(slug);
  if (!c) return {};
  return pageMetadata({ title: c.seoTitle, description: c.seoDescription, path: `/explore/${c.slug}`, type: "article" });
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await repo.componentBySlug(slug);
  if (!c) notFound();
  const [products, sources, processes, machines, components, related, nav] = await Promise.all([
    repo.products(), repo.sources(), repo.processes(), repo.machines(), repo.components(), relatedFor("component", c.id), siblings("component", c.slug),
  ]);
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const outputs = [...c.primaryOutputProductIds, ...c.secondaryOutputProductIds].map((id) => byId[id]).filter(Boolean);
  const children = components.filter((x) => x.parentComponentId === c.id);
  const parent = c.parentComponentId ? components.find((x) => x.id === c.parentComponentId) : null;
  const procs = processes.filter((p) => p.inputComponentIds.includes(c.id) || outputs.some((o) => p.productIds.includes(o.id)));
  const machineIds = new Set(outputs.flatMap((o) => o.machineIds));
  const mchs = machines.filter((m) => machineIds.has(m.id));
  const gap = componentGapReport(c);
  const customers = new Set(outputs.flatMap((o) => o.customers.map((x) => x.customerSegmentId)));
  const countries = new Set(outputs.flatMap((o) => o.exportCountryIds));
  const certs = new Set(outputs.flatMap((o) => o.certificationIds));
  const regs = new Set(outputs.flatMap((o) => o.regulationIds));
  const [customerSegments, countryList, certList, regList] = await Promise.all([repo.customerSegments(), repo.countries(), repo.certifications(), repo.regulations()]);

  const tree: TreeNode = {
    id: c.id, name: c.name.replace(/ \(.*\)/, ""),
    children: [
      ...children.map((s) => ({ id: s.id, name: s.name, href: `/explore/${s.slug}`, children: [...s.primaryOutputProductIds, ...s.secondaryOutputProductIds].map((id) => byId[id]).filter(Boolean).map((p) => ({ id: p.id, name: p.name, href: `/products/${p.slug}`, children: products.filter((d) => d.intermediateProductIds?.includes(p.id)).map((d) => ({ id: d.id, name: d.name, href: `/products/${d.slug}` })) })) })),
      ...outputs.filter((o) => !children.some((s) => [...s.primaryOutputProductIds, ...s.secondaryOutputProductIds].includes(o.id))).map((p) => ({ id: p.id, name: p.name, href: `/products/${p.slug}`, children: products.filter((d) => d.intermediateProductIds?.includes(p.id)).map((d) => ({ id: d.id, name: d.name, href: `/products/${d.slug}` })) })),
    ],
  };
  if (!tree.children?.length) tree.children = [{ id: "rr", name: "No commercially validated product yet", note: "research required" }];

  const toc: TocItem[] = [
    { id: "what", label: "What is it?" }, { id: "structure", label: "Biological structure" }, { id: "material", label: "Material characteristics" }, { id: "composition", label: "Composition" },
    { id: "separation", label: "How it is separated" }, { id: "tree", label: "Product tree" }, { id: "applications", label: "Applications & customers", depth: "business" },
    { id: "demand", label: "Demand, markets, competition", depth: "business" }, { id: "quality", label: "Quality, storage, transport", depth: "business" },
    { id: "industrial", label: "Processing, machinery, factory", depth: "industrial" }, { id: "economics", label: "Economics", depth: "industrial" },
    { id: "swot", label: "SWOT & who should enter", depth: "business" }, { id: "future", label: "Technology & future" }, { id: "gaps", label: "Research gaps" }, { id: "sources", label: "Sources" },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Explore", path: "/explore" }, { name: c.name, path: `/explore/${c.slug}` }])} />
      <JsonLd data={articleJsonLd({ headline: c.seoTitle, description: c.seoDescription, path: `/explore/${c.slug}`, datePublished: c.createdAt, dateModified: c.updatedAt, about: outputs.map((o) => o.name) })} />
      {/* HERO */}
      <section className="surface-dark pt-8 pb-14">
        <Container className="relative z-[1]">
          <Breadcrumbs items={[{ label: "Explore", href: "/explore" }, ...(parent ? [{ label: parent.name.replace(/ \(.*\)/, ""), href: `/explore/${parent.slug}` }] : []), { label: c.name.replace(/ \(.*\)/, "") }]} dark className="mb-8" />
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="t-overline text-leaf-300 mb-4">{c.origin === "fruit" ? "Fruit component" : "Palm resource"}{c.explodedOrder ? ` · layer ${String(c.explodedOrder).padStart(2, "0")}` : ""}</p>
              <h1 className="t-h1 text-ivory-50">{c.name}</h1>
              <p className="mt-3 t-caption italic text-ivory-100/60">{c.scientificName} · also: {c.commonNames.join(", ")}</p>
              <p className="t-body-lg mt-6 max-w-[58ch] text-ivory-100/80">{c.summary}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {c.massShare && <Qty q={c.massShare} sources={sources} label="Share of nut mass" className="text-ivory-50" />}
                <Badge tone="dark">Complexity: {c.processingComplexity.replace("_", " ")}</Badge>
                <Badge tone="dark">{gap.contentStatus.replace(/_/g, " ")} · {gap.coveragePct}% coverage</Badge>
              </div>
              <p className="mt-4 t-caption text-ivory-100/60">Position: {c.position}</p>
            </div>
            <div className="text-ivory-50"><EntityImage kind="components" slug={c.slug} alt={`${c.name} — photograph`} priority className="mx-auto max-w-[520px]" fallback={<ComponentCutaway highlightId={c.parentComponentId ?? c.id} className="mx-auto w-full max-w-[440px]" />} /></div>
          </div>
        </Container>
      </section>

      <TwoCol aside={<><TableOfContents items={toc} /><div className="mt-8"><GraphNav type="component" id={c.id} compact /></div></>}>
        <div className="pt-8 lg:hidden"><GraphNav type="component" id={c.id} compact /></div>
        <EntitySection id="what" title="What is it, and where does it come from?">
          <Prose paragraphs={[c.summary, `Position in the coconut: ${c.position}`, ...c.processingFlow.map((f) => `Flow: ${f}`)]} />
        </EntitySection>
        <EntitySection id="structure" title="Biological structure"><Prose paragraphs={c.biologicalStructure} /></EntitySection>
        <EntitySection id="material" title="Material characteristics"><BulletList items={c.materialCharacteristics} /></EntitySection>
        <EntitySection id="composition" title="Composition (where verified)">
          <QuantityTable rows={c.composition.map((x) => ({ label: x.parameter, q: x.quantity }))} sources={sources} caption="Values carry evidence labels; ranges are estimates unless marked verified." />
        </EntitySection>
        <EntitySection id="separation" title="How it is separated and processed">
          <BulletList items={c.separationMethod} />
          {procs.length > 0 && (
            <div className="mt-8">
              <p className="t-overline text-neutral-500 mb-3">Processes using this component</p>
              <ul className="flex flex-wrap gap-2">{procs.map((p) => <li key={p.id}><Link href={`/processing/${p.slug}`} className="t-nav rounded-full border border-neutral-300 px-3 py-1.5 hover:border-coconut-800 tap">{p.name}</Link></li>)}</ul>
            </div>
          )}
        </EntitySection>
        <EntitySection id="tree" title="Product tree" overline="Primary and secondary outputs">
          <ProductTree root={tree} />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div><p className="t-overline text-neutral-500 mb-2">Primary outputs</p><TagRow items={c.primaryOutputProductIds.map((id) => byId[id]).filter(Boolean).map((p) => ({ label: p.name, href: `/products/${p.slug}`, tone: "green" as const }))} /></div>
            <div><p className="t-overline text-neutral-500 mb-2">Secondary outputs</p><TagRow items={c.secondaryOutputProductIds.map((id) => byId[id]).filter(Boolean).map((p) => ({ label: p.name, href: `/products/${p.slug}`, tone: "fibre" as const }))} /></div>
          </div>
        </EntitySection>
        <EntitySection id="applications" title="Applications and customers" depth="business">
          <div className="grid gap-8 md:grid-cols-2">
            <div><p className="t-overline text-neutral-500 mb-2">Applications</p><BulletList items={c.applications} /></div>
            <div><p className="t-overline text-neutral-500 mb-2">Customer types</p><BulletList items={c.customerTypes} />
              {customers.size > 0 && <div className="mt-4"><TagRow items={customerSegments.filter((s) => customers.has(s.id)).map((s) => ({ label: s.name, href: `/customers/${s.slug}` }))} /></div>}
            </div>
          </div>
          <p className="t-overline text-neutral-500 mt-8 mb-2">Why customers buy — demand drivers</p><BulletList items={c.demandDrivers} columns={2} />
        </EntitySection>
        <EntitySection id="demand" title="India, international context and competition" depth="business">
          <div className="grid gap-8 md:grid-cols-2">
            <div><p className="t-overline text-neutral-500 mb-2">India</p><Prose paragraphs={c.indiaContext} /></div>
            <div><p className="t-overline text-neutral-500 mb-2">International</p><Prose paragraphs={c.internationalContext} /></div>
          </div>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div><p className="t-overline text-neutral-500 mb-2">Competition</p><BulletList items={c.competition} /></div>
            <div><p className="t-overline text-neutral-500 mb-2">Advantages</p><BulletList items={c.advantages} /></div>
            <div><p className="t-overline text-neutral-500 mb-2">Limitations</p><BulletList items={c.limitations} /></div>
          </div>
          {countries.size > 0 && <div className="mt-8"><p className="t-overline text-neutral-500 mb-2">Export potential — target markets via products</p><TagRow items={countryList.filter((x) => countries.has(x.id)).map((x) => ({ label: x.name, href: `/export/${x.slug}` }))} /></div>}
        </EntitySection>
        <EntitySection id="quality" title="Quality, certifications, regulations, storage and transport" depth="business">
          <div className="grid gap-8 md:grid-cols-2">
            <div><p className="t-overline text-neutral-500 mb-2">Quality requirements</p><BulletList items={c.qualityRequirements} /></div>
            <div><p className="t-overline text-neutral-500 mb-2">Storage</p><BulletList items={c.storage} /><p className="t-overline text-neutral-500 mt-5 mb-2">Transportation</p><BulletList items={c.transportation} /></div>
          </div>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div><p className="t-overline text-neutral-500 mb-2">Certifications (via products)</p>{certs.size ? <TagRow items={certList.filter((x) => certs.has(x.id)).map((x) => ({ label: x.name }))} /> : <BulletList items={[]} />}</div>
            <div><p className="t-overline text-neutral-500 mb-2">Regulations (via products)</p>{regs.size ? <TagRow items={regList.filter((x) => regs.has(x.id)).map((x) => ({ label: x.name }))} /> : <BulletList items={[]} />}</div>
          </div>
        </EntitySection>
        <EntitySection id="industrial" title="Processing complexity, technology, machinery, factory" depth="industrial">
          <p className="mb-4"><Badge tone="dark">Processing complexity: {c.processingComplexity.replace("_", " ")}</Badge></p>
          <p className="t-overline text-neutral-500 mb-2">Technology requirements</p><BulletList items={c.technologyRequirements} columns={2} />
          {mchs.length > 0 && (
            <div className="mt-8">
              <p className="t-overline text-neutral-500 mb-3">Machinery linked through this component&apos;s products</p>
              <ul className="grid gap-2 sm:grid-cols-2">{mchs.map((m) => <li key={m.id}><Link href={`/machinery/${m.slug}`} className="block rounded-[var(--radius-control)] border hairline p-3 hover:border-coconut-800"><span className="t-nav block">{m.name}</span><span className="t-caption">{m.category} · {m.processStage}</span></Link></li>)}</ul>
            </div>
          )}
          <Callout tone="neutral" title="Land, factory, manpower, utilities, CAPEX">
            These are product-specific. Open a product from the tree above, or run the <Link href="/tools/factory-planner" className="underline">Factory Planner</Link> for one of: {outputs.slice(0, 4).map((o, i) => <span key={o.id}>{i > 0 && ", "}<Link href={`/build/${o.slug}`} className="underline">{o.name}</Link></span>)}.
          </Callout>
        </EntitySection>
        <EntitySection id="economics" title="Economics — revenue models, margins, break-even, scale" depth="industrial">
          <p className="text-[0.95rem] text-neutral-700 max-w-[68ch]">Economics belong to products, not components: the same husk earns very differently as loose fibre versus buffered cocopeat grow bags. Each product page carries unit economics, cost structure, CAPEX, working capital and break-even with evidence labels; the <Link href="/tools/financial-model" className="underline">Financial Model</Link> computes them from your inputs.</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">{outputs.map((o) => <li key={o.id}><Link href={`/products/${o.slug}#economics`} className="block rounded-[var(--radius-control)] border hairline p-4 hover:border-coconut-800"><span className="t-nav block">{o.name} → economics</span><span className="t-caption">Level {o.businessLevel.slice(1)} · {o.marketTags.join(" · ")}</span></Link></li>)}</ul>
        </EntitySection>
        <EntitySection id="swot" title="SWOT, why it can work, why it can fail, who should enter" depth="business">
          <SwotGrid swot={c.swot} />
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div><p className="t-overline text-leaf-500 mb-2">Why it can work</p><BulletList items={c.whyItCanWork} /></div>
            <div><p className="t-overline text-danger mb-2">Why it can fail</p><BulletList items={c.whyItCanFail} /></div>
            <div><p className="t-overline text-neutral-500 mb-2">Who should enter</p><BulletList items={c.whoShouldEnter} /></div>
            <div><p className="t-overline text-neutral-500 mb-2">Who should not enter</p><BulletList items={c.whoShouldNotEnter} /></div>
          </div>
        </EntitySection>
        <EntitySection id="future" title="Technology and future opportunities">
          <div className="grid gap-8 md:grid-cols-2">
            <div><p className="t-overline text-neutral-500 mb-2">Technology opportunities</p><BulletList items={c.technologyOpportunities} /></div>
            <div><p className="t-overline text-neutral-500 mb-2">Future opportunities</p><BulletList items={c.futureOpportunities} /></div>
          </div>
        </EntitySection>
        <EntitySection id="gaps" title="Research gaps">
          <BulletList items={c.researchGaps} />
          <div className="mt-6"><Link href={`/research/gaps#${c.id}`} className="t-nav underline underline-offset-4">Field-level gap report ({gap.missingCount} fields research required) →</Link></div>
        </EntitySection>
        <EntitySection id="sources" title="Sources"><SourceList ids={c.sourceIds} sources={sources} /></EntitySection>
        <RelatedBlocks groups={related} />
        <div className="py-10"><PrevNext prev={nav.prev} next={nav.next} label="component" /></div>
        {outputs[0] && <div className="pb-16"><LinkButton href={`/build/${outputs[0].slug}`}>Plan an industry from {c.name.replace(/ \(.*\)/, "")} <Arrow /></LinkButton></div>}
      </TwoCol>
    </>
  );
}
