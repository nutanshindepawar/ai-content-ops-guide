"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

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
  turnstileToken: string;
};

export async function suggestResource(
  input: SuggestResourceInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!input.title.trim() || !input.processId) {
    return { ok: false, error: "Title and process are required." };
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
      workflow_steps: input.howItWorks
        ? [{ title: "How it works", detail: input.howItWorks }]
        : [],
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

    return { ok: true };
  }

  const dbType = RESOURCE_TYPE_MAP[input.resourceType];
  if (!dbType) {
    return { ok: false, error: "Invalid resource type." };
  }

  const description = [input.description, input.howItWorks]
    .filter(Boolean)
    .join("\n\nHow it works: ");

  const { error: resourceError } = await supabase.from("resources").insert({
    process_id: input.processId,
    type: dbType,
    title: input.title.trim(),
    description: description || null,
    url: input.url || null,
    status: "pending",
    contributor_name: input.contributorName || null,
    contributor_website: input.contributorWebsite || null,
  });

  if (resourceError) {
    return { ok: false, error: resourceError.message };
  }

  return { ok: true };
}
