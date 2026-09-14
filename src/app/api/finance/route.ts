import { NextResponse } from "next/server";
import { computeFinancials, validateInputs, applyScenario, priceToEconomicsWaterfall, FORMULAS, type FinancialInputs, type Scenario } from "@/lib/calc/finance";

/** POST /api/finance { inputs: FinancialInputs, scenario?: Scenario } */
export async function POST(req: Request) {
  const body = (await req.json()) as { inputs: FinancialInputs; scenario?: Scenario };
  const errors = validateInputs(body.inputs);
  if (errors.length) return NextResponse.json({ errors }, { status: 400 });
  const inputs = applyScenario(body.inputs, body.scenario ?? "base");
  const outputs = computeFinancials(inputs);
  return NextResponse.json({ inputs, outputs, waterfall: priceToEconomicsWaterfall(inputs, outputs), formulas: FORMULAS, evidence: "CALCULATED" });
}
