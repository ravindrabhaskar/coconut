import Link from "next/link";
import { repo } from "@/services/repository";
import { Container, Section, Badge, Chip, Callout } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { EvidenceBadge } from "@/components/ui/evidence";
import { formatQuantity } from "@/lib/format";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Coconut Processing Machinery Database", description: "Relational machinery database: purpose, process stage, products, capacity, power, utilities, footprint, operators, automation, maintenance, safety, material of construction, availability, cost status. No fabricated suppliers or prices.", path: "/machinery" });

type SP = { product?: string; process?: string; automation?: string; availability?: string; grade?: string; capital?: string };

export default async function MachineryPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const [machines, products, sources] = await Promise.all([repo.machines(), repo.products(), repo.sources()]);
  const stages = [...new Set(machines.map((m) => m.processStage))].sort();
  const filtered = machines.filter((m) =>
    (!sp.product || m.productIds.includes(sp.product)) && (!sp.process || m.processStage === sp.process) && (!sp.automation || m.automation === sp.automation) &&
    (!sp.availability || m.availability === sp.availability || m.availability === "both") && (!sp.grade || (sp.grade === "food" ? m.foodGrade : !m.foodGrade)) &&
    (!sp.capital || (sp.capital === "quoted" ? m.cost.value !== undefined : m.cost.value === undefined)),
  );
  const qs = (patch: Partial<SP>) => { const u = new URLSearchParams(); Object.entries({ ...sp, ...patch }).forEach(([k, v]) => { if (v) u.set(k, v); }); const s = u.toString(); return `/machinery${s ? `?${s}` : ""}`; };
  return (
    <>
      <PageIntro overline="Processing · machinery" title="Machinery database." lede={`${machines.length} machine types linked relationally to products and process stages. Capacities and utilities are ESTIMATE ranges or RESEARCH REQUIRED; costs are RESEARCH REQUIRED — CURRENT SUPPLIER QUOTATION until a dated quote is attached. Visuals are ILLUSTRATIVE PROCESS EQUIPMENT, never a specific commercial model.`} breadcrumbs={[{ label: "Processing", href: "/processing" }, { label: "Machinery" }]} />
      <Section surface="ivory" padded={false} className="py-8">
        <Container>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2"><span className="t-overline self-center text-neutral-500 mr-2">Product</span><Chip href={qs({ product: undefined })} active={!sp.product}>All</Chip>{products.filter((p) => machines.some((m) => m.productIds.includes(p.id))).map((p) => <Chip key={p.id} href={qs({ product: p.id })} active={sp.product === p.id}>{p.name}</Chip>)}</div>
            <div className="flex flex-wrap gap-2"><span className="t-overline self-center text-neutral-500 mr-2">Process stage</span><Chip href={qs({ process: undefined })} active={!sp.process}>All</Chip>{stages.map((s) => <Chip key={s} href={qs({ process: s })} active={sp.process === s}>{s}</Chip>)}</div>
            <div className="flex flex-wrap gap-2"><span className="t-overline self-center text-neutral-500 mr-2">Automation</span><Chip href={qs({ automation: undefined })} active={!sp.automation}>All</Chip>{["manual", "semi_automatic", "automatic"].map((a) => <Chip key={a} href={qs({ automation: a })} active={sp.automation === a}>{a.replace("_", "-")}</Chip>)}
              <span className="t-overline self-center text-neutral-500 ml-4 mr-2">Availability</span><Chip href={qs({ availability: undefined })} active={!sp.availability}>All</Chip><Chip href={qs({ availability: "india" })} active={sp.availability === "india"}>India</Chip><Chip href={qs({ availability: "import" })} active={sp.availability === "import"}>Import</Chip>
              <span className="t-overline self-center text-neutral-500 ml-4 mr-2">Grade</span><Chip href={qs({ grade: undefined })} active={!sp.grade}>All</Chip><Chip href={qs({ grade: "food" })} active={sp.grade === "food"}>Food</Chip><Chip href={qs({ grade: "industrial" })} active={sp.grade === "industrial"}>Industrial</Chip>
              <span className="t-overline self-center text-neutral-500 ml-4 mr-2">Capital</span><Chip href={qs({ capital: undefined })} active={!sp.capital}>All</Chip><Chip href={qs({ capital: "quoted" })} active={sp.capital === "quoted"}>Quoted</Chip><Chip href={qs({ capital: "rr" })} active={sp.capital === "rr"}>Quotation required</Chip></div>
          </div>
        </Container>
      </Section>
      <Section surface="white" padded={false} className="pb-24 pt-6">
        <Container>
          <p className="t-caption mb-4">{filtered.length} of {machines.length} machines</p>
          {filtered.length === 0 ? <p className="t-caption py-10">No machines match. Clear a filter.</p> : (
            <div className="overflow-x-auto"><table className="table-data">
              <thead><tr><th>Machine</th><th>Stage</th><th>Capacity</th><th>Power</th><th>Footprint</th><th>Operators</th><th>Automation</th><th>Availability</th><th>Cost</th></tr></thead>
              <tbody>{filtered.map((m) => <tr key={m.id}><td><Link href={`/machinery/${m.slug}`} className="font-medium underline-offset-4 hover:underline">{m.name}</Link><span className="t-caption block">{m.category}{m.foodGrade ? " · food-grade" : ""}</span></td><td className="t-caption">{m.processStage}</td><td className="t-data">{formatQuantity(m.capacityRange)} <EvidenceBadge q={m.capacityRange} sources={sources} compact /></td><td className="t-data">{formatQuantity(m.power)}</td><td className="t-data">{formatQuantity(m.footprint)}</td><td className="t-data">{m.operators.value}</td><td><Badge>{m.automation.replace("_", "-")}</Badge></td><td className="t-caption">{m.availability}</td><td><EvidenceBadge q={m.cost} sources={sources} /></td></tr>)}</tbody>
            </table></div>
          )}
          <div className="mt-10"><Callout tone="warning" title="Supplier names">This database does not fabricate supplier names. Machines carry a supplier category (e.g. “Coimbatore coconut-processing fabricators”); attach a real, dated quotation via the admin layer to promote a cost from RESEARCH REQUIRED.</Callout></div>
        </Container>
      </Section>
    </>
  );
}
