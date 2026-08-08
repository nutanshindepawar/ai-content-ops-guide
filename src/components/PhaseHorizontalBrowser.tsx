"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, GitBranch, Lightbulb, Star } from "lucide-react";
import type { PhaseWithProcesses } from "@/lib/types/content";
import { PHASE_ICONS, PHASE_QUICK_TIPS } from "@/lib/phase-ui-meta";

function PhaseCard({
  phase,
  active,
  onClick,
}: {
  phase: PhaseWithProcesses;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = PHASE_ICONS[phase.number];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-28 shrink-0 flex-col items-start gap-2 rounded-lg border p-2.5 text-left transition-colors ${
        active
          ? "border-pistachio bg-pistachio"
          : "border-warm-grey/20 bg-white hover:border-pistachio"
      }`}
    >
      <div className="flex w-full items-center justify-between">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full ${
            active ? "bg-white/20" : "bg-pistachio/15"
          }`}
        >
          {Icon && (
            <Icon
              size={14}
              className={active ? "text-white" : "text-pistachio"}
              strokeWidth={2}
            />
          )}
        </span>
        <span
          className={`font-mono text-[10px] ${
            active ? "text-white/80" : "text-warm-grey"
          }`}
        >
          {String(phase.number).padStart(2, "0")}
        </span>
      </div>
      <span
        className={`font-sans text-xs font-semibold leading-tight ${
          active ? "text-white" : "text-premium-black"
        }`}
      >
        {phase.name}
      </span>
    </button>
  );
}

function ProcessDetail({ process }: { process: PhaseWithProcesses["processes"][number] }) {
  return (
    <div className="mt-4 border-t border-warm-grey/20 pt-4">
      {process.description ? (
        <p className="text-sm text-soft-charcoal">{process.description}</p>
      ) : (
        <p className="text-sm italic text-warm-grey">
          No description yet — add one in the admin taxonomy screen.
        </p>
      )}

      {process.often_overlooked && (
        <div className="mt-3 rounded-lg bg-pistachio/10 p-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-pistachio">
            Often overlooked
          </p>
          <p className="mt-1 text-sm text-soft-charcoal">
            {process.often_overlooked}
          </p>
        </div>
      )}

      <div className="mt-4">
        {process.automations.length === 0 ? (
          <p className="font-mono text-xs uppercase tracking-widest text-warm-grey">
            No automations published yet
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {process.automations.map((automation) => (
              <li key={automation.id}>
                <Link
                  href={`/automation/${automation.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-warm-grey/20 bg-white px-3 py-2 text-sm transition-colors hover:border-pistachio"
                >
                  {automation.tool_platform && (
                    <span className="font-mono text-[10px] uppercase tracking-widest text-pistachio">
                      {automation.tool_platform}
                    </span>
                  )}
                  <p className="text-premium-black">{automation.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PhasePanel({ phase }: { phase: PhaseWithProcesses }) {
  const [openProcessId, setOpenProcessId] = useState<string | null>(null);
  const quickTip = PHASE_QUICK_TIPS[phase.number];

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="rounded-xl border border-warm-grey/20 bg-white p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pistachio/10">
                <Star size={16} className="text-pistachio" strokeWidth={2} />
              </span>
              <div>
                <p className="font-semibold text-premium-black">
                  Why this phase matters
                </p>
                {phase.description && (
                  <p className="mt-1 text-sm text-soft-charcoal">
                    {phase.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {phase.often_overlooked && (
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-pistachio">
                Often overlooked
              </p>
              <div className="mt-2 rounded-lg bg-pistachio/10 p-4">
                <p className="text-sm text-soft-charcoal">
                  {phase.often_overlooked}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-warm-grey/20 pt-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pistachio/10">
              <GitBranch size={16} className="text-pistachio" strokeWidth={2} />
            </span>
            <p className="font-semibold text-premium-black">
              Processes in this phase
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-4">
            {phase.processes.map((process) => (
              <button
                key={process.id}
                type="button"
                onClick={() =>
                  setOpenProcessId((current) =>
                    current === process.id ? null : process.id
                  )
                }
                className="flex items-baseline gap-2 text-left"
              >
                <span className="font-mono text-xs text-warm-grey">
                  {String(process.number).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium text-premium-black">
                  {process.name}
                </span>
                <ChevronRight
                  size={14}
                  className={`text-warm-grey transition-transform ${
                    openProcessId === process.id ? "rotate-90" : ""
                  }`}
                />
              </button>
            ))}
          </div>

          {openProcessId && (
            <ProcessDetail
              process={phase.processes.find((p) => p.id === openProcessId)!}
            />
          )}
        </div>
      </div>

      {quickTip && (
        <div className="rounded-xl border border-pistachio/30 bg-pistachio/10 p-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
            <Lightbulb size={16} className="text-pistachio" strokeWidth={2} />
          </span>
          <p className="mt-3 font-semibold text-premium-black">Quick tip</p>
          <p className="mt-1 text-sm text-soft-charcoal">{quickTip}</p>
        </div>
      )}
    </div>
  );
}

export function PhaseHorizontalBrowser({
  phases,
}: {
  phases: PhaseWithProcesses[];
}) {
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState({ width: 100, left: 0 });

  const activePhase = phases.find((p) => p.id === activePhaseId) ?? null;

  function updateScrollState() {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    setScrollProgress({
      width: Math.min(100, (clientWidth / scrollWidth) * 100),
      left: (scrollLeft / scrollWidth) * 100,
    });
  }

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);
    window.addEventListener("resize", updateScrollState);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScrollState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phases.length]);

  function scrollForward() {
    scrollerRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  }

  const isScrollable = canScrollLeft || canScrollRight;

  return (
    <div>
      <div className="relative flex items-center gap-3">
        <div className="relative min-w-0 flex-1">
          {canScrollLeft && (
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-white to-transparent" />
          )}
          <div
            ref={scrollerRef}
            onScroll={updateScrollState}
            className="flex gap-2 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {phases.map((phase) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                active={activePhaseId === phase.id}
                onClick={() =>
                  setActivePhaseId((current) =>
                    current === phase.id ? null : phase.id
                  )
                }
              />
            ))}
          </div>
          {canScrollRight && (
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-white to-transparent" />
          )}
        </div>
        {isScrollable && (
          <button
            type="button"
            onClick={scrollForward}
            aria-label="Scroll phases"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-warm-grey/20 bg-white hover:border-pistachio"
          >
            <ChevronRight size={16} className="text-premium-black" />
          </button>
        )}
      </div>

      {isScrollable && (
        <div className="mt-1 h-0.5 w-full bg-warm-grey/15">
          <div
            className="h-full bg-pistachio transition-[width,margin-left]"
            style={{
              width: `${scrollProgress.width}%`,
              marginLeft: `${scrollProgress.left}%`,
            }}
          />
        </div>
      )}

      {activePhase && <PhasePanel phase={activePhase} />}
    </div>
  );
}
