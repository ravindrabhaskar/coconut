/**
 * Unit conversion utilities. All conversions are explicit; mismatched dimensions throw.
 * Formulas documented inline. Never convert display strings — only typed numbers.
 */

export type MassUnit = "g" | "kg" | "t";
export type VolumeUnit = "ml" | "l" | "kL";
export type AreaUnit = "sqft" | "sqm" | "acre" | "ha";
export type EnergyUnit = "kWh" | "MWh";
export type CurrencyUnit = "INR" | "USD" | "INR lakh" | "INR crore";
export type TimeBasis = "day" | "month" | "year";

const MASS_TO_KG: Record<MassUnit, number> = { g: 0.001, kg: 1, t: 1000 };
const VOL_TO_L: Record<VolumeUnit, number> = { ml: 0.001, l: 1, kL: 1000 };
const AREA_TO_SQM: Record<AreaUnit, number> = {
  sqm: 1,
  sqft: 0.09290304, // 1 sqft = 0.09290304 m²
  acre: 4046.8564224, // 1 acre = 4046.8564224 m²
  ha: 10000,
};
const ENERGY_TO_KWH: Record<EnergyUnit, number> = { kWh: 1, MWh: 1000 };
const INR_MULT: Record<Exclude<CurrencyUnit, "USD">, number> = { INR: 1, "INR lakh": 100_000, "INR crore": 10_000_000 };

export function convertMass(value: number, from: MassUnit, to: MassUnit): number {
  return (value * MASS_TO_KG[from]) / MASS_TO_KG[to];
}
export function convertVolume(value: number, from: VolumeUnit, to: VolumeUnit): number {
  return (value * VOL_TO_L[from]) / VOL_TO_L[to];
}
export function convertArea(value: number, from: AreaUnit, to: AreaUnit): number {
  return (value * AREA_TO_SQM[from]) / AREA_TO_SQM[to];
}
export function convertEnergy(value: number, from: EnergyUnit, to: EnergyUnit): number {
  return (value * ENERGY_TO_KWH[from]) / ENERGY_TO_KWH[to];
}
/** INR denominations. USD requires an explicit rate — never assumed. */
export function convertInr(value: number, from: Exclude<CurrencyUnit, "USD">, to: Exclude<CurrencyUnit, "USD">): number {
  return (value * INR_MULT[from]) / INR_MULT[to];
}
export function inrToUsd(inr: number, usdPerInrRate: number): number {
  if (usdPerInrRate <= 0) throw new Error("USD/INR rate must be positive and supplied explicitly");
  return inr / usdPerInrRate;
}

/** Capacity per day/month/year. workingDays documented as an assumption. */
export function convertCapacity(value: number, from: TimeBasis, to: TimeBasis, workingDaysPerYear = 300): number {
  const perDay = from === "day" ? value : from === "month" ? value / (workingDaysPerYear / 12) : value / workingDaysPerYear;
  return to === "day" ? perDay : to === "month" ? perDay * (workingDaysPerYear / 12) : perDay * workingDaysPerYear;
}

/** Nuts ↔ kg using an explicit average nut mass (kg/nut). */
export function nutsToKg(nuts: number, avgNutMassKg: number): number {
  if (avgNutMassKg <= 0) throw new Error("avgNutMassKg must be positive");
  return nuts * avgNutMassKg;
}
export function kgToNuts(kg: number, avgNutMassKg: number): number {
  if (avgNutMassKg <= 0) throw new Error("avgNutMassKg must be positive");
  return kg / avgNutMassKg;
}

export function formatNumber(n: number | undefined, opts: { digits?: number; compact?: boolean } = {}): string {
  if (n === undefined || Number.isNaN(n)) return "—";
  const { digits = 0, compact = false } = opts;
  if (compact && Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (compact && Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(n);
}

/** Indian currency formatting with lakh/crore when large. */
export function formatInr(n: number | undefined, opts: { compact?: boolean } = {}): string {
  if (n === undefined || Number.isNaN(n)) return "—";
  const { compact = true } = opts;
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (compact && abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)} Cr`;
  if (compact && abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)} L`;
  return `${sign}₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(abs)}`;
}
