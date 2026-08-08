import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PhaseWithProcesses } from "@/lib/types/content";

export async function getPhaseTree(): Promise<PhaseWithProcesses[]> {
  const supabase = createServerSupabaseClient();

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
