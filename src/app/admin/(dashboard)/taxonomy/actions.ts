"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentEditorOrAdmin } from "@/lib/auth";
import { BASE_PATH } from "@/lib/base-path";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type ActionResult = { ok: true } | { ok: false; error: string };

export async function updatePhase(
  phaseId: string,
  name: string,
  description: string,
  oftenOverlooked: string
): Promise<ActionResult> {
  const user = await getCurrentEditorOrAdmin();
  if (!user || user.role !== "admin") {
    return { ok: false, error: "Admin only." };
  }
  if (!name.trim()) {
    return { ok: false, error: "Name is required." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("phases")
    .update({
      name: name.trim(),
      description: description || null,
      often_overlooked: oftenOverlooked || null,
    })
    .eq("id", phaseId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`${BASE_PATH}`);
  revalidatePath(`${BASE_PATH}/admin/taxonomy`);
  revalidatePath(`${BASE_PATH}/admin/new`);
  return { ok: true };
}

export async function updateProcess(
  processId: string,
  name: string,
  description: string,
  oftenOverlooked: string
): Promise<ActionResult> {
  const user = await getCurrentEditorOrAdmin();
  if (!user || user.role !== "admin") {
    return { ok: false, error: "Admin only." };
  }
  if (!name.trim()) {
    return { ok: false, error: "Name is required." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("processes")
    .update({
      name: name.trim(),
      description: description || null,
      often_overlooked: oftenOverlooked || null,
    })
    .eq("id", processId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`${BASE_PATH}`);
  revalidatePath(`${BASE_PATH}/admin/taxonomy`);
  revalidatePath(`${BASE_PATH}/admin/new`);
  return { ok: true };
}

export async function createProcess(
  phaseId: string,
  name: string
): Promise<ActionResult> {
  const user = await getCurrentEditorOrAdmin();
  if (!user || user.role !== "admin") {
    return { ok: false, error: "Admin only." };
  }
  if (!name.trim()) {
    return { ok: false, error: "Name is required." };
  }

  const supabase = await createServerSupabaseClient();

  const { data: existing, error: countError } = await supabase
    .from("processes")
    .select("number")
    .eq("phase_id", phaseId)
    .order("number", { ascending: false })
    .limit(1);

  if (countError) return { ok: false, error: countError.message };

  const nextNumber = (existing?.[0]?.number ?? 0) + 1;

  const { error } = await supabase.from("processes").insert({
    phase_id: phaseId,
    number: nextNumber,
    slug: slugify(name),
    name: name.trim(),
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath(`${BASE_PATH}`);
  revalidatePath(`${BASE_PATH}/admin/taxonomy`);
  revalidatePath(`${BASE_PATH}/admin/new`);
  return { ok: true };
}
