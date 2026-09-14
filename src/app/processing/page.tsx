import Link from "next/link";
import { repo } from "@/services/repository";
import { Container, Section, Badge } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Coconut Processing — Process Library", description: "Documented manufacturing processes for coconut products: steps, inputs, outputs, losses, machinery, QC points and hygiene zones.", path: "/processing" });

export default async function ProcessesPage() {
  const [processes, products] = await Promise.all([repo.processes(), repo.products()]);
  return (
    <>
      <PageIntro overline="Processing" title="Process library." lede="Each process is an ordered chain of steps with inputs, outputs, losses, machines and QC points. Products link to processes; processes link to machines." breadcrumbs={[{ label: "Processing" }]} />
      <Section surface="ivory">
        <Container>
          <ul className="grid gap-6 md:grid-cols-2">
            {processes.map((p) => (
              <li key={p.id} className="border-t-2 border-coconut-950 pt-4">
                <Link href={`/processing/${p.slug}`} className="group block">
                  <div className="flex flex-wrap gap-1.5"><Badge tone={p.hygieneClass === "food" ? "green" : p.hygieneClass === "industrial" ? "dark" : "fibre"}>{p.hygieneClass}</Badge><Badge>{p.steps.length} steps</Badge></div>
                  <p className="t-h4 mt-3 group-hover:underline underline-offset-4">{p.name}</p>
                  <p className="t-caption mt-2">{p.summary}</p>
                  <p className="t-data mt-3 text-neutral-500">Products: {p.productIds.map((id) => products.find((x) => x.id === id)?.name).filter(Boolean).join(", ")}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
