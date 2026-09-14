import { repo } from "@/services/repository";
import { Container, Section, Badge, Callout } from "@/components/ui/primitives";
import { PageIntro } from "@/components/layout/chrome";
import { EvidenceBadge } from "@/components/ui/evidence";
import { pageMetadata } from "@/lib/seo/site";

export const metadata = pageMetadata({ title: "90-Day Coconut Business Validation Plan", description: "Interactive timeline: Day 1–7, 8–30, 31–60, 61–90. For every task: objective, cost, time, expected result, success criterion, learning objective, people to contact, evidence to collect and the next decision.", path: "/90-day-plan" });

const PHASES: { id: "day-1-7" | "day-8-30" | "day-31-60" | "day-61-90"; label: string; theme: string }[] = [
  { id: "day-1-7", label: "Day 1–7", theme: "Focus: one product, one customer type, one scale hypothesis" },
  { id: "day-8-30", label: "Day 8–30", theme: "Ground truth: interviews, plant visits, quotations, trial batch" },
  { id: "day-31-60", label: "Day 31–60", theme: "Validation: trial sales, supply commitments, compliance path, model" },
  { id: "day-61-90", label: "Day 61–90", theme: "Decision: site, contracts, entry route, capital" },
];

export default async function NinetyDayPage() {
  const [tasks, sources] = await Promise.all([repo.roadmapTasks(), repo.sources()]);
  return (
    <>
      <PageIntro overline="Build" title="90-day validation plan." lede="Before any machine, land or factory: ninety days of customer, supply, process and economics validation. Each task states what it costs, what it proves and what decision it unlocks." breadcrumbs={[{ label: "Business", href: "/business" }, { label: "90-day plan" }]} />
      <Section surface="ivory"><Container>
        <ol className="relative border-l-2 border-leaf-500 pl-6 md:pl-10 space-y-14">
          {PHASES.map((ph) => (
            <li key={ph.id} className="relative">
              <span className="absolute -left-[33px] top-1 h-4 w-4 rounded-full bg-leaf-500 ring-4 ring-ivory-50 md:-left-[49px]" aria-hidden="true" />
              <p className="t-overline text-leaf-500">{ph.label}</p>
              <h2 className="t-h3 mt-1">{ph.theme}</h2>
              <ul className="mt-6 space-y-5">
                {tasks.filter((t) => t.phase === ph.id).map((t) => (
                  <li key={t.id} className="rounded-[var(--radius-media)] border hairline bg-cocos p-5">
                    <p className="t-h4">{t.task}</p>
                    <div className="mt-3 grid gap-x-8 gap-y-2 text-[0.85rem] sm:grid-cols-2 lg:grid-cols-3">
                      <p><span className="t-overline text-neutral-500 mr-2">Objective</span>{t.objective}</p>
                      <p><span className="t-overline text-neutral-500 mr-2">Cost</span>{t.cost.value === 0 ? "Time only" : t.cost.value ?? "Research required"} <EvidenceBadge q={t.cost} sources={sources} compact /></p>
                      <p><span className="t-overline text-neutral-500 mr-2">Time</span>{t.time}</p>
                      <p><span className="t-overline text-neutral-500 mr-2">Expected result</span>{t.expectedResult}</p>
                      <p><span className="t-overline text-neutral-500 mr-2">Success criterion</span>{t.successCriterion}</p>
                      <p><span className="t-overline text-neutral-500 mr-2">Learning objective</span>{t.learningObjective}</p>
                      <p><span className="t-overline text-neutral-500 mr-2">People</span>{t.peopleToContact.join(", ") || "—"}</p>
                      <p><span className="t-overline text-neutral-500 mr-2">Evidence</span>{t.evidenceToCollect.join(", ")}</p>
                      <p><span className="t-overline text-neutral-500 mr-2">Next decision</span><Badge tone="green">{t.nextDecision}</Badge></p>
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <div className="mt-14"><Callout tone="warning" title="Discipline">If Day 31–60 does not produce repeat orders and supply commitments, do not proceed to Day 61–90 capital decisions. Pivot the product or customer instead.</Callout></div>
      </Container></Section>
    </>
  );
}
