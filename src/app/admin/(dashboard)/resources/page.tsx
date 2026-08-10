import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ResourcesList } from "@/components/admin/ResourcesList";

export default async function AdminResourcesPage() {
  const supabase = await createServerSupabaseClient();
  const { data: resources } = await supabase
    .from("resources")
    .select(
      `
      id, title, type, status, description, url, contributor_name,
      contributor_website,
      process:processes ( name, phase:phases ( name ) ),
      automation:automations ( title ),
      contact:contribution_contacts ( email, phone )
    `
    )
    .order("created_at", { ascending: false });

  const rows = (resources ?? []).map((resource) => {
    const process = Array.isArray(resource.process)
      ? resource.process[0]
      : resource.process;
    const phase = process
      ? Array.isArray(process.phase)
        ? process.phase[0]
        : process.phase
      : null;
    const automation = Array.isArray(resource.automation)
      ? resource.automation[0]
      : resource.automation;
    const contact = Array.isArray(resource.contact)
      ? resource.contact[0]
      : resource.contact;

    return {
      id: resource.id,
      title: resource.title,
      type: resource.type,
      status: resource.status,
      description: resource.description,
      url: resource.url,
      phaseName: phase?.name ?? null,
      processName: process?.name ?? null,
      automationTitle: automation?.title ?? null,
      contributorName: resource.contributor_name,
      contributorWebsite: resource.contributor_website,
      contactEmail: contact?.email ?? null,
      contactPhone: contact?.phone ?? null,
    };
  });

  return (
    <div>
      <h1 className="font-serif text-3xl text-premium-black">Resources</h1>
      <p className="mt-2 text-sm text-soft-charcoal">
        Standalone contributions (prompts, templates, tools, videos, etc.) —
        not full automations.
      </p>

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-warm-grey">No resources yet.</p>
      ) : (
        <div className="mt-8">
          <ResourcesList rows={rows} />
        </div>
      )}
    </div>
  );
}
