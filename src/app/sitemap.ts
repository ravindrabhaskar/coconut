import type { MetadataRoute } from "next";
import { repo } from "@/services/repository";
import { SITE } from "@/lib/seo/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [components, products, processes, machines, customers, countries, states, opportunities, research, sources, industries, categories] = await Promise.all([
    repo.components(), repo.products(), repo.processes(), repo.machines(), repo.customerSegments(), repo.countries(), repo.states(), repo.opportunities(), repo.research(), repo.sources(), repo.industries(), repo.categories(),
  ]);
  const u = (path: string, priority = 0.6, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly", lastModified?: string) => ({ url: `${SITE.url}${path}`, lastModified: lastModified ? new Date(lastModified) : new Date(), changeFrequency, priority });
  return [
    u("/", 1, "weekly"), u("/explore", 0.9, "weekly"), u("/products", 0.9, "weekly"), u("/factory", 0.8), u("/machinery", 0.8), u("/build", 0.8), u("/opportunities", 0.8), u("/tools/compare", 0.6), u("/value-chain", 0.7), u("/zero-waste", 0.7),
    u("/export", 0.7), u("/india", 0.7), u("/hyderabad", 0.6), u("/customers", 0.6), u("/industries", 0.6), u("/research", 0.7), u("/research/gaps", 0.5), u("/sources", 0.5), u("/technology", 0.6), u("/sustainability", 0.6),
    u("/field-validation", 0.5), u("/90-day-plan", 0.6), u("/roadmap", 0.6), u("/methodology", 0.6), u("/about", 0.4), u("/processing", 0.7), u("/tools/factory-planner", 0.7), u("/tools/mass-balance", 0.7), u("/tools/financial-model", 0.7), u("/tools/land-calculator", 0.5), u("/tools/manpower", 0.5), u("/tools/opportunity-finder", 0.6), u("/tools/business-builder", 0.6), u("/tools/location-finder", 0.6),
    ...components.map((c) => u(`/explore/${c.slug}`, 0.9, "monthly", c.updatedAt)),
    ...products.map((p) => u(`/products/${p.slug}`, 0.9, "monthly", p.updatedAt)),
    ...products.map((p) => u(`/build/${p.slug}`, 0.7, "monthly", p.updatedAt)),
    ...categories.map((c) => u(`/products/category/${c.slug}`, 0.6)),
    ...processes.map((p) => u(`/processing/${p.slug}`, 0.7, "monthly", p.updatedAt)),
    ...machines.map((m) => u(`/machinery/${m.slug}`, 0.6, "monthly", m.updatedAt)),
    ...customers.map((c) => u(`/customers/${c.slug}`, 0.5)),
    ...countries.filter((c) => c.productIds.length).map((c) => u(`/export/${c.slug}`, 0.5)),
    ...states.map((s) => u(`/india/${s.slug}`, 0.5)),
    ...opportunities.map((o) => u(`/opportunities/${o.slug}`, 0.6)),
    ...research.map((r) => u(`/research/${r.slug}`, 0.6, "monthly", r.updatedAt)),
    ...sources.map((s) => u(`/sources/${s.slug}`, 0.3)),
    ...industries.map((i) => u(`/industries/${i.slug}`, 0.5)),
  ];
}
