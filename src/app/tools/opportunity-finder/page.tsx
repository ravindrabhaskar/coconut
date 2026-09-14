import { repo } from "@/services/repository";
import { Container, Section } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { OpportunityFinder } from "@/components/features/finder";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Which Coconut Business Is Right for Me? - Strategic Screening Tool", description: "Answer ten questions about capital, location, raw-material access, market, preference, capability, risk tolerance, scale, marketing and time horizon to get an explained shortlist of coconut business opportunities. Screening, not investment advice.", path: "/tools/opportunity-finder" });

export default async function FinderPage() {
  const [opps, products, industries] = await Promise.all([repo.opportunities(), repo.products(), repo.industries()]);
  const kind: Record<string, "food" | "industrial" | "other"> = {};
  for (const i of industries) kind[i.id] = ["ind-food", "ind-beverage", "ind-wellness", "ind-consumer"].includes(i.id) ? "food" : ["ind-industrial", "ind-coir", "ind-horticulture", "ind-waste-to-value"].includes(i.id) ? "industrial" : "other";
  const names = Object.fromEntries(products.map((p) => [p.id, { name: p.name, slug: p.slug }]));
  return (
    <>
      <PageIntro overline="Strategic screening tool" title="Which coconut business is right for me?" lede="Ten inputs, an explained shortlist. Every recommendation shows why it appeared and what to be careful about." breadcrumbs={[{ label: "Tools", href: "/tools" }, { label: "Finder" }]} />
      <Section surface="ivory"><Container><OpportunityFinder opportunities={opps} industryKind={kind} productNames={names} /></Container></Section>
    </>
  );
}
