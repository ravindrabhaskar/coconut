/**
 * Financial model — pure functions, no UI coupling.
 *
 * Every input is an explicit number with a documented unit. Every output declares its formula in
 * FORMULAS so the UI can show "how was this calculated". Nothing is hidden in code.
 *
 * All money in INR. All quantities per month unless stated. Annualisation = ×12.
 */

import type { EvidenceType } from "@/domain/types";

export interface FinancialInputs {
  /** Raw material quantity purchased per month (kg or nuts — must be consistent with rawMaterialCostPerUnit). */
  rawMaterialQtyPerMonth: number;
  /** INR per unit of raw material. */
  rawMaterialCostPerUnit: number;
  /** Finished product output per unit of raw material (kg finished / unit raw). 0..1 typically. */
  yieldRatio: number;
  /** INR per kg of finished product. */
  sellingPricePerKg: number;
  /** Capacity utilisation 0..1 applied to raw material quantity. */
  utilisation: number;
  /** INR per kg finished product. */
  packagingCostPerKg: number;
  /** INR per month. */
  directLabourPerMonth: number;
  powerPerMonth: number;
  waterPerMonth: number;
  fuelPerMonth: number;
  /** INR per kg finished product (outbound transport). */
  transportPerKg: number;
  rentPerMonth: number;
  repairsPerMonth: number;
  qcTestingPerMonth: number;
  marketingPerMonth: number;
  adminPerMonth: number;
  /** Annual interest rate as fraction (e.g. 0.12). */
  interestRate: number;
  /** Debt principal in INR on which interest is charged. */
  debt: number;
  /** Total CAPEX (INR). */
  capex: number;
  /** Depreciation as fraction of CAPEX per year (straight line). */
  depreciationRate: number;
  /** Working-capital cycle inputs (days). */
  customerCreditDays: number;
  supplierCreditDays: number;
  inventoryDays: number;
  /** Corporate tax rate fraction applied to positive EBT. */
  taxRate: number;
  /** Returns / rejections as fraction of revenue. */
  returnsRate: number;
}

export type InputEvidence = Record<keyof FinancialInputs, EvidenceType>;

export interface FinancialOutputs {
  effectiveRawQty: number;
  finishedQtyKg: number;
  revenue: number;
  returns: number;
  netRevenue: number;
  rawMaterialCost: number;
  packagingCost: number;
  transportCost: number;
  directLabour: number;
  utilitiesCost: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  variableCostPerKg: number;
  contribution: number;
  contributionPerKg: number;
  contributionMargin: number;
  fixedCosts: number;
  ebitda: number;
  ebitdaMargin: number;
  depreciation: number;
  ebit: number;
  interest: number;
  ebt: number;
  tax: number;
  netProfit: number;
  netMargin: number;
  operatingCashFlow: number;
  breakEvenQtyKg: number;
  breakEvenRevenue: number;
  breakEvenUtilisation: number;
  workingCapital: number;
  workingCapitalCycleDays: number;
  capitalEmployed: number;
  roi: number;
  roce: number;
  paybackMonths: number;
  annualRevenue: number;
  annualNetProfit: number;
}

export const FORMULAS: Record<keyof FinancialOutputs, string> = {
  effectiveRawQty: "rawMaterialQtyPerMonth × utilisation",
  finishedQtyKg: "effectiveRawQty × yieldRatio",
  revenue: "finishedQtyKg × sellingPricePerKg",
  returns: "revenue × returnsRate",
  netRevenue: "revenue − returns",
  rawMaterialCost: "effectiveRawQty × rawMaterialCostPerUnit",
  packagingCost: "finishedQtyKg × packagingCostPerKg",
  transportCost: "finishedQtyKg × transportPerKg",
  directLabour: "directLabourPerMonth",
  utilitiesCost: "power + water + fuel (per month)",
  cogs: "rawMaterialCost + packagingCost + directLabour + utilitiesCost",
  grossProfit: "netRevenue − cogs",
  grossMargin: "grossProfit ÷ netRevenue",
  variableCostPerKg: "(rawMaterialCost + packagingCost + transportCost + utilitiesCost) ÷ finishedQtyKg",
  contribution: "netRevenue − (rawMaterialCost + packagingCost + transportCost + utilitiesCost)",
  contributionPerKg: "contribution ÷ finishedQtyKg",
  contributionMargin: "contribution ÷ netRevenue",
  fixedCosts: "directLabour + rent + repairs + qcTesting + marketing + admin",
  ebitda: "contribution − fixedCosts",
  ebitdaMargin: "ebitda ÷ netRevenue",
  depreciation: "capex × depreciationRate ÷ 12",
  ebit: "ebitda − depreciation",
  interest: "debt × interestRate ÷ 12",
  ebt: "ebit − interest",
  tax: "max(0, ebt) × taxRate",
  netProfit: "ebt − tax",
  netMargin: "netProfit ÷ netRevenue",
  operatingCashFlow: "netProfit + depreciation",
  breakEvenQtyKg: "(fixedCosts + depreciation + interest) ÷ contributionPerKg",
  breakEvenRevenue: "breakEvenQtyKg × sellingPricePerKg × (1 − returnsRate)",
  breakEvenUtilisation: "breakEvenQtyKg ÷ (rawMaterialQtyPerMonth × yieldRatio)",
  workingCapital:
    "(netRevenue ÷ 30 × customerCreditDays) + (cogs ÷ 30 × inventoryDays) − (rawMaterialCost ÷ 30 × supplierCreditDays)",
  workingCapitalCycleDays: "customerCreditDays + inventoryDays − supplierCreditDays",
  capitalEmployed: "capex + workingCapital",
  roi: "annualNetProfit ÷ capex",
  roce: "(ebit × 12) ÷ capitalEmployed",
  paybackMonths: "capitalEmployed ÷ operatingCashFlow (monthly)",
  annualRevenue: "netRevenue × 12",
  annualNetProfit: "netProfit × 12",
};

const safeDiv = (a: number, b: number) => (b === 0 || !Number.isFinite(b) ? 0 : a / b);

export function validateInputs(i: FinancialInputs): string[] {
  const errs: string[] = [];
  if (i.utilisation < 0 || i.utilisation > 1) errs.push("utilisation must be between 0 and 1");
  if (i.yieldRatio <= 0) errs.push("yieldRatio must be > 0");
  if (i.sellingPricePerKg < 0) errs.push("sellingPricePerKg cannot be negative");
  if (i.rawMaterialQtyPerMonth < 0) errs.push("rawMaterialQtyPerMonth cannot be negative");
  if (i.depreciationRate < 0 || i.depreciationRate > 1) errs.push("depreciationRate must be 0..1");
  if (i.taxRate < 0 || i.taxRate > 1) errs.push("taxRate must be 0..1");
  if (i.returnsRate < 0 || i.returnsRate > 1) errs.push("returnsRate must be 0..1");
  return errs;
}

export function computeFinancials(i: FinancialInputs): FinancialOutputs {
  const effectiveRawQty = i.rawMaterialQtyPerMonth * i.utilisation;
  const finishedQtyKg = effectiveRawQty * i.yieldRatio;
  const revenue = finishedQtyKg * i.sellingPricePerKg;
  const returns = revenue * i.returnsRate;
  const netRevenue = revenue - returns;
  const rawMaterialCost = effectiveRawQty * i.rawMaterialCostPerUnit;
  const packagingCost = finishedQtyKg * i.packagingCostPerKg;
  const transportCost = finishedQtyKg * i.transportPerKg;
  const directLabour = i.directLabourPerMonth;
  const utilitiesCost = i.powerPerMonth + i.waterPerMonth + i.fuelPerMonth;
  const cogs = rawMaterialCost + packagingCost + directLabour + utilitiesCost;
  const grossProfit = netRevenue - cogs;
  const grossMargin = safeDiv(grossProfit, netRevenue);
  const variableTotal = rawMaterialCost + packagingCost + transportCost + utilitiesCost;
  const variableCostPerKg = safeDiv(variableTotal, finishedQtyKg);
  const contribution = netRevenue - variableTotal;
  const contributionPerKg = safeDiv(contribution, finishedQtyKg);
  const contributionMargin = safeDiv(contribution, netRevenue);
  const fixedCosts =
    directLabour + i.rentPerMonth + i.repairsPerMonth + i.qcTestingPerMonth + i.marketingPerMonth + i.adminPerMonth;
  const ebitda = contribution - fixedCosts;
  const ebitdaMargin = safeDiv(ebitda, netRevenue);
  const depreciation = (i.capex * i.depreciationRate) / 12;
  const ebit = ebitda - depreciation;
  const interest = (i.debt * i.interestRate) / 12;
  const ebt = ebit - interest;
  const tax = Math.max(0, ebt) * i.taxRate;
  const netProfit = ebt - tax;
  const netMargin = safeDiv(netProfit, netRevenue);
  const operatingCashFlow = netProfit + depreciation;
  const breakEvenQtyKg = contributionPerKg > 0 ? (fixedCosts + depreciation + interest) / contributionPerKg : Infinity;
  const breakEvenRevenue = Number.isFinite(breakEvenQtyKg) ? breakEvenQtyKg * i.sellingPricePerKg * (1 - i.returnsRate) : Infinity;
  const fullCapacityKg = i.rawMaterialQtyPerMonth * i.yieldRatio;
  const breakEvenUtilisation = Number.isFinite(breakEvenQtyKg) ? safeDiv(breakEvenQtyKg, fullCapacityKg) : Infinity;
  const workingCapital =
    (netRevenue / 30) * i.customerCreditDays + (cogs / 30) * i.inventoryDays - (rawMaterialCost / 30) * i.supplierCreditDays;
  const workingCapitalCycleDays = i.customerCreditDays + i.inventoryDays - i.supplierCreditDays;
  const capitalEmployed = i.capex + Math.max(0, workingCapital);
  const annualRevenue = netRevenue * 12;
  const annualNetProfit = netProfit * 12;
  const roi = safeDiv(annualNetProfit, i.capex);
  const roce = safeDiv(ebit * 12, capitalEmployed);
  const paybackMonths = operatingCashFlow > 0 ? capitalEmployed / operatingCashFlow : Infinity;

  return {
    effectiveRawQty, finishedQtyKg, revenue, returns, netRevenue, rawMaterialCost, packagingCost, transportCost,
    directLabour, utilitiesCost, cogs, grossProfit, grossMargin, variableCostPerKg, contribution, contributionPerKg,
    contributionMargin, fixedCosts, ebitda, ebitdaMargin, depreciation, ebit, interest, ebt, tax, netProfit, netMargin,
    operatingCashFlow, breakEvenQtyKg, breakEvenRevenue, breakEvenUtilisation, workingCapital, workingCapitalCycleDays,
    capitalEmployed, roi, roce, paybackMonths, annualRevenue, annualNetProfit,
  };
}

/** Waterfall from selling price to actual economics (per kg). */
export function priceToEconomicsWaterfall(i: FinancialInputs, o: FinancialOutputs) {
  const kg = o.finishedQtyKg || 1;
  const rows = [
    { label: "Selling price", value: i.sellingPricePerKg, kind: "start" as const },
    { label: "Raw material", value: -safeDiv(o.rawMaterialCost, kg), kind: "cost" as const },
    { label: "Processing (labour + utilities)", value: -safeDiv(o.directLabour + o.utilitiesCost, kg), kind: "cost" as const },
    { label: "Testing / QC", value: -safeDiv(i.qcTestingPerMonth, kg), kind: "cost" as const },
    { label: "Packaging", value: -i.packagingCostPerKg, kind: "cost" as const },
    { label: "Logistics", value: -i.transportPerKg, kind: "cost" as const },
    { label: "Marketing", value: -safeDiv(i.marketingPerMonth, kg), kind: "cost" as const },
    { label: "Admin + rent + repairs", value: -safeDiv(i.adminPerMonth + i.rentPerMonth + i.repairsPerMonth, kg), kind: "cost" as const },
    { label: "Returns", value: -safeDiv(o.returns, kg), kind: "cost" as const },
    { label: "Interest + depreciation", value: -safeDiv(o.interest + o.depreciation, kg), kind: "cost" as const },
  ];
  const end = rows.reduce((s, r) => s + r.value, 0);
  return { rows, netPerKg: end };
}

export type Scenario = "conservative" | "base" | "aggressive";

/** Apply scenario multipliers transparently (documented, editable). */
export const SCENARIO_MULTIPLIERS: Record<Scenario, Partial<Record<keyof FinancialInputs, number>>> = {
  conservative: { sellingPricePerKg: 0.9, utilisation: 0.8, yieldRatio: 0.95, rawMaterialCostPerUnit: 1.1 },
  base: {},
  aggressive: { sellingPricePerKg: 1.08, utilisation: 1.1, yieldRatio: 1.03, rawMaterialCostPerUnit: 0.95 },
};

export function applyScenario(base: FinancialInputs, s: Scenario): FinancialInputs {
  const out = { ...base };
  for (const [k, m] of Object.entries(SCENARIO_MULTIPLIERS[s])) {
    const key = k as keyof FinancialInputs;
    out[key] = Math.min(key === "utilisation" ? 1 : Infinity, base[key] * (m as number));
  }
  return out;
}
