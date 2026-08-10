import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PhaseWithProcesses } from "@/lib/types/content";
import type { AutomationDetail, WorkflowStep } from "@/lib/types/guide";

export async function getPhaseTree(): Promise<PhaseWithProcesses[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("phases")
    .select(
      `
      id, slug, number, name, description, often_overlooked,
      processes:processes (
        id, slug, number, name, description, often_overlooked,
        automations:automations (
          id, slug, title, tool_platform, status
        )
      )
    `
    )
    .order("number", { ascending: true })
    .order("number", { referencedTable: "processes", ascending: true });

  if (error) {
    throw new Error(`Failed to load phase tree: ${error.message}`);
  }

  return (data ?? []).map((phase) => ({
    ...phase,
    processes: (phase.processes ?? [])
      .slice()
      .sort((a, b) => a.number - b.number)
      .map((process) => ({
        ...process,
        automations: (process.automations ?? []).filter(
          (a) => a.status === "published"
        ),
      })),
  }));
}

export async function getAutomationBySlug(
  slug: string
): Promise<AutomationDetail | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("automations")
    .select(
      `
      id, slug, title, tool_platform, status, last_verified_at,
      contributor_name, contributor_website,
      process:processes (
        slug, name,
        phase:phases ( slug, name )
      ),
      guide:guides!guides_automation_id_fkey (
        what_it_does, why_useful, who_for, difficulty, time_required,
        tools_required, prerequisites, inputs, expected_output,
        workflow_steps, example, prompt_instructions, template_url,
        common_mistakes, human_review, troubleshooting, freshness_status,
        next_step:automations!guides_next_step_automation_id_fkey ( id, slug, title )
      ),
      resources:resources (
        id, type, title, description, url, file_path, status
      ),
      related:automation_related!automation_related_automation_id_fkey (
        related_automation:automations!automation_related_related_automation_id_fkey ( id, slug, title, status )
      )
    `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load automation "${slug}": ${error.message}`);
  }
  if (!data) return null;

  const guideRow = Array.isArray(data.guide) ? data.guide[0] : data.guide;
  const processRow = Array.isArray(data.process)
    ? data.process[0]
    : data.process;
  const phaseRow = processRow
    ? Array.isArray(processRow.phase)
      ? processRow.phase[0]
      : processRow.phase
    : null;

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    tool_platform: data.tool_platform,
    last_verified_at: data.last_verified_at,
    contributor_name: data.contributor_name,
    contributor_website: data.contributor_website,
    process: {
      slug: processRow?.slug ?? "",
      name: processRow?.name ?? "",
      phase: {
        slug: phaseRow?.slug ?? "",
        name: phaseRow?.name ?? "",
      },
    },
    guide: guideRow
      ? {
          what_it_does: guideRow.what_it_does,
          why_useful: guideRow.why_useful,
          who_for: guideRow.who_for,
          difficulty: guideRow.difficulty,
          time_required: guideRow.time_required,
          tools_required: guideRow.tools_required,
          prerequisites: guideRow.prerequisites,
          inputs: guideRow.inputs,
          expected_output: guideRow.expected_output,
          workflow_steps: (guideRow.workflow_steps ?? []) as WorkflowStep[],
          example: guideRow.example,
          prompt_instructions: guideRow.prompt_instructions,
          template_url: guideRow.template_url,
          common_mistakes: guideRow.common_mistakes,
          human_review: guideRow.human_review,
          troubleshooting: guideRow.troubleshooting,
          freshness_status: guideRow.freshness_status,
          next_step: Array.isArray(guideRow.next_step)
            ? guideRow.next_step[0] ?? null
            : guideRow.next_step ?? null,
        }
      : null,
    resources: (data.resources ?? []).filter((r) => r.status === "published"),
    related_automations: (data.related ?? [])
      .map((r) =>
        Array.isArray(r.related_automation)
          ? r.related_automation[0]
          : r.related_automation
      )
      .filter(
        (a): a is { id: string; slug: string; title: string; status: string } =>
          !!a && a.status === "published"
      ),
  };
}
