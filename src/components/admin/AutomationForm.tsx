"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RichTextField } from "@/components/admin/RichTextField";
import { FileUploadField } from "@/components/FileUploadField";
import {
  createAutomation,
  updateAutomation,
  type NewAutomationInput,
} from "@/app/admin/(dashboard)/new/actions";

type PhaseOption = {
  id: string;
  name: string;
  processes: { id: string; name: string }[];
};

type AutomationOption = { id: string; slug: string; title: string };

const RESOURCE_TYPES = [
  "prompt",
  "template",
  "tool",
  "ai_agent",
  "workflow",
  "video",
  "pdf",
  "tutorial",
  "case_study",
  "example",
];

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

const inputClass =
  "w-full border border-light-grey-bg px-3 py-2 text-sm text-premium-black outline-none focus:border-pistachio";

export type AutomationFormInitial = {
  automationId: string;
  processId: string;
  title: string;
  toolPlatform: string;
  lastVerifiedAt: string;
  whatItDoes: string;
  whyUseful: string;
  whoFor: string;
  difficulty: string;
  timeRequired: string;
  toolsRequired: string;
  prerequisites: string;
  inputs: string;
  expectedOutput: string;
  workflowSteps: { title: string; detail: string }[];
  example: string;
  promptInstructions: string;
  templateUrl: string;
  commonMistakes: string;
  humanReview: string;
  troubleshooting: string;
  freshnessStatus: string;
  nextStepId: string;
  relatedIds: string[];
  resources: { type: string; title: string; description: string; url: string }[];
};

export function AutomationForm({
  phases,
  existingAutomations,
  initial,
}: {
  phases: PhaseOption[];
  existingAutomations: AutomationOption[];
  initial?: AutomationFormInitial;
}) {
  const router = useRouter();
  const isEdit = !!initial;

  const initialPhaseId = initial
    ? phases.find((p) => p.processes.some((proc) => proc.id === initial.processId))
        ?.id ?? ""
    : "";

  const [phaseId, setPhaseId] = useState(initialPhaseId);
  const [processId, setProcessId] = useState(initial?.processId ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [toolPlatform, setToolPlatform] = useState(initial?.toolPlatform ?? "");
  const [lastVerifiedAt, setLastVerifiedAt] = useState(
    initial?.lastVerifiedAt ?? new Date().toISOString().slice(0, 10)
  );

  const [whatItDoes, setWhatItDoes] = useState(initial?.whatItDoes ?? "");
  const [whyUseful, setWhyUseful] = useState(initial?.whyUseful ?? "");
  const [whoFor, setWhoFor] = useState(initial?.whoFor ?? "");
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? "beginner");
  const [timeRequired, setTimeRequired] = useState(initial?.timeRequired ?? "");
  const [toolsRequired, setToolsRequired] = useState(initial?.toolsRequired ?? "");
  const [prerequisites, setPrerequisites] = useState(initial?.prerequisites ?? "");
  const [inputs, setInputs] = useState(initial?.inputs ?? "");
  const [expectedOutput, setExpectedOutput] = useState(initial?.expectedOutput ?? "");
  const [workflowSteps, setWorkflowSteps] = useState(
    initial?.workflowSteps?.length ? initial.workflowSteps : [{ title: "", detail: "" }]
  );
  const [example, setExample] = useState(initial?.example ?? "");
  const [promptInstructions, setPromptInstructions] = useState(
    initial?.promptInstructions ?? ""
  );
  const [templateUrl, setTemplateUrl] = useState(initial?.templateUrl ?? "");
  const [commonMistakes, setCommonMistakes] = useState(initial?.commonMistakes ?? "");
  const [humanReview, setHumanReview] = useState(initial?.humanReview ?? "");
  const [troubleshooting, setTroubleshooting] = useState(initial?.troubleshooting ?? "");
  const [freshnessStatus, setFreshnessStatus] = useState(
    initial?.freshnessStatus ?? "verified"
  );
  const [nextStepId, setNextStepId] = useState(initial?.nextStepId ?? "");
  const [relatedIds, setRelatedIds] = useState<string[]>(initial?.relatedIds ?? []);

  const [resources, setResources] = useState(
    initial?.resources?.length
      ? initial.resources
      : [{ type: "prompt", title: "", description: "", url: "" }]
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPhase = phases.find((p) => p.id === phaseId);

  function updateStep(i: number, field: "title" | "detail", value: string) {
    setWorkflowSteps((steps) =>
      steps.map((s, idx) => (idx === i ? { ...s, [field]: value } : s))
    );
  }

  function updateResource(
    i: number,
    field: "type" | "title" | "description" | "url",
    value: string
  ) {
    setResources((items) =>
      items.map((r, idx) => (idx === i ? { ...r, [field]: value } : r))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const input: NewAutomationInput = {
      process_id: processId,
      title,
      tool_platform: toolPlatform,
      last_verified_at: lastVerifiedAt,
      guide: {
        what_it_does: whatItDoes,
        why_useful: whyUseful,
        who_for: whoFor,
        difficulty,
        time_required: timeRequired,
        tools_required: toolsRequired,
        prerequisites,
        inputs,
        expected_output: expectedOutput,
        workflow_steps: workflowSteps,
        example,
        prompt_instructions: promptInstructions,
        template_url: templateUrl,
        common_mistakes: commonMistakes,
        human_review: humanReview,
        troubleshooting,
        freshness_status: freshnessStatus,
        next_step_automation_id: nextStepId || null,
      },
      related_automation_ids: relatedIds,
      resources,
    };

    const result = isEdit
      ? await updateAutomation(initial.automationId, input)
      : await createAutomation(input);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push(`/automation/${result.slug}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Tool / platform">
          <input
            value={toolPlatform}
            onChange={(e) => setToolPlatform(e.target.value)}
            placeholder="Claude, Gemini, ChatGPT…"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Difficulty">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className={inputClass}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </Field>
        <Field label="Time required">
          <input
            value={timeRequired}
            onChange={(e) => setTimeRequired(e.target.value)}
            placeholder="15 minutes"
            className={inputClass}
          />
        </Field>
        <Field label="Last verified">
          <input
            type="date"
            value={lastVerifiedAt}
            onChange={(e) => setLastVerifiedAt(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="What it does">
        <RichTextField value={whatItDoes} onChange={setWhatItDoes} />
      </Field>
      <Field label="Why it's useful">
        <RichTextField value={whyUseful} onChange={setWhyUseful} />
      </Field>
      <Field label="Who it's for">
        <RichTextField value={whoFor} onChange={setWhoFor} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tools required">
          <input
            value={toolsRequired}
            onChange={(e) => setToolsRequired(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Prerequisites">
          <input
            value={prerequisites}
            onChange={(e) => setPrerequisites(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Inputs">
          <input
            value={inputs}
            onChange={(e) => setInputs(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Expected output">
          <input
            value={expectedOutput}
            onChange={(e) => setExpectedOutput(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Step-by-step workflow">
        <div className="space-y-3">
          {workflowSteps.map((step, i) => (
            <div key={i} className="flex gap-2">
              <span className="mt-2 font-mono text-xs text-warm-grey">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 space-y-2">
                <input
                  placeholder="Step title"
                  value={step.title}
                  onChange={(e) => updateStep(i, "title", e.target.value)}
                  className={inputClass}
                />
                <textarea
                  placeholder="Detail (optional)"
                  value={step.detail}
                  onChange={(e) => updateStep(i, "detail", e.target.value)}
                  className={`${inputClass} min-h-[60px]`}
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  setWorkflowSteps((steps) =>
                    steps.filter((_, idx) => idx !== i)
                  )
                }
                className="self-start text-xs text-warm-grey hover:text-premium-black"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setWorkflowSteps((steps) => [
                ...steps,
                { title: "", detail: "" },
              ])
            }
            className="text-xs font-mono uppercase tracking-widest text-pistachio"
          >
            + Add step
          </button>
        </div>
      </Field>

      <Field label="Example">
        <RichTextField value={example} onChange={setExample} />
      </Field>

      <Field label="Prompt / instructions">
        <textarea
          value={promptInstructions}
          onChange={(e) => setPromptInstructions(e.target.value)}
          className={`${inputClass} min-h-[120px] font-mono`}
          placeholder="Plain text — copied verbatim into the AI tool, so no rich formatting here."
        />
      </Field>

      <Field label="Template">
        <div className="space-y-2">
          <FileUploadField
            label="Upload a file"
            onUploaded={(url) => setTemplateUrl(url)}
          />
          <input
            value={templateUrl}
            onChange={(e) => setTemplateUrl(e.target.value)}
            placeholder="or paste a URL directly"
            className={inputClass}
          />
        </div>
      </Field>

      <Field label="Common mistakes">
        <RichTextField value={commonMistakes} onChange={setCommonMistakes} />
      </Field>
      <Field label="Human review">
        <RichTextField value={humanReview} onChange={setHumanReview} />
      </Field>
      <Field label="Troubleshooting">
        <RichTextField value={troubleshooting} onChange={setTroubleshooting} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Freshness status">
          <select
            value={freshnessStatus}
            onChange={(e) => setFreshnessStatus(e.target.value)}
            className={inputClass}
          >
            <option value="verified">Verified</option>
            <option value="may_be_outdated">May be outdated</option>
          </select>
        </Field>
        <Field label="Next step automation (optional)">
          <select
            value={nextStepId}
            onChange={(e) => setNextStepId(e.target.value)}
            className={inputClass}
          >
            <option value="">None</option>
            {existingAutomations
              .filter((a) => a.id !== initial?.automationId)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
          </select>
        </Field>
      </div>

      <Field label="Related automations (optional)">
        <select
          multiple
          value={relatedIds}
          onChange={(e) =>
            setRelatedIds(
              Array.from(e.target.selectedOptions).map((o) => o.value)
            )
          }
          className={`${inputClass} min-h-[100px]`}
        >
          {existingAutomations
            .filter((a) => a.id !== initial?.automationId)
            .map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
        </select>
      </Field>

      <Field label="Resources">
        <div className="space-y-4">
          {resources.map((resource, i) => (
            <div
              key={i}
              className="grid gap-2 border border-light-grey-bg p-3 sm:grid-cols-2"
            >
              <select
                value={resource.type}
                onChange={(e) => updateResource(i, "type", e.target.value)}
                className={inputClass}
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                placeholder="Title"
                value={resource.title}
                onChange={(e) => updateResource(i, "title", e.target.value)}
                className={inputClass}
              />
              <input
                placeholder="URL"
                value={resource.url}
                onChange={(e) => updateResource(i, "url", e.target.value)}
                className={inputClass}
              />
              <input
                placeholder="Description"
                value={resource.description}
                onChange={(e) =>
                  updateResource(i, "description", e.target.value)
                }
                className={inputClass}
              />
              <button
                type="button"
                onClick={() =>
                  setResources((items) => items.filter((_, idx) => idx !== i))
                }
                className="text-left text-xs text-warm-grey hover:text-premium-black sm:col-span-2"
              >
                Remove resource
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setResources((items) => [
                ...items,
                { type: "prompt", title: "", description: "", url: "" },
              ])
            }
            className="text-xs font-mono uppercase tracking-widest text-pistachio"
          >
            + Add resource
          </button>
        </div>
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="border border-premium-black bg-premium-black px-6 py-3 text-sm text-white transition-colors hover:bg-soft-charcoal disabled:opacity-50"
      >
        {submitting
          ? isEdit
            ? "Saving…"
            : "Publishing…"
          : isEdit
            ? "Save changes"
            : "Publish automation"}
      </button>
    </form>
  );
}
