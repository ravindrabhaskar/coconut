/**
 * Domain types for the Coconut Industry Knowledge Graph.
 *
 * Every entity extends BaseEntity. Every number that matters is a Quantity with
 * explicit unit + evidence. A Quantity without a value renders as RESEARCH REQUIRED.
 */

export type ISODate = string; // YYYY-MM-DD

/**
 * Evidence states, strongest first:
 *  VERIFIED_FACT     — sourced from an authoritative document AND independently checked (section + date + verifier)
 *  SOURCE_BACKED     — an authoritative source is attached but the exact figure/section has not been re-verified
 *  ESTIMATE          — literature/practitioner range without a specific citable figure
 *  ASSUMPTION        — a modelling input chosen for a calculation (always editable)
 *  CALCULATED        — derived by a stated formula
 *  EXPERT_JUDGMENT   — platform team assessment
 *  RESEARCH_REQUIRED — no reliable value held
 */
export type EvidenceType =
  | "VERIFIED_FACT"
  | "SOURCE_BACKED"
  | "ESTIMATE"
  | "ASSUMPTION"
  | "CALCULATED"
  | "EXPERT_JUDGMENT"
  | "RESEARCH_REQUIRED";

export type Confidence = "low" | "medium" | "high";

export type Unit =
  | "kg" | "t" | "g" | "l" | "ml" | "nuts" | "kWh" | "kW" | "HP" | "sqft" | "sqm" | "acre" | "ha"
  | "INR" | "USD" | "INR/kg" | "USD/kg" | "INR/t" | "USD/t" | "INR/l" | "INR/nut" | "INR/unit"
  | "%" | "days" | "months" | "years" | "hours" | "kg/h" | "kg/day" | "t/day" | "l/day" | "nuts/day" | "nuts/h"
  | "kL/day" | "kg/batch" | "°C" | "mm" | "mesh" | "persons" | "count" | "ratio" | "kg/kg" | "l/kg" | "kWh/kg"
  | "kWh/t" | "m3/day" | "kg/m2" | "USD million" | "INR crore" | "INR lakh" | "million nuts" | "million t" | "MW"
  | "bar" | "kcal/kg" | "kg/nut" | "l/unit" | "text";

export type Currency = "INR" | "USD";

export interface Quantity {
  value?: number;
  unit: Unit;
  min?: number;
  max?: number;
  currency?: Currency;
  geography?: string;
  scale?: string;
  basis?: string;
  evidence: EvidenceType;
  sourceIds?: string[];
  publishedAt?: ISODate;
  researchedAt?: ISODate;
  lastVerifiedAt?: ISODate;
  formula?: string;
  notes?: string;
  confidence?: Confidence;
  year?: number;
  label?: string;
  /** Person/role who verified the value (required for VERIFIED_FACT). */
  verifiedBy?: string;
  /** Last editorial review date (may differ from lastVerifiedAt). */
  reviewedAt?: ISODate;
  /** Freshness class used by staleness rules (see lib/freshness.ts). */
  dataKind?: DataKind;
}

/** Data kinds drive staleness thresholds: prices go stale fast, standards slowly. */
export type DataKind = "price" | "statistic" | "quotation" | "scheme" | "regulation" | "composition" | "engineering" | "market" | "other";

export interface ExpertReview {
  reviewer: string;
  role: string;
  organisation?: string;
  date: ISODate;
  scope: string; // e.g. "process & yields", "whole entity"
  outcome: "approved" | "approved_with_notes" | "changes_requested";
  notes?: string;
}

export type EntityStatus = "draft" | "published" | "archived";

export type EntityType =
  | "component" | "product" | "product_category" | "industry" | "process" | "process_step" | "machine"
  | "raw_material" | "factory_zone" | "factory_scale_model" | "supplier_category" | "customer_segment"
  | "market" | "country" | "state" | "location" | "export_record" | "regulation" | "certification"
  | "quality_parameter" | "packaging" | "storage_requirement" | "utility" | "manpower_role"
  | "financial_model" | "financial_assumption" | "mass_balance_model" | "risk" | "opportunity"
  | "opportunity_score" | "competitor" | "source" | "evidence_record" | "research_document"
  | "research_note" | "visual_asset" | "field_interview" | "roadmap_task" | "technology" | "value_chain_node"
  | "business_level" | "machine_quotation" | "government_scheme" | "price_record";

export interface BaseEntity {
  id: string;
  name: string;
  slug: string;
  summary: string;
  status: EntityStatus;
  createdAt: ISODate;
  updatedAt: ISODate;
  lastVerifiedAt?: ISODate;
  /** Named expert sign-offs. The DATA VERIFIED / EXPERT REVIEWED badges require these — never decorative. */
  reviews?: ExpertReview[];
}

/** A block of long-form content, optionally with a minimum depth level. */
export type Depth = "understand" | "business" | "industrial";

export interface ContentBlock {
  heading: string;
  depth?: Depth;
  /** Markdown-ish paragraphs (plain paragraphs, '- ' lists supported). */
  body: string[];
  quantities?: Quantity[];
  sourceIds?: string[];
  status?: FieldStatus;
}

export type FieldStatus = "VERIFIED" | "SOURCE_BACKED" | "PARTIALLY_VERIFIED" | "ESTIMATE" | "RESEARCH_REQUIRED";

// ---------------------------------------------------------------------------
// Sources & evidence
// ---------------------------------------------------------------------------

export type SourceType =
  | "government" | "statutory_board" | "research_institution" | "university" | "peer_reviewed" | "company_report"
  | "technical_publication" | "supplier_specification" | "industry_database" | "international_body" | "standard"
  | "field_interview" | "internal_analysis";

export type EvidenceStrength = "strong" | "moderate" | "weak" | "unrated";

export interface Source extends BaseEntity {
  sourceType: SourceType;
  organisation: string;
  url?: string;
  reference?: string;
  publicationDate?: ISODate;
  researchDate: ISODate;
  relevantSection?: string;
  geography?: string;
  evidenceStrength: EvidenceStrength;
  notes?: string;
  lastReviewedAt?: ISODate;
}

export interface EvidenceRecord extends BaseEntity {
  entityType: EntityType;
  entityId: string;
  field: string;
  quantity: Quantity;
}

// ---------------------------------------------------------------------------
// Biological / material entities
// ---------------------------------------------------------------------------

export interface Component extends BaseEntity {
  scientificName: string;
  commonNames: string[];
  parentComponentId?: string;
  origin: "fruit" | "palm";
  position: string;
  colorToken: string; // design token used for the exploded coconut / trees
  explodedOrder?: number; // order in the exploded coconut (1 = outermost)
  massShare?: Quantity; // share of whole-nut mass
  biologicalStructure: string[];
  materialCharacteristics: string[];
  composition: { parameter: string; quantity: Quantity }[];
  separationMethod: string[];
  processingFlow: string[];
  primaryOutputProductIds: string[];
  secondaryOutputProductIds: string[];
  applications: string[];
  customerTypes: string[];
  demandDrivers: string[];
  indiaContext: string[];
  internationalContext: string[];
  competition: string[];
  advantages: string[];
  limitations: string[];
  qualityRequirements: string[];
  storage: string[];
  transportation: string[];
  processingComplexity: "low" | "medium" | "high" | "very_high";
  technologyRequirements: string[];
  swot: SWOT;
  whyItCanWork: string[];
  whyItCanFail: string[];
  whoShouldEnter: string[];
  whoShouldNotEnter: string[];
  technologyOpportunities: string[];
  futureOpportunities: string[];
  researchGaps: string[];
  sourceIds: string[];
  heroAssetId: string;
  seoTitle: string;
  seoDescription: string;
}

export interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export type MarketTag = "B2B" | "B2C" | "Industrial" | "Export";

export type BusinessLevelId = "L1" | "L2" | "L3" | "L4" | "L5";

export interface ProductCategory extends BaseEntity {
  order: number;
  industryId: string;
}

export interface Industry extends BaseEntity {
  order: number;
  icon: string;
}

export interface QualityParameter {
  parameter: string;
  quantity: Quantity;
  standard?: string;
  note?: string;
}

export interface PackagingFormat {
  format: string;
  typicalUse: string;
  sizes?: string;
  note?: string;
}

export interface CustomerLink {
  customerSegmentId: string;
  whyTheyBuy: string;
  specsTheyCareAbout: string[];
  note?: string;
}

export interface RiskLink {
  riskId: string;
  probability: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  mitigation: string;
  earlyWarning: string;
  backupPlan: string;
  evidence: EvidenceType;
}

export interface Product extends BaseEntity {
  technicalName: string;
  categoryId: string;
  industryIds: string[];
  sourceComponentIds: string[];
  intermediateProductIds?: string[]; // e.g. activated carbon ← shell charcoal
  marketTags: MarketTag[];
  businessLevel: BusinessLevelId;
  heroAssetId: string;
  hsCode?: Quantity; // stored as text quantity for provenance
  whatIsIt: string[];
  whyItExists: string[];
  rawMaterial: {
    description: string[];
    specification: string[];
    quality: string[];
    procurement: string[];
    coconutType: "mature" | "tender" | "either" | "n/a";
  };
  processIds: string[];
  processDescription: string[];
  inputs: string[];
  outputs: string[];
  byProducts: { productId?: string; name: string; note: string }[];
  yieldQuantities: Quantity[];
  qualityParameters: QualityParameter[];
  machineIds: string[];
  utilities: {
    power: Quantity;
    water: Quantity;
    steam?: Quantity;
    fuel?: Quantity;
    compressedAir?: Quantity;
    notes?: string[];
  };
  manpower: Quantity;
  land: Quantity;
  building: Quantity;
  areas: { name: string; quantity: Quantity }[];
  packaging: PackagingFormat[];
  storage: string[];
  shelfLife: Quantity;
  logistics: string[];
  customers: CustomerLink[];
  useCases: string[];
  competitors: string[]; // descriptive only; verified competitor entities live in competitors table
  pricing: Quantity[];
  costStructure: { item: string; quantity: Quantity; note?: string }[];
  unitEconomics: Quantity[];
  capex: Quantity;
  workingCapital: Quantity;
  breakEven?: Quantity;
  roi?: Quantity;
  payback?: Quantity;
  regulationIds: string[];
  certificationIds: string[];
  exportRequirements: string[];
  exportCountryIds: string[];
  risks: RiskLink[];
  swot: SWOT;
  scalability: string[];
  scaleOptions: ScaleOption[];
  technology: string[];
  futurePotential: string[];
  opportunityId?: string;
  researchDocumentIds: string[];
  sourceIds: string[];
  seoTitle: string;
  seoDescription: string;
  faqs?: { q: string; a: string }[];
}

export interface ScaleOption {
  id: string;
  label: string; // "100 kg/day"
  capacity: Quantity; // finished product per day
  supported: boolean; // only true when engineering assumptions exist
  note?: string;
  scaleModelId?: string;
}

// ---------------------------------------------------------------------------
// Manufacturing
// ---------------------------------------------------------------------------

export interface ProcessStep {
  id: string;
  order: number;
  name: string;
  description: string[];
  inputs: string[];
  outputs: string[];
  losses?: string;
  machineIds: string[];
  qcPoint?: string;
  hygieneZone?: "raw" | "wet" | "dry" | "clean" | "packing" | "utility" | "warehouse" | "thermal";
  durationNote?: string;
}

export interface Process extends BaseEntity {
  productIds: string[];
  inputComponentIds: string[];
  steps: ProcessStep[];
  yields: Quantity[];
  massBalanceModelId?: string;
  utilities: { power?: Quantity; water?: Quantity; steam?: Quantity; fuel?: Quantity; air?: Quantity };
  hygieneClass: "food" | "industrial" | "horticulture";
  automationOptions: string[];
  qualityControlPoints: string[];
  processLoss: Quantity;
  sourceIds: string[];
  diagramAssetId?: string;
}

export type AutomationLevel = "manual" | "semi_automatic" | "automatic";

export interface Machine extends BaseEntity {
  category: string;
  purpose: string[];
  processStage: string;
  productIds: string[];
  rawMaterialInput: string;
  output: string;
  capacityRange: Quantity;
  power: Quantity;
  fuel?: Quantity;
  water?: Quantity;
  steam?: Quantity;
  air?: Quantity;
  footprint: Quantity;
  operators: Quantity;
  automation: AutomationLevel;
  maintenance: string[];
  consumables: string[];
  safety: string[];
  cleaning: string[];
  materialOfConstruction: string;
  supplierCategory: string;
  availability: "india" | "import" | "both";
  installation: string[];
  usefulLife: Quantity;
  replacement: string[];
  cost: Quantity;
  lastQuotationAt?: ISODate;
  foodGrade: boolean;
  visualStatus: "illustrative" | "verified_model";
  sourceIds: string[];
  assetId?: string;
}

export interface FactoryZone {
  id: string;
  name: string;
  kind: "receiving" | "storage_raw" | "inspection" | "processing_wet" | "processing_dry" | "drying" | "thermal"
    | "qc_lab" | "packaging" | "storage_fg" | "utilities" | "water_treatment" | "waste" | "maintenance" | "office"
    | "worker_facilities" | "loading" | "roads" | "parking" | "fire_safety" | "expansion" | "effluent" | "cooling";
  hygiene?: "dirty" | "transition" | "clean";
  fireRisk?: "low" | "medium" | "high";
  areaRatio: number; // ratio to processing floor area (EXPERT_JUDGMENT), documented in scale model
  note?: string;
}

export interface FactoryScaleModel extends BaseEntity {
  productId: string;
  capacity: Quantity; // finished product/day
  rawMaterialPerDay: Quantity;
  processingFloorArea: Quantity; // base area from machine footprints × circulation factor
  circulationFactor: Quantity;
  zones: FactoryZone[];
  shiftsPerDay: number;
  manpower: { roleId: string; headcount: Quantity }[];
  power: Quantity;
  water: Quantity;
  fuel?: Quantity;
  steam?: Quantity;
  capex: Quantity;
  workingCapitalDays: Quantity;
  flowSequence: string[]; // zone ids in material-flow order
  assumptions: string[];
  sourceIds: string[];
}

export interface ManpowerRole extends BaseEntity {
  skill: "unskilled" | "semi_skilled" | "skilled" | "supervisory" | "managerial" | "technical";
  responsibilities: string[];
}

export interface RawMaterial extends BaseEntity {
  componentId: string;
  specification: string[];
  qualityChecks: string[];
  procurementModels: string[];
  seasonality: string[];
  sourceIds: string[];
}

export interface SupplierCategory extends BaseEntity {
  machineCategories: string[];
  geography: string;
  note: string;
}

// ---------------------------------------------------------------------------
// Market entities
// ---------------------------------------------------------------------------

export interface CustomerSegment extends BaseEntity {
  kind: "B2B" | "B2C" | "Industrial" | "Export" | "Institutional";
  whatTheyBuy: string[];
  whyTheyBuy: string[];
  specification: string[];
  qualityRequirements: string[];
  packaging: string[];
  moq: Quantity;
  purchaseFrequency: string;
  certifications: string[];
  buyingProcess: string[];
  paymentTerms: Quantity;
  problems: string[];
  selectionCriteria: string[];
  opportunity: string[];
  productIds: string[];
  sourceIds: string[];
}

export interface Country extends BaseEntity {
  iso2: string;
  region: string;
  productIds: string[];
  marketContext: string[];
  regulatoryNotes: string[];
  certificationsExpected: string[];
  logistics: string[];
  currencyRisk: string;
  lastVerifiedAt?: ISODate;
  sourceIds: string[];
}

export interface ExportRecord extends BaseEntity {
  productId: string;
  countryId: string;
  suitability: "high" | "medium" | "low" | "research_required";
  documentation: string[];
  packaging: string[];
  shipping: string[];
  shelfLifeIssues: string[];
  regulatoryComplexity: "low" | "medium" | "high";
  paymentRisk: string;
  portNotes: string[];
  priceIndication: Quantity;
  sourceIds: string[];
}

export interface LocationDimensionScore {
  dimension: string;
  score: number; // 0-10
  weight: number;
  reason: string;
  evidence: EvidenceType;
  sourceIds?: string[];
}

export interface StateProfile extends BaseEntity {
  code: string;
  mapPath: string; // simplified SVG path (relative coords)
  labelXY: [number, number];
  productionStats: Quantity[];
  dimensions: LocationDimensionScore[];
  processingEcosystem: string[];
  governmentSupport: string[];
  ports: string[];
  notes: string[];
  sourceIds: string[];
}

export interface Regulation extends BaseEntity {
  authority: string;
  scope: string[];
  appliesToProductIds: string[];
  requirements: string[];
  url?: string;
  sourceIds: string[];
}

export interface Certification extends BaseEntity {
  issuer: string;
  purpose: string;
  typicalFor: string[];
  requiredForMarkets: string[];
  productIds: string[];
  costIndication: Quantity;
  sourceIds: string[];
}

// ---------------------------------------------------------------------------
// Finance / mass balance / risk / opportunity
// ---------------------------------------------------------------------------

export interface FinancialAssumptionSet extends BaseEntity {
  productId: string;
  scenario: "conservative" | "base" | "aggressive";
  inputs: Record<string, Quantity>; // keys match FinancialInputs
}

export interface MassBalanceStage {
  id: string;
  name: string;
  fromStageId?: string;
  /** Fraction of the parent stage mass that ends here (0..1) */
  fraction: Quantity;
  kind: "material" | "product" | "byproduct" | "loss";
  productId?: string;
  componentId?: string;
}

export interface MassBalanceModel extends BaseEntity {
  coconutType: "mature" | "tender";
  maturityNote: string;
  geography?: string;
  processId?: string;
  productId?: string;
  baseUnit: "nuts" | "kg";
  avgNutMass: Quantity; // kg per whole nut with husk
  stages: MassBalanceStage[];
  sourceIds: string[];
}

export type RiskCategory =
  | "raw_material" | "seasonality" | "price" | "climate" | "quality" | "food_safety" | "machinery" | "labour"
  | "power" | "water" | "storage" | "spoilage" | "technology" | "working_capital" | "competition"
  | "customer_concentration" | "distributor_dependency" | "export" | "currency" | "regulation" | "reputation";

export interface Risk extends BaseEntity {
  category: RiskCategory;
  description: string[];
  genericMitigation: string[];
}

export interface OpportunityCriterion {
  criterion: string;
  score: number; // 0-10
  weight: number; // 0-1, weights sum to 1
  reason: string;
  evidence: EvidenceType;
  assumptions?: string;
  sourceIds?: string[];
}

export interface Opportunity extends BaseEntity {
  componentIds: string[];
  productId: string;
  industryId: string;
  customerSegmentIds: string[];
  businessModel: string;
  routeToMarket: string[];
  capex: Quantity;
  workingCapital: Quantity;
  marginPotential: "low" | "medium" | "high" | "research_required";
  demand: "low" | "medium" | "high" | "research_required";
  competition: "low" | "medium" | "high";
  difficulty: "low" | "medium" | "high" | "very_high";
  technicalRequirement: string[];
  shelfLife: "short" | "medium" | "long" | "n/a";
  scalability: "low" | "medium" | "high";
  exportPotential: "low" | "medium" | "high";
  brandPotential: "low" | "medium" | "high";
  capitalIntensity: "low" | "medium" | "high";
  workingCapitalIntensity: "low" | "medium" | "high";
  regulatoryComplexity: "low" | "medium" | "high";
  riskLevel: "low" | "medium" | "high";
  defensibility: "low" | "medium" | "high";
  evidenceQuality: EvidenceStrength;
  criteria: OpportunityCriterion[];
  canvas: BusinessModelCanvas;
  sourceIds: string[];
}

export interface BusinessModelCanvas {
  customerSegments: string[];
  valueProposition: string[];
  channels: string[];
  customerRelationships: string[];
  revenueStreams: string[];
  keyResources: string[];
  keyActivities: string[];
  keyPartners: string[];
  costStructure: string[];
}

export interface Competitor extends BaseEntity {
  category: string;
  productIds: string[];
  positioning: string;
  customers: string[];
  distribution: string[];
  strengths: string[];
  weaknesses: string[];
  pricing: Quantity[];
  manufacturing: string[];
  exports: string[];
  brand: string;
  opportunityForNewEntrants: string[];
  verified: boolean;
  sourceIds: string[];
}

// ---------------------------------------------------------------------------
// Research, assets, field validation, roadmap, technology, value chain
// ---------------------------------------------------------------------------

export interface ResearchDocument extends BaseEntity {
  detail: string[];
  keyFacts: { fact: string; quantity?: Quantity; sourceIds: string[] }[];
  businessImplications: string[];
  relatedProductIds: string[];
  relatedComponentIds: string[];
  relatedMachineIds: string[];
  relatedRegulationIds: string[];
  sourceIds: string[];
  researchDate: ISODate;
  evidenceLevel: EvidenceStrength;
  tags: string[];
  stateIds?: string[];
}

export type AssetType = "scientific" | "raw_material" | "product" | "process" | "machinery" | "factory" | "application"
  | "geographical" | "business";

export interface VisualAsset extends BaseEntity {
  entityType: EntityType | "page";
  entityId: string;
  page: string;
  section: string;
  assetType: AssetType;
  subject: string;
  purpose: string;
  visualBrief: string;
  generationStatus: "programmatic_svg" | "generated" | "licensed_photo" | "required" | "placeholder_technical";
  altText: string;
  caption: string;
  licence: string;
  attribution?: string;
  desktopSrc?: string;
  mobileSrc?: string;
  illustrative: boolean; // must be true for conceptual equipment
}

export interface InterviewQuestion {
  id: string;
  stakeholder: StakeholderType;
  topic: string;
  question: string;
  evidenceToCapture: string;
}

export type StakeholderType = "farmer" | "trader" | "collection_centre" | "factory_owner" | "processor" | "customer"
  | "retailer" | "distributor" | "exporter" | "machinery_supplier";

export interface RoadmapTask {
  id: string;
  phase: "day-1-7" | "day-8-30" | "day-31-60" | "day-61-90";
  task: string;
  objective: string;
  cost: Quantity;
  time: string;
  expectedResult: string;
  successCriterion: string;
  learningObjective: string;
  peopleToContact: string[];
  evidenceToCollect: string[];
  nextDecision: string;
}

export interface Technology extends BaseEntity {
  maturity: "USEFUL_NOW" | "USEFUL_AT_SCALE" | "EXPERIMENTAL" | "UNNECESSARY_HYPE";
  area: string;
  whatItDoes: string[];
  whereItPays: string[];
  caution: string[];
  productIds: string[];
}

export interface ValueChainNode extends BaseEntity {
  order: number;
  participants: string[];
  valueAddition: string[];
  risks: string[];
  costDrivers: string[];
  technology: string[];
  opportunities: string[];
  relatedProductIds: string[];
}

export interface BusinessLevel {
  id: BusinessLevelId;
  name: string;
  examples: string[];
  characteristics: string[];
  productIds: string[];
}

export type RelationType =
  | "HAS_COMPONENT" | "DERIVES_FROM" | "PRODUCES" | "REQUIRES_PROCESS" | "REQUIRES_MACHINE" | "STEP_USES_MACHINE"
  | "YIELDS_BYPRODUCT" | "SOLD_TO" | "REQUIRES_CERT" | "GOVERNED_BY" | "EXPORTED_TO" | "HAS_RISK"
  | "HAS_FINANCIAL_MODEL" | "HAS_MASS_BALANCE" | "HAS_OPPORTUNITY" | "BELONGS_TO_INDUSTRY" | "IN_CATEGORY"
  | "SUBSTITUTES" | "COMPETES_WITH" | "CITED_BY" | "ILLUSTRATED_BY" | "LOCATED_IN" | "RELATED_RESEARCH";

export interface Relationship {
  id: string;
  fromType: EntityType;
  fromId: string;
  relation: RelationType;
  toType: EntityType;
  toId: string;
  note?: string;
  evidence?: EvidenceType;
  order?: number;
}

// ---------------------------------------------------------------------------
// Field-data records (Phase 2): quotations, schemes, prices — never fabricated; empty until captured
// ---------------------------------------------------------------------------

export interface MachineQuotation extends BaseEntity {
  machineId: string;
  supplierName: string;           // real supplier only; blank/anonymised until permission to publish
  supplierLocation?: string;
  model?: string;
  capacity: Quantity;
  power: Quantity;
  dimensions?: string;            // L × W × H in mm
  materialOfConstruction?: string;
  price: Quantity;                // INR ex-works unless basis says otherwise
  currency: Currency;
  gstPct?: number;
  freight?: Quantity;
  installation?: Quantity;
  warrantyMonths?: number;
  leadTimeWeeks?: number;
  quotationDate: ISODate;
  validUntil?: ISODate;
  attachmentUrl?: string;         // stored document (admin upload)
  verification: "unverified" | "document_on_file" | "verified_with_supplier";
  notes?: string;
}

export interface GovernmentScheme extends BaseEntity {
  authority: string;              // e.g. MoFPI, CDB, Coir Board, State of Tamil Nadu
  level: "central" | "state" | "board";
  geography: string[];            // state ids or "India"
  applicableProductIds: string[];
  eligibility: string[];
  benefit: string[];
  subsidy: Quantity;              // % or INR — RESEARCH REQUIRED until read from guidelines
  maximumAmount: Quantity;
  officialUrl?: string;
  effectiveFrom?: ISODate;
  effectiveTo?: ISODate;
  sourceIds: string[];
  notes?: string;
}

export interface PriceRecord extends BaseEntity {
  commodity: string;              // e.g. "Copra (milling)", "Coconut oil", "Activated carbon 8x30 1000 IN"
  productId?: string;
  date: ISODate;
  market: string;                 // e.g. "Kangayam", "Kochi", "FOB Tuticorin"
  location: string;
  price: Quantity;                // unit-explicit (INR/kg, INR/quintal, USD/t)
  grade?: string;
  sourceIds: string[];
  notes?: string;
}
