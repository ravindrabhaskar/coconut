import { NextResponse } from "next/server";
import { repo } from "@/services/repository";
import { computeMassBalance, validateModel } from "@/lib/calc/massBalance";

/** GET /api/mass-balance?model=mb-mature-whole&nuts=1000 | &kg=1400 ; optional &o.<stageId>=fraction overrides */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const models = await repo.massBalanceModels();
  const model = models.find((m) => m.id === (url.searchParams.get("model") ?? models[0].id));
  if (!model) return NextResponse.json({ error: "unknown model", models: models.map((m) => m.id) }, { status: 404 });
  const nuts = url.searchParams.get("nuts"); const kg = url.searchParams.get("kg");
  const overrides: Record<string, number> = {};
  url.searchParams.forEach((v, k) => { if (k.startsWith("o.")) overrides[k.slice(2)] = Number(v); });
  try {
    const summary = computeMassBalance(model, nuts ? { nuts: Number(nuts) } : { kg: Number(kg ?? 1000) }, overrides);
    return NextResponse.json({ model: model.id, issues: validateModel(model, 0.05), ...summary });
  } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 400 }); }
}
