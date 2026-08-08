import Link from "next/link";
import { notFound } from "next/navigation";
import { getAutomationBySlug } from "@/lib/content";

export const revalidate = 60;

function MetaTag({ label, value }: { label: string; value: string }) {
  return (
    <span className="border border-light-grey-bg px-3 py-1 text-xs text-soft-charcoal">
      <span className="font-mono uppercase tracking-widest text-warm-grey">
        {label}
      </span>{" "}
      {value}
    </span>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-mono text-xs uppercase tracking-widest text-warm-grey">
        {title}
      </h2>
      <div className="mt-3 text-soft-charcoal">{children}</div>
    </section>
  );
}

function InfoGridItem({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  if (!value) return null;
  return (
    <div className="bg-light-grey-bg px-4 py-3">
      <p className="font-mono text-[11px] uppercase tracking-widest text-warm-grey">
        {label}
      </p>
      <p className="mt-1 text-sm text-soft-charcoal">{value}</p>
    </div>
  );
}

const RESOURCE_TYPE_LABELS: Record<string, string> = {
  prompt: "Prompt",
  template: "Template",
  tool: "Tool",
  ai_agent: "AI Agent",
  workflow: "Workflow",
  video: "Video",
  pdf: "PDF",
  tutorial: "Tutorial",
  case_study: "Case Study",
  example: "Example",
};

export default async function AutomationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const automation = await getAutomationBySlug(slug);

  if (!automation) {
    notFound();
  }

  const { guide } = automation;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      {/* Header */}
      <p className="font-mono text-xs uppercase tracking-widest text-warm-grey">
        <Link href="/" className="hover:text-pistachio">
          {automation.process.phase.name}
        </Link>{" "}
        &rsaquo; {automation.process.name}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-3xl text-premium-black sm:text-4xl">
          {automation.title}
        </h1>
        {automation.tool_platform && (
          <span className="border border-pistachio px-2 py-1 font-mono text-xs uppercase tracking-widest text-pistachio">
            {automation.tool_platform}
          </span>
        )}
      </div>

      {/* Meta bar */}
      <div className="mt-4 flex flex-wrap gap-2">
        {guide?.difficulty && (
          <MetaTag label="Difficulty" value={guide.difficulty} />
        )}
        {guide?.time_required && (
          <MetaTag label="Time" value={guide.time_required} />
        )}
        {automation.last_verified_at && (
          <MetaTag
            label="Last verified"
            value={new Date(automation.last_verified_at).toLocaleDateString(
              "en-US",
              { year: "numeric", month: "long" }
            )}
          />
        )}
        {guide?.freshness_status && (
          <MetaTag
            label="Status"
            value={
              guide.freshness_status === "verified"
                ? "Verified"
                : "May be outdated"
            }
          />
        )}
      </div>

      {!guide && (
        <p className="mt-10 italic text-warm-grey">
          This automation's guide hasn't been filled in yet.
        </p>
      )}

      {guide && (
        <>
          {/* Body intro */}
          {guide.what_it_does && (
            <Section title="What it does">
              <p>{guide.what_it_does}</p>
            </Section>
          )}
          {guide.why_useful && (
            <Section title="Why it's useful">
              <p>{guide.why_useful}</p>
            </Section>
          )}
          {guide.who_for && (
            <Section title="Who it's for">
              <p>{guide.who_for}</p>
            </Section>
          )}

          {/* Before you start */}
          {(guide.tools_required ||
            guide.prerequisites ||
            guide.inputs ||
            guide.expected_output) && (
            <div className="mt-10 grid gap-2 sm:grid-cols-2">
              <InfoGridItem label="Tools required" value={guide.tools_required} />
              <InfoGridItem label="Prerequisites" value={guide.prerequisites} />
              <InfoGridItem label="Inputs" value={guide.inputs} />
              <InfoGridItem
                label="Expected output"
                value={guide.expected_output}
              />
            </div>
          )}

          {/* Step-by-step workflow */}
          {guide.workflow_steps.length > 0 && (
            <Section title="Step-by-step workflow">
              <ol className="space-y-4">
                {guide.workflow_steps.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="font-mono text-sm text-pistachio">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-premium-black">{step.title}</p>
                      {step.detail && (
                        <p className="mt-1 text-sm text-soft-charcoal">
                          {step.detail}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {guide.example && (
            <Section title="Example">
              <p className="whitespace-pre-line">{guide.example}</p>
            </Section>
          )}

          {/* Resources panel */}
          {(guide.prompt_instructions ||
            guide.template_url ||
            automation.resources.length > 0) && (
            <Section title="Resources">
              <div className="space-y-3">
                {guide.prompt_instructions && (
                  <div className="bg-light-grey-bg p-4 font-mono text-sm text-premium-black">
                    <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-warm-grey">
                      Prompt / instructions
                    </p>
                    <pre className="whitespace-pre-wrap">
                      {guide.prompt_instructions}
                    </pre>
                  </div>
                )}
                {guide.template_url && (
                  <a
                    href={guide.template_url}
                    className="inline-block border border-pistachio px-4 py-2 text-sm text-premium-black hover:bg-pistachio/10"
                  >
                    Download template
                  </a>
                )}
                {automation.resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="border border-light-grey-bg px-4 py-3"
                  >
                    <p className="font-mono text-[11px] uppercase tracking-widest text-warm-grey">
                      {RESOURCE_TYPE_LABELS[resource.type] ?? resource.type}
                    </p>
                    <p className="mt-1 text-sm text-premium-black">
                      {resource.title}
                    </p>
                    {resource.description && (
                      <p className="mt-1 text-sm text-soft-charcoal">
                        {resource.description}
                      </p>
                    )}
                    {resource.type === "video" && resource.url ? (
                      <div className="mt-3 aspect-video w-full">
                        <iframe
                          src={resource.url}
                          className="h-full w-full"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      resource.url && (
                        <a
                          href={resource.url}
                          className="mt-2 inline-block text-sm text-pistachio underline"
                        >
                          Open resource
                        </a>
                      )
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {guide.common_mistakes && (
            <Section title="Common mistakes">
              <p>{guide.common_mistakes}</p>
            </Section>
          )}
          {guide.human_review && (
            <Section title="Human review">
              <p>{guide.human_review}</p>
            </Section>
          )}
          {guide.troubleshooting && (
            <Section title="Troubleshooting">
              <p>{guide.troubleshooting}</p>
            </Section>
          )}
        </>
      )}

      {/* Footer: related automations + next step */}
      {(automation.related_automations.length > 0 || guide?.next_step) && (
        <footer className="mt-16 border-t border-light-grey-bg pt-8">
          {automation.related_automations.length > 0 && (
            <div>
              <h2 className="font-mono text-xs uppercase tracking-widest text-warm-grey">
                Related automations
              </h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {automation.related_automations.map((related) => (
                  <li key={related.id}>
                    <Link
                      href={`/automation/${related.slug}`}
                      className="block border border-light-grey-bg px-4 py-3 hover:border-pistachio"
                    >
                      {related.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {guide?.next_step && (
            <div className="mt-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-warm-grey">
                Next step
              </h2>
              <Link
                href={`/automation/${guide.next_step.slug}`}
                className="mt-3 block border border-pistachio px-4 py-3 text-premium-black hover:bg-pistachio/10"
              >
                {guide.next_step.title} &rarr;
              </Link>
            </div>
          )}
        </footer>
      )}
    </div>
  );
}
