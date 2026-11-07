"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentEditorOrAdmin } from "@/lib/auth";
import { BASE_PATH } from "@/lib/base-path";
import {
  emailContributorApproved,
  emailContributorRejected,
  guideUrl,
} from "@/lib/notify";

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

export async function updateAutomation(
  automationId: string,
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

  const { data: automation, error: automationError } = await supabase
    .from("automations")
    .update({
      process_id: input.process_id,
      title: input.title.trim(),
      tool_platform: input.tool_platform.trim() || null,
      last_verified_at: input.last_verified_at || new Date().toISOString(),
    })
    .eq("id", automationId)
    .select("id, slug")
    .single();

  if (automationError || !automation) {
    return {
      ok: false,
      error: automationError?.message ?? "Failed to update automation.",
    };
  }

  const { error: guideError } = await supabase
    .from("guides")
    .update({
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
    })
    .eq("automation_id", automationId);

  if (guideError) {
    return { ok: false, error: guideError.message };
  }

  await supabase
    .from("automation_related")
    .delete()
    .eq("automation_id", automationId);
  if (input.related_automation_ids.length > 0) {
    await supabase.from("automation_related").insert(
      input.related_automation_ids.map((relatedId) => ({
        automation_id: automationId,
        related_automation_id: relatedId,
      }))
    );
  }

  await supabase.from("resources").delete().eq("automation_id", automationId);
  const resourcesToInsert = input.resources.filter((r) => r.title.trim());
  if (resourcesToInsert.length > 0) {
    await supabase.from("resources").insert(
      resourcesToInsert.map((r) => ({
        automation_id: automationId,
        type: r.type,
        title: r.title.trim(),
        description: r.description || null,
        url: r.url || null,
        status: "published",
        created_by: user.id,
      }))
    );
  }

  revalidatePath(`${BASE_PATH}`);
  revalidatePath(`${BASE_PATH}/automation/${automation.slug}`);
  revalidatePath(`${BASE_PATH}/admin/automations`);

  return { ok: true, slug: automation.slug };
}

export type ReviewResult =
  | { ok: true; email: "sent" | "failed" | "no-contact" }
  | { ok: false; error: string };

export async function setAutomationStatus(
  automationId: string,
  status: "published" | "rejected",
  reason?: string
): Promise<ReviewResult> {
  const user = await getCurrentEditorOrAdmin();
  if (!user) {
    return { ok: false, error: "Not signed in as an Editor/Admin." };
  }
  const rejectionReason = (reason ?? "").trim();
  if (status === "rejected" && !rejectionReason) {
    return { ok: false, error: "A reason for rejection is required." };
  }

  const supabase = await createServerSupabaseClient();

  const { data: before } = await supabase
    .from("automations")
    .select("title, slug, contributor_name, contributor_website")
    .eq("id", automationId)
    .single();
  const { data: contact } = await supabase
    .from("contribution_contacts")
    .select("email")
    .eq("automation_id", automationId)
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("automations")
    .update({
      status,
      rejection_reason: status === "rejected" ? rejectionReason : null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", automationId)
    .select("slug")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Failed to update status." };
  }

  // The contributor's attached link (created with the submission) follows the
  // automation's decision.
  await supabase
    .from("resources")
    .update({ status, reviewed_by: user.id, reviewed_at: new Date().toISOString() })
    .eq("automation_id", automationId)
    .eq("status", "pending");

  revalidatePath(`${BASE_PATH}`);
  revalidatePath(`${BASE_PATH}/automation/${data.slug}`);
  revalidatePath(`${BASE_PATH}/admin/automations`);

  if (!contact?.email || !before) return { ok: true, email: "no-contact" };

  const name = before.contributor_name || "there";
  const sent =
    status === "published"
      ? await emailContributorApproved({
          to: contact.email,
          name,
          title: before.title,
          kind: "automation",
          link: `${guideUrl}/automation/${data.slug}`,
          linkIsOwnPage: true,
          website: before.contributor_website,
        })
      : await emailContributorRejected({
          to: contact.email,
          name,
          title: before.title,
          reason: rejectionReason,
        });

  return { ok: true, email: sent ? "sent" : "failed" };
}
