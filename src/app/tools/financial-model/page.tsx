import { repo } from "@/services/repository";
import { Container, Section, Callout } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { FinancialModel } from "@/components/features/financial-model";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Financial Model — Revenue to Payback in Three Scenarios", description: "Interactive coconut business financial model: raw material, yield, price, packaging, labour, utilities, logistics, rent, QC, marketing, admin, interest, depreciation, working capital. Outputs: revenue, COGS, gross profit, contribution, EBITDA, EBIT, net profit, cash flow, break-even, ROI, ROCE, payback, working-capital cycle.", path: "/tools/financial-model" });

export default async function FinancialModelPage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const sp = await searchParams;
  const product = sp.product ? await repo.productById(sp.product) : null;
  const y = product?.yieldQuantities.find((q) => q.unit === "kg/kg" && q.value !== undefined);
  return (
    <>
      <PageIntro overline="Tools" title={product ? `Financial model — ${product.name}.` : "Financial model."} lede="Every input is labelled VERIFIED / ESTIMATED / ASSUMED / RESEARCH REQUIRED and every output shows its formula. Prices are never pre-filled by the platform. Load the illustrative assumption set to see the mechanics, then replace it with your quotations." breadcrumbs={[{ label: "Tools", href: "/tools" }, { label: "Financial model" }]} />
      <Section surface="ivory">
        <Container>
          <Callout tone="neutral" title="Not investment advice">This model computes arithmetic from your inputs. It does not know your market. Conservative / base / aggressive scenarios apply transparent multipliers to price, utilisation, yield and raw-material cost so you can see sensitivity — they are not forecasts.</Callout>
          <div className="mt-8"><FinancialModel productName={product?.name} yieldHint={y ? { value: y.value!, label: y.basis ?? "yield", evidence: y.evidence } : undefined} /></div>
        </Container>
      </Section>
    </>
  );
}
