import type { Certification, Country, CustomerSegment, Regulation, Risk, StateProfile } from "@/domain/types";
import { base, rr, ej } from "./helpers";

const EJ = ["src-internal-ej"];

const seg = (
  id: string, name: string, slug: string, summary: string, kind: CustomerSegment["kind"], productIds: string[],
  fields: Partial<CustomerSegment>,
): CustomerSegment => ({
  ...base(id, name, slug, summary), kind, productIds,
  whatTheyBuy: [], whyTheyBuy: [], specification: [], qualityRequirements: [], packaging: [],
  moq: rr("kg", "MOQ varies by buyer; capture in field validation."), purchaseFrequency: "RESEARCH REQUIRED", certifications: [],
  buyingProcess: [], paymentTerms: rr("days", "Credit days vary; capture written terms from buyers."), problems: [], selectionCriteria: [], opportunity: [],
  sourceIds: EJ, ...fields,
});

export const customerSegments: CustomerSegment[] = [
  seg("cus-hotels", "Hotels", "hotels", "Hotel kitchens and F&B buying coconut milk, cream, DC, water and oil for menus.", "Institutional", ["prd-coconut-milk", "prd-coconut-cream", "prd-coconut-water", "prd-desiccated-coconut", "prd-virgin-coconut-oil"], {
    whatTheyBuy: ["Coconut milk/cream (retail and food-service packs)", "Tender coconut water", "DC for pastry", "Coconut oil for regional cuisine"],
    whyTheyBuy: ["Menu consistency vs fresh grating labour", "Shelf-stable stock", "Hygiene assurance"],
    specification: ["Fat % of milk/cream", "Pack size (1 L / 5 L / 20 L)", "Shelf life ≥ 6 months for ambient packs"],
    qualityRequirements: ["FSSAI licence", "No off-flavour", "Consistent viscosity/fat"],
    packaging: ["Tetra/aseptic packs", "HDPE cans for food service", "Bag-in-box"],
    purchaseFrequency: "Weekly to fortnightly via distributors", certifications: ["FSSAI", "HACCP preferred"],
    buyingProcess: ["Chef trial → purchase manager listing → distributor supply"], problems: ["Fresh grating labour", "Inconsistent supplier quality"],
    selectionCriteria: ["Consistency", "Price per litre of fat", "Delivery reliability"], opportunity: ["Food-service packs of milk/cream", "Chilled coconut water contracts"],
  }),
  seg("cus-restaurants", "Restaurants & Cloud Kitchens", "restaurants", "Restaurants, cloud kitchens and caterers using coconut ingredients daily.", "Institutional", ["prd-coconut-milk", "prd-coconut-cream", "prd-desiccated-coconut", "prd-coconut-oil"], {
    whatTheyBuy: ["Coconut milk", "Grated/desiccated coconut", "Coconut oil"], whyTheyBuy: ["Speed and consistency", "Storage convenience"],
    specification: ["Fat %", "Pack size"], qualityRequirements: ["FSSAI", "Consistent taste"], packaging: ["1 L packs", "5 kg bulk"],
    purchaseFrequency: "Weekly", buyingProcess: ["Distributor / HoReCa platforms"], problems: ["Price sensitivity", "Small drops"],
    selectionCriteria: ["Price", "Availability"], opportunity: ["HoReCa distribution partnerships"],
  }),
  seg("cus-bakeries", "Bakeries & Confectioners", "bakeries", "Bakeries and confectioners buying desiccated coconut, flour, chips and flakes.", "B2B", ["prd-desiccated-coconut", "prd-coconut-flour", "prd-coconut-flakes", "prd-coconut-chips"], {
    whatTheyBuy: ["Desiccated coconut (fine/medium)", "Toasted flakes/chips", "Coconut flour for gluten-free lines"],
    whyTheyBuy: ["Texture and flavour in biscuits, cakes, macaroons", "Gluten-free formulations"],
    specification: ["Grade (fine/medium/coarse)", "Moisture ≤ spec", "Fat %", "Colour (white)", "Free fatty acid"],
    qualityRequirements: ["FSSAI/Codex DC standards", "No rancidity", "Sieve consistency", "Microbial limits"],
    packaging: ["25 kg multi-wall paper bags with PE liner", "10 kg cartons"],
    purchaseFrequency: "Monthly contracts, weekly deliveries for large bakeries", certifications: ["FSSAI", "ISO 22000/HACCP for large buyers"],
    buyingProcess: ["Sample → lab test → trial batch → rate contract"], problems: ["Rancidity in stored DC", "Batch variation"],
    selectionCriteria: ["Consistency", "Price per kg", "Shelf life", "Lead time"], opportunity: ["Specification-led DC supply", "Coconut flour for gluten-free bakers"],
  }),
  seg("cus-food-manufacturers", "Food Manufacturers", "food-manufacturers", "Packaged-food makers using coconut milk powder, DC, oil, flour and chips as ingredients.", "B2B", ["prd-desiccated-coconut", "prd-coconut-milk", "prd-coconut-cream", "prd-coconut-oil", "prd-coconut-flour", "prd-virgin-coconut-oil"], {
    whatTheyBuy: ["Bulk DC", "Aseptic milk/cream", "Oil in drums/IBC", "Flour"], whyTheyBuy: ["Ingredient functionality", "Cost per functional unit", "Supply security"],
    specification: ["Full CoA per batch", "Fat, moisture, FFA, peroxide value", "Microbial: TPC, yeast & mould, coliform, Salmonella absent"],
    qualityRequirements: ["HACCP/ISO 22000", "Supplier audit", "Allergen and traceability documentation"],
    packaging: ["25 kg bags", "200 kg drums", "1000 L IBC/aseptic bags"], purchaseFrequency: "Monthly/quarterly contracts",
    certifications: ["FSSAI", "ISO 22000 / FSSC 22000", "Kosher/Halal where required"], buyingProcess: ["Vendor qualification → audit → contract"],
    problems: ["Supplier consistency", "Price volatility"], selectionCriteria: ["Audit pass", "Consistency", "Price", "Credit terms"],
    opportunity: ["Become an audited ingredient vendor"],
  }),
  seg("cus-ingredient-companies", "Ingredient Companies & Traders", "ingredient-companies", "Ingredient distributors and traders aggregating coconut ingredients for manufacturers and export.", "B2B", ["prd-desiccated-coconut", "prd-coconut-oil", "prd-virgin-coconut-oil", "prd-coconut-flour", "prd-copra"], {
    whatTheyBuy: ["Bulk DC, oil, VCO, flour, copra"], whyTheyBuy: ["Resale margin", "Aggregation for large buyers"],
    specification: ["Standard grades", "Bulk packaging"], qualityRequirements: ["CoA", "Consistency"], packaging: ["Bulk"],
    purchaseFrequency: "Ongoing", buyingProcess: ["Price negotiation on market benchmarks"], problems: ["Thin margins"], selectionCriteria: ["Price", "Volume reliability"],
    opportunity: ["Volume offtake for new plants"],
  }),
  seg("cus-beverage-manufacturers", "Beverage Manufacturers", "beverage-manufacturers", "Beverage makers using coconut water, concentrate and coconut milk bases.", "B2B", ["prd-coconut-water", "prd-coconut-milk"], {
    whatTheyBuy: ["Coconut water concentrate or aseptic single-strength", "Coconut milk base"], whyTheyBuy: ["Plant-based beverage lines"],
    specification: ["Brix", "pH", "Microbial", "Colour stability"], qualityRequirements: ["Aseptic", "FSSAI"], packaging: ["Aseptic drums/bag-in-box"],
    purchaseFrequency: "Contract", buyingProcess: ["R&D trial → supplier approval"], problems: ["Browning", "Flavour"], selectionCriteria: ["Flavour stability", "Price per Brix"],
    opportunity: ["Concentrate supply from tender-nut regions"],
  }),
  seg("cus-distributors", "Distributors & Wholesalers", "distributors", "FMCG and food-service distributors carrying coconut products to retail and HoReCa.", "B2B", ["prd-coconut-oil", "prd-virgin-coconut-oil", "prd-coconut-chips", "prd-coconut-milk", "prd-coconut-water"], {
    whatTheyBuy: ["Branded packs"], whyTheyBuy: ["Margin and range"], specification: ["Shelf life ≥ 9 months", "Case configuration"],
    qualityRequirements: ["Barcoded, FSSAI-compliant labels"], packaging: ["Retail packs in cases"], purchaseFrequency: "Weekly",
    buyingProcess: ["Margin negotiation, credit"], problems: ["Slow-moving SKUs", "Returns"], selectionCriteria: ["Margin", "Brand pull", "Credit days"],
    opportunity: ["Regional distribution for new brands"],
  }),
  seg("cus-retailers", "Retailers & Supermarkets", "retailers", "Modern trade, supermarkets, and specialty stores.", "B2C", ["prd-coconut-oil", "prd-virgin-coconut-oil", "prd-coconut-chips", "prd-coconut-water", "prd-coconut-flour", "prd-coconut-sugar"], {
    whatTheyBuy: ["Retail SKUs"], whyTheyBuy: ["Category demand", "Margin"], specification: ["Barcode, labelling, shelf life", "Pack sizes"],
    qualityRequirements: ["FSSAI labelling compliance", "Legal metrology"], packaging: ["Retail packs"], purchaseFrequency: "Weekly replenishment",
    buyingProcess: ["Listing fees, margins, promotions"], problems: ["Listing costs", "Returns"], selectionCriteria: ["Margin", "Sell-through", "Brand support"],
    opportunity: ["Private label for retailers"],
  }),
  seg("cus-quick-commerce", "Quick-commerce & E-commerce", "quick-commerce", "Online grocery and quick-commerce platforms.", "B2C", ["prd-coconut-water", "prd-coconut-chips", "prd-virgin-coconut-oil"], {
    whatTheyBuy: ["Fast-moving SKUs"], whyTheyBuy: ["Assortment"], specification: ["Dark-store friendly packs", "Shelf life"], qualityRequirements: ["Labelling compliance"],
    packaging: ["Retail"], purchaseFrequency: "Continuous", buyingProcess: ["Onboarding, margins, ads"], problems: ["High platform margins and ad costs"],
    selectionCriteria: ["Conversion", "Margin"], opportunity: ["Chilled coconut water in metro dark stores"],
  }),
  seg("cus-exporters", "Exporters / Merchant Exporters", "exporters", "Merchant exporters buying finished coconut products for overseas buyers.", "Export", ["prd-desiccated-coconut", "prd-activated-carbon", "prd-cocopeat", "prd-coir-fibre", "prd-shell-charcoal", "prd-virgin-coconut-oil"], {
    whatTheyBuy: ["Export-grade lots"], whyTheyBuy: ["Overseas orders"], specification: ["Buyer specs", "Container loads"], qualityRequirements: ["Export certifications"],
    packaging: ["Export packaging, palletised"], purchaseFrequency: "Order-based", buyingProcess: ["Sample approval → LC/advance → shipment"],
    problems: ["Rejections at destination"], selectionCriteria: ["Certification", "Consistency", "Price"], opportunity: ["Supplying merchant exporters before exporting directly"],
  }),
  seg("cus-industrial-buyers", "Industrial Buyers", "industrial-buyers", "Manufacturers using coconut-derived industrial materials: shell powder, charcoal, fibre.", "Industrial", ["prd-shell-powder", "prd-shell-charcoal", "prd-coir-fibre", "prd-biochar"], {
    whatTheyBuy: ["Shell powder (mesh grades)", "Charcoal (size, fixed carbon)", "Fibre"], whyTheyBuy: ["Filler/fuel/reinforcement functionality"],
    specification: ["Mesh size", "Moisture", "Ash", "Fixed carbon"], qualityRequirements: ["Consistent grade"], packaging: ["50 kg / jumbo bags"],
    purchaseFrequency: "Monthly", buyingProcess: ["Sample, price, credit"], problems: ["Inconsistent supply"], selectionCriteria: ["Price", "Consistency"],
    opportunity: ["Steady industrial contracts"],
  }),
  seg("cus-horticulture", "Horticulture & Greenhouse Companies", "horticulture-companies", "Protected-cultivation growers using cocopeat grow bags and blocks.", "B2B", ["prd-cocopeat"], {
    whatTheyBuy: ["Grow bags", "5 kg blocks", "Buffered media"], whyTheyBuy: ["Substrate performance for vegetables and berries"],
    specification: ["EC, pH, particle size, expansion volume", "Buffered vs unbuffered", "Grow-bag dimensions"],
    qualityRequirements: ["Pathogen-free", "Consistent EC batch to batch"], packaging: ["Palletised blocks", "Bagged grow bags"],
    purchaseFrequency: "Seasonal (planting cycles)", buyingProcess: ["Trial → seasonal contract"], problems: ["High-EC batches damaging crops"],
    selectionCriteria: ["Consistency", "Price per litre expanded", "Support"], opportunity: ["Buffered media for berry growers"],
  }),
  seg("cus-nurseries", "Nurseries", "nurseries", "Plant nurseries using cocopeat-based potting mixes.", "B2B", ["prd-cocopeat"], {
    whatTheyBuy: ["Cocopeat bricks/blocks", "Potting mix"], whyTheyBuy: ["Germination and root development"], specification: ["Fine grade, low EC"],
    qualityRequirements: ["Weed-free"], packaging: ["650 g bricks, 5 kg blocks"], purchaseFrequency: "Monthly", buyingProcess: ["Local dealers"],
    problems: ["Quality variability"], selectionCriteria: ["Price", "Quality"], opportunity: ["Regional dealer network"],
  }),
  seg("cus-hydroponic-farms", "Hydroponic Farms", "hydroponic-farms", "Soilless farms using cocopeat slabs and grow bags.", "B2B", ["prd-cocopeat"], {
    whatTheyBuy: ["Slabs, grow bags, buffered cocopeat"], whyTheyBuy: ["Substrate for tomato, cucumber, strawberry"], specification: ["Low EC, buffered, specific particle blend"],
    qualityRequirements: ["Pathogen-free, consistent"], packaging: ["Slabs with drip holes"], purchaseFrequency: "Per crop cycle",
    buyingProcess: ["Agronomist trial"], problems: ["Root disease from contaminated media"], selectionCriteria: ["Agronomic performance"], opportunity: ["Premium buffered slabs"],
  }),
  seg("cus-water-treatment", "Water-treatment Companies", "water-treatment-companies", "Municipal and industrial water/wastewater treatment using granular activated carbon.", "Industrial", ["prd-activated-carbon"], {
    whatTheyBuy: ["Granular activated carbon (GAC)", "Powdered AC"], whyTheyBuy: ["Adsorption of organics, chlorine, taste/odour"],
    specification: ["Iodine number", "Particle size (e.g. 8×30, 12×40 mesh)", "Hardness/abrasion", "Ash", "Moisture", "Apparent density"],
    qualityRequirements: ["Batch CoA", "Consistency", "Relevant standards (ASTM/AWWA/IS)"], packaging: ["25 kg bags", "500 kg jumbo bags"],
    purchaseFrequency: "Quarterly/annual tenders", buyingProcess: ["Tender / spec qualification"], problems: ["Inconsistent iodine number", "Fines"],
    selectionCriteria: ["Spec compliance", "Price per kg", "Supply reliability"], opportunity: ["Domestic GAC supply to treatment contractors"],
  }),
  seg("cus-filtration", "Filtration & Purifier Manufacturers", "filtration-companies", "Domestic and industrial filter makers using coconut-shell carbon.", "Industrial", ["prd-activated-carbon"], {
    whatTheyBuy: ["GAC and carbon blocks", "Silver-impregnated grades"], whyTheyBuy: ["Coconut carbon's microporosity suits taste/odour removal"],
    specification: ["Iodine number ≥ buyer spec", "Low ash", "Particle size", "pH"], qualityRequirements: ["NSF/food-contact grades where required"],
    packaging: ["25 kg bags"], purchaseFrequency: "Monthly", buyingProcess: ["Qualification lot → contract"], problems: ["Dust", "Variation"],
    selectionCriteria: ["Spec compliance", "Price"], opportunity: ["Domestic purifier OEM supply"],
  }),
  seg("cus-personal-care", "Personal-care Manufacturers", "personal-care-manufacturers", "Cosmetic and personal-care brands using coconut oil, VCO and derivatives.", "B2B", ["prd-virgin-coconut-oil", "prd-coconut-oil"], {
    whatTheyBuy: ["Cosmetic-grade VCO/RBD coconut oil"], whyTheyBuy: ["Emollient, hair oil base, soap"], specification: ["FFA, peroxide value, colour, odour", "Cosmetic-grade CoA"],
    qualityRequirements: ["GMP", "Batch traceability"], packaging: ["Drums, IBC"], purchaseFrequency: "Monthly", buyingProcess: ["Sample, CoA, contract"],
    problems: ["Odour variation"], selectionCriteria: ["Consistency", "Price"], opportunity: ["Cosmetic-grade VCO supply"],
  }),
];

export const customerSegmentById = Object.fromEntries(customerSegments.map((c) => [c.id, c]));

// ---------------------------------------------------------------------------

export const regulations: Regulation[] = [
  { ...base("reg-fssai-licence", "FSSAI Licensing & Registration", "fssai-licensing", "Mandatory licence/registration for any food business in India under the FSS Act 2006."), authority: "FSSAI", scope: ["All food products: DC, flour, milk, cream, oil, VCO, chips, water, sugar"], appliesToProductIds: ["prd-desiccated-coconut", "prd-coconut-flour", "prd-coconut-milk", "prd-coconut-cream", "prd-coconut-oil", "prd-virgin-coconut-oil", "prd-coconut-chips", "prd-coconut-flakes", "prd-coconut-water", "prd-coconut-sugar", "prd-copra"], requirements: ["Basic registration / State licence / Central licence by turnover and scale", "Food safety management system", "Labelling per FSS (Labelling & Display) Regulations", "Product standards per FSS (Food Products Standards) Regulations"], url: "https://www.fssai.gov.in", sourceIds: ["src-fssai"] },
  { ...base("reg-fss-product-standards", "FSS (Food Products Standards & Food Additives) Regulations 2011", "fss-product-standards", "Compositional standards for specific coconut foods — edible oils incl. coconut oil and VCO, desiccated coconut, coconut milk/cream, coconut sugar."), authority: "FSSAI", scope: ["Compositional limits: moisture, fat, FFA, additives"], appliesToProductIds: ["prd-desiccated-coconut", "prd-coconut-oil", "prd-virgin-coconut-oil", "prd-coconut-milk", "prd-coconut-cream", "prd-coconut-sugar"], requirements: ["Product must meet the numeric standard for its category — verify the current consolidated text for each parameter", "Testing at NABL/FSSAI-notified labs"], url: "https://www.fssai.gov.in", sourceIds: ["src-fssai"] },
  { ...base("reg-legal-metrology", "Legal Metrology (Packaged Commodities) Rules", "legal-metrology", "Net quantity, MRP and declaration rules for packaged goods."), authority: "Department of Consumer Affairs", scope: ["All retail packs"], appliesToProductIds: ["prd-coconut-chips", "prd-virgin-coconut-oil", "prd-coconut-oil", "prd-coconut-water", "prd-coconut-flour", "prd-coconut-sugar"], requirements: ["Standard declarations on label", "Registration of packer/manufacturer"], sourceIds: ["src-internal-ej"] },
  { ...base("reg-pcb-consent", "State Pollution Control Board Consent (CTE/CTO)", "pcb-consent", "Consent to Establish and Operate under Water and Air Acts; industry category (red/orange/green/white) decides complexity."), authority: "State PCBs / CPCB", scope: ["All manufacturing units; kilns and effluent-generating processes face stricter categories"], appliesToProductIds: ["prd-shell-charcoal", "prd-activated-carbon", "prd-cocopeat", "prd-coconut-milk", "prd-coconut-oil", "prd-biochar"], requirements: ["Category determination (RESEARCH REQUIRED per process and state)", "Effluent treatment for washing/milk lines", "Emission control for kilns"], url: "https://cpcb.nic.in", sourceIds: ["src-cpcb"] },
  { ...base("reg-udyam", "Udyam (MSME) Registration", "udyam-registration", "Registration for micro/small/medium enterprises; prerequisite for many schemes."), authority: "Ministry of MSME", scope: ["All MSMEs"], appliesToProductIds: [], requirements: ["Online registration with PAN/Aadhaar"], url: "https://udyamregistration.gov.in", sourceIds: ["src-msme"] },
  { ...base("reg-iec", "Importer-Exporter Code (IEC)", "iec", "Mandatory code from DGFT for export/import."), authority: "DGFT", scope: ["All exporters"], appliesToProductIds: ["prd-desiccated-coconut", "prd-activated-carbon", "prd-cocopeat", "prd-coir-fibre", "prd-virgin-coconut-oil", "prd-shell-charcoal"], requirements: ["IEC registration", "RCMC from APEDA/Coir Board as applicable"], url: "https://www.dgft.gov.in", sourceIds: ["src-dgft"] },
  { ...base("reg-apeda-rcmc", "APEDA Registration (RCMC)", "apeda-rcmc", "Registration-cum-Membership Certificate for exporters of scheduled products."), authority: "APEDA", scope: ["Scheduled agri-food products"], appliesToProductIds: ["prd-desiccated-coconut", "prd-virgin-coconut-oil", "prd-coconut-water"], requirements: ["RCMC application", "Compliance with APEDA export guidelines"], url: "https://apeda.gov.in", sourceIds: ["src-apeda"] },
  { ...base("reg-coir-board-reg", "Coir Board Registration for Exporters", "coir-board-registration", "Registration of coir exporters with Coir Board."), authority: "Coir Board", scope: ["Coir fibre, pith, products"], appliesToProductIds: ["prd-cocopeat", "prd-coir-fibre", "prd-coir-geotextile", "prd-coir-yarn"], requirements: ["Exporter registration; quality guidelines"], url: "https://coirboard.gov.in", sourceIds: ["src-coir-board"] },
  { ...base("reg-state-excise-neera", "State Excise / Abkari Rules for Neera Tapping", "neera-tapping-rules", "Tapping of coconut inflorescence sap is regulated by state excise because sap ferments into toddy."), authority: "State Governments", scope: ["Neera, coconut sugar via tapping"], appliesToProductIds: ["prd-coconut-sugar"], requirements: ["Licence requirements differ by state — RESEARCH REQUIRED"], sourceIds: ["src-internal-ej"] },
  { ...base("reg-factories-act", "Factories Act / State Factory Rules", "factories-act", "Registration and compliance for units above worker/power thresholds."), authority: "State Labour Departments", scope: ["Units above thresholds"], appliesToProductIds: [], requirements: ["Factory licence", "Safety, welfare provisions"], sourceIds: ["src-internal-ej"] },
];

export const certifications: Certification[] = [
  { ...base("cert-haccp", "HACCP", "haccp", "Hazard Analysis and Critical Control Points — food safety management."), issuer: "Accredited certification bodies", purpose: "Demonstrates hazard control for food buyers.", typicalFor: ["Food ingredients"], requiredForMarkets: ["Institutional and export food buyers"], productIds: ["prd-desiccated-coconut", "prd-coconut-flour", "prd-coconut-milk", "prd-virgin-coconut-oil", "prd-coconut-chips", "prd-coconut-water"], costIndication: rr("INR", "Certification cost depends on body and scale; obtain quotations."), sourceIds: EJ },
  { ...base("cert-iso22000", "ISO 22000 / FSSC 22000", "iso-22000", "Food safety management system standards frequently required by large manufacturers and importers."), issuer: "Accredited certification bodies", purpose: "Supplier qualification for large food buyers.", typicalFor: ["Food ingredients"], requiredForMarkets: ["EU/US/Middle East food importers", "Large Indian manufacturers"], productIds: ["prd-desiccated-coconut", "prd-coconut-milk", "prd-coconut-cream", "prd-virgin-coconut-oil", "prd-coconut-flour"], costIndication: rr("INR", "Obtain quotations."), sourceIds: EJ },
  { ...base("cert-organic", "Organic (NPOP / USDA NOP / EU)", "organic", "Organic certification under India's NPOP with equivalence/recognition for export markets."), issuer: "APEDA-accredited certification bodies", purpose: "Access to organic premium markets.", typicalFor: ["VCO, DC, coconut sugar, flour"], requiredForMarkets: ["Organic retail in EU/US"], productIds: ["prd-virgin-coconut-oil", "prd-desiccated-coconut", "prd-coconut-sugar", "prd-coconut-flour"], costIndication: rr("INR", "Farm-group and processor certification costs — obtain quotations."), sourceIds: ["src-apeda"] },
  { ...base("cert-halal", "Halal", "halal", "Required by many Middle East and South-East Asian food buyers."), issuer: "Recognised halal bodies", purpose: "Market access.", typicalFor: ["Food"], requiredForMarkets: ["GCC", "Malaysia", "Indonesia"], productIds: ["prd-desiccated-coconut", "prd-coconut-milk", "prd-virgin-coconut-oil"], costIndication: rr("INR", "Obtain quotations."), sourceIds: EJ },
  { ...base("cert-kosher", "Kosher", "kosher", "Required by some US/EU food buyers."), issuer: "Kosher agencies", purpose: "Market access.", typicalFor: ["Food"], requiredForMarkets: ["US", "EU"], productIds: ["prd-desiccated-coconut", "prd-virgin-coconut-oil", "prd-coconut-flour"], costIndication: rr("INR", "Obtain quotations."), sourceIds: EJ },
  { ...base("cert-bis-is", "BIS / IS Standard Marking", "bis-is-marking", "Conformance to relevant Indian Standards (e.g. coconut oil IS 542, activated carbon standards, coir products)."), issuer: "Bureau of Indian Standards", purpose: "Domestic quality assurance; some tenders require IS conformity.", typicalFor: ["Coconut oil", "Activated carbon", "Coir"], requiredForMarkets: ["Government tenders", "Industrial buyers"], productIds: ["prd-coconut-oil", "prd-activated-carbon", "prd-coir-geotextile"], costIndication: rr("INR", "BIS licensing fees — verify current schedule."), sourceIds: ["src-bis"] },
  { ...base("cert-nsf", "NSF/ANSI 61 (drinking-water components)", "nsf-ansi-61", "Certification for activated carbon used in drinking-water treatment in North America."), issuer: "NSF International", purpose: "Access to US/Canada drinking-water market.", typicalFor: ["Activated carbon"], requiredForMarkets: ["USA", "Canada"], productIds: ["prd-activated-carbon"], costIndication: rr("USD", "Obtain quotation."), sourceIds: EJ },
  { ...base("cert-phyto", "Phytosanitary Certificate", "phytosanitary", "Plant-quarantine certificate for horticultural and plant-derived exports (cocopeat, coir)."), issuer: "Plant Quarantine Organisation of India", purpose: "Import clearance in destination country.", typicalFor: ["Cocopeat", "Coir"], requiredForMarkets: ["Most destinations"], productIds: ["prd-cocopeat", "prd-coir-fibre", "prd-coir-geotextile"], costIndication: rr("INR", "Per-consignment fee — verify."), sourceIds: EJ },
  { ...base("cert-gmp-cosmetic", "Cosmetic GMP (ISO 22716)", "cosmetic-gmp", "Good manufacturing practice for cosmetic-grade oils."), issuer: "Accredited bodies", purpose: "Cosmetic buyer qualification.", typicalFor: ["Cosmetic-grade VCO/oil"], requiredForMarkets: ["Personal-care manufacturers"], productIds: ["prd-virgin-coconut-oil"], costIndication: rr("INR", "Obtain quotation."), sourceIds: EJ },
];

// ---------------------------------------------------------------------------

const risk = (id: string, name: string, category: Risk["category"], description: string[], mitigation: string[]): Risk => ({
  ...base(id, name, id.replace("rsk-", ""), description[0]), category, description, genericMitigation: mitigation,
});

export const risks: Risk[] = [
  risk("rsk-raw-material", "Raw-material availability", "raw_material", ["Nut supply depends on harvest cycles, competing buyers (tender-nut, copra, retail) and local traders."], ["Multiple procurement channels", "Farmer clusters", "Storage of shelf-stable intermediates (copra, shell, dry husk)"]),
  risk("rsk-seasonality", "Seasonality", "seasonality", ["Nut availability and prices swing seasonally; utilisation falls in lean months."], ["Plan capacity on lean-season supply", "Inventory of storable intermediates", "Off-season product mix"]),
  risk("rsk-price", "Raw-material price volatility", "price", ["Coconut, copra and oil prices are volatile and can move against contracted selling prices."], ["Price-linked contracts", "Shorter contract cycles", "Hedging via product mix"]),
  risk("rsk-climate", "Climate & weather", "climate", ["Drought, cyclones and heat affect yields and drying operations."], ["Diversified sourcing regions", "Mechanical drying capacity"]),
  risk("rsk-quality", "Quality variability", "quality", ["Mixed maturity, mould, and inconsistent grading reduce yield and cause rejections."], ["Receiving inspection", "Grade-based pricing", "Supplier scorecards"]),
  risk("rsk-food-safety", "Food-safety failure", "food_safety", ["Contamination, rancidity, aflatoxin (copra), microbial failure lead to recalls and licence risk."], ["HACCP", "Potable water", "Lab testing per batch", "Hygienic zoning"]),
  risk("rsk-machinery", "Machinery downtime & wrong specification", "machinery", ["Breakdowns, spare-part delays and mis-specified machines reduce output."], ["Supplier service agreements", "Spares inventory", "Pilot before full-scale purchase"]),
  risk("rsk-labour", "Labour availability & skill", "labour", ["Skilled operators, climbers and tappers are scarce; attrition is high."], ["Training", "Semi-automation", "Retention incentives"]),
  risk("rsk-power", "Power reliability & cost", "power", ["Outages and tariff increases hit dryers, kilns and cold chains."], ["Backup generation", "Biomass fuel for thermal loads", "Solar where viable"]),
  risk("rsk-water", "Water availability & effluent", "water", ["Washing, milk lines and pith processing need large volumes and generate effluent."], ["Water recycling", "ETP sizing", "Site selection"]),
  risk("rsk-storage", "Storage losses", "storage", ["Moisture pickup, pests and fire in husk/shell yards."], ["Controlled storage", "FIFO", "Fire safety"]),
  risk("rsk-spoilage", "Spoilage / shelf-life", "spoilage", ["Fresh kernel, water and milk spoil rapidly; DC and VCO go rancid if mishandled."], ["Process within hours", "Moisture and packaging control", "Nitrogen flushing where justified"]),
  risk("rsk-technology", "Technology obsolescence / process failure", "technology", ["Chosen process fails to meet spec (e.g. iodine number, EC) or becomes uncompetitive."], ["Pilot trials", "Process validation with buyers"]),
  risk("rsk-working-capital", "Working-capital lock-up", "working_capital", ["Credit to buyers plus inventory ties up cash; growth starves liquidity."], ["Credit limits", "Advance/LC for export", "Inventory discipline"]),
  risk("rsk-competition", "Competition & price pressure", "competition", ["Established domestic and South-East Asian producers with scale advantages."], ["Specification niche", "Service and reliability", "Regional logistics advantage"]),
  risk("rsk-customer-concentration", "Customer concentration", "customer_concentration", ["Dependence on one or two buyers exposes the plant to sudden volume loss."], ["Diversify to ≥5 buyers", "Contracts with minimums"]),
  risk("rsk-distributor", "Distributor dependency", "distributor_dependency", ["Distributors control shelf access and credit; loss of a distributor collapses sales."], ["Multi-distributor strategy", "Direct institutional accounts"]),
  risk("rsk-export", "Export rejection & compliance", "export", ["Failed residue/microbial tests, wrong documentation, or phytosanitary issues cause rejections."], ["Pre-shipment testing", "Experienced forwarders", "Buyer-approved samples"]),
  risk("rsk-currency", "Currency movement", "currency", ["INR movements alter export margins between contract and payment."], ["Forward cover", "Shorter payment cycles"]),
  risk("rsk-regulation", "Regulatory change", "regulation", ["Standards, consents and scheme rules change; non-compliance halts operations."], ["Compliance calendar", "Consultants for consents"]),
  risk("rsk-reputation", "Reputation & adulteration", "reputation", ["Sector-wide adulteration concerns (oil) taint honest producers."], ["Third-party testing", "Traceability", "Transparent labelling"]),
];

export const riskById = Object.fromEntries(risks.map((r) => [r.id, r]));

// ---------------------------------------------------------------------------

const country = (id: string, name: string, slug: string, iso2: string, region: string, productIds: string[], ctx: string[], reg: string[], certs: string[], logistics: string[], currencyRisk: string): Country => ({
  ...base(id, name, slug, ctx[0]), iso2, region, productIds, marketContext: ctx, regulatoryNotes: reg, certificationsExpected: certs, logistics, currencyRisk, sourceIds: EJ,
});

export const countries: Country[] = [
  country("cty-usa", "United States", "united-states", "US", "North America", ["prd-activated-carbon", "prd-virgin-coconut-oil", "prd-desiccated-coconut", "prd-cocopeat", "prd-coconut-flour", "prd-coconut-water"], ["Large importer of coconut water, VCO, DC and coconut-shell activated carbon. Volumes by product — RESEARCH REQUIRED (USITC/APEDA)."], ["FDA facility registration and FSVP for food", "NSF/ANSI 61 for drinking-water carbon"], ["FDA registration", "Organic (USDA NOP) for premium", "Kosher common"], ["East and West Coast ports; 30–45 day transit from Indian west-coast ports"], "USD/INR — generally favourable to exporters on INR weakness; hedge receivables."),
  country("cty-eu", "European Union", "european-union", "EU", "Europe", ["prd-cocopeat", "prd-desiccated-coconut", "prd-virgin-coconut-oil", "prd-coir-geotextile", "prd-activated-carbon", "prd-coconut-flour"], ["Major cocopeat importer (peat substitution policies) and food-ingredient market. Country-level data — RESEARCH REQUIRED."], ["EU food-contact and contaminant limits (e.g. mineral oil, pesticide MRLs)", "Plant-health rules for growing media", "Organic regulation (EU 2018/848)"], ["ISO/FSSC 22000", "Organic EU", "Phytosanitary for cocopeat"], ["Rotterdam, Antwerp, Hamburg; 25–35 day transit"], "EUR/INR exposure."),
  country("cty-uk", "United Kingdom", "united-kingdom", "GB", "Europe", ["prd-desiccated-coconut", "prd-virgin-coconut-oil", "prd-cocopeat", "prd-coconut-water"], ["Established DC and coconut-product market; retailer private-label demand."], ["UK food law post-Brexit; BRCGS often required by retailers"], ["BRCGS", "Organic (Soil Association)"], ["Felixstowe, Southampton"], "GBP/INR exposure."),
  country("cty-uae", "United Arab Emirates", "uae", "AE", "Middle East", ["prd-coconut-water", "prd-desiccated-coconut", "prd-cocopeat", "prd-virgin-coconut-oil", "prd-coconut-milk"], ["Re-export hub and consumer market; halal requirement; strong hydroponic sector demand for cocopeat."], ["ESMA/GCC standards", "Halal"], ["Halal", "FSSAI export health certificate"], ["Jebel Ali; short transit (7–12 days) from west-coast India"], "AED pegged to USD."),
  country("cty-saudi", "Saudi Arabia", "saudi-arabia", "SA", "Middle East", ["prd-cocopeat", "prd-desiccated-coconut", "prd-coconut-water"], ["Greenhouse cultivation expansion drives cocopeat demand."], ["SFDA and SASO requirements", "Halal"], ["Halal"], ["Jeddah, Dammam"], "SAR pegged to USD."),
  country("cty-japan", "Japan", "japan", "JP", "East Asia", ["prd-activated-carbon", "prd-cocopeat", "prd-desiccated-coconut", "prd-coconut-sugar"], ["Quality-demanding market for activated carbon and cocopeat; strict specifications."], ["Strict positive-list pesticide regime for foods", "JAS organic"], ["JAS organic"], ["Tokyo, Yokohama, Osaka; 20–25 days"], "JPY/INR exposure."),
  country("cty-korea", "South Korea", "south-korea", "KR", "East Asia", ["prd-cocopeat", "prd-activated-carbon"], ["Large importer of cocopeat for protected cultivation."], ["Plant quarantine; growing-media registration"], ["Phytosanitary"], ["Busan"], "KRW/INR exposure."),
  country("cty-china", "China", "china", "CN", "East Asia", ["prd-cocopeat", "prd-shell-charcoal", "prd-coir-fibre", "prd-coconut-milk"], ["Importer of cocopeat, coir and shell charcoal; competitive and price-driven."], ["GACC registration for foods", "Quarantine for plant products"], ["GACC"], ["Shanghai, Shenzhen"], "CNY/INR exposure."),
  country("cty-germany", "Germany", "germany", "DE", "Europe", ["prd-desiccated-coconut", "prd-cocopeat", "prd-virgin-coconut-oil", "prd-coconut-flour"], ["Largest EU food-ingredient and organic market."], ["EU rules apply"], ["Organic EU", "IFS/BRCGS"], ["Hamburg"], "EUR/INR."),
  country("cty-netherlands", "Netherlands", "netherlands", "NL", "Europe", ["prd-cocopeat", "prd-coir-geotextile", "prd-desiccated-coconut"], ["Greenhouse capital of Europe — major cocopeat and growing-media importer; Rotterdam gateway."], ["EU rules apply; RHP quality mark common for growing media"], ["RHP (growing media)", "Phytosanitary"], ["Rotterdam"], "EUR/INR."),
  country("cty-australia", "Australia", "australia", "AU", "Oceania", ["prd-cocopeat", "prd-desiccated-coconut", "prd-virgin-coconut-oil", "prd-activated-carbon"], ["Strict biosecurity for cocopeat; established DC/VCO consumer market."], ["DAFF biosecurity import conditions for coir products", "FSANZ food standards"], ["Phytosanitary", "Organic ACO"], ["Sydney, Melbourne, Brisbane"], "AUD/INR."),
  country("cty-sri-lanka", "Sri Lanka", "sri-lanka", "LK", "South Asia", [], ["Competitor rather than market for most coconut products."], [], [], [], "n/a"),
];

export const countryById = Object.fromEntries(countries.map((c) => [c.id, c]));

// ---------------------------------------------------------------------------
// India states — simplified map shapes (normalised 0–100 grid; approximate outlines for visualisation only)

const dims = (rows: [string, number, number, string][]): StateProfile["dimensions"] =>
  rows.map(([dimension, score, weight, reason]) => ({ dimension, score, weight, reason, evidence: "EXPERT_JUDGMENT", sourceIds: EJ }));

const stateBase = (id: string, name: string, slug: string, code: string, summary: string, mapPath: string, labelXY: [number, number], d: StateProfile["dimensions"], eco: string[], gov: string[], ports: string[], notes: string[]): StateProfile => ({
  ...base(id, name, slug, summary), code, mapPath, labelXY,
  productionStats: [rr("million nuts", `Coconut production for ${name} — cite CDB state statistics with year; distinguish nuts vs tonnes.`)],
  dimensions: d, processingEcosystem: eco, governmentSupport: gov, ports, notes, sourceIds: ["src-cdb", ...EJ],
});

export const states: StateProfile[] = [
  stateBase("st-tn", "Tamil Nadu", "tamil-nadu", "TN", "One of India's largest coconut producers; Pollachi–Coimbatore is the country's densest coconut-processing and cocopeat-export cluster.",
    "M 44 78 L 52 74 L 58 78 L 60 88 L 56 98 L 48 100 L 42 92 Z", [50, 88],
    dims([["Raw-material availability", 9, 0.2, "Very high production and dense palm area (Coimbatore, Tiruppur, Thanjavur)"], ["Land", 6, 0.08, "Industrial land available in Pollachi/Coimbatore belt; prices rising"], ["Labour", 7, 0.1, "Experienced processing workforce"], ["Electricity", 7, 0.08, "Generally reliable industrial supply"], ["Water", 5, 0.08, "Water stress in parts of the belt"], ["Road", 8, 0.06, "Good highways"], ["Rail", 7, 0.04, "Coimbatore connectivity"], ["Port access", 8, 0.08, "Tuticorin (V.O. Chidambaranar), Chennai, Cochin within reach"], ["Market access", 7, 0.08, "Chennai, Bengaluru, Kerala markets"], ["Processing ecosystem", 10, 0.1, "Deepest cluster: DC, copra, oil, cocopeat, coir, charcoal, AC"], ["Suppliers", 9, 0.05, "Machinery fabricators concentrated in Coimbatore"], ["Government support", 7, 0.03, "CDB regional presence, state schemes"], ["Export connectivity", 9, 0.02, "Established cocopeat/AC export chains"]]),
    ["Pollachi cocopeat and coir cluster", "Copra and coconut oil mills", "DC units", "Shell charcoal and activated carbon units", "Machinery fabricators in Coimbatore"],
    ["State horticulture schemes (verify current)", "CDB schemes", "MSME cluster support"], ["Tuticorin", "Chennai", "Cochin (via road)"],
    ["Competition for raw material is intense — new entrants pay market price", "Deep supplier ecosystem lowers execution risk"]),
  stateBase("st-kl", "Kerala", "kerala", "KL", "Historic heart of Indian coconut and coir; strong copra, oil and coir traditions; high land and labour costs.",
    "M 38 74 L 44 78 L 42 92 L 40 100 L 34 96 L 32 84 Z", [37, 88],
    dims([["Raw-material availability", 8, 0.2, "Large palm area, but ageing palms and smallholdings"], ["Land", 4, 0.08, "Scarce and expensive industrial land"], ["Labour", 5, 0.1, "Skilled but high-cost, strong labour organisation"], ["Electricity", 7, 0.08, "Reliable"], ["Water", 8, 0.08, "Abundant"], ["Road", 6, 0.06, "Congested"], ["Rail", 7, 0.04, "Good"], ["Port access", 9, 0.08, "Cochin port and Vizhinjam"], ["Market access", 6, 0.08, "Domestic consumption strong; distant from north India"], ["Processing ecosystem", 9, 0.1, "Coir (Alappuzha), copra/oil, VCO, CDB HQ in Kochi"], ["Suppliers", 7, 0.05, "Good"], ["Government support", 8, 0.03, "Kerafed, Coir Board HQ, CDB HQ"], ["Export connectivity", 8, 0.02, "Cochin port"]]),
    ["Alappuzha coir cluster", "Copra and oil mills", "VCO and DC units", "CDB and Coir Board headquarters"],
    ["Coir Board schemes", "Kerala state coconut mission (verify)", "CDB"], ["Cochin", "Vizhinjam"],
    ["Land and labour costs are the main constraint", "Institutional knowledge is unmatched"]),
  stateBase("st-ka", "Karnataka", "karnataka", "KA", "Major producer (Tumakuru, Hassan, Chitradurga); copra (ball copra) and tender-nut supply for Bengaluru.",
    "M 34 56 L 46 54 L 50 64 L 46 74 L 38 74 L 32 66 Z", [40, 64],
    dims([["Raw-material availability", 8, 0.2, "Large production; Tiptur/Tumakuru copra belt"], ["Land", 7, 0.08, "Available in interior districts"], ["Labour", 6, 0.1, "Moderate"], ["Electricity", 6, 0.08, "Variable in rural areas"], ["Water", 5, 0.08, "Dry interior; groundwater stress"], ["Road", 7, 0.06, "Good"], ["Rail", 6, 0.04, "Moderate"], ["Port access", 6, 0.08, "Mangaluru; interior belt is far from ports"], ["Market access", 8, 0.08, "Bengaluru metro market"], ["Processing ecosystem", 7, 0.1, "Copra, oil, tender-nut trade; fewer DC/AC units"], ["Suppliers", 6, 0.05, "Moderate"], ["Government support", 6, 0.03, "State horticulture schemes"], ["Export connectivity", 5, 0.02, "Via Mangaluru/Chennai"]]),
    ["Tiptur copra market", "Oil mills", "Tender-nut trade to Bengaluru"], ["State horticulture schemes (verify)", "CDB"], ["Mangaluru"], ["Strong for copra-route and Bengaluru-facing beverage/retail models"]),
  stateBase("st-ap", "Andhra Pradesh", "andhra-pradesh", "AP", "East Godavari/Konaseema coconut belt with coir and pith units; port access via Kakinada and Visakhapatnam.",
    "M 48 54 L 62 50 L 70 58 L 66 70 L 56 72 L 50 64 Z", [60, 62],
    dims([["Raw-material availability", 8, 0.2, "Konaseema belt is dense and productive"], ["Land", 7, 0.08, "Available"], ["Labour", 7, 0.1, "Available; lower cost than Kerala"], ["Electricity", 7, 0.08, "Generally reliable"], ["Water", 8, 0.08, "Delta region — abundant"], ["Road", 7, 0.06, "Good highways"], ["Rail", 7, 0.04, "Good"], ["Port access", 8, 0.08, "Kakinada and Visakhapatnam nearby"], ["Market access", 7, 0.08, "Hyderabad, Vijayawada, Visakhapatnam"], ["Processing ecosystem", 7, 0.1, "Coir/pith, copra; growing"], ["Suppliers", 5, 0.05, "Thinner than Tamil Nadu"], ["Government support", 7, 0.03, "State support for food processing (verify)"], ["Export connectivity", 7, 0.02, "East-coast ports for East Asia"]]),
    ["Konaseema coir and pith units", "Copra trade", "Tender-nut supply to Hyderabad"], ["AP food-processing policy (verify current)", "CDB"], ["Kakinada", "Visakhapatnam"],
    ["Closest large supply belt to Hyderabad", "East-coast ports favour Asian export destinations"]),
  stateBase("st-ts", "Telangana", "telangana", "TS", "Limited coconut cultivation; Hyderabad is a demand, logistics and HQ hub rather than a raw-material base.",
    "M 46 40 L 58 38 L 62 50 L 48 54 L 44 46 Z", [53, 46],
    dims([["Raw-material availability", 2, 0.2, "Minimal cultivation — raw material must be hauled from AP/KA/TN"], ["Land", 7, 0.08, "Industrial parks available"], ["Labour", 7, 0.1, "Urban labour pool"], ["Electricity", 8, 0.08, "Reliable industrial power"], ["Water", 5, 0.08, "Moderate"], ["Road", 9, 0.06, "Excellent highway hub"], ["Rail", 8, 0.04, "Major junction"], ["Port access", 4, 0.08, "Nearest ports 500+ km (Kakinada, Visakhapatnam, Chennai)"], ["Market access", 9, 0.08, "Large metro consumption, HoReCa, quick commerce"], ["Processing ecosystem", 3, 0.1, "Few coconut processors"], ["Suppliers", 6, 0.05, "General engineering suppliers"], ["Government support", 7, 0.03, "TS-iPASS, industrial policy (verify)"], ["Export connectivity", 6, 0.02, "Air cargo strong; sea via distant ports"]]),
    ["Wholesale coconut markets", "Food manufacturing", "HoReCa and retail demand"], ["Telangana industrial policy (verify)"], ["None (Kakinada/Visakhapatnam/Chennai by road)"],
    ["Best suited to HQ, sales, distribution, and finishing/packing rather than primary processing"]),
  stateBase("st-od", "Odisha", "odisha", "OD", "Coastal coconut belt (Puri, Ganjam) with emerging processing; Paradip port access.",
    "M 60 34 L 72 32 L 78 44 L 70 52 L 62 50 Z", [69, 43],
    dims([["Raw-material availability", 6, 0.2, "Moderate coastal production"], ["Land", 8, 0.08, "Available and lower cost"], ["Labour", 7, 0.1, "Available"], ["Electricity", 6, 0.08, "Moderate"], ["Water", 7, 0.08, "Coastal"], ["Road", 6, 0.06, "Improving"], ["Rail", 7, 0.04, "Good"], ["Port access", 8, 0.08, "Paradip, Gopalpur"], ["Market access", 5, 0.08, "Smaller local markets; Kolkata reachable"], ["Processing ecosystem", 4, 0.1, "Thin"], ["Suppliers", 4, 0.05, "Thin"], ["Government support", 7, 0.03, "State incentives (verify)"], ["Export connectivity", 6, 0.02, "East coast"]]),
    ["Early-stage coconut processing"], ["Odisha food-processing incentives (verify)"], ["Paradip"], ["Low-competition entry with thinner ecosystem"]),
  stateBase("st-mh", "Maharashtra", "maharashtra", "MH", "Konkan coast production; Mumbai consumer market and JNPT port.",
    "M 30 34 L 46 32 L 48 44 L 40 50 L 30 46 Z", [39, 41],
    dims([["Raw-material availability", 5, 0.2, "Konkan coast moderate production"], ["Land", 5, 0.08, "Expensive near Mumbai; available in Konkan"], ["Labour", 7, 0.1, "Available"], ["Electricity", 7, 0.08, "Reliable"], ["Water", 6, 0.08, "Coastal ok"], ["Road", 8, 0.06, "Good"], ["Rail", 8, 0.04, "Konkan railway"], ["Port access", 9, 0.08, "JNPT — India's largest container port"], ["Market access", 9, 0.08, "Mumbai/Pune metro"], ["Processing ecosystem", 4, 0.1, "Limited coconut-specific processing"], ["Suppliers", 8, 0.05, "Strong general engineering"], ["Government support", 6, 0.03, "State policy"], ["Export connectivity", 9, 0.02, "JNPT"]]),
    ["Konkan coconut and tender-nut", "Mumbai wholesale"], ["State schemes (verify)"], ["JNPT", "Mumbai"], ["Consumer-market and export-gateway strengths, weak raw-material base"]),
  stateBase("st-wb", "West Bengal", "west-bengal", "WB", "Significant coconut production in coastal districts; Kolkata market and port.",
    "M 72 28 L 82 26 L 84 38 L 78 44 L 72 32 Z", [78, 34],
    dims([["Raw-material availability", 6, 0.2, "Moderate"], ["Land", 6, 0.08, ""], ["Labour", 8, 0.1, "Abundant"], ["Electricity", 6, 0.08, ""], ["Water", 8, 0.08, ""], ["Road", 6, 0.06, ""], ["Rail", 8, 0.04, ""], ["Port access", 7, 0.08, "Kolkata/Haldia"], ["Market access", 7, 0.08, "Kolkata"], ["Processing ecosystem", 4, 0.1, "Thin"], ["Suppliers", 5, 0.05, ""], ["Government support", 5, 0.03, ""], ["Export connectivity", 6, 0.02, ""]]),
    ["Fresh-nut trade"], [], ["Kolkata", "Haldia"], ["Under-analysed — RESEARCH REQUIRED"]),
];

export const stateById = Object.fromEntries(states.map((s) => [s.id, s]));

void ej;
