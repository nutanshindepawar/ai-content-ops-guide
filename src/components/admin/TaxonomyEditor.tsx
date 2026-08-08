"use client";

import { useState } from "react";
import {
  updatePhase,
  updateProcess,
  createProcess,
} from "@/app/admin/(dashboard)/taxonomy/actions";

type Process = {
  id: string;
  number: number;
  name: string;
  description: string | null;
  often_overlooked: string | null;
};

type Phase = {
  id: string;
  number: number;
  name: string;
  description: string | null;
  often_overlooked: string | null;
  processes: Process[];
};

const inputClass =
  "w-full border border-light-grey-bg px-3 py-2 text-sm text-premium-black outline-none focus:border-pistachio";

function EditableField({
  name: initialName,
  description,
  oftenOverlooked,
  onSave,
}: {
  name: string;
  description: string | null;
  oftenOverlooked: string | null;
  onSave: (
    name: string,
    description: string,
    oftenOverlooked: string
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const [name, setName] = useState(initialName);
  const [desc, setDesc] = useState(description ?? "");
  const [overlooked, setOverlooked] = useState(oftenOverlooked ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setStatus("saving");
    setError(null);
    const result = await onSave(name, desc, overlooked);
    if (result.ok) {
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1500);
    } else {
      setStatus("error");
      setError(result.error);
    }
  }

  return (
    <div className="space-y-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className={`${inputClass} font-serif text-base`}
      />
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Description — why this exists"
        className={`${inputClass} min-h-[60px]`}
      />
      <textarea
        value={overlooked}
        onChange={(e) => setOverlooked(e.target.value)}
        placeholder="Often overlooked — what teams typically miss"
        className={`${inputClass} min-h-[60px]`}
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={status === "saving"}
          className="border border-premium-black bg-premium-black px-4 py-1.5 text-xs uppercase tracking-widest text-white hover:bg-soft-charcoal disabled:opacity-50"
        >
          {status === "saving" ? "Saving…" : "Save"}
        </button>
        {status === "saved" && (
          <span className="text-xs text-pistachio">Saved</span>
        )}
        {status === "error" && (
          <span className="text-xs text-red-600">{error}</span>
        )}
      </div>
    </div>
  );
}

function AddProcessForm({
  phaseId,
  onAdded,
}: {
  phaseId: string;
  onAdded: () => void;
}) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setStatus("saving");
    setError(null);
    const result = await createProcess(phaseId, name);
    if (result.ok) {
      setName("");
      setStatus("idle");
      onAdded();
    } else {
      setStatus("error");
      setError(result.error);
    }
  }

  return (
    <div className="mt-4 flex items-start gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New process name"
        className={inputClass}
      />
      <button
        type="button"
        onClick={handleAdd}
        disabled={status === "saving" || !name.trim()}
        className="shrink-0 border border-pistachio px-3 py-2 text-xs uppercase tracking-widest text-premium-black hover:bg-pistachio/10 disabled:opacity-50"
      >
        + Add process
      </button>
      {status === "error" && (
        <span className="self-center text-xs text-red-600">{error}</span>
      )}
    </div>
  );
}

export function TaxonomyEditor({ phases }: { phases: Phase[] }) {
  const [openPhaseId, setOpenPhaseId] = useState<string | null>(null);

  return (
    <div className="divide-y divide-light-grey-bg border-y border-light-grey-bg">
      {phases.map((phase) => {
        const open = openPhaseId === phase.id;
        return (
          <div key={phase.id} className="py-4">
            <button
              type="button"
              onClick={() => setOpenPhaseId(open ? null : phase.id)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="flex items-baseline gap-3">
                <span className="font-mono text-xs text-warm-grey">
                  {String(phase.number).padStart(2, "0")}
                </span>
                <span className="font-serif text-xl text-premium-black">
                  {phase.name}
                </span>
              </span>
              <span className="font-mono text-sm text-warm-grey">
                {open ? "−" : "+"}
              </span>
            </button>

            {open && (
              <div className="mt-4 space-y-6 pl-6">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-warm-grey">
                    Phase name, description &amp; often overlooked
                  </p>
                  <div className="mt-2">
                    <EditableField
                      name={phase.name}
                      description={phase.description}
                      oftenOverlooked={phase.often_overlooked}
                      onSave={(n, d, o) => updatePhase(phase.id, n, d, o)}
                    />
                  </div>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-warm-grey">
                    Processes
                  </p>
                  <div className="mt-2 space-y-4">
                    {phase.processes.map((process) => (
                      <div
                        key={process.id}
                        className="border border-light-grey-bg p-3"
                      >
                        <p className="font-mono text-[11px] text-warm-grey">
                          {String(process.number).padStart(2, "0")}
                        </p>
                        <div className="mt-2">
                          <EditableField
                            name={process.name}
                            description={process.description}
                            oftenOverlooked={process.often_overlooked}
                            onSave={(n, d, o) =>
                              updateProcess(process.id, n, d, o)
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <AddProcessForm
                    phaseId={phase.id}
                    onAdded={() => {
                      window.location.reload();
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
