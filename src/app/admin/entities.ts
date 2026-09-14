import { repo } from "@/services/repository";

export const ADMIN_ENTITIES: { table: string; label: string; fetch: () => Promise<{ id: string; name: string; slug: string; status: string; updatedAt: string; lastVerifiedAt?: string }[]> }[] = [
  { table: "components", label: "Components", fetch: repo.components }, { table: "products", label: "Products", fetch: repo.products }, { table: "processes", label: "Processes", fetch: repo.processes },
  { table: "machines", label: "Machines", fetch: repo.machines }, { table: "factory_scale_models", label: "Factory scale models", fetch: repo.scaleModels }, { table: "mass_balance_models", label: "Mass-balance models", fetch: repo.massBalanceModels },
  { table: "customer_segments", label: "Customer segments", fetch: repo.customerSegments }, { table: "countries", label: "Export markets", fetch: repo.countries }, { table: "states", label: "States", fetch: repo.states },
  { table: "regulations", label: "Regulations", fetch: repo.regulations }, { table: "certifications", label: "Certifications", fetch: repo.certifications }, { table: "risks", label: "Risks", fetch: repo.risks },
  { table: "opportunities", label: "Opportunities", fetch: repo.opportunities }, { table: "sources", label: "Sources", fetch: repo.sources }, { table: "research_documents", label: "Research", fetch: repo.research },
  { table: "visual_assets", label: "Visual assets", fetch: repo.assets }, { table: "technologies", label: "Technologies", fetch: repo.technologies },
  { table: "government_schemes", label: "Government schemes", fetch: repo.schemes }, { table: "price_records", label: "Price records (dated)", fetch: repo.prices }, { table: "machine_quotations", label: "Machine quotations", fetch: repo.quotations },
];
