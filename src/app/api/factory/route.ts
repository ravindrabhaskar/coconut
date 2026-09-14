import { NextResponse } from "next/server";
import { repo } from "@/services/repository";
import { planFactory, layoutZones, type PlannerChoices } from "@/lib/calc/factoryPlanner";

/** GET /api/factory?model=fsm-dc-1tpd&automation=semi_automatic&shifts=1&location=near_farms&market=B2B */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const models = await repo.scaleModels();
  const model = models.find((m) => m.id === url.searchParams.get("model")) ?? models.find((m) => m.productId === url.searchParams.get("product"));
  if (!model) return NextResponse.json({ error: "unknown model", models: models.map((m) => ({ id: m.id, productId: m.productId })) }, { status: 404 });
  const choices: PlannerChoices = {
    automation: (url.searchParams.get("automation") as PlannerChoices["automation"]) ?? "semi_automatic",
    shifts: (Number(url.searchParams.get("shifts") ?? 1) as 1 | 2 | 3),
    location: (url.searchParams.get("location") as PlannerChoices["location"]) ?? "near_farms",
    targetMarket: (url.searchParams.get("market") as PlannerChoices["targetMarket"]) ?? "B2B",
  };
  const result = planFactory(model, choices);
  return NextResponse.json({ model: model.id, choices, result, layout: layoutZones(result.zones, model.flowSequence), disclaimer: "CONCEPTUAL PLANNING LAYOUT - REQUIRES PROFESSIONAL ENGINEERING VALIDATION" });
}
