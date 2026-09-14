// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
afterEach(cleanup);
import { EvidenceBadge, Qty } from "../evidence";
import { formatQuantity } from "@/lib/format";
import { sources } from "@/data/sources";

describe("EvidenceBadge", () => {
  it("renders label text (never colour-only) and opens provenance popover with formula and source", () => {
    render(<EvidenceBadge q={{ value: 0.3, min: 0.25, max: 0.35, unit: "kg/kg", evidence: "ESTIMATE", basis: "kg DC per kg kernel", formula: "dry mass / wet mass", researchedAt: "2026-09-14", sourceIds: ["src-cdb"], notes: "Verify at pilot." }} sources={sources} />);
    const btn = screen.getByRole("button");
    expect(btn.textContent).toContain("ESTIMATE");
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(btn);
    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain("Estimate");
    expect(dialog.textContent).toContain("dry mass / wet mass");
    expect(dialog.textContent).toContain("Coconut Development Board");
    expect(dialog.textContent).toContain("Verify at pilot.");
    expect(dialog.textContent).toContain("Not yet verified");
  });
  it("research-required renders without a value and explains the gap", () => {
    render(<Qty q={{ unit: "INR", evidence: "RESEARCH_REQUIRED", notes: "RESEARCH REQUIRED - CURRENT SUPPLIER QUOTATION." }} />);
    expect(screen.getByText("—")).toBeTruthy();
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("dialog").textContent).toContain("SUPPLIER QUOTATION");
  });
  it("closes on Escape", () => {
    render(<EvidenceBadge q={{ value: 1, unit: "kg", evidence: "ASSUMPTION" }} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryByRole("dialog")).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("formatQuantity", () => {
  it("formats ranges, percentages and INR", () => {
    expect(formatQuantity({ value: 0.3, min: 0.25, max: 0.35, unit: "%", evidence: "ESTIMATE" })).toBe("25–35%");
    expect(formatQuantity({ value: 250000, unit: "INR", evidence: "ASSUMPTION" })).toBe("₹2.50 L");
    expect(formatQuantity({ unit: "kg", evidence: "RESEARCH_REQUIRED" })).toBe("Research required");
    expect(formatQuantity({ value: 1000, unit: "kg/day", evidence: "ASSUMPTION" })).toBe("1,000 kg/day");
  });
});
