import Link from "next/link";
import { repo } from "@/services/repository";
import { freshness, FRESHNESS_LABEL } from "@/lib/freshness";
import { Container, Section, Callout, EmptyState, Badge } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { EvidenceBadge } from "@/components/ui/evidence";
import { formatQuantity } from "@/lib/format";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Coconut Price Intelligence — Dated, Sourced Price Records", description: "Price index architecture for coconut, copra, coconut oil, desiccated coconut, shell charcoal, activated carbon, coir fibre and cocopeat. Every record carries date, market, location, unit, grade and source; old prices are never presented as current.", path: "/markets/prices" });

const COMMODITIES = ["Coconut (mature, per nut)", "Tender coconut (per nut)", "Copra (milling)", "Coconut oil", "Virgin coconut oil", "Desiccated coconut", "Shell charcoal", "Activated carbon (GAC)", "Coir fibre", "Cocopeat (5 kg block, FOB)"];

export default async function PricesPage() {
  const [prices, sources] = await Promise.all([repo.prices(), repo.sources()]);
  const byCommodity = COMMODITIES.map((c) => ({ c, rows: prices.filter((p) => p.commodity === c).sort((a, b) => b.date.localeCompare(a.date)) }));
  return (
    <>
      <PageIntro overline="Markets" title="Price intelligence." lede="A price without a date, market, unit and source is not a price — it is a rumour. This register holds only dated, sourced records; charts expose their date range; old records are flagged by freshness rules (30 days review, 90 days stale)." breadcrumbs={[{ label: "Markets", href: "/markets" }, { label: "Prices" }]} />
      <Section surface="ivory"><Container>
        {prices.length === 0 && <EmptyState title="No dated price records yet" body="The platform ships without invented prices. Capture prices in field validation (with date, market, grade and source) or import ICC / CDB / Coir Board published series via the admin layer; they will appear here with freshness flags." action={<Link href="/field-validation" className="t-cta underline underline-offset-4">Field validation →</Link>} />}
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {byCommodity.map(({ c, rows }) => (
            <div key={c} className="border-t hairline pt-4">
              <div className="flex items-center justify-between gap-3"><p className="t-h4">{c}</p><Badge tone={rows.length ? "green" : "neutral"}>{rows.length ? `${rows.length} records` : "research required"}</Badge></div>
              {rows.length ? (
                <table className="table-data mt-3"><thead><tr><th>Date</th><th>Market</th><th>Price</th><th>Grade</th><th>Freshness</th></tr></thead><tbody>{rows.slice(0, 8).map((r) => { const f = freshness({ ...r.price, lastVerifiedAt: r.date, dataKind: "price" }); return <tr key={r.id}><td className="t-data">{r.date}</td><td>{r.market}, {r.location}</td><td className="t-data">{formatQuantity(r.price)} <EvidenceBadge q={r.price} sources={sources} compact /></td><td className="t-caption">{r.grade ?? "—"}</td><td className="t-caption">{FRESHNESS_LABEL[f.state]}</td></tr>; })}</tbody></table>
              ) : <p className="t-caption mt-2">Known sources to capture: ICC monthly market reports; CDB price bulletins; Coir Board export unit values; market boards (e.g. Kangayam, Tiptur, Kochi). Record grade and basis (ex-farm, mandi, FOB).</p>}
            </div>
          ))}
        </div>
        <div className="mt-12"><Callout tone="neutral" title="Data kinds and staleness">Prices use the strictest freshness rule on the platform (review after 30 days, potentially stale after 90). Regulatory standards use 1–3 years; compositions 3–5 years. See Methodology.</Callout></div>
      </Container></Section>
    </>
  );
}
