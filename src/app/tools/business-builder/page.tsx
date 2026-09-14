import { repo } from "@/services/repository";
import { Container, Section, Callout } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { BusinessBuilder } from "@/components/features/finder";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Build Your Coconut Business - Capital x Market x Product", description: "Choose capital (Rs 50,000 to Rs 5 crore), market (B2B, B2C, export, hybrid) and product to get an indicative entry route - contract manufacture, private label, micro processing, small factory, B2B ingredient model, distribution, export trading or integrated processing - with validation stage, capital allocation, working capital, customer validation, risks and next milestone.", path: "/tools/business-builder" });

export default async function BusinessBuilderPage() {
  const [products, categories] = await Promise.all([repo.products(), repo.categories()]);
  const list = products.map((p) => ({ id: p.id, name: p.name, slug: p.slug, capex: p.capex.value, category: categories.find((c) => c.id === p.categoryId)?.name ?? "" }));
  return (
    <>
      <PageIntro overline="Build your coconut business" title="Capital, market, product - indicative route." lede="The route is chosen from your capital band and market, then checked against the product's indicative CAPEX where one exists. The output explains validation stage, capital allocation, working capital, customer validation, main risks and the next milestone. It never implies a guaranteed return." breadcrumbs={[{ label: "Tools", href: "/tools" }, { label: "Business builder" }]} />
      <Section surface="ivory"><Container><BusinessBuilder products={list} /><div className="mt-10"><Callout tone="warning" title="Discipline">Do not buy machinery until you validate the customer. Do not assume a machine quote represents total project cost.</Callout></div></Container></Section>
    </>
  );
}
