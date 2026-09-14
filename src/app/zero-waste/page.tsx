import Link from "next/link";
import { repo } from "@/services/repository";
import { Container, Section, SectionHeader, BulletList } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/layout/chrome";
import { ZeroWasteRing } from "@/components/viz/zero-waste-ring";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Zero-Waste Coconut — One Coconut, Almost Nothing Left Behind", description: "Full-screen circular visualisation of coconut material streams — water, kernel, husk, fibre, pith, shell, secondary material, product, energy/recovery — each with its commercial path. Economic circularity, not vague environmental claims.", path: "/zero-waste" });

export default async function ZeroWastePage() {
  const [components, products, research] = await Promise.all([repo.components(), repo.products(), repo.research()]);
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const streams = [
    ...components.filter((c) => c.explodedOrder || c.parentComponentId).map((c) => ({ id: c.id, name: c.name.replace(/ \(.*\)/, ""), href: `/explore/${c.slug}`, kind: "component" as const, path: `${c.processingFlow[0] ?? c.summary} ${c.applications[0] ? `Commercial path: ${c.applications.slice(0, 3).join("; ")}.` : ""}`, products: [...c.primaryOutputProductIds, ...c.secondaryOutputProductIds].map((id) => byId[id]).filter(Boolean).slice(0, 6).map((p) => ({ name: p.name, href: `/products/${p.slug}` })), note: c.researchGaps[0] ? `Open gap: ${c.researchGaps[0]}` : undefined })),
    { id: "secondary", name: "Secondary material", href: "/products/activated-carbon", kind: "product" as const, path: "Charcoal becomes activated carbon; press residue becomes flour; fibre becomes yarn and geotextile. Second conversions carry the margin.", products: [{ name: "Activated carbon", href: "/products/activated-carbon" }, { name: "Coconut flour", href: "/products/coconut-flour" }, { name: "Coir geotextile", href: "/products/coir-geotextile" }] },
    { id: "energy", name: "Energy / recovery", href: "/explore/residues", kind: "recovery" as const, path: "Shell and husk fines fire boilers and dryers; volatiles from carbonisation supply kiln heat; parings and cake go to feed; effluent is treated and reused. Value is measured in fuel saved and disposal cost avoided.", products: [{ name: "Biochar", href: "/products/biochar" }, { name: "Shell charcoal", href: "/products/shell-charcoal" }], note: "Not every residue has a positive value; some are a cost minimised by design." },
  ];
  const zw = research.find((r) => r.id === "rd-zero-waste-model");
  return (
    <>
      <section className="surface-charcoal min-h-[90vh] pt-8 pb-16 flex items-center">
        <Container className="relative z-[1] w-full">
          <Breadcrumbs items={[{ label: "Zero waste" }]} dark className="mb-8" />
          <p className="t-overline text-leaf-300 mb-4">Signature experience</p>
          <h1 className="t-display text-ivory-50 max-w-[14ch]">ONE COCONUT. ALMOST NOTHING LEFT BEHIND.</h1>
          <div className="mt-12 text-ivory-50"><ZeroWasteRing streams={streams} /></div>
        </Container>
      </section>
      {zw && (
        <Section surface="ivory">
          <Container>
            <SectionHeader overline="Strategic analysis — not investment advice" title={zw.name} lede={zw.summary} />
            <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr]"><div className="prose-coconut">{zw.detail.map((d, i) => <p key={i}>{d}</p>)}</div><div><p className="t-overline text-neutral-500 mb-2">Business implications</p><BulletList items={zw.businessImplications} /><p className="mt-6 t-caption"><Link href={`/research/${zw.slug}`} className="underline">Read the research record →</Link></p></div></div>
          </Container>
        </Section>
      )}
    </>
  );
}
