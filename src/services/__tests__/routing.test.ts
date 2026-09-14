import { describe, it, expect } from "vitest";
import { hrefFor, repo } from "../repository";
import { relatedFor, siblings } from "../related";
import sitemap from "@/app/sitemap";

describe("routing", () => {
  it("maps entity types to clean URLs", () => {
    expect(hrefFor("component", "hard-shell")).toBe("/explore/hard-shell");
    expect(hrefFor("product", "activated-carbon")).toBe("/products/activated-carbon");
    expect(hrefFor("machine", "rotary-activation-kiln")).toBe("/machinery/rotary-activation-kiln");
    expect(hrefFor("process", "steam-activation")).toBe("/processing/steam-activation");
    expect(hrefFor("country", "netherlands")).toBe("/export/netherlands");
  });
  it("sitemap contains every component, product, build, process, machine and research page", async () => {
    const urls = (await sitemap()).map((u) => u.url);
    for (const p of await repo.products()) { expect(urls.some((u) => u.endsWith(`/products/${p.slug}`))).toBe(true); expect(urls.some((u) => u.endsWith(`/build/${p.slug}`))).toBe(true); }
    for (const c of await repo.components()) expect(urls.some((u) => u.endsWith(`/explore/${c.slug}`))).toBe(true);
    for (const m of await repo.machines()) expect(urls.some((u) => u.endsWith(`/machinery/${m.slug}`))).toBe(true);
    expect(new Set(urls).size).toBe(urls.length);
  });
  it("related entities are derived from the graph (never hard-coded)", async () => {
    const groups = await relatedFor("product", "prd-activated-carbon");
    const labels = groups.map((g) => g.label);
    expect(labels).toContain("Related Components");
    expect(labels).toContain("Related Machinery");
    expect(labels).toContain("Related Customers");
    expect(labels).toContain("Related Export Markets");
    expect(groups.find((g) => g.label === "Related Components")!.items.some((i) => i.href === "/explore/hard-shell")).toBe(true);
  });
  it("component siblings give prev/next navigation", async () => {
    const s = await siblings("component", "fibrous-husk");
    expect(s.prev?.href).toBe("/explore/outer-husk");
    expect(s.next?.href).toBe("/explore/hard-shell");
  });
});
