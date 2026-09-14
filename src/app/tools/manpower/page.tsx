import Link from "next/link";
import { repo } from "@/services/repository";
import { Container, Section, Badge } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { EvidenceBadge } from "@/components/ui/evidence";
import { AUTOMATION_FACTORS } from "@/lib/calc/factoryPlanner";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Manpower Planning — Roles, Skills & Headcount by Scale", description: "Manpower roles for coconut processing plants with headcount per engineering scale model, skill levels, and automation/shift factors.", path: "/tools/manpower" });

export default async function ManpowerPage() {
  const [roles, models, products, sources] = await Promise.all([repo.manpowerRoles(), repo.scaleModels(), repo.products(), repo.sources()]);
  return (
    <>
      <PageIntro overline="Tools" title="Manpower." lede="Headcounts are EXPERT JUDGMENT per scale model at semi-automatic level and a base shift pattern; the planner applies automation (×1.25 manual, ×0.7 automatic) and shift factors (×1.8 for 2 shifts, ×2.6 for 3). Field-validate wages and availability." breadcrumbs={[{ label: "Tools", href: "/tools" }, { label: "Manpower" }]} />
      <Section surface="ivory">
        <Container>
          <p className="t-overline text-neutral-500 mb-4">Roles</p>
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{roles.map((r) => <li key={r.id} className="border-t hairline pt-3"><p className="font-semibold">{r.name} <Badge className="ml-2">{r.skill.replace("_", " ")}</Badge></p><p className="t-caption mt-1">{r.summary}</p><p className="t-caption mt-1">{r.responsibilities.join(" · ")}</p></li>)}</ul>
          <p className="t-overline text-neutral-500 mt-14 mb-4">Headcount by scale model</p>
          <div className="overflow-x-auto"><table className="table-data"><thead><tr><th>Scale model</th><th>Shifts (base)</th>{roles.map((r) => <th key={r.id}>{r.name.split(" ")[0]}</th>)}<th>Total</th></tr></thead><tbody>
            {models.map((m) => { const total = m.manpower.reduce((s, x) => s + (x.headcount.value ?? 0), 0); const prod = products.find((p) => p.id === m.productId); return <tr key={m.id}><td><Link href={`/tools/factory-planner?product=${m.productId}&model=${m.id}`} className="underline underline-offset-4">{m.name}</Link>{prod && <span className="t-caption block">{prod.name}</span>}</td><td className="t-data">{m.shiftsPerDay}</td>{roles.map((r) => { const h = m.manpower.find((x) => x.roleId === r.id); return <td key={r.id} className="t-data">{h ? <>{h.headcount.value ?? "—"} <EvidenceBadge q={h.headcount} sources={sources} compact /></> : "·"}</td>; })}<td className="t-data font-semibold">{total}</td></tr>; })}
          </tbody></table></div>
          <p className="t-caption mt-4">Automation factors: manual ×{AUTOMATION_FACTORS.manual.manpower}, semi-automatic ×{AUTOMATION_FACTORS.semi_automatic.manpower}, automatic ×{AUTOMATION_FACTORS.automatic.manpower} (EXPERT JUDGMENT).</p>
        </Container>
      </Section>
    </>
  );
}
