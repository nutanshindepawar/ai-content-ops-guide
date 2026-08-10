"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentEditorOrAdmin } from "@/lib/auth";
import { BASE_PATH } from "@/lib/base-path";

export async function setResourceStatus(
  resourceId: string,
  status: "published" | "rejected"
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentEditorOrAdmin();
  if (!user) {
    return { ok: false, error: "Not signed in as an Editor/Admin." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("resources")
    .update({
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", resourceId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`${BASE_PATH}/admin/resources`);
  revalidatePath(`${BASE_PATH}/automation`);

  return { ok: true };
}
