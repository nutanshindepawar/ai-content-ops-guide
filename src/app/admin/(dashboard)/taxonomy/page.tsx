import { getPhaseTree } from "@/lib/content";
import { TaxonomyEditor } from "@/components/admin/TaxonomyEditor";

export default async function TaxonomyPage() {
  const phases = await getPhaseTree();

  return (
    <div>
      <h1 className="font-serif text-3xl text-premium-black">
        Phase &amp; Process Taxonomy
      </h1>
      <p className="mt-2 text-sm text-soft-charcoal">
        Admin only. Add processes and edit descriptions here — never as free
        text on the automation form, to prevent duplicate categories. The 12
        phases themselves are fixed per the build spec.
      </p>

      <div className="mt-8">
        <TaxonomyEditor
          phases={phases.map((p) => ({
            id: p.id,
            number: p.number,
            name: p.name,
            description: p.description,
            often_overlooked: p.often_overlooked,
            processes: p.processes.map((proc) => ({
              id: proc.id,
              number: proc.number,
              name: proc.name,
              description: proc.description,
              often_overlooked: proc.often_overlooked,
            })),
          }))}
        />
      </div>
    </div>
  );
}
