"use client";

import { useState } from "react";
import { Turnstile } from "@/components/Turnstile";
import { FileUploadField } from "@/components/FileUploadField";
import { suggestResource } from "@/app/suggest/actions";

type PhaseOption = {
  id: string;
  name: string;
  processes: { id: string; name: string }[];
};

const RESOURCE_TYPE_OPTIONS = [
  { value: "automation", label: "Automation" },
  { value: "workflow", label: "Workflow" },
  { value: "prompt", label: "Prompt" },
  { value: "agent", label: "AI Agent" },
  { value: "template", label: "Template" },
  { value: "tool", label: "Tool" },
  { value: "video", label: "Video" },
  { value: "pdf", label: "PDF" },
  { value: "tutorial", label: "Tutorial" },
  { value: "case_study", label: "Case Study" },
];

const inputClass =
  "w-full border border-light-grey-bg px-3 py-2 text-sm text-premium-black outline-none focus:border-pistachio";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block font-mono text-[11px] uppercase tracking-widest text-warm-grey">
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function SuggestResourceForm({ phases }: { phases: PhaseOption[] }) {
  const [resourceType, setResourceType] = useState("automation");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [phaseId, setPhaseId] = useState("");
  const [processId, setProcessId] = useState("");
  const [toolPlatform, setToolPlatform] = useState("");
  const [url, setUrl] = useState("");
  const [howItWorks, setHowItWorks] = useState("");
  const [contributorName, setContributorName] = useState("");
  const [contributorWebsite, setContributorWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const selectedPhase = phases.find((p) => p.id === phaseId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (siteKey && !turnstileToken) {
      setError("Please complete the verification challenge.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await suggestResource({
      resourceType,
      title,
      description,
      processId,
      toolPlatform,
      url,
      howItWorks,
      contributorName,
      contributorWebsite,
      turnstileToken,
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="border border-pistachio px-4 py-6 text-premium-black">
        <p className="font-serif text-xl">Thanks for the submission.</p>
        <p className="mt-2 text-sm text-soft-charcoal">
          An editor will review it before it goes live.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field label="Resource type">
        <select
          value={resourceType}
          onChange={(e) => setResourceType(e.target.value)}
          className={inputClass}
        >
          {RESOURCE_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Title">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass} min-h-[80px]`}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phase">
          <select
            required
            value={phaseId}
            onChange={(e) => {
              setPhaseId(e.target.value);
              setProcessId("");
            }}
            className={inputClass}
          >
            <option value="">Select a phase…</option>
            {phases.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Process">
          <select
            required
            value={processId}
            onChange={(e) => setProcessId(e.target.value)}
            disabled={!selectedPhase}
            className={inputClass}
          >
            <option value="">Select a process…</option>
            {selectedPhase?.processes.map((proc) => (
              <option key={proc.id} value={proc.id}>
                {proc.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Tool / platform">
        <input
          value={toolPlatform}
          onChange={(e) => setToolPlatform(e.target.value)}
          placeholder="Claude, Gemini, ChatGPT…"
          className={inputClass}
        />
      </Field>

      <Field label="URL">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          className={inputClass}
        />
      </Field>

      <FileUploadField label="Or upload a supporting file" onUploaded={setUrl} />

      <Field label="How it works">
        <textarea
          value={howItWorks}
          onChange={(e) => setHowItWorks(e.target.value)}
          className={`${inputClass} min-h-[100px]`}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name">
          <input
            value={contributorName}
            onChange={(e) => setContributorName(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Website / LinkedIn">
          <input
            value={contributorWebsite}
            onChange={(e) => setContributorWebsite(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      {siteKey && (
        <Turnstile siteKey={siteKey} onVerify={setTurnstileToken} />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="border border-premium-black bg-premium-black px-6 py-3 text-sm text-white transition-colors hover:bg-soft-charcoal disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}
