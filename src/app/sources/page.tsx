import Link from "next/link";
import { repo } from "@/services/repository";
import { Container, Section, Badge } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Sources — Authoritative References Behind Every Number", description: "Source registry: Coconut Development Board, Coir Board, FSSAI, APEDA, DGFT, MoFPI, MSME, ICAR-CPCRI, FAO, International Coconut Community, BIS, CPCB, Codex, universities — with source type, evidence strength, research date and last reviewed date.", path: "/sources" });

export default async function SourcesPage() {
  const sources = await repo.sources();
  return (
    <>
      <PageIntro overline="Insights" title="Sources." lede="A VERIFIED FACT must cite one of these. Internal expert judgment is registered as a source too — so it can be seen, challenged and replaced." breadcrumbs={[{ label: "Sources" }]} />
      <Section surface="ivory"><Container>
        <ul className="space-y-4">{sources.map((s) => <li key={s.id} className="grid gap-3 border-t hairline pt-4 md:grid-cols-[1fr_220px]"><div><div className="flex flex-wrap gap-1.5"><Badge tone={s.evidenceStrength === "strong" ? "green" : s.evidenceStrength === "weak" ? "amber" : "neutral"}>{s.evidenceStrength}</Badge><Badge>{s.sourceType.replace("_", " ")}</Badge></div><Link href={`/sources/${s.slug}`} className="t-h4 mt-2 block underline-offset-4 hover:underline">{s.name}</Link><p className="t-caption mt-1">{s.organisation}</p><p className="mt-2 text-[0.9rem] text-neutral-700">{s.summary}</p></div><div className="t-data text-[0.75rem] text-neutral-600"><p>RESEARCHED {s.researchDate}</p><p>REVIEWED {s.lastReviewedAt ?? "—"}</p><p>GEOGRAPHY {s.geography ?? "—"}</p>{s.url && <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline break-all">{s.url.replace("https://", "")}</a>}</div></li>)}</ul>
      </Container></Section>
    </>
  );
}
