import Link from "next/link";
import { repo } from "@/services/repository";
import { Container, Section, SectionHeader, BulletList, Badge, Callout } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Hyderabad as a Coconut Business Hub — HQ, Distribution, Sales or Processing?", description: "Analysis of Hyderabad's role in a coconut business: demand (wholesale, HoReCa, food manufacturing, retail, quick commerce, D2C, B2B), logistics, warehousing, airport, port connectivity — and when it should be an HQ, distribution centre, sales hub, processing centre, or none of these.", path: "/hyderabad" });

const ROLES: [string, "strong" | "reasonable" | "weak", string][] = [
  ["Headquarters", "strong", "Talent, finance, professional services, connectivity."],
  ["Sales & brand hub", "strong", "Large metro demand: HoReCa, modern retail, quick commerce, D2C; South Indian cuisine consumption."],
  ["Distribution centre", "strong", "National highway and rail hub; airport for air cargo; central to South and Central India."],
  ["Finishing / packing", "reasonable", "Bottling VCO, packing DC/chips from bulk brought from processing belts; low raw-material haul weight."],
  ["Chilled coconut-water city model", "reasonable", "Tender nuts from AP/KA farms; proximity to consumers matters for a short-life product."],
  ["Primary processing of whole nuts", "weak", "Telangana grows little coconut; hauling husked nuts 300–500 km carries husk weight and freight."],
  ["Export processing", "weak", "No seaport; Kakinada, Visakhapatnam and Chennai are 500+ km by road."],
];

export default async function HyderabadPage() {
  const [ts, ap, research] = await Promise.all([repo.stateBySlug("telangana"), repo.stateBySlug("andhra-pradesh"), repo.research()]);
  const doc = research.find((r) => r.id === "rd-hyderabad-hub");
  return (
    <>
      <PageIntro overline="Markets · Hyderabad" title="Hyderabad as a coconut business hub." lede="Hyderabad is a demand, logistics and management city — not a raw-material base. Its right role depends on the product. This page does not assume Hyderabad should host a factory." breadcrumbs={[{ label: "Locations", href: "/locations" }, { label: "Hyderabad" }]} />
      <Section surface="ivory">
        <Container>
          <SectionHeader overline="Role fit" title="What Hyderabad is good at — and what it is not." />
          <ul className="grid gap-4 md:grid-cols-2">{ROLES.map(([role, fit, why]) => <li key={role} className="border-t hairline pt-4"><div className="flex items-center justify-between gap-3"><p className="t-h4">{role}</p><Badge tone={fit === "strong" ? "green" : fit === "reasonable" ? "fibre" : "danger"}>{fit}</Badge></div><p className="t-caption mt-2">{why}</p></li>)}</ul>
          {doc && <div className="mt-14 grid gap-10 md:grid-cols-[1.2fr_0.8fr]"><div className="prose-coconut">{doc.detail.map((d, i) => <p key={i}>{d}</p>)}</div><div><p className="t-overline text-neutral-500 mb-2">Implications</p><BulletList items={doc.businessImplications} /><p className="mt-6 t-caption"><Link href={`/research/${doc.slug}`} className="underline">Research record →</Link></p></div></div>}
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {ts && <div><p className="t-overline text-neutral-500 mb-2">Telangana dimensions</p><ul className="space-y-1 text-[0.88rem]">{ts.dimensions.map((d) => <li key={d.dimension} className="flex justify-between border-b hairline py-1"><span>{d.dimension}</span><span className="t-data">{d.score}/10</span></li>)}</ul><p className="mt-2 t-caption"><Link href="/india/telangana" className="underline">Full Telangana profile</Link></p></div>}
            {ap && <div><p className="t-overline text-neutral-500 mb-2">Nearest supply belt — Andhra Pradesh (Konaseema)</p><ul className="space-y-1 text-[0.88rem]">{ap.dimensions.map((d) => <li key={d.dimension} className="flex justify-between border-b hairline py-1"><span>{d.dimension}</span><span className="t-data">{d.score}/10</span></li>)}</ul><p className="mt-2 t-caption"><Link href="/india/andhra-pradesh" className="underline">Full Andhra Pradesh profile</Link></p></div>}
          </div>
          <div className="mt-10"><Callout tone="neutral" title="Recommended structure (EXPERT JUDGMENT)">Primary processing near supply (Andhra Pradesh / Tamil Nadu); finishing, sales, brand and distribution in Hyderabad — or a chilled coconut-water city model sourced from Andhra tender-nut farms. Validate freight per tonne and tender-nut prices in the field before deciding.</Callout></div>
        </Container>
      </Section>
    </>
  );
}
