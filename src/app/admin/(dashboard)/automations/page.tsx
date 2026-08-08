import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AdminAutomationsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: automations } = await supabase
    .from("automations")
    .select(
      `
      id, slug, title, status, tool_platform,
      process:processes ( name, phase:phases ( name ) )
    `
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-serif text-3xl text-premium-black">Automations</h1>
      <p className="mt-2 text-sm text-soft-charcoal">
        All automations, any status. Click one to edit.
      </p>

      <div className="mt-8 divide-y divide-light-grey-bg border-y border-light-grey-bg">
        {(automations ?? []).length === 0 && (
          <p className="py-6 text-sm text-warm-grey">
            No automations yet.{" "}
            <Link href="/admin/new" className="text-pistachio underline">
              Create one
            </Link>
            .
          </p>
        )}
        {(automations ?? []).map((automation) => {
          const process = Array.isArray(automation.process)
            ? automation.process[0]
            : automation.process;
          const phase = process
            ? Array.isArray(process.phase)
              ? process.phase[0]
              : process.phase
            : null;
          return (
            <Link
              key={automation.id}
              href={`/admin/automations/${automation.id}/edit`}
              className="flex items-center justify-between gap-4 py-4 hover:bg-light-grey-bg/40"
            >
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-warm-grey">
                  {phase?.name} &rsaquo; {process?.name}
                </p>
                <p className="mt-1 text-premium-black">{automation.title}</p>
              </div>
              <span
                className={`shrink-0 font-mono text-[11px] uppercase tracking-widest ${
                  automation.status === "published"
                    ? "text-pistachio"
                    : "text-warm-grey"
                }`}
              >
                {automation.status}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
