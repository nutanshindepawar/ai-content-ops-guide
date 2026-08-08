import { getPhaseTree } from "@/lib/content";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AutomationForm } from "@/components/admin/AutomationForm";

export default async function NewAutomationPage() {
  const phases = await getPhaseTree();

  const supabase = await createServerSupabaseClient();
  const { data: existingAutomations } = await supabase
    .from("automations")
    .select("id, slug, title")
    .eq("status", "published")
    .order("title");

  return (
    <div>
      <h1 className="font-serif text-3xl text-premium-black">
        New Automation
      </h1>
      <p className="mt-2 text-sm text-soft-charcoal">
        Publishes immediately — no review queue for Editor/Admin submissions.
      </p>

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
        />
      </div>
    </div>
  );
}
