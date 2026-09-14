import Link from "next/link";
import { repo } from "@/services/repository";
import { Container, Section, SectionHeader, BulletList, Badge, Callout } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Coconut Industry 4.0 — Technology That Pays, Technology That Doesn't", description: "AI, computer vision, automated grading, IoT, sensors, ERP, traceability, farmer management, procurement software, route optimisation, factory automation, predictive maintenance, analytics and forecasting — each categorised as USEFUL NOW, USEFUL AT SCALE, EXPERIMENTAL or UNNECESSARY HYPE.", path: "/technology" });

const ORDER = ["USEFUL_NOW", "USEFUL_AT_SCALE", "EXPERIMENTAL", "UNNECESSARY_HYPE"] as const;
const LABEL: Record<string, string> = { USEFUL_NOW: "Useful now", USEFUL_AT_SCALE: "Useful at scale", EXPERIMENTAL: "Experimental", UNNECESSARY_HYPE: "Unnecessary hype" };

export default async function TechnologyPage() {
  const [tech, products] = await Promise.all([repo.technologies(), repo.products()]);
  return (
    <>
      <PageIntro overline="Insights" title="Coconut Industry 4.0." lede="Technology is categorised by when it earns its cost. AI is not magic; a working moisture sensor on a dryer beats a blockchain." breadcrumbs={[{ label: "Technology" }]} />
      <Section surface="ivory"><Container>
        {ORDER.map((m) => {
          const list = tech.filter((t) => t.maturity === m);
          if (!list.length) return null;
          return (
            <div key={m} className="mb-16">
              <SectionHeader overline={m === "UNNECESSARY_HYPE" ? "Avoid" : "Category"} title={LABEL[m]} className="mb-8" />
              <ul className="grid gap-6 md:grid-cols-2">{list.map((t) => <li key={t.id} className="border-t hairline pt-4"><div className="flex items-center justify-between gap-3"><p className="t-h4">{t.name}</p><Badge tone={m === "USEFUL_NOW" ? "green" : m === "UNNECESSARY_HYPE" ? "danger" : "fibre"}>{t.area}</Badge></div><p className="t-caption mt-1">{t.summary}</p><div className="mt-3 grid gap-4 sm:grid-cols-3 text-[0.85rem]"><div><p className="t-overline text-neutral-500 mb-1">What it does</p><BulletList items={t.whatItDoes} /></div><div><p className="t-overline text-neutral-500 mb-1">Where it pays</p><BulletList items={t.whereItPays} /></div><div><p className="t-overline text-neutral-500 mb-1">Caution</p><BulletList items={t.caution.filter(Boolean)} /></div></div>{t.productIds.length > 0 && <p className="t-caption mt-3">Applies to: {t.productIds.map((id) => products.find((p) => p.id === id)).filter(Boolean).map((p, i) => <span key={p!.id}>{i > 0 && ", "}<Link href={`/products/${p!.slug}`} className="underline">{p!.name}</Link></span>)}</p>}</li>)}</ul>
            </div>
          );
        })}
        <Callout tone="neutral" title="Categorisation basis">EXPERT JUDGMENT by the platform team for Indian small and medium coconut processors in 2026; revisit as costs fall and evidence accumulates.</Callout>
      </Container></Section>
    </>
  );
}
