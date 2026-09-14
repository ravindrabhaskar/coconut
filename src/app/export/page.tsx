import Link from "next/link";
import { repo } from "@/services/repository";
import { Container, Section, Chip, Badge, Callout } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { FreshnessChip } from "@/components/ui/evidence";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Coconut Exports — Markets, Requirements, Certification & Logistics", description: "Export explorer for coconut products: product suitability, potential markets, market context, certification, documentation, packaging, shipping, shelf-life, regulatory complexity, currency and payment risk, ports. No invented export prices.", path: "/export" });

export default async function ExportPage({ searchParams }: { searchParams: Promise<{ product?: string; region?: string; cert?: string }> }) {
  const sp = await searchParams;
  const [countries, products, certs] = await Promise.all([repo.countries(), repo.products(), repo.certifications()]);
  const regions = [...new Set(countries.map((c) => c.region))];
  const list = countries.filter((c) => c.productIds.length && (!sp.product || c.productIds.includes(sp.product)) && (!sp.region || c.region === sp.region) && (!sp.cert || c.certificationsExpected.some((x) => x.toLowerCase().includes(sp.cert!.toLowerCase()))));
  const qs = (patch: Record<string, string | undefined>) => { const u = new URLSearchParams(); Object.entries({ ...sp, ...patch }).forEach(([k, v]) => { if (v) u.set(k, v); }); const s = u.toString(); return `/export${s ? `?${s}` : ""}`; };
  return (
    <>
      <PageIntro overline="Markets" title="Coconut exports." lede="Filter by product, region and certification. Each market lists context, regulatory notes, expected certifications, logistics and currency risk. Export prices are never invented — they appear only as dated, sourced records." breadcrumbs={[{ label: "Markets", href: "/markets" }, { label: "Export" }]} />
      <Section surface="ivory" padded={false} className="py-8">
        <Container>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2"><span className="t-overline self-center text-neutral-500 mr-2">Product</span><Chip href={qs({ product: undefined })} active={!sp.product}>All</Chip>{products.filter((p) => p.exportCountryIds.length).map((p) => <Chip key={p.id} href={qs({ product: p.id })} active={sp.product === p.id}>{p.name}</Chip>)}</div>
            <div className="flex flex-wrap gap-2"><span className="t-overline self-center text-neutral-500 mr-2">Region</span><Chip href={qs({ region: undefined })} active={!sp.region}>All</Chip>{regions.map((r) => <Chip key={r} href={qs({ region: r })} active={sp.region === r}>{r}</Chip>)}</div>
            <div className="flex flex-wrap gap-2"><span className="t-overline self-center text-neutral-500 mr-2">Certification</span><Chip href={qs({ cert: undefined })} active={!sp.cert}>All</Chip>{["Organic", "Halal", "Phytosanitary", "NSF", "BRCGS", "ISO"].map((c) => <Chip key={c} href={qs({ cert: c })} active={sp.cert === c}>{c}</Chip>)}</div>
          </div>
        </Container>
      </Section>
      <Section surface="white" padded={false} className="pb-24 pt-6">
        <Container>
          <ul className="grid gap-6 md:grid-cols-2">
            {list.map((c) => (
              <li key={c.id} className="rounded-[var(--radius-media)] border hairline bg-cocos p-6">
                <div className="flex items-start justify-between gap-3"><div><Link href={`/export/${c.slug}`} className="t-h3 underline-offset-4 hover:underline">{c.name}</Link><p className="t-caption">{c.region} · {c.iso2}</p></div><Badge>{c.productIds.length} products</Badge></div>
                <p className="mt-3 text-[0.92rem] text-neutral-700">{c.marketContext[0]}</p>
                <p className="t-caption mt-2">Certifications expected: {c.certificationsExpected.join(", ") || "—"}</p>
                <p className="t-caption">Logistics: {c.logistics.join("; ") || "—"}</p>
                <div className="mt-3"><FreshnessChip researchedAt="2026-09-14" lastVerifiedAt={c.lastVerifiedAt} /></div>
                <ul className="mt-4 flex flex-wrap gap-1.5">{c.productIds.map((id) => products.find((p) => p.id === id)).filter(Boolean).map((p) => <li key={p!.id}><Link href={`/products/${p!.slug}`} className="t-badge rounded-[var(--radius-data)] border border-neutral-300 px-2 py-1 hover:border-coconut-800">{p!.name}</Link></li>)}</ul>
              </li>
            ))}
          </ul>
          <div className="mt-10"><Callout tone="neutral" title="Certifications referenced">{certs.map((c) => c.name).join(" · ")}. Costs are RESEARCH REQUIRED per certification body.</Callout></div>
        </Container>
      </Section>
    </>
  );
}
