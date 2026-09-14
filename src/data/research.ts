import type { ResearchDocument, Technology } from "@/domain/types";
import { base, rr, TODAY } from "./helpers";

const EJ = ["src-internal-ej"];
const SR = ["src-supplied-research"];

type R = Partial<ResearchDocument> & { id: string; name: string; slug: string; summary: string; detail: string[]; tags: string[] };
const doc = (r: R): ResearchDocument => ({
  ...base(r.id, r.name, r.slug, r.summary), keyFacts: [], businessImplications: [], relatedProductIds: [], relatedComponentIds: [], relatedMachineIds: [], relatedRegulationIds: [],
  sourceIds: [...SR, ...EJ], researchDate: TODAY, evidenceLevel: "moderate", ...r,
});

export const researchDocuments: ResearchDocument[] = [
  doc({
    id: "rd-business-levels", name: "The Five Business Levels of the Coconut Economy", slug: "five-business-levels", tags: ["strategy", "business-model"],
    summary: "Coconut businesses sit on five levels from raw commodity to integrated platform; each has a different margin logic, capital need and failure mode.",
    detail: [
      "Level 1 — Raw commodity (raw nuts, copra, commodity oil, basic fibre, basic charcoal). Price is set by markets, not by the seller. Survival depends on procurement relationships, working capital and volume. Differentiation is nearly impossible.",
      "Level 2 — Basic processing (drying, copra making, basic DC, basic separation). Adds storability and a little value; margins remain thin and utilisation-sensitive. Seasonal supply is the main risk.",
      "Level 3 — Industrial and value-added ingredients (coconut milk, cream, flour, DC, milk powder, VCO bulk, cocopeat, industrial coir, activated carbon). Sales are specification-driven, repeat and institutional. Certification, QC and process discipline decide who wins. Capital and technical capability are required.",
      "Level 4 — Branded consumer products (chips, premium VCO, specialty foods, wellness, personal care). Gross margins look high; net margins depend on marketing, channel margins, returns and shelf life. High selling price is not high profitability.",
      "Level 5 — Integrated coconut platform: procurement → processing → multiple primary products → secondary products → by-products → B2B → B2C → exports. Multi-stream revenue from one raw material is the zero-waste ideal, but it is an outcome of proving one product first, not a starting point.",
      "Product strategy determines procurement strategy: a Level-4 VCO brand needs maturity-controlled direct sourcing; a Level-1 copra trader needs mandi relationships and credit. Choosing the level is the first strategic decision.",
    ],
    businessImplications: ["Do not start at Level 5.", "Level 3 offers the best balance of margin and repeatability for technically capable entrants.", "Level 4 requires marketing capital equal to or greater than processing capital."],
    relatedProductIds: ["prd-copra", "prd-desiccated-coconut", "prd-virgin-coconut-oil", "prd-coconut-chips", "prd-activated-carbon"],
  }),
  doc({
    id: "rd-procurement-models", name: "Three Procurement Models and Why Product Strategy Decides Them", slug: "procurement-models", tags: ["procurement", "supply-chain"],
    summary: "Trader sourcing, direct farmer procurement, and farmer-cluster/FPO/collection-centre models each fit different products, volumes and quality needs.",
    detail: [
      "Trader sourcing: buy from mandis/commission agents. Fast to start, flexible volumes, no field organisation. Costs: intermediary margin, grade disputes, mixed maturity, no traceability. Fits Level 1–2 and early pilots.",
      "Direct farmer procurement: contracts with individual farmers; pay for maturity and grade. Benefits: quality control, traceability, loyalty. Costs: field staff, cash logistics, dispersed collection. Fits VCO, DC, organic programmes.",
      "Farmer cluster / FPO / collection-centre model: aggregate through FPOs or own collection centres with weighing, grading and dehusking at source. Benefits: volume, standardised grading, husk recovered locally for coir, reduced haul weight. Costs: centre capex, working capital advances, governance. Fits Level 3–5 plants above ~5,000 nuts/day (EXPERT_JUDGMENT).",
      "Tender vs mature nuts: a tender-nut business (water) and a mature-nut business (kernel) compete for the same palms; harvesting tender removes future mature nuts. Their prices, seasonality and logistics differ. Never model them as one raw material.",
    ],
    businessImplications: ["Choose the model that matches the product's quality and volume needs.", "Collection centres justify themselves through husk recovery and freight reduction, not only price."],
    relatedProductIds: ["prd-virgin-coconut-oil", "prd-desiccated-coconut", "prd-coconut-water", "prd-cocopeat"],
  }),
  doc({
    id: "rd-tender-vs-mature", name: "Tender Coconut vs Mature Coconut — Different Economies", slug: "tender-vs-mature", tags: ["raw-material", "economics"],
    summary: "Tender (6–8 month) and mature (11–12 month) nuts have different water volumes, kernel value, prices, seasonality and by-product profiles.",
    detail: [
      "Tender nuts are harvested for water and jelly kernel; the husk is high-moisture and low in fibre value; the shell is thin. Their whole value is in ~250–500 ml of perishable liquid per nut (ESTIMATE).",
      "Mature nuts carry firm kernel (oil-rich), storable shell, lignified husk with strong fibre, and less water. They are storable for weeks when dehusked. Their value is distributed across four streams.",
      "A palm produces one or the other from a given bunch; tender harvesting forgoes mature yield. Farmers price accordingly. A processor cannot switch a tender-nut line to mature-nut products without different equipment and customers.",
    ],
    businessImplications: ["Model tender and mature economics separately.", "Beverage businesses need tender-nut contracts; kernel businesses need harvest-interval discipline."],
    relatedProductIds: ["prd-coconut-water", "prd-desiccated-coconut"], relatedComponentIds: ["cmp-coconut-water", "cmp-kernel"],
  }),
  doc({
    id: "rd-high-price-vs-profit", name: "High Selling Price Is Not High Profitability", slug: "high-price-vs-profit", tags: ["economics", "unit-economics"],
    summary: "Actual economics = selling price − raw material − processing − testing − packaging − logistics − marketing − distribution − returns − working capital cost. Premium products often lose on the last five lines.",
    detail: [
      "The waterfall: Selling price → minus raw material → minus processing → minus testing → minus packaging → minus logistics → minus marketing → minus distribution margin → minus returns → minus working-capital/interest and depreciation = actual economics.",
      "For a branded VCO sold through quick commerce, distribution and platform margins plus marketing can consume 40–60% of the shelf price (EXPERT_JUDGMENT — verify with channel terms). Raw material (8–14 nuts per litre) takes another large share. The residue is modest.",
      "For B2B DC sold at a far lower price per kg, packaging, marketing and returns are small; margins are thin but predictable and utilisation-driven.",
      "The Financial Model on this platform renders this waterfall for any input set so the comparison is explicit rather than assumed.",
    ],
    businessImplications: ["Compare products on contribution per kg after channel costs, not on price per kg.", "Fund marketing from a plan, not from hope."],
    relatedProductIds: ["prd-virgin-coconut-oil", "prd-coconut-chips", "prd-desiccated-coconut", "prd-coconut-water"],
  }),
  doc({
    id: "rd-zero-waste-model", name: "Integrated Coconut Ingredients + Zero-Waste Processing Model (Strategic Analysis)", slug: "integrated-zero-waste-model", tags: ["strategy", "zero-waste", "integration"],
    summary: "A strategic long-term concept: one plant converting the whole nut into kernel ingredients, husk products and shell products, with residues recovered as fuel, feed and flour. Presented as analysis, not investment advice.",
    detail: [
      "Concept: mature nuts enter one site; kernel goes to DC/milk/VCO with residue to flour and parings to oil; husk to fibre and cocopeat; shell to charcoal (fuelling dryers) or powder; mature water to beverage/vinegar where validated; effluent treated and reused.",
      "Economic logic: the by-products of each line are the raw materials of another, freight is eliminated between them, and thermal energy (shell/husk) offsets purchased fuel. Revenue diversification reduces exposure to any single commodity price.",
      "Constraints: capital across several process technologies; management complexity; hygiene separation between food and industrial zones; consents for kilns next to food lines; utilisation across lines with different demand cycles; the temptation to launch everything at once.",
      "Sequencing: prove one anchor product (typically DC or cocopeat depending on location) with customers, then add the co-product whose raw material the anchor already produces (flour with milk/VCO; fibre with cocopeat; charcoal with DC), then a third stream. Phase 5 is earned.",
    ],
    businessImplications: ["Treat as a 5–10 year strategic scenario.", "Design the site for it; build it one line at a time."],
    relatedProductIds: ["prd-desiccated-coconut", "prd-coconut-flour", "prd-cocopeat", "prd-coir-fibre", "prd-shell-charcoal"],
  }),
  doc({
    id: "rd-kernel-product-tree", name: "Kernel Product Tree — From Fresh Meat to Ingredients", slug: "kernel-product-tree", tags: ["kernel", "product-tree"],
    summary: "How one kernel stream branches into DC, flour, milk, cream, oil, VCO, copra, chips and flakes, and which share equipment.",
    detail: [
      "Fresh route (pared white kernel): DC (dry), chips/flakes (slice + dry), milk/cream (press), VCO (press + separate), flour (residue of pressing). All share dehusk/deshell/pare/wash/grate equipment; the branch point is the disintegrator/slicer/press.",
      "Dry route (copra): kernel dried in shell → copra → expelled → commodity oil + cake. Different customers, different economics, storable intermediate.",
      "Equipment-sharing is the practical basis for a multi-product kernel plant: the front end is common; back ends are added product by product.",
    ],
    relatedProductIds: ["prd-desiccated-coconut", "prd-coconut-flour", "prd-coconut-milk", "prd-coconut-cream", "prd-virgin-coconut-oil", "prd-coconut-oil", "prd-copra", "prd-coconut-chips", "prd-coconut-flakes"],
    relatedComponentIds: ["cmp-kernel"], relatedMachineIds: ["mch-dehusker", "mch-desheller", "mch-parer", "mch-disintegrator", "mch-screw-press"],
  }),
  doc({
    id: "rd-husk-product-tree", name: "Husk Product Tree — Fibre and Pith", slug: "husk-product-tree", tags: ["husk", "coir", "cocopeat"],
    summary: "One defibering step yields two products with different customers: fibre (converters) and pith (growers).",
    detail: ["Fibre: yarn, rope, mats, brushes, rubberised coir, geotextiles. Pith: cocopeat blocks, bricks, grow bags, nursery media, hydroponic slabs. A husk business that sells only one of the two leaves a third to two-thirds of its mass unmonetised."],
    relatedProductIds: ["prd-coir-fibre", "prd-coir-yarn", "prd-coir-geotextile", "prd-cocopeat"], relatedComponentIds: ["cmp-fibrous-husk", "cmp-coir-fibre", "cmp-coir-pith"],
  }),
  doc({
    id: "rd-shell-product-tree", name: "Shell Product Tree — Charcoal, Activated Carbon, Powder, Biochar", slug: "shell-product-tree", tags: ["shell", "industrial"],
    summary: "Shell branches into a thermal chain (charcoal → activated carbon) and a mechanical chain (powder), plus biochar and fuel.",
    detail: ["Thermal chain: carbonisation (≈70% mass loss, heat recoverable) then activation (≈60–70% burn-off) — high value, high energy, high regulation. Mechanical chain: grinding to powder — low value, low tech, power-intensive. Fuel: shell burns hot and clean relative to husk; often the best use in a DC plant is to fire the dryer."],
    relatedProductIds: ["prd-shell-charcoal", "prd-activated-carbon", "prd-shell-powder", "prd-biochar"], relatedComponentIds: ["cmp-hard-shell"], relatedRegulationIds: ["reg-pcb-consent"],
  }),
  doc({
    id: "rd-evidence-methodology", name: "Evidence Methodology — How Numbers Are Labelled on This Platform", slug: "evidence-methodology", tags: ["methodology"],
    summary: "Every number carries one of six evidence labels; missing data is shown as RESEARCH REQUIRED, never as a plausible guess.",
    detail: [
      "VERIFIED FACT — read from an authoritative primary document (government, statutory board, standard, peer-reviewed) with the section identified, a last-verified date and a named verifier.",
      "SOURCE-BACKED — an authoritative source is attached, but the exact figure or section has not been independently re-verified; confirm before contractual use.",
      "ESTIMATE — a range from technical literature or practitioner experience, not yet tied to a specific citable figure; shown with min/max and confidence.",
      "ASSUMPTION — a modelling input chosen for a calculation; always editable by the user and visible in the model.",
      "CALCULATED — derived from other values by a stated formula; the formula is shown on the badge.",
      "EXPERT JUDGMENT — a qualitative-numeric assessment by the platform team (e.g. area ratios, criterion scores); labelled and open to challenge.",
      "RESEARCH REQUIRED — no reliable value held; the badge explains what needs to be researched (e.g. 'current supplier quotation').",
      "Promotion path: RESEARCH REQUIRED → ESTIMATE (literature range) → SOURCE-BACKED (source attached) → VERIFIED FACT (primary document read, section cited, verifier named, date). The Research-Gap Engine tracks coverage per entity.",
      "Staleness: every value is judged on its last-verified (else reviewed, else researched) date against a rule per data kind — prices 30/90 days, quotations 90/180, schemes 180/365, market and other 180/365, statistics 365/730, regulations 365/1095, compositions 1095/1825 — shown as Current, Review suggested or Potentially stale.",
      "Entity badges: DATA VERIFIED appears only when ≥70% of tracked fields are VERIFIED and at least one named expert review is recorded as approved. EXPERT REVIEWED requires a recorded review. Neither badge is decorative.",
    ],
    evidenceLevel: "strong", sourceIds: EJ,
  }),
  doc({
    id: "rd-sap-regulation", name: "Neera / Sap Tapping — Regulatory Reality", slug: "neera-regulation", tags: ["sap", "regulation"],
    summary: "Because coconut sap ferments to toddy, tapping is regulated by state excise; neera policies differ by state and change over time.",
    detail: ["Several states (e.g. Kerala, Karnataka, Tamil Nadu, Goa, Maharashtra) have at various times issued neera policies or licences for unfermented sap collection, typically through cooperatives/FPOs and with technology such as CPCRI's coco-sap chiller. Exact current rules per state are RESEARCH REQUIRED and must be confirmed with the state excise department before any investment."],
    relatedProductIds: ["prd-coconut-sugar"], relatedComponentIds: ["cmp-sap"], relatedRegulationIds: ["reg-state-excise-neera"], evidenceLevel: "weak",
  }),
  doc({
    id: "rd-india-statistics", name: "India Coconut Production Statistics — Source Record Structure", slug: "india-production-statistics", tags: ["statistics", "india"],
    summary: "India is among the world's largest coconut producers alongside Indonesia and the Philippines (FAO). All quantitative statistics on this platform are stored as dated source records with explicit units — nuts vs tonnes are never compared.",
    detail: [
      "Two unit systems coexist: CDB and Indian state statistics commonly report production in million nuts and area in hectares; FAOSTAT reports production in tonnes (in-shell). A figure in tonnes cannot be compared to a figure in nuts without an explicit average nut mass, which itself varies by variety and maturity.",
      "Time sensitivity: annual figures change; any figure shown must carry year, unit, source, research date and last-verified date. The supplied research notes reference historical production and value-added export growth figures; these are treated as source records to be re-verified against CDB and APEDA and are not shown as headline claims until verified.",
    ],
    keyFacts: [
      { fact: "India is one of the top three coconut-producing countries by volume (with Indonesia and the Philippines).", sourceIds: ["src-fao"] },
      { fact: "India coconut production (latest year) in million nuts", quantity: rr("million nuts", "Cite CDB statistics table with year; record unit as nuts.", { sourceIds: ["src-cdb"] }), sourceIds: ["src-cdb"] },
      { fact: "India coconut production (latest year) in tonnes", quantity: rr("million t", "Cite FAOSTAT with year; unit tonnes (in-shell).", { sourceIds: ["src-fao"] }), sourceIds: ["src-fao"] },
      { fact: "Value-added coconut product exports from India (latest year)", quantity: rr("INR crore", "Cite CDB/APEDA export statistics with year and product coverage.", { sourceIds: ["src-cdb", "src-apeda"] }), sourceIds: ["src-cdb", "src-apeda"] },
    ],
    businessImplications: ["Export growth is a strategic signal but must be read by product and year.", "Never use a headline production number without unit and year."],
    evidenceLevel: "moderate", sourceIds: ["src-fao", "src-cdb", "src-apeda", ...SR],
  }),
  doc({
    id: "rd-discipline-rules", name: "Discipline Rules Before Committing Capital", slug: "discipline-rules", tags: ["strategy", "validation"],
    summary: "Ten rules that separate validated coconut businesses from expensive experiments.",
    detail: [
      "DO NOT BUY MACHINERY UNTIL YOU VALIDATE THE CUSTOMER.", "DO NOT BUY LAND UNTIL YOU UNDERSTAND THE PROCESS.", "DO NOT BUILD A FACTORY UNTIL YOU UNDERSTAND UTILISATION.", "DO NOT LAUNCH TEN PRODUCTS AT ONCE.", "DO NOT ASSUME DEMAND.", "DO NOT ASSUME MARGINS.", "DO NOT ASSUME SUBSIDIES.", "DO NOT ASSUME EXPORTS.", "DO NOT ASSUME A MACHINE QUOTE REPRESENTS TOTAL PROJECT COST.", "DO NOT TREAT TENDER AND MATURE NUTS AS THE SAME RAW MATERIAL.",
    ],
    evidenceLevel: "strong",
  }),
  doc({
    id: "rd-hyderabad-hub", name: "Hyderabad as a Coconut Business Hub — Role Analysis", slug: "hyderabad-hub", tags: ["hyderabad", "location"],
    summary: "Hyderabad is a demand, distribution and headquarters city with weak raw-material supply; its role depends on the product.",
    detail: [
      "Demand: large metro population; HoReCa, food manufacturing, modern retail, quick commerce, D2C. Coconut consumption is strong in South Indian cuisine segments.",
      "Supply: Telangana grows little coconut; nearest belts are Andhra Pradesh's Konaseema (East Godavari) and Karnataka's Tumakuru/Hassan, several hundred kilometres away. Raw nuts hauled to Hyderabad carry husk weight and freight cost.",
      "Logistics: excellent highway and rail hub; major airport for air cargo; no seaport — Kakinada, Visakhapatnam and Chennai are 500+ km by road.",
      "Role fit: HQ, sales and brand hub — strong. Distribution centre for finished goods — strong. Finishing/packing (bottling VCO, packing DC/chips from bulk) — reasonable. Primary processing of whole nuts — weak unless a tender-nut/coconut-water metro model justifies proximity to consumers. Export processing — weak versus port-adjacent sites.",
      "Recommended structure for a Hyderabad-based venture: primary processing near supply (AP/TN), finishing and sales in Hyderabad — or a chilled coconut-water city model sourced from AP tender-nut farms.",
    ],
    businessImplications: ["Do not assume Hyderabad should host the factory.", "Use Hyderabad for what it is good at: demand, distribution, management."],
    relatedProductIds: ["prd-coconut-water", "prd-virgin-coconut-oil", "prd-coconut-chips"], stateIds: ["st-ts", "st-ap"],
  }),
];

export const researchById = Object.fromEntries(researchDocuments.map((r) => [r.id, r]));

export const technologies: Technology[] = [
  { ...base("tech-erp", "ERP / Inventory & Batch Management", "erp", "Basic ERP for procurement, inventory, batches and invoicing."), maturity: "USEFUL_NOW", area: "Operations", whatItDoes: ["Tracks nuts in, products out, batches, costs"], whereItPays: ["Any plant above micro scale; required for FSSAI traceability"], caution: ["Over-configured ERPs stall small plants — start with a simple system"], productIds: [] },
  { ...base("tech-traceability", "QR / Batch Traceability", "batch-traceability", "Batch codes and QR labels linking product to farm lots, process records and CoAs."), maturity: "USEFUL_NOW", area: "Quality", whatItDoes: ["Recall readiness", "Buyer transparency"], whereItPays: ["Export food products", "Branded VCO/DC"], caution: ["Only valuable if records behind the code are real"], productIds: ["prd-virgin-coconut-oil", "prd-desiccated-coconut", "prd-cocopeat"] },
  { ...base("tech-procurement-app", "Farmer & Procurement Management Software", "procurement-software", "Farmer registry, collection-centre weighment, payments, grade capture."), maturity: "USEFUL_NOW", area: "Procurement", whatItDoes: ["Digital weighment and payments", "Grade-based pricing records"], whereItPays: ["Direct/FPO procurement above ~5,000 nuts/day"], caution: ["Adoption requires field staff, not just an app"], productIds: [] },
  { ...base("tech-sensors-drying", "Dryer Sensors & Moisture Control", "dryer-moisture-control", "Inline temperature/humidity and outlet moisture control for DC/copra/flour dryers."), maturity: "USEFUL_NOW", area: "Process control", whatItDoes: ["Stops over/under-drying", "Cuts energy"], whereItPays: ["Every drying operation"], caution: ["Calibrate against lab moisture"], productIds: ["prd-desiccated-coconut", "prd-copra", "prd-coconut-flour"] },
  { ...base("tech-cold-chain-iot", "Cold-chain Temperature Logging", "cold-chain-iot", "Data loggers/IoT for chilled coconut water and milk."), maturity: "USEFUL_NOW", area: "Logistics", whatItDoes: ["Proves temperature compliance"], whereItPays: ["Chilled beverages"], caution: [""], productIds: ["prd-coconut-water"] },
  { ...base("tech-route-opt", "Route Optimisation for Collection & Distribution", "route-optimisation", "Software to plan collection routes and delivery drops."), maturity: "USEFUL_AT_SCALE", area: "Logistics", whatItDoes: ["Reduces km per tonne"], whereItPays: ["Multi-centre procurement or metro distribution fleets"], caution: ["Spreadsheet suffices below ~10 routes"], productIds: [] },
  { ...base("tech-demand-forecast", "Demand Forecasting & Analytics", "demand-forecasting", "Statistical forecasting of orders and seasonality."), maturity: "USEFUL_AT_SCALE", area: "Analytics", whatItDoes: ["Plans utilisation and inventory"], whereItPays: ["Multi-product plants, branded portfolios"], caution: ["Needs 2+ years of clean data"], productIds: [] },
  { ...base("tech-factory-automation", "Factory Automation (PLC/SCADA lines)", "factory-automation", "Automated nut-prep, drying, filling lines with PLC control."), maturity: "USEFUL_AT_SCALE", area: "Manufacturing", whatItDoes: ["Reduces labour, improves consistency"], whereItPays: ["Above ~5 t/day DC, aseptic milk, AC kilns"], caution: ["Capital and skills; labour cost in India often favours semi-automation"], productIds: ["prd-desiccated-coconut", "prd-coconut-milk", "prd-activated-carbon"] },
  { ...base("tech-predictive-maintenance", "Predictive Maintenance", "predictive-maintenance", "Vibration/temperature sensors predicting failures on kilns, expellers, centrifuges."), maturity: "USEFUL_AT_SCALE", area: "Maintenance", whatItDoes: ["Avoids unplanned downtime"], whereItPays: ["24/7 AC plants; large expellers"], caution: ["Preventive maintenance schedules come first"], productIds: ["prd-activated-carbon", "prd-coconut-oil"] },
  { ...base("tech-cv-grading", "Computer-vision Nut Grading", "computer-vision-grading", "Camera-based grading of nuts by size, colour, damage."), maturity: "EXPERIMENTAL", area: "Procurement", whatItDoes: ["Objective grading at receiving"], whereItPays: ["Large receiving volumes with grade disputes"], caution: ["Maturity is not visible externally; kernel quality still needs sampling"], productIds: [] },
  { ...base("tech-ai-general", "Generative AI for Operations", "generative-ai", "LLM-based assistants for documentation, SOPs, buyer communication."), maturity: "USEFUL_NOW", area: "Admin", whatItDoes: ["Drafts SOPs, export documents, buyer replies"], whereItPays: ["Small teams"], caution: ["Never for compliance numbers without verification; not magic"], productIds: [] },
  { ...base("tech-blockchain", "Blockchain Traceability", "blockchain-traceability", "Distributed-ledger product provenance."), maturity: "UNNECESSARY_HYPE", area: "Quality", whatItDoes: ["Immutable records"], whereItPays: ["Rarely — a database with audit logs achieves buyer needs"], caution: ["Cost and complexity without buyer demand"], productIds: [] },
  { ...base("tech-drone-farm", "Drone Palm Monitoring", "drone-monitoring", "Aerial imaging for pest/disease and palm counts."), maturity: "EXPERIMENTAL", area: "Farm", whatItDoes: ["Palm census, whitefly detection"], whereItPays: ["Large estates or FPO service models"], caution: ["Actionability depends on ground teams"], productIds: [] },
  { ...base("tech-biomass-energy", "Biomass Boilers & Heat Recovery", "biomass-energy", "Shell/husk-fired boilers and kiln heat recovery for dryers."), maturity: "USEFUL_NOW", area: "Energy", whatItDoes: ["Replaces purchased fuel with by-products"], whereItPays: ["Any plant with dryers and shell/husk"], caution: ["Emissions and boiler compliance"], productIds: ["prd-desiccated-coconut", "prd-copra", "prd-activated-carbon"] },
];
