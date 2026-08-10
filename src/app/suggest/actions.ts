"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notifyNewContribution } from "@/lib/notify";
import { BASE_PATH } from "@/lib/base-path";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false;

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    }
  );
  const result = await response.json();
  return result.success === true;
}

const RESOURCE_TYPE_MAP: Record<string, string> = {
  workflow: "workflow",
  prompt: "prompt",
  agent: "ai_agent",
  template: "template",
  tool: "tool",
  video: "video",
  pdf: "pdf",
  tutorial: "tutorial",
  case_study: "case_study",
};

export type SuggestResourceInput = {
  resourceType: string;
  title: string;
  description: string;
  processId: string;
  toolPlatform: string;
  url: string;
  howItWorks: string;
  contributorName: string;
  contributorWebsite: string;
  contributorEmail: string;
  contributorPhone: string;
  turnstileToken: string;
  // Only used when resourceType !== "automation" — folded into description.
  keyFeatures: string;
  // Only used when resourceType === "automation" — full guide field set.
  whyUseful: string;
  whoFor: string;
  difficulty: string;
  timeRequired: string;
  toolsRequired: string;
  prerequisites: string;
  inputs: string;
  expectedOutput: string;
  workflowSteps: { title: string; detail: string }[];
  example: string;
  promptInstructions: string;
  templateUrl: string;
  commonMistakes: string;
  humanReview: string;
  troubleshooting: string;
  // Proposal for a phase/process that doesn't exist yet in the taxonomy —
  // the automation still gets filed under the closest existing process
  // picked above; this is just a note for Editor/Admin to consider adding
  // a real new process during review.
  proposedPhaseName: string;
  proposedProcessName: string;
};

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://stacknarrative.com";

function buildProposalNote(input: SuggestResourceInput): string | null {
  if (!input.proposedPhaseName.trim() && !input.proposedProcessName.trim()) {
    return null;
  }
  const parts = [];
  if (input.proposedPhaseName.trim()) {
    parts.push(`proposed new phase: "${input.proposedPhaseName.trim()}"`);
  }
  if (input.proposedProcessName.trim()) {
    parts.push(`proposed new process: "${input.proposedProcessName.trim()}"`);
  }
  return `Contributor ${parts.join(" and ")} — filed under the closest existing process below in the meantime.`;
}

export async function suggestResource(
  input: SuggestResourceInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!input.title.trim() || !input.processId) {
    return { ok: false, error: "Title and process are required." };
  }
  if (!input.contributorName.trim() || !input.contributorEmail.trim() || !input.contributorPhone.trim()) {
    return {
      ok: false,
      error: "Your name, email, and mobile number are required so we can reach you about changes.",
    };
  }

  const humanVerified = await verifyTurnstile(input.turnstileToken);
  if (!humanVerified) {
    return { ok: false, error: "Verification failed. Please try again." };
  }

  const supabase = await createServerSupabaseClient();

  if (input.resourceType === "automation") {
    const slug = `${slugify(input.title)}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;

    const { data: automation, error: automationError } = await supabase
      .from("automations")
      .insert({
        process_id: input.processId,
        slug,
        title: input.title.trim(),
        tool_platform: input.toolPlatform || null,
        status: "pending",
        contributor_name: input.contributorName || null,
        contributor_website: input.contributorWebsite || null,
        review_notes: buildProposalNote(input),
      })
      .select("id")
      .single();

    if (automationError || !automation) {
      return {
        ok: false,
        error: automationError?.message ?? "Failed to submit.",
      };
    }

    const { error: guideError } = await supabase.from("guides").insert({
      automation_id: automation.id,
      what_it_does: input.description || null,
      why_useful: input.whyUseful || null,
      who_for: input.whoFor || null,
      difficulty: input.difficulty || null,
      time_required: input.timeRequired || null,
      tools_required: input.toolsRequired || null,
      prerequisites: input.prerequisites || null,
      inputs: input.inputs || null,
      expected_output: input.expectedOutput || null,
      workflow_steps: input.howItWorks
        ? [{ title: "How it works", detail: input.howItWorks }, ...input.workflowSteps.filter((s) => s.title.trim())]
        : input.workflowSteps.filter((s) => s.title.trim()),
      example: input.example || null,
      prompt_instructions: input.promptInstructions || null,
      template_url: input.templateUrl || null,
      common_mistakes: input.commonMistakes || null,
      human_review: input.humanReview || null,
      troubleshooting: input.troubleshooting || null,
    });

    if (guideError) {
      return { ok: false, error: guideError.message };
    }

    if (input.url) {
      await supabase.from("resources").insert({
        automation_id: automation.id,
        type: "tool",
        title: `${input.title.trim()} — submitted link`,
        url: input.url,
        status: "pending",
        contributor_name: input.contributorName || null,
        contributor_website: input.contributorWebsite || null,
      });
    }

    await supabase.from("contribution_contacts").insert({
      automation_id: automation.id,
      email: input.contributorEmail,
      phone: input.contributorPhone,
    });

    await notifyNewContribution({
      type: "Automation",
      title: input.title,
      contributorName: input.contributorName,
      contributorEmail: input.contributorEmail,
      contributorPhone: input.contributorPhone,
      contributorWebsite: input.contributorWebsite,
      reviewUrl: `${SITE_ORIGIN}${BASE_PATH}/admin/automations`,
    });

    return { ok: true };
  }

  const dbType = RESOURCE_TYPE_MAP[input.resourceType];
  if (!dbType) {
    return { ok: false, error: "Invalid resource type." };
  }

  const description = [
    input.description,
    input.keyFeatures ? `Key features / specs: ${input.keyFeatures}` : "",
    input.howItWorks ? `How it works: ${input.howItWorks}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const { data: resource, error: resourceError } = await supabase
    .from("resources")
    .insert({
      process_id: input.processId,
      type: dbType,
      title: input.title.trim(),
      description: description || null,
      url: input.url || null,
      status: "pending",
      contributor_name: input.contributorName || null,
      contributor_website: input.contributorWebsite || null,
    })
    .select("id")
    .single();

  if (resourceError || !resource) {
    return { ok: false, error: resourceError?.message ?? "Failed to submit." };
  }

  await supabase.from("contribution_contacts").insert({
    resource_id: resource.id,
    email: input.contributorEmail,
    phone: input.contributorPhone,
  });

  await notifyNewContribution({
    type: dbType,
    title: input.title,
    contributorName: input.contributorName,
    contributorEmail: input.contributorEmail,
    contributorPhone: input.contributorPhone,
    contributorWebsite: input.contributorWebsite,
    reviewUrl: `${SITE_ORIGIN}${BASE_PATH}/admin/resources`,
  });

  return { ok: true };
}
