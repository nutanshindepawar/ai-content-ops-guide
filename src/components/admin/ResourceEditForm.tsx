"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateResource } from "@/app/admin/(dashboard)/resources/actions";

const TYPES = [
  "prompt", "template", "tool", "ai_agent", "workflow",
  "video", "pdf", "tutorial", "case_study", "example",
];

const inputClass =
  "w-full border border-light-grey-bg px-3 py-2 text-sm text-premium-black outline-none focus:border-pistachio";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-mono text-[11px] uppercase tracking-widest text-warm-grey">
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

type Phase = { id: string; name: string; processes: { id: string; name: string }[] };

export function ResourceEditForm({
  resource,
  phases,
}: {
  resource: {
    id: string;
    title: string;
    type: string;
    description: string | null;
    url: string | null;
    process_id: string | null;
    automation_id: string | null;
    contributor_name: string | null;
    contributor_website: string | null;
  };
  phases: Phase[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(resource.title);
  const [type, setType] = useState(resource.type);
  const [description, setDescription] = useState(resource.description ?? "");
  const [url, setUrl] = useState(resource.url ?? "");
  const [processId, setProcessId] = useState(resource.process_id ?? "");
  const [phaseId, setPhaseId] = useState(
    phases.find((p) => p.processes.some((x) => x.id === resource.process_id))?.id ?? ""
  );
  const [name, setName] = useState(resource.contributor_name ?? "");
  const [website, setWebsite] = useState(resource.contributor_website ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const attached = !!resource.automation_id;
  const processes = phases.find((p) => p.id === phaseId)?.processes ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await updateResource(resource.id, {
      title,
      type,
      description,
      url,
      process_id: attached ? null : processId || null,
      contributor_name: name,
      contributor_website: website,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/admin/resources");
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <Field label="Title">
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </Field>
      <Field label="Type">
        <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
          {TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field label="Description">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} min-h-[120px]`} />
      </Field>
      <Field label="URL">
        <input value={url} onChange={(e) => setUrl(e.target.value)} className={inputClass} />
      </Field>
      {attached ? (
        <p className="text-sm text-warm-grey">
          This resource is attached to an automation, so it has no phase or process of its own.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phase">
            <select
              value={phaseId}
              onChange={(e) => { setPhaseId(e.target.value); setProcessId(""); }}
              className={inputClass}
            >
              <option value="">Select a phase…</option>
              {phases.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Process">
            <select
              required
              value={processId}
              onChange={(e) => setProcessId(e.target.value)}
              disabled={!phaseId}
              className={inputClass}
            >
              <option value="">Select a process…</option>
              {processes.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Author name">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Author link">
          <input value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} />
        </Field>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="border border-premium-black bg-premium-black px-6 py-3 text-sm text-white transition-colors hover:bg-soft-charcoal disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
