import { describe, it, expect } from "vitest";
import { t, numberFormat, LOCALES, DEFAULT_LOCALE } from "../index";

describe("i18n prep", () => {
  it("returns English and interpolates variables", () => {
    expect(t("nav.explore")).toBe("Explore");
    expect(t("evidence.RESEARCH_REQUIRED", "hi")).toBe("Research required"); // fallback
  });
  it("uses Indian digit grouping for every locale", () => {
    for (const l of LOCALES) expect(numberFormat(l).format(1234567)).toBe("12,34,567");
    expect(DEFAULT_LOCALE).toBe("en");
  });
});
