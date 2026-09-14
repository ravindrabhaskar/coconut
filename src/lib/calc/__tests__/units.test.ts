import { describe, it, expect } from "vitest";
import { convertMass, convertArea, convertCapacity, convertInr, nutsToKg, kgToNuts, inrToUsd, formatInr } from "../units";

describe("units", () => {
  it("converts mass", () => {
    expect(convertMass(1, "t", "kg")).toBe(1000);
    expect(convertMass(500, "g", "kg")).toBe(0.5);
  });
  it("converts area", () => {
    expect(convertArea(1, "acre", "sqm")).toBeCloseTo(4046.86, 1);
    expect(convertArea(1, "ha", "acre")).toBeCloseTo(2.471, 2);
    expect(convertArea(100, "sqm", "sqft")).toBeCloseTo(1076.39, 1);
  });
  it("converts capacity by working days", () => {
    expect(convertCapacity(1000, "day", "year", 300)).toBe(300000);
    expect(convertCapacity(300000, "year", "day", 300)).toBe(1000);
  });
  it("converts INR denominations", () => {
    expect(convertInr(1, "INR crore", "INR lakh")).toBe(100);
    expect(convertInr(250000, "INR", "INR lakh")).toBe(2.5);
  });
  it("nuts to kg needs explicit nut mass", () => {
    expect(nutsToKg(1000, 1.4)).toBe(1400);
    expect(kgToNuts(1400, 1.4)).toBeCloseTo(1000, 9);
    expect(() => nutsToKg(1, 0)).toThrow();
  });
  it("USD requires explicit rate", () => {
    expect(inrToUsd(8300, 83)).toBe(100);
    expect(() => inrToUsd(100, 0)).toThrow();
  });
  it("formats INR in lakh/crore", () => {
    expect(formatInr(250000)).toBe("₹2.50 L");
    expect(formatInr(25000000)).toBe("₹2.50 Cr");
  });
});
