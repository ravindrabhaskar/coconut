import { describe, it, expect } from "vitest";
import { computeFinancials, validateInputs, applyScenario, priceToEconomicsWaterfall, type FinancialInputs } from "../finance";

const base: FinancialInputs = {
  rawMaterialQtyPerMonth: 10000, rawMaterialCostPerUnit: 20, yieldRatio: 0.5, sellingPricePerKg: 100, utilisation: 1,
  packagingCostPerKg: 5, directLabourPerMonth: 50000, powerPerMonth: 10000, waterPerMonth: 2000, fuelPerMonth: 8000, transportPerKg: 2,
  rentPerMonth: 20000, repairsPerMonth: 5000, qcTestingPerMonth: 5000, marketingPerMonth: 10000, adminPerMonth: 10000, interestRate: 0.12, debt: 1000000,
  capex: 2000000, depreciationRate: 0.1, customerCreditDays: 30, supplierCreditDays: 0, inventoryDays: 15, taxRate: 0.25, returnsRate: 0.01,
};

describe("finance", () => {
  it("computes revenue and cogs from documented formulas", () => {
    const o = computeFinancials(base);
    expect(o.finishedQtyKg).toBe(5000);
    expect(o.revenue).toBe(500000);
    expect(o.returns).toBe(5000);
    expect(o.netRevenue).toBe(495000);
    expect(o.rawMaterialCost).toBe(200000);
    expect(o.packagingCost).toBe(25000);
    expect(o.utilitiesCost).toBe(20000);
    expect(o.cogs).toBe(200000 + 25000 + 50000 + 20000);
    expect(o.grossProfit).toBe(495000 - 295000);
  });
  it("computes contribution, ebitda, net profit and break-even consistently", () => {
    const o = computeFinancials(base);
    const variable = 200000 + 25000 + 10000 + 20000;
    expect(o.contribution).toBe(495000 - variable);
    expect(o.fixedCosts).toBe(50000 + 20000 + 5000 + 5000 + 10000 + 10000);
    expect(o.ebitda).toBe(o.contribution - o.fixedCosts);
    expect(o.depreciation).toBeCloseTo((2000000 * 0.1) / 12, 6);
    expect(o.interest).toBeCloseTo(10000, 6);
    expect(o.netProfit).toBeCloseTo(o.ebt - Math.max(0, o.ebt) * 0.25, 6);
    expect(o.breakEvenQtyKg * o.contributionPerKg).toBeCloseTo(o.fixedCosts + o.depreciation + o.interest, 3);
    expect(o.breakEvenUtilisation).toBeLessThan(1);
  });
  it("working capital cycle uses credit/inventory days", () => {
    const o = computeFinancials(base);
    expect(o.workingCapitalCycleDays).toBe(45);
    expect(o.workingCapital).toBeCloseTo((495000 / 30) * 30 + (o.cogs / 30) * 15, 3);
  });
  it("returns Infinity break-even when contribution is non-positive", () => {
    const o = computeFinancials({ ...base, sellingPricePerKg: 10 });
    expect(o.breakEvenQtyKg).toBe(Infinity);
    expect(o.paybackMonths).toBe(Infinity);
  });
  it("validates inputs", () => {
    expect(validateInputs(base)).toEqual([]);
    expect(validateInputs({ ...base, utilisation: 1.5 }).length).toBe(1);
  });
  it("applies scenario multipliers and caps utilisation at 1", () => {
    const c = applyScenario(base, "conservative");
    expect(c.sellingPricePerKg).toBeCloseTo(90);
    const a = applyScenario({ ...base, utilisation: 0.95 }, "aggressive");
    expect(a.utilisation).toBe(1);
  });
  it("waterfall from price to net per kg sums to net", () => {
    const o = computeFinancials(base);
    const w = priceToEconomicsWaterfall(base, o);
    const sum = w.rows.reduce((s, r) => s + r.value, 0);
    expect(w.netPerKg).toBeCloseTo(sum, 6);
    expect(w.rows[0].value).toBe(100);
  });
});
