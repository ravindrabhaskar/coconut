import { repo } from "@/services/repository";
import { Container, Section, SectionHeader, BulletList } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { ValueChain } from "@/components/viz/value-chain";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "The Complete Coconut Value Chain — Farm to Export", description: "Interactive coconut value chain: farm, cultivation, harvest, collection, grading, trading, transport, processing, primary products, secondary products, by-products, B2B, B2C, export — participants, value addition, risks, cost drivers, technology and opportunities at every node.", path: "/value-chain" });

export default async function ValueChainPage() {
  const [nodes, products, research] = await Promise.all([repo.valueChain(), repo.products(), repo.research()]);
  const proc = research.find((r) => r.id === "rd-procurement-models");
  return (
    <>
      <PageIntro overline="Value chain" title="Farm → export, node by node." lede="Fourteen stages. Click any node for participants, value addition, risks, cost drivers, technology and business opportunities. Value is added — and lost — at every handover." breadcrumbs={[{ label: "Value chain" }]} />
      <Section surface="ivory"><Container><ValueChain nodes={nodes} products={products} /></Container></Section>
      {proc && (
        <Section surface="white">
          <Container>
            <SectionHeader overline="Procurement" title="Product strategy determines procurement strategy." lede={proc.summary} />
            <div className="grid gap-8 md:grid-cols-2"><div className="prose-coconut">{proc.detail.map((d, i) => <p key={i}>{d}</p>)}</div><div><p className="t-overline text-neutral-500 mb-2">Implications</p><BulletList items={proc.businessImplications} /></div></div>
          </Container>
        </Section>
      )}
    </>
  );
}
