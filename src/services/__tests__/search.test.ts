import { describe, it, expect } from "vitest";
import { search, autocomplete } from "../search";

describe("search", () => {
  it("'shell' surfaces the hard shell, charcoal, activated carbon, powder, processing, machinery, customers-linked entities", async () => {
    const r = await search("shell", { limit: 40 });
    const names = r.map((x) => x.name);
    expect(names).toContain("Hard Shell (Endocarp)");
    expect(names).toContain("Shell Charcoal");
    expect(names).toContain("Activated Carbon");
    expect(names).toContain("Coconut Shell Powder");
    expect(names.some((n) => n.includes("Carbonisation"))).toBe(true);
    expect(r.some((x) => x.type === "machine")).toBe(true);
    expect(r.some((x) => x.type === "opportunity")).toBe(true);
    expect(r[0].score).toBeGreaterThanOrEqual(r[r.length - 1].score);
  });
  it("supports type filters", async () => {
    const r = await search("coconut", { types: ["machine"] });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((x) => x.type === "machine")).toBe(true);
  });
  it("autocomplete returns prefix matches first", async () => {
    const a = await autocomplete("coco");
    expect(a.length).toBeGreaterThan(0);
    expect(a[0].name.toLowerCase().startsWith("coco")).toBe(true);
  });
  it("empty query returns nothing", async () => {
    expect(await search("")).toEqual([]);
  });
});
