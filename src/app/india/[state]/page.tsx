import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { repo } from "@/services/repository";
import { scoreLocation } from "@/lib/calc/scoring";
import { Container, Section, BulletList, Badge } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { QuantityTable, SourceList } from "@/components/entity/blocks";
import { ScoreBar } from "@/components/viz/charts";
import { pageMetadata } from "@/lib/seo/site";
import { EntityImage } from "@/components/ui/entity-image";

export async function generateStaticParams() { return (await repo.states()).map((s) => ({ state: s.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const { state } = await params; const s = await repo.stateBySlug(state); if (!s) return {};
  return pageMetadata({ title: `Coconut Processing in ${s.name} — Raw Material, Infrastructure & Market Access`, description: s.summary, path: `/india/${s.slug}` });
}

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const s = await repo.stateBySlug(state);
  if (!s) notFound();
  const [sources, schemes, products] = await Promise.all([repo.sources(), repo.schemes(), repo.products()]);
  const stateSchemes = schemes.filter((x) => x.geography.includes(s.id) || x.geography.includes("India"));
  const r = scoreLocation(s.dimensions);
  return (
    <>
      <PageIntro overline={`India · ${s.code}`} title={s.name} lede={s.summary} breadcrumbs={[{ label: "Locations", href: "/locations" }, { label: "India", href: "/india" }, { label: s.name }]}>
        <div className="mt-6 max-w-sm text-ivory-50"><p className="t-overline text-leaf-300">Default-weight score</p><p className="t-metric text-5xl">{r.total}<span className="text-lg text-ivory-100/60">/100</span></p><ScoreBar value={r.total} label="Score" dark /></div>
      </PageIntro>
      <Section surface="ivory">
        <Container>
          <EntityImage kind="states" slug={s.slug} alt={`Coconut cultivation or processing in ${s.name}`} className="mb-10 max-w-[900px]" fallback={null} />
          <div className="overflow-x-auto"><table className="table-data"><thead><tr><th>Dimension</th><th>Score</th><th>Weight</th><th>Reason</th></tr></thead><tbody>{s.dimensions.map((d) => <tr key={d.dimension}><td className="font-medium">{d.dimension}</td><td><ScoreBar value={d.score} max={10} label={d.dimension} /></td><td className="t-data">{Math.round(d.weight * 100)}%</td><td className="text-[0.85rem]">{d.reason || "—"} <Badge>{d.evidence.replace("_", " ")}</Badge></td></tr>)}</tbody></table></div>
          <div className="mt-12 grid gap-10 md:grid-cols-2">
            <div><p className="t-overline text-neutral-500 mb-2">Processing ecosystem</p><BulletList items={s.processingEcosystem} /><p className="t-overline text-neutral-500 mt-6 mb-2">Ports</p><BulletList items={s.ports} /></div>
            <div><p className="t-overline text-neutral-500 mb-2">Government support (verify current schemes)</p><BulletList items={s.governmentSupport} /><p className="t-overline text-neutral-500 mt-6 mb-2">Notes / trade-offs</p><BulletList items={s.notes} /></div>
          </div>
          <div className="mt-12 grid gap-10 md:grid-cols-2">
            <div><p className="t-overline text-neutral-500 mb-3">Schemes applicable here</p><ul className="space-y-1.5">{stateSchemes.map((x) => <li key={x.id} className="text-[0.9rem]"><Link href={`/business/schemes#${x.slug}`} className="underline underline-offset-4">{x.name}</Link> <Badge tone={x.subsidy.evidence === "VERIFIED_FACT" ? "green" : "amber"}>{x.subsidy.evidence === "VERIFIED_FACT" ? "verified" : "research required"}</Badge></li>)}</ul></div>
            <div><p className="t-overline text-neutral-500 mb-3">Products with modelled fit (EXPERT JUDGMENT)</p><ul className="flex flex-wrap gap-2">{products.filter((p) => s.processingEcosystem.join(" ").toLowerCase().split(/[^a-z]+/).some((w) => w.length > 3 && p.name.toLowerCase().includes(w))).slice(0, 8).map((p) => <li key={p.id}><Link href={`/products/${p.slug}`} className="t-nav rounded-full border border-neutral-300 px-3 py-1.5 hover:border-coconut-800 tap">{p.name}</Link></li>)}</ul><p className="t-caption mt-2">Derived from the state&apos;s processing-ecosystem notes; not a recommendation.</p></div>
          </div>
          <div className="mt-12"><p className="t-overline text-neutral-500 mb-3">Production statistics</p><QuantityTable rows={s.productionStats.map((q, i) => ({ label: `Production ${i + 1}`, q }))} sources={sources} caption="Cite CDB state statistics with year; unit is nuts unless stated." /></div>
          <div className="mt-12"><p className="t-overline text-neutral-500 mb-3">Sources</p><SourceList ids={s.sourceIds} sources={sources} /></div>
        </Container>
      </Section>
    </>
  );
}
