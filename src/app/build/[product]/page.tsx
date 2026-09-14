import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { repo } from "@/services/repository";
import { Container, Section, BulletList, Badge, Callout, LinkButton, Arrow } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/layout/chrome";
import { Qty, EvidenceBadge } from "@/components/ui/evidence";
import { FactoryPlanner } from "@/components/features/factory-planner";
import { ProcessFlow } from "@/components/viz/illustrations";
import { QuantityTable } from "@/components/entity/blocks";
import { pageMetadata } from "@/lib/seo/site";

export async function generateStaticParams() { return (await repo.products()).map((p) => ({ product: p.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ product: string }> }): Promise<Metadata> {
  const { product } = await params; const p = await repo.productBySlug(product); if (!p) return {};
  return pageMetadata({ title: `Build a ${p.name} Industry — Planning Chain, Factory, Machinery & Economics`, description: `Product-specific planning chain for ${p.name}: raw material, capacity, process, mass balance, land, building, machinery, manpower, utilities, storage, QC, packaging, CAPEX, working capital, customers, break-even, risks, scale.`, path: `/build/${p.slug}` });
}

const STEPS = [["Product", "product"], ["Raw material", "raw"], ["Target capacity", "capacity"], ["Process", "process"], ["Mass balance", "mass"], ["Land · Building · Machinery · Manpower · Power · Water · Utilities · Storage · QC · Packaging", "factory"], ["CAPEX · Working capital · Operating cost · Production · Revenue · Break-even · ROI", "economics"], ["Customers", "customers"], ["Risks", "risks"], ["Scale", "scale"]];

export default async function BuildProductPage({ params, searchParams }: { params: Promise<{ product: string }>; searchParams: Promise<{ scale?: string }> }) {
  const { product } = await params;
  const sp = await searchParams;
  const p = await repo.productBySlug(product);
  if (!p) notFound();
  const [components, sources, processes, roles, models, customers, risks, machines] = await Promise.all([repo.components(), repo.sources(), repo.processes(), repo.manpowerRoles(), repo.scaleModelsForProduct(p.id), repo.customerSegments(), repo.risks(), repo.machines()]);
  const comps = p.sourceComponentIds.map((id) => components.find((c) => c.id === id)).filter(Boolean) as typeof components;
  const proc = processes.find((x) => x.id === p.processIds[0]);
  const scaleOpt = p.scaleOptions.find((s) => s.id === sp.scale) ?? p.scaleOptions.find((s) => s.supported);
  const initialModel = scaleOpt?.scaleModelId ?? models[0]?.id;
  const mchs = p.machineIds.map((id) => machines.find((m) => m.id === id)).filter(Boolean) as typeof machines;

  return (
    <>
      <section className="surface-dark pt-8 pb-12">
        <Container className="relative z-[1]">
          <Breadcrumbs items={[{ label: "Build", href: "/build" }, { label: p.name }]} dark className="mb-8" />
          <p className="t-overline text-leaf-300 mb-3">Planning chain</p>
          <h1 className="t-h1 text-ivory-50">Build a {p.name} industry.</h1>
          <p className="mt-5 max-w-[60ch] text-ivory-100/75">Everything below is specific to {p.name}. Numbers carry evidence labels; capacities are only offered where engineering assumptions exist; costs remain RESEARCH REQUIRED until quotations are attached.</p>
          <ol className="mt-8 flex flex-wrap gap-2">{STEPS.map(([label, id], i) => <li key={id}><a href={`#${id}`} className="t-badge inline-block rounded-full border border-ivory-100/25 px-3 py-1.5 text-ivory-100/80 hover:bg-ivory-50/10 tap">{i + 1}. {label}</a></li>)}</ol>
        </Container>
      </section>

      <Section surface="ivory" padded={false} className="py-12">
        <Container>
          <Step id="product" n={1} title="Product">
            <p className="max-w-[68ch]">{p.summary}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">{p.marketTags.map((t) => <Badge key={t}>{t}</Badge>)}<Badge tone="fibre">Business level {p.businessLevel.slice(1)}</Badge></div>
            <p className="mt-3 t-caption"><Link href={`/products/${p.slug}`} className="underline">Full product page →</Link></p>
          </Step>
          <Step id="raw" n={2} title="Raw material">
            <div className="grid gap-8 md:grid-cols-2">
              <div><p className="t-overline text-neutral-500 mb-2">Source component</p><ul className="space-y-1">{comps.map((c) => <li key={c.id}><Link href={`/explore/${c.slug}`} className="underline underline-offset-4">{c.name}</Link>{c.massShare && <span className="ml-2"><Qty q={c.massShare} sources={sources} /></span>}</li>)}</ul><p className="mt-3 t-caption">Coconut type: {p.rawMaterial.coconutType}</p></div>
              <div><p className="t-overline text-neutral-500 mb-2">Specification & procurement</p><BulletList items={[...p.rawMaterial.specification, ...p.rawMaterial.procurement]} /></div>
            </div>
          </Step>
          <Step id="capacity" n={3} title="Target capacity">
            <ul className="flex flex-wrap gap-2">{p.scaleOptions.map((s) => s.supported ? <li key={s.id}><Link href={`/build/${p.slug}?scale=${s.id}#factory`} className={`t-nav rounded-full border px-3.5 py-1.5 tap ${scaleOpt?.id === s.id ? "bg-coconut-950 text-ivory-50 border-coconut-950" : "border-leaf-500"}`}>{s.label}</Link></li> : <li key={s.id}><span className="t-nav rounded-full border border-dashed border-neutral-400 px-3.5 py-1.5 text-neutral-500" title={s.note}>{s.label} — research required</span></li>)}</ul>
            <p className="mt-3 t-caption">Only capacities with documented engineering assumptions are selectable. {p.scaleOptions.filter((s) => !s.supported).length} other scales are listed as RESEARCH REQUIRED with the reason on hover.</p>
          </Step>
          <Step id="process" n={4} title="Process">
            {proc ? <><ProcessFlow steps={proc.steps.map((s) => ({ name: s.name, zone: s.hygieneZone, qc: s.qcPoint }))} /><p className="mt-3 t-caption"><Link href={`/processing/${proc.slug}`} className="underline">{proc.name} — full process page</Link></p></> : <p className="t-caption">RESEARCH REQUIRED — no process linked.</p>}
          </Step>
          <Step id="mass" n={5} title="Mass balance">
            <QuantityTable rows={[...p.yieldQuantities.map((q, i) => ({ label: `Yield ${i + 1}`, q })), ...(proc ? [{ label: "Process loss", q: proc.processLoss }] : [])]} sources={sources} />
            <p className="mt-3"><LinkButton href={`/tools/mass-balance?product=${p.id}`} variant="ghost">Open interactive mass balance <Arrow /></LinkButton></p>
          </Step>
          <Step id="factory" n={6} title="Land · Building · Machinery · Manpower · Power · Water · Utilities · Storage · QC · Packaging">
            <FactoryPlanner products={[{ id: p.id, name: p.name, slug: p.slug, models }]} roles={roles} sources={sources} initialProductId={p.id} initialModelId={initialModel} embedded />
            <div className="mt-8"><p className="t-overline text-neutral-500 mb-2">Machinery list</p><ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{mchs.map((m) => <li key={m.id} className="text-[0.9rem]"><Link href={`/machinery/${m.slug}`} className="underline underline-offset-4">{m.name}</Link> <span className="t-caption">· cost <EvidenceBadge q={m.cost} sources={sources} compact /></span></li>)}</ul></div>
            <div className="mt-6 grid gap-6 md:grid-cols-3"><div><p className="t-overline text-neutral-500 mb-2">Storage</p><BulletList items={p.storage} /></div><div><p className="t-overline text-neutral-500 mb-2">Quality control</p><BulletList items={proc?.qualityControlPoints ?? []} /></div><div><p className="t-overline text-neutral-500 mb-2">Packaging</p><BulletList items={p.packaging.map((x) => `${x.format} — ${x.typicalUse}`)} /></div></div>
          </Step>
          <Step id="economics" n={7} title="CAPEX · Working capital · Monthly operating cost · Expected production · Revenue · Break-even · ROI">
            <div className="grid gap-6 sm:grid-cols-3"><div><p className="t-overline text-neutral-500">CAPEX</p><Qty q={p.capex} sources={sources} big /></div><div><p className="t-overline text-neutral-500">Working capital</p><Qty q={p.workingCapital} sources={sources} big /></div><div><p className="t-overline text-neutral-500">Selling price</p><Qty q={p.pricing[0]} sources={sources} big /></div></div>
            <Callout tone="green" title="Compute, don't assume">Operating cost, expected production, revenue, break-even, ROI, ROCE and payback are computed in the Financial Model from labelled inputs — including the price-to-economics waterfall. <Link href={`/tools/financial-model?product=${p.id}`} className="underline font-semibold">Open the Financial Model for {p.name} →</Link></Callout>
            <div className="mt-6"><p className="t-overline text-neutral-500 mb-2">Cost structure</p><QuantityTable rows={p.costStructure.map((c) => ({ label: c.item, q: c.quantity, note: c.note }))} sources={sources} /></div>
          </Step>
          <Step id="customers" n={8} title="Customers & revenue model">
            <ul className="grid gap-3 md:grid-cols-2">{p.customers.map((c) => { const s = customers.find((x) => x.id === c.customerSegmentId); return s ? <li key={s.id} className="rounded-[var(--radius-control)] border hairline p-4"><Link href={`/customers/${s.slug}`} className="t-h4 underline-offset-4 hover:underline">{s.name}</Link><p className="text-[0.9rem] mt-1">{c.whyTheyBuy}</p><p className="t-caption mt-1">MOQ: <EvidenceBadge q={s.moq} sources={sources} compact /> · Payment terms: <EvidenceBadge q={s.paymentTerms} sources={sources} compact /></p></li> : null; })}</ul>
          </Step>
          <Step id="risks" n={9} title="Risks">
            <ul className="grid gap-3 md:grid-cols-2">{p.risks.map((r) => { const rk = risks.find((x) => x.id === r.riskId); return rk ? <li key={r.riskId} className="border-t hairline pt-3"><p className="font-semibold">{rk.name} <span className="t-data text-neutral-500">P{r.probability}×I{r.impact}</span></p><p className="text-[0.88rem] mt-1">{r.mitigation}</p></li> : null; })}</ul>
          </Step>
          <Step id="scale" n={10} title="Scale">
            <BulletList items={p.scalability} />
            <div className="mt-6 flex flex-wrap gap-3"><LinkButton href="/roadmap" variant="ghost">Phase roadmap</LinkButton><LinkButton href="/90-day-plan" variant="ghost">90-day validation plan</LinkButton><LinkButton href={`/tools/compare?ids=${p.id}`} variant="ghost">Compare with other products</LinkButton></div>
          </Step>
        </Container>
      </Section>
    </>
  );
}

function Step({ id, n, title, children }: { id: string; n: number; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 grid gap-4 border-t hairline py-10 md:grid-cols-[100px_1fr]">
      <div><span className="t-metric text-3xl text-leaf-500">{String(n).padStart(2, "0")}</span></div>
      <div className="min-w-0"><h2 className="t-h3 mb-5">{title}</h2>{children}</div>
    </section>
  );
}
