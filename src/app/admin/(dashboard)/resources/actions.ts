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
import type { ReviewResult } from "@/app/admin/(dashboard)/new/actions";

const TYPE_LABELS: Record<string, string> = {
  ai_agent: "AI agent",
  case_study: "case study",
};

export async function setResourceStatus(
  resourceId: string,
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
    .from("resources")
    .select(
      "title, type, contributor_name, contributor_website, process:processes ( name, phase:phases ( name ) )"
    )
    .eq("id", resourceId)
    .single();
  const { data: contact } = await supabase
    .from("contribution_contacts")
    .select("email")
    .eq("resource_id", resourceId)
    .limit(1)
    .maybeSingle();

  const { error } = await supabase
    .from("resources")
    .update({
      status,
      rejection_reason: status === "rejected" ? rejectionReason : null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", resourceId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`${BASE_PATH}`);
  revalidatePath(`${BASE_PATH}/admin/resources`);
  revalidatePath(`${BASE_PATH}/automation`);

  if (!contact?.email || !before) return { ok: true, email: "no-contact" };

  const process = Array.isArray(before.process) ? before.process[0] : before.process;
  const phase = process ? (Array.isArray(process.phase) ? process.phase[0] : process.phase) : null;
  const name = before.contributor_name || "there";

  const sent =
    status === "published"
      ? await emailContributorApproved({
          to: contact.email,
          name,
          title: before.title,
          kind: TYPE_LABELS[before.type] ?? before.type,
          link: guideUrl,
          linkIsOwnPage: false,
          location: phase && process ? `${phase.name} › ${process.name}` : undefined,
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

export async function updateResource(
  resourceId: string,
  input: {
    title: string;
    type: string;
    description: string;
    url: string;
    process_id: string | null;
    contributor_name: string;
    contributor_website: string;
  }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentEditorOrAdmin();
  if (!user) {
    return { ok: false, error: "Not signed in as an Editor/Admin." };
  }
  if (!input.title.trim()) {
    return { ok: false, error: "Title is required." };
  }

  const supabase = await createServerSupabaseClient();
  const patch: Record<string, string | null> = {
    title: input.title.trim(),
    type: input.type,
    description: input.description.trim() || null,
    url: input.url.trim() || null,
    contributor_name: input.contributor_name.trim() || null,
    contributor_website: input.contributor_website.trim() || null,
  };
  // Resources attached to an automation have no process of their own.
  if (input.process_id) patch.process_id = input.process_id;

  const { error } = await supabase.from("resources").update(patch).eq("id", resourceId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`${BASE_PATH}`);
  revalidatePath(`${BASE_PATH}/admin/resources`);
  return { ok: true };
}
