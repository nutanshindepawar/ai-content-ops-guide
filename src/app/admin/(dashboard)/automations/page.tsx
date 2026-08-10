import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AutomationsList } from "@/components/admin/AutomationsList";

export default async function AdminAutomationsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: automations } = await supabase
    .from("automations")
    .select(
      `
      id, slug, title, status, tool_platform, contributor_name,
      contributor_website, review_notes,
      process:processes ( name, phase:phases ( name ) ),
      contact:contribution_contacts ( email, phone )
    `
    )
    .order("created_at", { ascending: false });

  const rows = (automations ?? []).map((automation) => {
    const process = Array.isArray(automation.process)
      ? automation.process[0]
      : automation.process;
    const phase = process
      ? Array.isArray(process.phase)
        ? process.phase[0]
        : process.phase
      : null;
    const contact = Array.isArray(automation.contact)
      ? automation.contact[0]
      : automation.contact;

    return {
      id: automation.id,
      slug: automation.slug,
      title: automation.title,
      status: automation.status,
      phaseName: phase?.name ?? "",
      processName: process?.name ?? "",
      contributorName: automation.contributor_name,
      contributorWebsite: automation.contributor_website,
      reviewNotes: automation.review_notes,
      contactEmail: contact?.email ?? null,
      contactPhone: contact?.phone ?? null,
    };
  });

  return (
    <div>
      <h1 className="font-serif text-3xl text-premium-black">Automations</h1>
      <p className="mt-2 text-sm text-soft-charcoal">
        All automations, any status. Click a title to edit; use Publish/Reject
        to review a pending contribution.
      </p>

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-warm-grey">
          No automations yet.{" "}
          <Link href="/admin/new" className="text-pistachio underline">
            Create one
          </Link>
          .
        </p>
      ) : (
        <div className="mt-8">
          <AutomationsList rows={rows} />
        </div>
      )}
    </div>
  );
}
