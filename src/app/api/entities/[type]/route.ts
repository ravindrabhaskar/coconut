import { NextResponse } from "next/server";
import { repo } from "@/services/repository";

const MAP: Record<string, () => Promise<unknown[]>> = {
  components: repo.components, products: repo.products, processes: repo.processes, machines: repo.machines, customers: repo.customerSegments,
  countries: repo.countries, states: repo.states, regulations: repo.regulations, certifications: repo.certifications, risks: repo.risks,
  opportunities: repo.opportunities, sources: repo.sources, research: repo.research, "factory-models": repo.scaleModels, "mass-balance": repo.massBalanceModels,
  technologies: repo.technologies, "value-chain": repo.valueChain, industries: repo.industries, relationships: repo.relationships, assets: repo.assets,
};

/** GET /api/entities/[type]?slug=... - JSON service layer over the repository. */
export async function GET(req: Request, ctx: { params: Promise<{ type: string }> }) {
  const { type } = await ctx.params;
  const fn = MAP[type];
  if (!fn) return NextResponse.json({ error: "unknown entity type", types: Object.keys(MAP) }, { status: 404 });
  const list = (await fn()) as { slug?: string; id?: string }[];
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const id = url.searchParams.get("id");
  if (slug || id) {
    const e = list.find((x) => (slug && x.slug === slug) || (id && x.id === id));
    return e ? NextResponse.json(e) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ count: list.length, items: list });
}
