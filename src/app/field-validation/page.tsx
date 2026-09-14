import { repo } from "@/services/repository";
import { Container, Section, Callout } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { FieldValidation } from "@/components/features/field-validation";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "Field Validation — 100+ Interview Questions for Farmers, Traders, Processors, Customers, Exporters & Suppliers", description: "Structured interview framework across ten stakeholder types. Mark interviews complete, save notes, capture evidence, attach references, record date, location and participant type, tag findings, export for the database.", path: "/field-validation" });

export default async function FieldValidationPage() {
  const questions = await repo.interviewQuestions();
  return (
    <>
      <PageIntro overline="Build" title="Field validation." lede={`${questions.length} questions across farmers, traders, collection centres, factory owners, processors, customers, retailers, distributors, exporters and machinery suppliers. Every RESEARCH REQUIRED field on this platform maps to one of these questions.`} breadcrumbs={[{ label: "Business", href: "/business" }, { label: "Field validation" }]} />
      <Section surface="ivory"><Container>
        <Callout tone="green" title="Why this module exists">Prices, yields, terms, rejection rates, quotations and utilisation are learned in the field, not on a screen. Capture them with dates and references so they can be promoted from RESEARCH REQUIRED to ESTIMATE and VERIFIED.</Callout>
        <div className="mt-10"><FieldValidation questions={questions} /></div>
      </Container></Section>
    </>
  );
}
