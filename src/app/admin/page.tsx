import Link from "next/link";
import { repo, dataSourceMode } from "@/services/repository";
import { productGapReport, componentGapReport, aggregateCoverage } from "@/services/gaps";
import { Container, Badge, Metric, Callout } from "@/components/ui/primitives";
import { logout } from "./actions";
import { ADMIN_ENTITIES } from "./entities";

export const metadata = { title: "Admin", robots: { index: false } };



export default async function AdminHome() {
  const counts = await Promise.all(ADMIN_ENTITIES.map(async (e) => ({ ...e, n: (await e.fetch()).length })));
  const [products, components, assets] = await Promise.all([repo.products(), repo.components(), repo.assets()]);
  const reports = [...products.map(productGapReport), ...components.map(componentGapReport)];
  const agg = aggregateCoverage(reports);
  const statusCounts = reports.reduce<Record<string, number>>((a, r) => { a[r.contentStatus] = (a[r.contentStatus] ?? 0) + 1; return a; }, {});
  const assetStatus = assets.reduce<Record<string, number>>((a, x) => { a[x.generationStatus] = (a[x.generationStatus] ?? 0) + 1; return a; }, {});
  const mode = dataSourceMode();
  return (
    <section className="surface-ivory py-12">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="t-overline text-leaf-500">Administration</p><h1 className="t-h2 mt-1">Content & research dashboard</h1></div>
          <div className="flex items-center gap-3"><Badge tone={mode === "postgres" ? "green" : "amber"}>Data source: {mode === "postgres" ? "PostgreSQL" : "static content (read-only)"}</Badge><form action={logout}><button className="tap rounded-[var(--radius-control)] border border-neutral-300 px-4 py-2 text-[0.85rem]">Sign out</button></form></div>
        </div>
        {mode === "static" && <div className="mt-6"><Callout tone="warning" title="Read-only mode">Edits are disabled until DATABASE_URL points at PostgreSQL/Supabase. Run <code className="t-data">pnpm db:push</code> then <code className="t-data">pnpm seed</code> to load the typed content into the database; the site then reads from the database and this layer can create, edit, publish and unpublish entities without code changes.</Callout></div>}
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Fields tracked" value={agg.totalFields} /><Metric label="Research required" value={agg.missing} /><Metric label="Evidence coverage" value={`${agg.coveragePct}%`} /><Metric label="Verified" value={`${agg.verifiedPct}%`} /></div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="t-overline text-neutral-500 mb-3">Entities</p>
            <table className="table-data"><thead><tr><th>Entity</th><th>Rows</th><th></th></tr></thead><tbody>{counts.map((c) => <tr key={c.table}><td className="font-medium">{c.label}</td><td className="t-data">{c.n}</td><td><Link href={`/admin/${c.table}`} className="t-nav underline underline-offset-4">Open</Link></td></tr>)}</tbody></table>
          </div>
          <div>
            <p className="t-overline text-neutral-500 mb-3">Content status</p>
            <ul className="space-y-2">{Object.entries(statusCounts).map(([k, v]) => <li key={k} className="flex justify-between border-b hairline py-1.5 text-[0.9rem]"><span>{k.replace(/_/g, " ")}</span><span className="t-data">{v}</span></li>)}</ul>
            <p className="t-overline text-neutral-500 mt-8 mb-3">Visual asset manifest</p>
            <ul className="space-y-2">{Object.entries(assetStatus).map(([k, v]) => <li key={k} className="flex justify-between border-b hairline py-1.5 text-[0.9rem]"><span>{k.replace(/_/g, " ")}</span><span className="t-data">{v}</span></li>)}</ul>
            <p className="t-overline text-neutral-500 mt-8 mb-3">Lowest coverage</p>
            <ul className="space-y-1.5">{reports.sort((a, b) => a.coveragePct - b.coveragePct).slice(0, 6).map((r) => <li key={r.entityId} className="flex justify-between text-[0.9rem]"><span>{r.entityName}</span><span className="t-data">{r.coveragePct}% · {r.missingCount} missing</span></li>)}</ul>
            <p className="mt-4"><Link href="/research/gaps" className="t-nav underline underline-offset-4">Full research-gap report →</Link></p>
          </div>
        </div>
      </Container>
    </section>
  );
}
