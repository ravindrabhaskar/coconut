import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { repo } from "@/services/repository";
import { Container, Section, Badge, BulletList } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { ProcessFlow } from "@/components/viz/illustrations";
import { EntityImage } from "@/components/ui/entity-image";
import { QuantityTable, SourceList, MetricRow } from "@/components/entity/blocks";
import { pageMetadata, breadcrumbJsonLd, JsonLd } from "@/lib/seo/site";
import { GraphNav } from "@/components/entity/graph-nav";

export async function generateStaticParams() { return (await repo.processes()).map((p) => ({ slug: p.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const p = await repo.processBySlug(slug); if (!p) return {};
  return pageMetadata({ title: `${p.name} — Steps, Inputs, Outputs & Machinery`, description: p.summary, path: `/processing/${p.slug}`, type: "article" });
}

export default async function ProcessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await repo.processBySlug(slug);
  if (!p) notFound();
  const [machines, products, components, sources] = await Promise.all([repo.machines(), repo.products(), repo.components(), repo.sources()]);
  const util = [p.utilities.power && { label: "Power", q: p.utilities.power }, p.utilities.water && { label: "Water", q: p.utilities.water }, p.utilities.steam && { label: "Steam", q: p.utilities.steam }, p.utilities.fuel && { label: "Fuel", q: p.utilities.fuel }].filter(Boolean) as { label: string; q: NonNullable<typeof p.utilities.power> }[];
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Processing", path: "/processing" }, { name: p.name, path: `/processing/${p.slug}` }])} />
      <PageIntro overline={`Process · ${p.hygieneClass}`} title={p.name} lede={p.summary} breadcrumbs={[{ label: "Processing", href: "/processing" }, { label: p.name }]}>
        <div className="mt-6 flex flex-wrap gap-2 text-ivory-50">
          {p.productIds.map((id) => products.find((x) => x.id === id)).filter(Boolean).map((x) => <Link key={x!.id} href={`/products/${x!.slug}`} className="t-nav rounded-full border border-ivory-100/30 px-3 py-1.5 hover:bg-ivory-50/10 tap">{x!.name}</Link>)}
          {p.inputComponentIds.map((id) => components.find((x) => x.id === id)).filter(Boolean).map((x) => <Link key={x!.id} href={`/explore/${x!.slug}`} className="t-nav rounded-full border border-leaf-300/50 px-3 py-1.5 text-leaf-300 hover:bg-ivory-50/10 tap">{x!.name.replace(/ \(.*\)/, "")}</Link>)}
        </div>
      </PageIntro>
      <Section surface="ivory">
        <Container>
          <EntityImage kind="processes" slug={p.slug} alt={`${p.name} — process photograph`} className="mb-10 max-w-[900px]" fallback={null} />
          <ProcessFlow steps={p.steps.map((s) => ({ name: s.name, zone: s.hygieneZone, qc: s.qcPoint }))} />
          <ol className="mt-12 space-y-6">
            {p.steps.map((s) => (
              <li key={s.id} id={s.id} className="grid gap-3 border-t hairline pt-6 md:grid-cols-[4rem_1fr_1fr]">
                <span className="t-metric text-2xl text-leaf-500">{String(s.order).padStart(2, "0")}</span>
                <div><p className="t-h4">{s.name} {s.hygieneZone && <Badge className="ml-2">{s.hygieneZone} zone</Badge>}</p><p className="mt-2 text-[0.92rem] text-neutral-700">{s.description.join(" ")}</p>{s.qcPoint && <p className="mt-2 t-caption">QC point: {s.qcPoint}</p>}{s.losses && <p className="t-caption">Losses: {s.losses}</p>}</div>
                <div className="text-[0.85rem]"><p><span className="t-caption">Inputs: </span>{s.inputs.join(", ")}</p><p className="mt-1"><span className="t-caption">Outputs: </span>{s.outputs.join(", ")}</p>{s.machineIds.length > 0 && <p className="mt-2"><span className="t-caption">Machines: </span>{s.machineIds.map((id) => machines.find((m) => m.id === id)).filter(Boolean).map((m, i) => <span key={m!.id}>{i > 0 && ", "}<Link href={`/machinery/${m!.slug}`} className="underline underline-offset-4">{m!.name}</Link></span>)}</p>}</div>
              </li>
            ))}
          </ol>
          <div className="mt-14 grid gap-10 md:grid-cols-2">
            <div><p className="t-overline text-neutral-500 mb-3">Yields & process loss</p><QuantityTable rows={[...p.yields.map((q, i) => ({ label: `Yield ${i + 1}`, q })), { label: "Process loss", q: p.processLoss }]} sources={sources} /></div>
            <div><p className="t-overline text-neutral-500 mb-3">Utilities</p>{util.length ? <MetricRow items={util} sources={sources} /> : <p className="t-caption">RESEARCH REQUIRED</p>}<p className="t-overline text-neutral-500 mt-8 mb-2">Quality control points</p><BulletList items={p.qualityControlPoints} /><p className="t-overline text-neutral-500 mt-6 mb-2">Automation options</p><BulletList items={p.automationOptions} /></div>
          </div>
          <div className="mt-12 grid gap-10 md:grid-cols-[1fr_320px]"><div><p className="t-overline text-neutral-500 mb-3">Sources</p><SourceList ids={p.sourceIds} sources={sources} /></div><GraphNav type="process" id={p.id} compact /></div>
        </Container>
      </Section>
    </>
  );
}
