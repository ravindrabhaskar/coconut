import type { VisualAsset, AssetType, EntityType } from "@/domain/types";
import { base } from "./helpers";

/**
 * IMAGE ASSET MANIFEST
 * Every visual on the platform is registered here. Programmatic SVG assets are rendered by components in
 * src/components/viz and src/components/illustration; "required" entries document photography/rendering briefs
 * that must be produced under licence before they can be shown. No placeholder stock imagery is used.
 */

type A = { id: string; entityType: EntityType | "page"; entityId: string; page: string; section: string; assetType: AssetType; subject: string; purpose: string; visualBrief: string; status: VisualAsset["generationStatus"]; alt: string; caption: string; illustrative?: boolean; licence?: string };

const asset = (a: A): VisualAsset => ({
  ...base(a.id, a.subject, a.id, a.purpose),
  entityType: a.entityType, entityId: a.entityId, page: a.page, section: a.section, assetType: a.assetType, subject: a.subject, purpose: a.purpose,
  visualBrief: a.visualBrief, generationStatus: a.status, altText: a.alt, caption: a.caption,
  licence: a.licence ?? (a.status === "programmatic_svg" ? "Platform-generated SVG (owned)" : "To be licensed"),
  illustrative: a.illustrative ?? a.status !== "licensed_photo",
});

const componentHero = (id: string, slug: string, name: string, brief: string): VisualAsset =>
  asset({ id: `ast-${id}`, entityType: "component", entityId: id, page: `/explore/${slug}`, section: "hero", assetType: "scientific", subject: `${name} — isolated technical visual`, purpose: "Hero visual isolating the component within the coconut cutaway.", visualBrief: brief, status: "programmatic_svg", alt: `Technical cutaway illustration of the coconut with the ${name.toLowerCase()} highlighted`, caption: `${name}: position within the fruit (technical illustration).` });

const productHero = (id: string, slug: string, name: string, brief: string): VisualAsset =>
  asset({ id: `ast-${id}`, entityType: "product", entityId: id, page: `/products/${slug}`, section: "hero", assetType: "product", subject: `${name} — material illustration`, purpose: "Hero visual conveying the product's material character (colour, grain, form).", visualBrief: `${brief} Replace with premium ingredient photography (dark/ivory studio, macro texture) when licensed photography is produced.`, status: "programmatic_svg", alt: `Illustrative material texture representing ${name.toLowerCase()}`, caption: `${name} — illustrative material visual; photography pending.` });

export const visualAssets: VisualAsset[] = [
  asset({ id: "ast-hero-exploded", entityType: "page", entityId: "home", page: "/", section: "hero", assetType: "scientific", subject: "Exploded coconut", purpose: "Signature hero: assembled coconut separating into peduncle, exocarp, mesocarp, endocarp, kernel and water.", visualBrief: "Layered technical illustration, studio lighting, warm charcoal ground, precise spacing, labelled layers. Architecture allows replacement by GLB/GLTF model.", status: "programmatic_svg", alt: "Exploded view of a coconut showing its layers separated", caption: "The coconut, exploded: six material streams from one fruit.", illustrative: true }),
  asset({ id: "ast-hero-exploded-photo", entityType: "page", entityId: "home", page: "/", section: "anatomy", assetType: "scientific", subject: "Exploded-view render of a young green coconut (stem, exocarp, mesocarp, endocarp, endosperm, water)", purpose: "Homepage anatomy section image; labels baked in.", visualBrief: "Supplied render, white background, 1191x1321 px; served via next/image at /images/pages/coconut-exploded-view.png.", status: "licensed_photo", alt: "Exploded view of a young green coconut showing stem, outer husk, fibrous husk, hard shell, coconut meat and coconut water", caption: "Exploded view of a young (tender) coconut.", licence: "Supplied by project owner - confirm rights before public launch", illustrative: false }),
  asset({ id: "ast-product-tree", entityType: "page", entityId: "home", page: "/", section: "product-tree", assetType: "scientific", subject: "Branching product tree", purpose: "Interactive tree from coconut to products.", visualBrief: "Animated SVG branches drawing outward from components to products.", status: "programmatic_svg", alt: "Tree diagram from coconut components to products", caption: "From one coconut to many products." }),
  asset({ id: "ast-value-chain", entityType: "page", entityId: "value-chain", page: "/value-chain", section: "chain", assetType: "business", subject: "Farm-to-export chain", purpose: "Interactive value chain.", visualBrief: "Horizontal node chain with flow animation; vertical on mobile.", status: "programmatic_svg", alt: "Value chain diagram from farm to export", caption: "The complete coconut value chain." }),
  asset({ id: "ast-zero-waste-ring", entityType: "page", entityId: "zero-waste", page: "/zero-waste", section: "ring", assetType: "scientific", subject: "Circular value-recovery ring", purpose: "Full-screen circular visualisation of streams.", visualBrief: "Radial SVG with animated flow arcs; click to open stream detail.", status: "programmatic_svg", alt: "Circular diagram of coconut material streams and recovery paths", caption: "One coconut. Almost nothing left behind." }),
  asset({ id: "ast-india-map", entityType: "page", entityId: "india", page: "/india", section: "map", assetType: "geographical", subject: "India coconut-state map", purpose: "Interactive state comparison.", visualBrief: "Simplified state outlines (schematic, not survey-accurate) with score shading; label positions from data.", status: "programmatic_svg", alt: "Schematic map of India highlighting coconut-producing states", caption: "Schematic map — state shapes simplified for comparison, not cartographic accuracy." }),
  asset({ id: "ast-factory-blueprint", entityType: "page", entityId: "factory-planner", page: "/tools/factory-planner", section: "layout", assetType: "factory", subject: "Dynamic factory blueprint", purpose: "Product-specific conceptual layout.", visualBrief: "Blueprint-style zoned layout with material flow arrows, hygiene shading, fire-risk hatching.", status: "programmatic_svg", alt: "Conceptual factory layout blueprint", caption: "CONCEPTUAL PLANNING LAYOUT — REQUIRES PROFESSIONAL ENGINEERING VALIDATION." }),
  asset({ id: "ast-mass-balance", entityType: "page", entityId: "mass-balance", page: "/tools/mass-balance", section: "flow", assetType: "business", subject: "Mass-balance flow", purpose: "Sankey-style flow of mass.", visualBrief: "Proportional flow bars with evidence colouring.", status: "programmatic_svg", alt: "Flow diagram of coconut mass into products and losses", caption: "Mass balance with evidence labels." }),
  asset({ id: "ast-machine-generic", entityType: "machine", entityId: "*", page: "/machinery/[slug]", section: "hero", assetType: "machinery", subject: "Illustrative process equipment", purpose: "Schematic machine profile with input/output direction, operator zone and maintenance access.", visualBrief: "Line drawing; never resembles a specific commercial model; labelled ILLUSTRATIVE PROCESS EQUIPMENT.", status: "programmatic_svg", alt: "Schematic line drawing of process equipment", caption: "ILLUSTRATIVE PROCESS EQUIPMENT — not a specific commercial model.", illustrative: true }),
  componentHero("cmp-outer-husk", "outer-husk", "Outer Husk", "Cutaway with exocarp skin highlighted in leaf green; other layers dimmed."),
  componentHero("cmp-fibrous-husk", "fibrous-husk", "Fibrous Husk", "Cutaway with mesocarp fibre band highlighted; visible fibre strands."),
  componentHero("cmp-hard-shell", "hard-shell", "Hard Shell", "Cutaway with endocarp highlighted; three eyes visible."),
  componentHero("cmp-kernel", "kernel", "Kernel", "Cutaway with white endosperm highlighted; testa line visible."),
  componentHero("cmp-coconut-water", "coconut-water", "Coconut Water", "Cutaway with inner cavity highlighted as liquid."),
  componentHero("cmp-coir-fibre", "fibre", "Coir Fibre", "Macro fibre-strand illustration."),
  componentHero("cmp-coir-pith", "pith", "Coir Pith", "Granular pith texture illustration."),
  componentHero("cmp-sap", "sap", "Inflorescence Sap", "Palm crown with spadix and tapping vessel."),
  componentHero("cmp-leaves", "leaves", "Leaves", "Frond and midrib line illustration."),
  componentHero("cmp-trunk", "trunk", "Trunk", "Trunk cross-section showing density gradient."),
  componentHero("cmp-residues", "residues", "Residues", "Composite of parings, cake, fines, effluent."),
  productHero("prd-desiccated-coconut", "desiccated-coconut", "Desiccated Coconut", "Fine white granular texture."),
  productHero("prd-coconut-flour", "coconut-flour", "Coconut Flour", "Fine cream powder texture."),
  productHero("prd-coconut-milk", "coconut-milk", "Coconut Milk", "Opaque white liquid surface."),
  productHero("prd-coconut-cream", "coconut-cream", "Coconut Cream", "Thick white cream surface."),
  productHero("prd-virgin-coconut-oil", "virgin-coconut-oil", "Virgin Coconut Oil", "Clear water-white oil with refraction."),
  productHero("prd-coconut-oil", "coconut-oil", "Coconut Oil", "Pale golden clear oil."),
  productHero("prd-copra", "copra", "Copra", "Dried kernel cup, tan-brown."),
  productHero("prd-coconut-chips", "coconut-chips", "Coconut Chips", "Toasted thin slices, golden edges."),
  productHero("prd-coconut-flakes", "coconut-flakes", "Coconut Flakes", "Larger white flakes."),
  productHero("prd-coconut-water", "coconut-water", "Coconut Water", "Clear pale liquid."),
  productHero("prd-coconut-sugar", "coconut-sugar", "Coconut Sugar", "Brown granular crystals."),
  productHero("prd-cocopeat", "cocopeat", "Cocopeat", "Compressed brown pith block texture."),
  productHero("prd-coir-fibre", "coir-fibre", "Coir Fibre", "Bundled brown fibre strands."),
  productHero("prd-coir-yarn", "coir-yarn", "Coir Yarn", "Twisted two-ply yarn."),
  productHero("prd-coir-geotextile", "coir-geotextile", "Coir Geotextile", "Open-weave mesh."),
  productHero("prd-shell-charcoal", "shell-charcoal", "Shell Charcoal", "Black lump charcoal with sheen."),
  productHero("prd-activated-carbon", "activated-carbon", "Activated Carbon", "Black granules, matte."),
  productHero("prd-shell-powder", "shell-powder", "Shell Powder", "Fine brown powder."),
  productHero("prd-biochar", "biochar", "Biochar", "Black porous fragments."),
  productHero("prd-coconut-milk-powder", "coconut-milk-powder", "Coconut Milk Powder", "Fine off-white powder."),
  productHero("prd-cocopeat-grow-bags", "cocopeat-grow-bags", "Cocopeat Grow Bags", "Film-wrapped compressed slab."),
  productHero("prd-coir-rope-mats", "coir-rope-mats", "Coir Rope & Mats", "Twisted rope and woven mat texture."),
  productHero("prd-coconut-vinegar", "coconut-vinegar", "Coconut Vinegar", "Pale amber clear liquid."),
  productHero("prd-nata-de-coco", "nata-de-coco", "Nata de Coco", "Translucent gel cubes."),
  productHero("prd-shell-handicrafts", "shell-handicrafts", "Coconut Shell Handicrafts", "Polished dark shell bowl."),
  // Required photography briefs (not yet produced; never substituted with stock)
  asset({ id: "ast-req-macro-husk", entityType: "component", entityId: "cmp-fibrous-husk", page: "/explore/fibrous-husk", section: "material", assetType: "raw_material", subject: "Macro photograph of husk fibre and pith", purpose: "Teach fibre/pith structure.", visualBrief: "Macro, raking light, neutral background, 3:2, desktop 2400px / mobile 1200px, AVIF/WebP.", status: "required", alt: "Macro photograph of coconut husk fibre and pith", caption: "Photography pending — brief registered." }),
  asset({ id: "ast-req-macro-shell", entityType: "component", entityId: "cmp-hard-shell", page: "/explore/hard-shell", section: "material", assetType: "raw_material", subject: "Macro photograph of shell cross-section", purpose: "Teach shell density and eyes.", visualBrief: "Macro, cross-section, studio light.", status: "required", alt: "Macro photograph of coconut shell cross-section", caption: "Photography pending." }),
  asset({ id: "ast-req-process-drying", entityType: "process", entityId: "prc-desiccated-coconut", page: "/processing/desiccated-coconut-processing", section: "drying", assetType: "process", subject: "DC dryer in operation", purpose: "Show real drying step.", visualBrief: "Wide shot in operating plant with permission; no branding of specific machine model unless attributed.", status: "required", alt: "Desiccated coconut drying operation", caption: "Photography pending." }),
  asset({ id: "ast-req-application-greenhouse", entityType: "product", entityId: "prd-cocopeat", page: "/products/cocopeat", section: "applications", assetType: "application", subject: "Greenhouse grow bags in use", purpose: "Customer application.", visualBrief: "Hydroponic tomato rows on cocopeat slabs.", status: "required", alt: "Greenhouse crops growing on cocopeat slabs", caption: "Photography pending." }),
  asset({ id: "ast-req-application-water", entityType: "product", entityId: "prd-activated-carbon", page: "/products/activated-carbon", section: "applications", assetType: "application", subject: "GAC filter vessel at a water-treatment plant", purpose: "Customer application.", visualBrief: "Industrial filter vessels, documentary style.", status: "required", alt: "Activated carbon filter vessels at a water treatment plant", caption: "Photography pending." }),
];

export const assetById = Object.fromEntries(visualAssets.map((a) => [a.id, a]));
