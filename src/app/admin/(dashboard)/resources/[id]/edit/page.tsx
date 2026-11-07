import { notFound } from "next/navigation";
import { getPhaseTree } from "@/lib/content";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ResourceEditForm } from "@/components/admin/ResourceEditForm";

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: resource } = await supabase
    .from("resources")
    .select(
      "id, title, type, status, description, url, process_id, automation_id, contributor_name, contributor_website"
    )
    .eq("id", id)
    .maybeSingle();

  if (!resource) notFound();

  const phases = await getPhaseTree();

  return (
    <div>
      <h1 className="font-serif text-3xl text-premium-black">Edit Resource</h1>
      <p className="mt-2 text-sm text-soft-charcoal">
        Status: {resource.status}. Changes save immediately; use Publish/Reject
        on the Resources list to decide.
      </p>
      <div className="mt-8">
        <ResourceEditForm
          resource={resource}
          phases={phases.map((p) => ({
            id: p.id,
            name: p.name,
            processes: p.processes.map((proc) => ({ id: proc.id, name: proc.name })),
          }))}
        />
      </div>
    </div>
  );
}
