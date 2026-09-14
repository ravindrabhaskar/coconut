import { repo } from "@/services/repository";
import { Container, Section } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { LocationFinder } from "@/components/features/location-finder";
import { needsForProduct } from "@/lib/calc/location";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Where Should I Build? - Coconut Factory Location Finder for India", description: "Rank Indian coconut states for your specific plant: raw-material dependence, export share, power, water, labour, ecosystem and domestic-market needs re-weight transparent expert-judgment dimensions. Screening, not a site decision.", path: "/tools/location-finder" });

export default async function LocationFinderPage() {
  const [states, products] = await Promise.all([repo.states(), repo.products()]);
  const presets = products.map((p) => ({ id: p.id, name: p.name, slug: p.slug, needs: needsForProduct(p) })).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <>
      <PageIntro overline="Location engine" title="Where should this plant sit?" lede="Pick a product or describe what the plant needs; the engine re-weights each state's scored dimensions and explains every rank with the reasons behind the scores." breadcrumbs={[{ label: "Tools", href: "/tools" }, { label: "Location finder" }]} />
      <Section surface="ivory"><Container><LocationFinder states={states} presets={presets} /></Container></Section>
    </>
  );
}
