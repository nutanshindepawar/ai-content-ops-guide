"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentEditorOrAdmin } from "@/lib/auth";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export type NewAutomationInput = {
  process_id: string;
  title: string;
  tool_platform: string;
  last_verified_at: string;
  guide: {
    what_it_does: string;
    why_useful: string;
    who_for: string;
    difficulty: string;
    time_required: string;
    tools_required: string;
    prerequisites: string;
    inputs: string;
    expected_output: string;
    workflow_steps: { title: string; detail: string }[];
    example: string;
    prompt_instructions: string;
    template_url: string;
    common_mistakes: string;
    human_review: string;
    troubleshooting: string;
    freshness_status: string;
    next_step_automation_id: string | null;
  };
  related_automation_ids: string[];
  resources: {
    type: string;
    title: string;
    description: string;
    url: string;
  }[];
};

export async function createAutomation(
  input: NewAutomationInput
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  const user = await getCurrentEditorOrAdmin();
  if (!user) {
    return { ok: false, error: "Not signed in as an Editor/Admin." };
  }

  if (!input.title.trim() || !input.process_id) {
    return { ok: false, error: "Title and process are required." };
  }

  const supabase = await createServerSupabaseClient();

  const slug = `${slugify(input.title)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;

  const { data: automation, error: automationError } = await supabase
    .from("automations")
    .insert({
      process_id: input.process_id,
      slug,
      title: input.title.trim(),
      tool_platform: input.tool_platform.trim() || null,
      status: "published",
      created_by: user.id,
      last_verified_at: input.last_verified_at || new Date().toISOString(),
    })
    .select("id, slug")
    .single();

  if (automationError || !automation) {
    return {
      ok: false,
      error: automationError?.message ?? "Failed to create automation.",
    };
  }

  const { error: guideError } = await supabase.from("guides").insert({
    automation_id: automation.id,
    what_it_does: input.guide.what_it_does || null,
    why_useful: input.guide.why_useful || null,
    who_for: input.guide.who_for || null,
    difficulty: input.guide.difficulty || null,
    time_required: input.guide.time_required || null,
    tools_required: input.guide.tools_required || null,
    prerequisites: input.guide.prerequisites || null,
    inputs: input.guide.inputs || null,
    expected_output: input.guide.expected_output || null,
    workflow_steps: input.guide.workflow_steps.filter((s) => s.title.trim()),
    example: input.guide.example || null,
    prompt_instructions: input.guide.prompt_instructions || null,
    template_url: input.guide.template_url || null,
    common_mistakes: input.guide.common_mistakes || null,
    human_review: input.guide.human_review || null,
    troubleshooting: input.guide.troubleshooting || null,
    freshness_status: input.guide.freshness_status || "verified",
    next_step_automation_id: input.guide.next_step_automation_id || null,
  });

  if (guideError) {
    return { ok: false, error: guideError.message };
  }

  if (input.related_automation_ids.length > 0) {
    await supabase.from("automation_related").insert(
      input.related_automation_ids.map((relatedId) => ({
        automation_id: automation.id,
        related_automation_id: relatedId,
      }))
    );
  }

  const resourcesToInsert = input.resources.filter((r) => r.title.trim());
  if (resourcesToInsert.length > 0) {
    await supabase.from("resources").insert(
      resourcesToInsert.map((r) => ({
        automation_id: automation.id,
        type: r.type,
        title: r.title.trim(),
        description: r.description || null,
        url: r.url || null,
        status: "published",
        created_by: user.id,
      }))
    );
  }

  return { ok: true, slug: automation.slug };
}
