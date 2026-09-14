/** English chrome strings. Keys are stable ids; other locales override a subset and fall back to these. */
export const en = {
  "nav.explore": "Explore", "nav.products": "Products", "nav.processing": "Processing", "nav.factory": "Factory", "nav.business": "Business",
  "nav.markets": "Markets", "nav.locations": "Locations", "nav.research": "Research", "nav.tools": "Tools", "nav.more": "More", "nav.search": "Search",
  "evidence.VERIFIED_FACT": "Verified", "evidence.SOURCE_BACKED": "Sourced", "evidence.ESTIMATE": "Estimate", "evidence.ASSUMPTION": "Assumption",
  "evidence.CALCULATED": "Calculated", "evidence.EXPERT_JUDGMENT": "Expert judgment", "evidence.RESEARCH_REQUIRED": "Research required",
  "common.readMore": "Read more", "common.researchRequired": "research required", "common.notInvestmentAdvice": "Screening heuristic - not investment advice",
  "scenario.title": "Scenario", "scenario.reset": "Reset scenario",
  "footer.evidenceNote": "Every number carries an evidence label. Unknown values are shown as research required, never invented.",
  "freshness.stale": "Stale - re-verify", "freshness.aging": "Ageing", "freshness.fresh": "Current", "freshness.unknown": "No verification date",
  "a11y.skipToContent": "Skip to content",
} as const;
export type MessageKey = keyof typeof en;
