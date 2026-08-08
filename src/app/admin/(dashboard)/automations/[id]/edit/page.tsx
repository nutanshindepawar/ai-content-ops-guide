import { notFound } from "next/navigation";
import { getPhaseTree } from "@/lib/content";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  AutomationForm,
  type AutomationFormInitial,
} from "@/components/admin/AutomationForm";

export default async function EditAutomationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: automation } = await supabase
    .from("automations")
    .select(
      `
      id, process_id, title, tool_platform, last_verified_at,
      guide:guides!guides_automation_id_fkey (
        what_it_does, why_useful, who_for, difficulty, time_required,
        tools_required, prerequisites, inputs, expected_output,
        workflow_steps, example, prompt_instructions, template_url,
        common_mistakes, human_review, troubleshooting, freshness_status,
        next_step_automation_id
      ),
      resources:resources ( type, title, description, url ),
      related:automation_related!automation_related_automation_id_fkey (
        related_automation_id
      )
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (!automation) {
    notFound();
  }

  const guideRow = Array.isArray(automation.guide)
    ? automation.guide[0]
    : automation.guide;

  const phases = await getPhaseTree();
  const { data: existingAutomations } = await supabase
    .from("automations")
    .select("id, slug, title")
    .eq("status", "published")
    .order("title");

  const initial: AutomationFormInitial = {
    automationId: automation.id,
    processId: automation.process_id,
    title: automation.title,
    toolPlatform: automation.tool_platform ?? "",
    lastVerifiedAt: automation.last_verified_at
      ? new Date(automation.last_verified_at).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    whatItDoes: guideRow?.what_it_does ?? "",
    whyUseful: guideRow?.why_useful ?? "",
    whoFor: guideRow?.who_for ?? "",
    difficulty: guideRow?.difficulty ?? "beginner",
    timeRequired: guideRow?.time_required ?? "",
    toolsRequired: guideRow?.tools_required ?? "",
    prerequisites: guideRow?.prerequisites ?? "",
    inputs: guideRow?.inputs ?? "",
    expectedOutput: guideRow?.expected_output ?? "",
    workflowSteps:
      (guideRow?.workflow_steps as { title: string; detail: string }[]) ?? [],
    example: guideRow?.example ?? "",
    promptInstructions: guideRow?.prompt_instructions ?? "",
    templateUrl: guideRow?.template_url ?? "",
    commonMistakes: guideRow?.common_mistakes ?? "",
    humanReview: guideRow?.human_review ?? "",
    troubleshooting: guideRow?.troubleshooting ?? "",
    freshnessStatus: guideRow?.freshness_status ?? "verified",
    nextStepId: guideRow?.next_step_automation_id ?? "",
    relatedIds: (automation.related ?? []).map((r) => r.related_automation_id),
    resources: (automation.resources ?? []).map((r) => ({
      type: r.type,
      title: r.title,
      description: r.description ?? "",
      url: r.url ?? "",
    })),
  };

  return (
    <div>
      <h1 className="font-serif text-3xl text-premium-black">
        Edit Automation
      </h1>

      <div className="mt-8">
        <AutomationForm
          phases={phases.map((p) => ({
            id: p.id,
            name: p.name,
            processes: p.processes.map((proc) => ({
              id: proc.id,
              name: proc.name,
            })),
          }))}
          existingAutomations={existingAutomations ?? []}
          initial={initial}
        />
      </div>
    </div>
  );
}
