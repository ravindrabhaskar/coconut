import { NextResponse } from "next/server";
import { repo } from "@/services/repository";
import { scoreOpportunity, matchOpportunity, recommendRoute, type FinderProfile } from "@/lib/calc/scoring";

/** GET /api/score -> all opportunity scores. POST { profile: FinderProfile } -> finder matches. POST { capital, market, productId } -> route. */
export async function GET() {
  const opps = await repo.opportunities();
  return NextResponse.json({ scores: opps.map((o) => ({ id: o.id, slug: o.slug, name: o.name, ...scoreOpportunity(o) })), note: "Strategic screening heuristic - not investment advice" });
}

export async function POST(req: Request) {
  const body = (await req.json()) as { profile?: FinderProfile; capital?: number; market?: "B2B" | "B2C" | "Export" | "Hybrid"; productId?: string };
  const [opps, industries, products] = await Promise.all([repo.opportunities(), repo.industries(), repo.products()]);
  if (body.profile) {
    const kind = (id: string): "food" | "industrial" | "other" => (["ind-food", "ind-beverage", "ind-wellness", "ind-consumer"].includes(id) ? "food" : ["ind-industrial", "ind-coir", "ind-horticulture", "ind-waste-to-value"].includes(id) ? "industrial" : "other");
    void industries;
    return NextResponse.json({ matches: opps.map((o) => matchOpportunity(o, body.profile!, kind(o.industryId))).sort((a, b) => b.fit - a.fit) });
  }
  if (body.capital && body.market) {
    const p = products.find((x) => x.id === body.productId);
    return NextResponse.json(recommendRoute(body.capital, body.market, p?.capex.value));
  }
  return NextResponse.json({ error: "provide profile or capital+market" }, { status: 400 });
}
