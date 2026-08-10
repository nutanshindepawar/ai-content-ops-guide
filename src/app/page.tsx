import Link from "next/link";
import { getPhaseTree } from "@/lib/content";
import { PhaseHorizontalBrowser } from "@/components/PhaseHorizontalBrowser";

export const revalidate = 60;

export default async function Home() {
  const phases = await getPhaseTree();

  return (
    <div className="mx-auto w-full max-w-[100rem] px-6 py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-pistachio">
            StackNarrative
          </p>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl text-premium-black sm:text-5xl">
            B2B AI Content Operations Guide
          </h1>
          <p className="mt-4 max-w-xl text-soft-charcoal">
            Explore a phase, choose a process, choose an automation, follow a
            step-by-step guide.
          </p>
        </div>

        <Link
          href="/contribute"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 border border-pistachio px-4 py-2 text-sm font-medium text-premium-black transition-colors hover:bg-pistachio/10"
        >
          Contribute your AI tools/automations
        </Link>
      </div>

      <div className="mt-10">
        <PhaseHorizontalBrowser phases={phases} />
      </div>
    </div>
  );
}
