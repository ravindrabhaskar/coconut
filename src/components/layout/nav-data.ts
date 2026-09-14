export interface NavItem { label: string; href: string; description?: string }
export interface NavGroup { label: string; href: string; columns: { heading: string; items: NavItem[] }[]; featured?: { title: string; body: string; href: string }; secondary?: boolean }

/**
 * Primary navigation — intent-based IA v2 (docs/07-audit-and-ia-v2.md).
 * Explore · Products · Processing · Factory · Business · Markets · Locations · Research · Tools
 * Component/product/scheme items are appended from the database at render time (chrome.tsx).
 * `secondary` groups collapse under "More" on narrower desktop widths.
 */
export const NAV_STATIC: NavGroup[] = [
  {
    label: "Explore", href: "/explore",
    columns: [
      { heading: "The coconut", items: [{ label: "Interactive anatomy", href: "/explore", description: "Exploded coconut, layer by layer" }, { label: "Value chain", href: "/value-chain", description: "Farm to export, node by node" }, { label: "Zero-waste streams", href: "/zero-waste" }] },
      { heading: "Fruit components", items: [] },
      { heading: "Palm resources", items: [] },
    ],
    featured: { title: "One coconut. Six material streams.", body: "Hover or tap each layer to see what it becomes.", href: "/explore" },
  },
  {
    label: "Products", href: "/products",
    columns: [
      { heading: "By category", items: [] },
      { heading: "Featured products", items: [] },
      { heading: "Compare", items: [{ label: "Compare products", href: "/tools/compare" }, { label: "All products", href: "/products" }] },
    ],
  },
  {
    label: "Processing", href: "/processing",
    columns: [
      { heading: "How it is made", items: [{ label: "Process library", href: "/processing", description: "Unit operations, routes, yields, QC" }, { label: "Machinery directory", href: "/machinery", description: "Relational machine database" }] },
      { heading: "Featured processes", items: [] },
    ],
  },
  {
    label: "Factory", href: "/factory",
    columns: [
      { heading: "Design a plant", items: [{ label: "Factory journey", href: "/factory", description: "Product → capacity → machines → layout → CAPEX/OPEX → ROI" }, { label: "Plan a specific product", href: "/build", description: "Product-specific planning chain" }] },
      { heading: "Planning tools", items: [{ label: "Factory planner", href: "/tools/factory-planner" }, { label: "Mass balance", href: "/tools/mass-balance" }, { label: "Land & building", href: "/tools/land-calculator" }, { label: "Manpower", href: "/tools/manpower" }, { label: "Financial model", href: "/tools/financial-model" }] },
    ],
    featured: { title: "Activated carbon is not coconut flour.", body: "Every product gets its own zones, utilities, hygiene rules and economics.", href: "/factory" },
  },
  {
    label: "Business", href: "/business",
    columns: [
      { heading: "Decide", items: [{ label: "Business hub", href: "/business" }, { label: "Opportunity database", href: "/opportunities", description: "Transparent 0–100 assessment" }, { label: "Which business is right for me?", href: "/tools/opportunity-finder" }, { label: "Business builder", href: "/tools/business-builder", description: "Capital × market → route" }] },
      { heading: "Execute", items: [{ label: "Government schemes", href: "/business/schemes" }, { label: "90-day validation plan", href: "/90-day-plan" }, { label: "Roadmap & discipline rules", href: "/roadmap" }, { label: "Field validation", href: "/field-validation" }] },
    ],
  },
  {
    label: "Markets", href: "/markets",
    columns: [
      { heading: "Demand", items: [{ label: "Markets hub", href: "/markets" }, { label: "Customers", href: "/customers" }, { label: "Industries", href: "/industries" }] },
      { heading: "Trade", items: [{ label: "Export explorer", href: "/export" }, { label: "Price intelligence", href: "/markets/prices", description: "Dated, sourced prices only" }] },
    ],
  },
  {
    label: "Locations", href: "/locations", secondary: true,
    columns: [
      { heading: "Where to build", items: [{ label: "Locations hub", href: "/locations" }, { label: "India state analysis", href: "/india", description: "Scored, scenario-weighted" }, { label: "Hyderabad hub", href: "/hyderabad" }, { label: "Location finder", href: "/tools/location-finder", description: "Need profile → ranked states" }] },
      { heading: "States", items: [] },
    ],
  },
  {
    label: "Research", href: "/research", secondary: true,
    columns: [
      { heading: "Evidence", items: [{ label: "Research library", href: "/research" }, { label: "Sources", href: "/sources" }, { label: "Research gaps", href: "/research/gaps" }, { label: "Methodology", href: "/methodology" }] },
      { heading: "Themes", items: [{ label: "Technology (Industry 4.0)", href: "/technology" }, { label: "Sustainability", href: "/sustainability" }, { label: "About", href: "/about" }] },
    ],
  },
  {
    label: "Tools", href: "/tools", secondary: true,
    columns: [
      { heading: "Plan", items: [{ label: "All tools", href: "/tools" }, { label: "Factory planner", href: "/tools/factory-planner" }, { label: "Mass balance", href: "/tools/mass-balance" }, { label: "Financial model", href: "/tools/financial-model" }] },
      { heading: "Decide", items: [{ label: "Opportunity finder", href: "/tools/opportunity-finder" }, { label: "Business builder", href: "/tools/business-builder" }, { label: "Compare products", href: "/tools/compare" }, { label: "Location finder", href: "/tools/location-finder" }] },
    ],
  },
];
