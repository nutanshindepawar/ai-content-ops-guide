import { getPhaseTree } from "@/lib/content";
import { SuggestResourceForm } from "@/components/SuggestResourceForm";

export default async function SuggestPage() {
  const phases = await getPhaseTree();

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-warm-grey">
        StackNarrative
      </p>
      <h1 className="mt-2 font-serif text-3xl text-premium-black sm:text-4xl">
        Suggest a resource
      </h1>
      <p className="mt-2 text-sm text-soft-charcoal">
        Share an automation, prompt, template, tool, or tutorial. An editor
        reviews every submission before it goes live.
      </p>

      <div className="mt-10">
        <SuggestResourceForm
          phases={phases.map((p) => ({
            id: p.id,
            name: p.name,
            processes: p.processes.map((proc) => ({
              id: proc.id,
              name: proc.name,
            })),
          }))}
        />
      </div>
    </div>
  );
}
