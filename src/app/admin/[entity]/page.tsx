import Link from "next/link";
import { notFound } from "next/navigation";
import { dataSourceMode } from "@/services/repository";
import { productGapReport, componentGapReport } from "@/services/gaps";
import type { Product, Component } from "@/domain/types";
import { Container, Badge } from "@/components/ui/primitives";
import { EntityEditor } from "@/components/features/entity-editor";
import { ADMIN_ENTITIES } from "../entities";

export const metadata = { title: "Admin — entity", robots: { index: false } };

export default async function AdminEntityPage({ params, searchParams }: { params: Promise<{ entity: string }>; searchParams: Promise<{ id?: string; new?: string }> }) {
  const { entity } = await params;
  const sp = await searchParams;
  const def = ADMIN_ENTITIES.find((e) => e.table === entity);
  if (!def) notFound();
  const rows = (await def.fetch()) as (Record<string, unknown> & { id: string; name: string; slug: string; status: string; updatedAt: string; lastVerifiedAt?: string })[];
  const selected = sp.id ? rows.find((r) => r.id === sp.id) ?? null : null;
  const readOnly = dataSourceMode() !== "postgres";
  const gap = selected && entity === "products" ? productGapReport(selected as unknown as Product) : selected && entity === "components" ? componentGapReport(selected as unknown as Component) : null;
  return (
    <section className="surface-ivory py-12">
      <Container>
        <p className="t-caption"><Link href="/admin" className="underline">Admin</Link> → {def.label}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3"><h1 className="t-h2">{def.label} <span className="t-caption">({rows.length})</span></h1><Link href={`/admin/${entity}?new=1`} className="tap rounded-[var(--radius-control)] bg-leaf-500 px-4 py-2 text-cocos t-cta text-xs">Create new</Link></div>
        <div className="mt-8 grid gap-10 lg:grid-cols-[360px_1fr]">
          <div className="max-h-[70vh] overflow-y-auto rounded-[var(--radius-control)] border hairline bg-cocos">
            <table className="table-data"><thead><tr><th>Name</th><th>Status</th><th>Verified</th></tr></thead><tbody>{rows.map((r) => <tr key={r.id} className={sp.id === r.id ? "bg-neutral-100" : ""}><td><Link href={`/admin/${entity}?id=${r.id}`} className="underline-offset-4 hover:underline">{r.name}</Link><span className="t-caption block">{r.id}</span></td><td><Badge tone={r.status === "published" ? "green" : "amber"}>{r.status}</Badge></td><td className="t-caption">{r.lastVerifiedAt ?? "—"}</td></tr>)}</tbody></table>
          </div>
          <div>
            {selected || sp.new ? (
              <>
                {selected && <div className="mb-4 flex flex-wrap gap-2"><Badge>{selected.id}</Badge><Badge>updated {selected.updatedAt}</Badge>{gap && <Badge tone={gap.contentStatus === "DATA_VERIFIED" ? "green" : "fibre"}>{gap.contentStatus.replace(/_/g, " ")} · {gap.coveragePct}% coverage · {gap.missingCount} research required</Badge>}</div>}
                {gap && <details className="mb-4 rounded border hairline p-3"><summary className="t-nav cursor-pointer">Field status ({gap.fields.length})</summary><ul className="mt-2 grid gap-1 sm:grid-cols-2 text-[0.8rem]">{gap.fields.map((f) => <li key={f.field} className="flex justify-between gap-2"><span>{f.field}</span><span className="t-data">{f.status}{f.needs && f.needs !== "none" ? ` · ${f.needs}` : ""}</span></li>)}</ul></details>}
                <EntityEditor table={entity} initial={selected} readOnly={readOnly} />
              </>
            ) : <p className="t-caption">Select a row to inspect or edit, or create a new entity.</p>}
          </div>
        </div>
      </Container>
    </section>
  );
}
