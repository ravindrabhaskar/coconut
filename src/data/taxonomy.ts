import type { BusinessLevel, Industry, ProductCategory, ValueChainNode } from "@/domain/types";
import { base } from "./helpers";

export const industries: Industry[] = [
  { ...base("ind-food", "Food", "food", "Coconut ingredients and foods: desiccated coconut, flour, milk, cream, oil, chips."), order: 1, icon: "leaf" },
  { ...base("ind-beverage", "Beverage", "beverage", "Coconut water, packaged and processed beverages, concentrates."), order: 2, icon: "drop" },
  { ...base("ind-horticulture", "Horticulture", "horticulture", "Cocopeat, grow bags, nursery media, hydroponic substrates."), order: 3, icon: "sprout" },
  { ...base("ind-coir", "Coir", "coir", "Coir fibre, yarn, rope, mats, brushes, geotextiles."), order: 4, icon: "rope" },
  { ...base("ind-industrial", "Industrial", "industrial", "Shell charcoal, activated carbon, shell powder, biochar, engineered materials."), order: 5, icon: "factory" },
  { ...base("ind-personal-care", "Personal Care", "personal-care", "Coconut-oil based cosmetics, hair and skin care, soaps."), order: 6, icon: "spa" },
  { ...base("ind-wellness", "Wellness", "wellness", "VCO, functional foods, MCT-positioned products."), order: 7, icon: "heart" },
  { ...base("ind-consumer", "Consumer", "consumer", "Branded consumer packaged goods built on coconut ingredients."), order: 8, icon: "bag" },
  { ...base("ind-export", "Export", "export", "Cross-border trade of coconut products."), order: 9, icon: "ship" },
  { ...base("ind-technology", "Technology", "technology", "Digital, automation and process technologies serving the coconut chain."), order: 10, icon: "chip" },
  { ...base("ind-waste-to-value", "Waste-to-value", "waste-to-value", "Recovery of residues into fuel, compost, biochar and materials."), order: 11, icon: "recycle" },
];

export const productCategories: ProductCategory[] = [
  { ...base("cat-food", "Food", "food", "Coconut food ingredients and foods."), order: 1, industryId: "ind-food" },
  { ...base("cat-beverages", "Beverages", "beverages", "Coconut water and beverages."), order: 2, industryId: "ind-beverage" },
  { ...base("cat-horticulture", "Horticulture", "horticulture", "Growing media from coir pith."), order: 3, industryId: "ind-horticulture" },
  { ...base("cat-coir", "Coir", "coir", "Fibre products."), order: 4, industryId: "ind-coir" },
  { ...base("cat-industrial", "Industrial", "industrial", "Shell-derived and engineered materials."), order: 5, industryId: "ind-industrial" },
  { ...base("cat-personal-care", "Personal Care", "personal-care", "Cosmetic and personal-care products."), order: 6, industryId: "ind-personal-care" },
  { ...base("cat-wellness", "Wellness", "wellness", "Health-positioned products."), order: 7, industryId: "ind-wellness" },
  { ...base("cat-consumer", "Consumer", "consumer", "Branded packaged goods."), order: 8, industryId: "ind-consumer" },
];

export const businessLevels: BusinessLevel[] = [
  {
    id: "L1", name: "Level 1 — Raw Commodity",
    examples: ["Raw coconut", "Copra", "Commodity coconut oil", "Basic fibre", "Basic charcoal"],
    characteristics: ["Low differentiation", "Price competition", "Working-capital dependence", "Supplier relationships decide margin", "Commodity price exposure"],
    productIds: ["prd-copra", "prd-coir-fibre", "prd-shell-charcoal"],
  },
  {
    id: "L2", name: "Level 2 — Basic Processing",
    examples: ["Drying", "Copra making", "Basic desiccated coconut", "Basic coconut processing"],
    characteristics: ["Simple technology", "Thin margins unless scale or quality edge", "Local B2B sales", "Seasonal utilisation risk"],
    productIds: ["prd-copra", "prd-shell-powder", "prd-coconut-water"],
  },
  {
    id: "L3", name: "Level 3 — Industrial / Value-added Ingredients",
    examples: ["Coconut milk", "Coconut cream", "Coconut flour", "Desiccated coconut", "Coconut milk powder", "VCO", "Cocopeat", "Industrial coir", "Activated carbon"],
    characteristics: ["Specification-driven B2B sales", "Certification and QC matter", "Repeat institutional demand", "Capital and process discipline required"],
    productIds: ["prd-coconut-milk", "prd-coconut-cream", "prd-coconut-flour", "prd-desiccated-coconut", "prd-virgin-coconut-oil", "prd-cocopeat", "prd-coir-geotextile", "prd-activated-carbon"],
  },
  {
    id: "L4", name: "Level 4 — Branded Consumer Products",
    examples: ["Coconut chips", "Premium oil", "Specialty foods", "Wellness", "Personal care", "Functional products"],
    characteristics: ["Brand and distribution cost dominate", "Higher gross margin but higher marketing spend", "Returns and shelf-life management", "High selling price ≠ high profitability"],
    productIds: ["prd-coconut-chips", "prd-virgin-coconut-oil", "prd-coconut-sugar"],
  },
  {
    id: "L5", name: "Level 5 — Integrated Coconut Platform",
    examples: ["Procurement → processing → multiple primary products → secondary products → by-products → B2B → B2C → exports"],
    characteristics: ["Multi-stream revenue from one raw material", "Zero-waste economics", "Complex operations and capital", "Only after single-product proof"],
    productIds: [],
  },
];

export const valueChainNodes: ValueChainNode[] = [
  { ...base("vc-farm", "Farm", "farm", "Coconut palms on smallholder and estate land; the origin of every stream."), order: 1, participants: ["Smallholder farmers", "Estate owners", "FPOs / cooperatives"], valueAddition: ["Palm management", "Variety selection (tall / dwarf / hybrid)", "Irrigation, nutrition, pest control"], risks: ["Climate and drought", "Pest and disease (e.g. rugose spiralling whitefly, root wilt)", "Price volatility", "Ageing palms"], costDrivers: ["Labour for harvesting", "Inputs", "Land"], technology: ["Drip irrigation", "Farmer management apps", "Palm-climbing devices"], opportunities: ["Farmer-cluster procurement", "Direct sourcing contracts", "Tender-nut vs mature-nut decision"], relatedProductIds: [] },
  { ...base("vc-cultivation", "Cultivation", "cultivation", "Agronomy determines nut count, size and kernel quality."), order: 2, participants: ["Farmers", "Extension officers", "Input suppliers"], valueAddition: ["Yield per palm", "Nut quality consistency"], risks: ["Input cost", "Water stress"], costDrivers: ["Fertiliser", "Irrigation", "Labour"], technology: ["Soil sensors", "Advisory platforms"], opportunities: ["Intercropping income", "Quality premiums for consistent nut grades"], relatedProductIds: [] },
  { ...base("vc-harvest", "Harvest", "harvest", "Climbing and cutting bunches; harvest interval and maturity decide product suitability."), order: 3, participants: ["Climbers", "Harvest contractors"], valueAddition: ["Correct maturity for target product (tender vs mature)"], risks: ["Climber shortage", "Safety", "Harvest timing"], costDrivers: ["Climber wages per palm"], technology: ["Climbing machines", "Mechanised harvest aids"], opportunities: ["Harvest service businesses"], relatedProductIds: ["prd-coconut-water"] },
  { ...base("vc-collection", "Collection", "collection", "Aggregation at farm gate or collection centres."), order: 4, participants: ["Village agents", "Collection centres", "FPOs"], valueAddition: ["Volume aggregation", "First sort"], risks: ["Cash handling", "Mixed maturity"], costDrivers: ["Transport to centre", "Handling"], technology: ["Procurement apps", "Digital weighment"], opportunities: ["Collection-centre model for direct procurement"], relatedProductIds: [] },
  { ...base("vc-grading", "Grading", "grading", "Sorting by size, maturity, damage; drives yield and price."), order: 5, participants: ["Traders", "Processor receiving teams"], valueAddition: ["Grade-based pricing", "Rejection of damaged nuts"], risks: ["Subjective grading disputes"], costDrivers: ["Labour"], technology: ["Computer-vision grading (experimental at nut level)"], opportunities: ["Standardised grading contracts"], relatedProductIds: [] },
  { ...base("vc-trading", "Trading", "trading", "Mandis and traders intermediate most Indian coconut volume."), order: 6, participants: ["Commission agents", "Wholesale traders", "Copra traders"], valueAddition: ["Price discovery", "Credit", "Logistics"], risks: ["Margin capture by intermediaries", "Price manipulation"], costDrivers: ["Commission", "Credit cost"], technology: ["e-NAM and market price feeds"], opportunities: ["Bypassing tiers with direct procurement where volume justifies"], relatedProductIds: ["prd-copra"] },
  { ...base("vc-transport", "Transport", "transport", "Movement of whole nuts, husks, shells, copra to processors."), order: 7, participants: ["Truck operators", "Logistics firms"], valueAddition: ["Time-to-process (freshness for water/kernel)"], risks: ["Spoilage in transit for tender nuts", "Fuel cost"], costDrivers: ["Distance", "Load density (husked vs dehusked)"], technology: ["Route optimisation"], opportunities: ["Dehusking near farm to cut haul weight and recover husk locally"], relatedProductIds: [] },
  { ...base("vc-processing", "Processing", "processing", "Separation and conversion into products."), order: 8, participants: ["Micro units", "SMEs", "Integrated plants"], valueAddition: ["Component separation", "Product conversion", "Quality assurance"], risks: ["Utilisation", "Food safety", "Machinery"], costDrivers: ["Raw material", "Energy", "Labour"], technology: ["Automation", "ERP", "Traceability"], opportunities: ["All product pages on this platform"], relatedProductIds: ["prd-desiccated-coconut", "prd-virgin-coconut-oil", "prd-cocopeat", "prd-activated-carbon"] },
  { ...base("vc-primary", "Primary Products", "primary-products", "First-conversion outputs: DC, copra, oil, fibre, pith, charcoal."), order: 9, participants: ["Processors"], valueAddition: ["Standardised specifications"], risks: ["Commodity pricing"], costDrivers: ["Yield"], technology: ["QC labs"], opportunities: ["Specification-led B2B supply"], relatedProductIds: ["prd-copra", "prd-coir-fibre", "prd-shell-charcoal", "prd-desiccated-coconut"] },
  { ...base("vc-secondary", "Secondary Products", "secondary-products", "Second-conversion outputs: activated carbon, coconut flour, geotextiles, milk powder."), order: 10, participants: ["Specialist processors"], valueAddition: ["Higher specification and margin potential"], risks: ["Technical complexity", "Capital"], costDrivers: ["Energy", "Capex"], technology: ["Process control"], opportunities: ["Activated carbon, coconut flour, geotextiles"], relatedProductIds: ["prd-activated-carbon", "prd-coconut-flour", "prd-coir-geotextile"] },
  { ...base("vc-byproducts", "By-products", "by-products", "Residues valued as fuel, compost, biochar, feed."), order: 11, participants: ["Processors", "Biomass buyers", "Farmers"], valueAddition: ["Waste-to-value recovery"], risks: ["Low unit value", "Logistics"], costDrivers: ["Handling"], technology: ["Biomass boilers", "Composting"], opportunities: ["Fuel self-sufficiency", "Compost sales"], relatedProductIds: ["prd-biochar", "prd-shell-charcoal"] },
  { ...base("vc-b2b", "B2B", "b2b", "Sales to manufacturers, industrial users, institutions."), order: 12, participants: ["Food manufacturers", "Industrial buyers", "Distributors"], valueAddition: ["Volume contracts", "Specification compliance"], risks: ["Customer concentration", "Credit days"], costDrivers: ["Working capital"], technology: ["ERP", "Traceability"], opportunities: ["Ingredient supply"], relatedProductIds: [] },
  { ...base("vc-b2c", "B2C", "b2c", "Branded retail, e-commerce, quick commerce, D2C."), order: 13, participants: ["Brands", "Retailers", "Platforms"], valueAddition: ["Brand margin"], risks: ["Marketing cost", "Returns", "Shelf life"], costDrivers: ["Marketing", "Distribution margin"], technology: ["D2C stack", "Analytics"], opportunities: ["Premium chips, VCO, water"], relatedProductIds: ["prd-coconut-chips", "prd-virgin-coconut-oil"] },
  { ...base("vc-export", "Export", "export", "Cross-border sale with certification, documentation and logistics."), order: 14, participants: ["Exporters", "Freight forwarders", "Importers"], valueAddition: ["Access to higher-value markets"], risks: ["Currency", "Payment", "Regulatory rejection"], costDrivers: ["Certification", "Freight", "Documentation"], technology: ["Export documentation platforms"], opportunities: ["Activated carbon, cocopeat, DC, VCO exports"], relatedProductIds: ["prd-activated-carbon", "prd-cocopeat", "prd-desiccated-coconut"] },
];
