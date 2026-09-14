/**
 * Research-Gap Engine — computes field-level evidence coverage per entity.
 * Pure functions over domain objects; no data-source coupling.
 */

import type { Component, Product, Quantity, FieldStatus, EvidenceType } from "@/domain/types";

export interface FieldGap {
  field: string;
  status: FieldStatus;
  evidence?: EvidenceType;
  needs?: "supplier_quotation" | "field_validation" | "citation" | "measurement" | "verification" | "none";
  note?: string;
  lastVerifiedAt?: string;
}

export interface GapReport {
  entityId: string;
  entityName: string;
  entityType: "product" | "component";
  fields: FieldGap[];
  missingCount: number;
  coveragePct: number; // fields not RESEARCH_REQUIRED / total
  verifiedPct: number; // VERIFIED / total
  sourcedPct: number;  // VERIFIED + SOURCE_BACKED / total
  expertReviewed: boolean;
  lastResearchedAt?: string;
  contentStatus: "PAGE_IMPLEMENTED" | "DATA_PARTIALLY_POPULATED" | "DATA_VERIFIED" | "RESEARCH_REQUIRED";
  requiringQuotation: string[];
  requiringFieldValidation: string[];
  requiringUpdate: string[];
}

const statusOf = (q: Quantity | undefined): FieldStatus => {
  if (!q || q.evidence === "RESEARCH_REQUIRED" || q.value === undefined) return "RESEARCH_REQUIRED";
  if (q.evidence === "VERIFIED_FACT") return "VERIFIED";
  if (q.evidence === "SOURCE_BACKED") return "SOURCE_BACKED";
  if (q.evidence === "ESTIMATE" || q.evidence === "CALCULATED") return "ESTIMATE";
  return "PARTIALLY_VERIFIED";
};

const needsOf = (field: string, q: Quantity | undefined): FieldGap["needs"] => {
  if (statusOf(q) !== "RESEARCH_REQUIRED") return q?.evidence === "VERIFIED_FACT" ? "none" : q?.evidence === "SOURCE_BACKED" ? "verification" : "citation";
  const f = field.toLowerCase();
  if (f.includes("capex") || f.includes("machine") || f.includes("quotation")) return "supplier_quotation";
  if (f.includes("price") || f.includes("selling") || f.includes("demand") || f.includes("customer")) return "field_validation";
  if (f.includes("power") || f.includes("water") || f.includes("yield") || f.includes("steam") || f.includes("fuel")) return "measurement";
  return "citation";
};

const gap = (field: string, q: Quantity | undefined, note?: string): FieldGap => ({ field, status: statusOf(q), evidence: q?.evidence, needs: needsOf(field, q), note: note ?? q?.notes, lastVerifiedAt: q?.lastVerifiedAt });

const listGap = (field: string, arr: unknown[], needs: FieldGap["needs"] = "field_validation"): FieldGap => ({ field, status: arr.length ? "PARTIALLY_VERIFIED" : "RESEARCH_REQUIRED", needs: arr.length ? "none" : needs });

const finish = (entityId: string, entityName: string, entityType: GapReport["entityType"], fields: FieldGap[], dates: (string | undefined)[], reviews: { outcome: string }[] = []): GapReport => {
  const missing = fields.filter((f) => f.status === "RESEARCH_REQUIRED").length;
  const verified = fields.filter((f) => f.status === "VERIFIED").length;
  const sourced = fields.filter((f) => f.status === "VERIFIED" || f.status === "SOURCE_BACKED").length;
  const total = fields.length || 1;
  const coveragePct = Math.round(((total - missing) / total) * 100);
  const verifiedPct = Math.round((verified / total) * 100);
  const sourcedPct = Math.round((sourced / total) * 100);
  const expertReviewed = reviews.some((r) => r.outcome === "approved" || r.outcome === "approved_with_notes");
  // DATA_VERIFIED requires both a high verified share AND at least one approving expert review - never decorative.
  const contentStatus: GapReport["contentStatus"] = verifiedPct >= 70 && expertReviewed ? "DATA_VERIFIED" : coveragePct >= 40 ? "DATA_PARTIALLY_POPULATED" : coveragePct > 0 ? "PAGE_IMPLEMENTED" : "RESEARCH_REQUIRED";
  const lastResearchedAt = dates.filter(Boolean).sort().at(-1);
  return {
    entityId, entityName, entityType, fields, missingCount: missing, coveragePct, verifiedPct, sourcedPct, expertReviewed, lastResearchedAt, contentStatus,
    requiringQuotation: fields.filter((f) => f.needs === "supplier_quotation").map((f) => f.field),
    requiringFieldValidation: fields.filter((f) => f.needs === "field_validation").map((f) => f.field),
    requiringUpdate: fields.filter((f) => f.status !== "VERIFIED" && f.status !== "RESEARCH_REQUIRED").map((f) => f.field),
  };
};

export function productGapReport(p: Product): GapReport {
  const fields: FieldGap[] = [
    { field: "Process", status: p.processIds.length ? "PARTIALLY_VERIFIED" : "RESEARCH_REQUIRED", needs: "none" },
    { field: "Machinery", status: p.machineIds.length ? "PARTIALLY_VERIFIED" : "RESEARCH_REQUIRED", needs: "supplier_quotation", note: "Machine list exists; quotations required" },
    gap("Yield", p.yieldQuantities[0]),
    gap("Power", p.utilities.power),
    gap("Water", p.utilities.water),
    gap("Manpower", p.manpower),
    gap("Land", p.land),
    gap("Building", p.building),
    gap("CAPEX (current machinery quotation)", p.capex),
    gap("Working capital", p.workingCapital),
    gap("Selling price", p.pricing[0]),
    gap("Shelf life", p.shelfLife),
    listGap("Quality parameters", p.qualityParameters, "citation"),
    listGap("Customers", p.customers),
    listGap("Export markets", p.exportCountryIds, "field_validation"),
    listGap("Regulations", p.regulationIds, "citation"),
    listGap("Certifications", p.certificationIds, "citation"),
    listGap("Risks", p.risks, "field_validation"),
    listGap("Cost structure", p.costStructure.filter((c) => c.quantity.value !== undefined), "field_validation"),
    { field: "Export demand", status: p.exportCountryIds.length ? "PARTIALLY_VERIFIED" : "RESEARCH_REQUIRED", needs: "field_validation" },
  ];
  // quality parameters: verified if any VERIFIED
  const qp = p.qualityParameters.map((x) => x.quantity);
  if (qp.some((x) => x.evidence === "VERIFIED_FACT")) fields.find((f) => f.field === "Quality parameters")!.status = "VERIFIED";
  else if (qp.some((x) => x.evidence === "SOURCE_BACKED")) fields.find((f) => f.field === "Quality parameters")!.status = "SOURCE_BACKED";
  return finish(p.id, p.name, "product", fields, [...p.yieldQuantities, p.capex, p.manpower, p.utilities.power, ...qp].map((x) => x?.researchedAt), p.reviews);
}

export function componentGapReport(c: Component): GapReport {
  const fields: FieldGap[] = [
    gap("Mass share of nut", c.massShare),
    ...c.composition.map((x) => gap(`Composition — ${x.parameter}`, x.quantity)),
    listGap("Separation method", c.separationMethod, "citation"),
    listGap("Primary outputs", c.primaryOutputProductIds, "none"),
    listGap("Customer types", c.customerTypes),
    listGap("India context", c.indiaContext, "citation"),
    listGap("International context", c.internationalContext, "citation"),
    listGap("Quality requirements", c.qualityRequirements, "citation"),
  ];
  return finish(c.id, c.name, "component", fields, [c.massShare?.researchedAt, ...c.composition.map((x) => x.quantity.researchedAt)], c.reviews);
}

export function aggregateCoverage(reports: GapReport[]) {
  const total = reports.reduce((s, r) => s + r.fields.length, 0) || 1;
  const missing = reports.reduce((s, r) => s + r.missingCount, 0);
  const verified = reports.reduce((s, r) => s + r.fields.filter((f) => f.status === "VERIFIED").length, 0);
  const sourced = reports.reduce((s, r) => s + r.fields.filter((f) => f.status === "SOURCE_BACKED").length, 0);
  return { totalFields: total, missing, verified, sourced, coveragePct: Math.round(((total - missing) / total) * 100), verifiedPct: Math.round((verified / total) * 100), sourcedPct: Math.round(((verified + sourced) / total) * 100) };
}
