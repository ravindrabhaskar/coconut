import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { repo } from "@/services/repository";
import { Container, Section, Badge, BulletList, KeyValue } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { MachineSchematic } from "@/components/viz/illustrations";
import { EntityImage } from "@/components/ui/entity-image";
import { MetricRow, SourceList, QuantityTable } from "@/components/entity/blocks";
import { pageMetadata, breadcrumbJsonLd, JsonLd } from "@/lib/seo/site";
import { GraphNav } from "@/components/entity/graph-nav";
import { formatQuantity } from "@/lib/format";

export async function generateStaticParams() { return (await repo.machines()).map((m) => ({ slug: m.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const m = await repo.machineBySlug(slug); if (!m) return {};
  return pageMetadata({ title: `${m.name} — Capacity, Utilities & Applications`, description: m.summary, path: `/machinery/${m.slug}`, type: "article" });
}

export default async function MachinePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = await repo.machineBySlug(slug);
  if (!m) notFound();
  const [products, processes, sources] = await Promise.all([repo.products(), repo.processes(), repo.sources()]);
  const prods = m.productIds.map((id) => products.find((p) => p.id === id)).filter(Boolean) as typeof products;
  const procs = processes.filter((p) => p.steps.some((s) => s.machineIds.includes(m.id)));
  const [quotations, allMachines] = await Promise.all([repo.quotationsForMachine(m.id), repo.machines()]);
  const comparable = allMachines.filter((x) => x.id !== m.id && (x.category === m.category || x.processStage === m.processStage)).slice(0, 6);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Machinery", path: "/machinery" }, { name: m.name, path: `/machinery/${m.slug}` }])} />
      <PageIntro overline={`${m.category} · ${m.processStage}`} title={m.name} lede={m.summary} breadcrumbs={[{ label: "Processing", href: "/processing" }, { label: "Machinery", href: "/machinery" }, { label: m.name }]}>
        <div className="mt-5 flex flex-wrap gap-2"><Badge tone="dark">{m.automation.replace("_", "-")}</Badge><Badge tone="dark">{m.availability}</Badge>{m.foodGrade && <Badge tone="dark">food-grade contact parts</Badge>}<Badge tone="dark">{m.visualStatus === "illustrative" ? "ILLUSTRATIVE VISUAL" : "verified model"}</Badge></div>
      </PageIntro>
      <Section surface="ivory">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
            <div><EntityImage kind="machines" slug={m.slug} alt={`${m.name} — equipment photograph`} fallback={<MachineSchematic name={m.name} input={m.rawMaterialInput} output={m.output} category={m.category} />} caption="Photograph of representative equipment; attribute manufacturer/model in the image metadata file." /></div>
            <div>
              <MetricRow items={[{ label: "Capacity", q: m.capacityRange }, { label: "Power", q: m.power }, { label: "Footprint", q: m.footprint }, { label: "Operators / shift", q: m.operators }]} sources={sources} />
              <div className="mt-8"><QuantityTable rows={[{ label: "Cost", q: m.cost }, { label: "Useful life", q: m.usefulLife }, ...(m.water ? [{ label: "Water", q: m.water }] : []), ...(m.fuel ? [{ label: "Fuel", q: m.fuel }] : []), ...(m.steam ? [{ label: "Steam", q: m.steam }] : []), ...(m.air ? [{ label: "Compressed air", q: m.air }] : [])]} sources={sources} caption={m.lastQuotationAt ? `Last quotation/research: ${m.lastQuotationAt}` : "No quotation attached — RESEARCH REQUIRED — CURRENT SUPPLIER QUOTATION"} /></div>
            </div>
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-2">
            <KeyValue rows={[{ k: "Purpose", v: m.purpose.join(" ") }, { k: "Input", v: m.rawMaterialInput }, { k: "Output", v: m.output }, { k: "Material of construction", v: m.materialOfConstruction }, { k: "Supplier category", v: m.supplierCategory }, { k: "Installation", v: m.installation.join("; ") }]} />
            <div className="space-y-6">
              <div><p className="t-overline text-neutral-500 mb-2">Maintenance</p><BulletList items={m.maintenance} /></div>
              <div><p className="t-overline text-neutral-500 mb-2">Safety</p><BulletList items={m.safety} /></div>
              <div><p className="t-overline text-neutral-500 mb-2">Cleaning</p><BulletList items={m.cleaning} /></div>
              {m.consumables.length > 0 && <div><p className="t-overline text-neutral-500 mb-2">Consumables</p><BulletList items={m.consumables} /></div>}
              <div><p className="t-overline text-neutral-500 mb-2">Replacement considerations</p><BulletList items={m.replacement} /></div>
            </div>
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-2">
            <div><p className="t-overline text-neutral-500 mb-3">Products using this machine</p><ul className="flex flex-wrap gap-2">{prods.map((p) => <li key={p.id}><Link href={`/products/${p.slug}`} className="t-nav rounded-full border border-neutral-300 px-3 py-1.5 hover:border-coconut-800 tap">{p.name}</Link></li>)}</ul></div>
            <div><p className="t-overline text-neutral-500 mb-3">Process steps</p><ul className="space-y-1">{procs.map((p) => <li key={p.id}><Link href={`/processing/${p.slug}`} className="underline underline-offset-4">{p.name}</Link> <span className="t-caption">— {p.steps.filter((s) => s.machineIds.includes(m.id)).map((s) => s.name).join(", ")}</span></li>)}</ul></div>
          </div>
          {/* Quotation history — real records only */}
          <div className="mt-14">
            <p className="t-overline text-neutral-500 mb-3">Quotation history</p>
            {quotations.length ? (
              <div className="overflow-x-auto"><table className="table-data"><thead><tr><th>Date</th><th>Supplier</th><th>Model</th><th>Capacity</th><th>Power</th><th>Price</th><th>Lead time</th><th>Status</th></tr></thead><tbody>{quotations.map((q) => <tr key={q.id}><td className="t-data">{q.quotationDate}</td><td>{q.supplierName}</td><td>{q.model ?? "—"}</td><td className="t-data">{formatQuantity(q.capacity)}</td><td className="t-data">{formatQuantity(q.power)}</td><td className="t-data">{formatQuantity(q.price)}</td><td className="t-data">{q.leadTimeWeeks ?? "—"} wk</td><td><Badge>{q.verification.replace(/_/g, " ")}</Badge></td></tr>)}</tbody></table></div>
            ) : <p className="t-caption">No quotations on file. Target: 3 dated quotations per important production line (see Field Validation). Quotation records capture supplier, model, capacity, power, dimensions, MOC, price, GST, freight, installation, warranty, lead time, validity and document.</p>}
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-[1fr_320px]">
            <div><p className="t-overline text-neutral-500 mb-3">Comparable machines (same category or stage)</p><ul className="grid gap-2 sm:grid-cols-2">{comparable.map((x) => <li key={x.id}><Link href={`/machinery/${x.slug}`} className="block rounded-[var(--radius-control)] border hairline p-3 hover:border-coconut-800"><span className="t-nav block">{x.name}</span><span className="t-caption">{formatQuantity(x.capacityRange)} · {formatQuantity(x.power)}</span></Link></li>)}{!comparable.length && <li className="t-caption">None.</li>}</ul></div>
            <GraphNav type="machine" id={m.id} compact />
          </div>
          <div className="mt-14"><p className="t-overline text-neutral-500 mb-3">Sources</p><SourceList ids={m.sourceIds} sources={sources} /></div>
        </Container>
      </Section>
    </>
  );
}
