"use client";

import { useState } from "react";
import Link from "next/link";
import type { PhaseWithProcesses } from "@/lib/types/content";

function OftenOverlooked({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <div className="mt-4 border-l-2 border-pistachio bg-light-grey-bg px-4 py-3">
      <p className="font-mono text-[11px] uppercase tracking-widest text-warm-grey">
        Often overlooked
      </p>
      <p className="mt-1 text-sm text-soft-charcoal">{text}</p>
    </div>
  );
}

function ExpandIcon({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-warm-grey/40 font-mono text-sm text-warm-grey"
    >
      {open ? "−" : "+"}
    </span>
  );
}

function ProcessRow({
  process,
  open,
  onToggle,
}: {
  process: PhaseWithProcesses["processes"][number];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-t border-light-grey-bg first:border-t-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-warm-grey">
            {String(process.number).padStart(2, "0")}
          </span>
          <span className="text-base text-premium-black">{process.name}</span>
        </span>
        <ExpandIcon open={open} />
      </button>

      {open && (
        <div className="pb-6">
          {process.description ? (
            <p className="text-sm text-soft-charcoal">{process.description}</p>
          ) : (
            <p className="text-sm italic text-warm-grey">
              No description yet — add one in the admin taxonomy screen.
            </p>
          )}

          <OftenOverlooked text={process.often_overlooked} />

          <div className="mt-5">
            {process.automations.length === 0 ? (
              <p className="font-mono text-xs uppercase tracking-widest text-warm-grey">
                No automations published yet
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {process.automations.map((automation) => (
                  <li key={automation.id}>
                    <Link
                      href={`/automation/${automation.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block border border-light-grey-bg bg-white px-4 py-3 transition-colors hover:border-pistachio"
                    >
                      {automation.tool_platform && (
                        <span className="font-mono text-[11px] uppercase tracking-widest text-pistachio">
                          {automation.tool_platform}
                        </span>
                      )}
                      <p className="mt-1 text-sm text-premium-black">
                        {automation.title}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PhaseAccordion({ phases }: { phases: PhaseWithProcesses[] }) {
  const [openPhaseId, setOpenPhaseId] = useState<string | null>(null);
  const [openProcessId, setOpenProcessId] = useState<string | null>(null);

  function togglePhase(phaseId: string) {
    const opening = openPhaseId !== phaseId;
    setOpenPhaseId(opening ? phaseId : null);
    setOpenProcessId(null);
  }

  function toggleProcess(processId: string) {
    setOpenProcessId((current) => (current === processId ? null : processId));
  }

  return (
    <div className="divide-y divide-light-grey-bg border-y border-light-grey-bg">
      {phases.map((phase) => {
        const open = openPhaseId === phase.id;
        return (
          <div key={phase.id}>
            <button
              type="button"
              onClick={() => togglePhase(phase.id)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 py-6 text-left"
            >
              <span className="flex items-baseline gap-4">
                <span className="font-mono text-xs text-warm-grey">
                  {String(phase.number).padStart(2, "0")}
                </span>
                <span className="font-serif text-2xl text-premium-black sm:text-3xl">
                  {phase.name}
                </span>
              </span>
              <ExpandIcon open={open} />
            </button>

            {open && (
              <div className="pb-8">
                {phase.description && (
                  <p className="max-w-2xl text-soft-charcoal">
                    {phase.description}
                  </p>
                )}

                <OftenOverlooked text={phase.often_overlooked} />

                <div className="mt-6">
                  {phase.processes.map((process) => (
                    <ProcessRow
                      key={process.id}
                      process={process}
                      open={openProcessId === process.id}
                      onToggle={() => toggleProcess(process.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
