"use client";

import { useState } from "react";
import { Turnstile } from "@/components/Turnstile";
import { FileUploadField } from "@/components/FileUploadField";
import { RichTextField } from "@/components/admin/RichTextField";
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
  const isAutomation = resourceType === "automation";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keyFeatures, setKeyFeatures] = useState("");
  const [phaseId, setPhaseId] = useState("");
  const [processId, setProcessId] = useState("");
  const [proposedPhaseName, setProposedPhaseName] = useState("");
  const [proposedProcessName, setProposedProcessName] = useState("");
  const [toolPlatform, setToolPlatform] = useState("");
  const [url, setUrl] = useState("");
  const [howItWorks, setHowItWorks] = useState("");
  const [contributorName, setContributorName] = useState("");
  const [contributorWebsite, setContributorWebsite] = useState("");
  const [contributorEmail, setContributorEmail] = useState("");
  const [contributorPhone, setContributorPhone] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  // Automation-only, full guide field set.
  const [whyUseful, setWhyUseful] = useState("");
  const [whoFor, setWhoFor] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [timeRequired, setTimeRequired] = useState("");
  const [toolsRequired, setToolsRequired] = useState("");
  const [prerequisites, setPrerequisites] = useState("");
  const [inputs, setInputs] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [workflowSteps, setWorkflowSteps] = useState([{ title: "", detail: "" }]);
  const [example, setExample] = useState("");
  const [promptInstructions, setPromptInstructions] = useState("");
  const [templateUrl, setTemplateUrl] = useState("");
  const [commonMistakes, setCommonMistakes] = useState("");
  const [humanReview, setHumanReview] = useState("");
  const [troubleshooting, setTroubleshooting] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const selectedPhase = phases.find((p) => p.id === phaseId);

  function updateStep(i: number, field: "title" | "detail", value: string) {
    setWorkflowSteps((steps) =>
      steps.map((s, idx) => (idx === i ? { ...s, [field]: value } : s))
    );
  }

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
      keyFeatures,
      processId,
      toolPlatform,
      url,
      howItWorks,
      contributorName,
      contributorWebsite,
      contributorEmail,
      contributorPhone,
      turnstileToken,
      whyUseful,
      whoFor,
      difficulty,
      timeRequired,
      toolsRequired,
      prerequisites,
      inputs,
      expectedOutput,
      workflowSteps,
      example,
      promptInstructions,
      templateUrl,
      commonMistakes,
      humanReview,
      troubleshooting,
      proposedPhaseName,
      proposedProcessName,
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

      <Field label={isAutomation ? "What it does" : "Description"}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass} min-h-[80px]`}
        />
      </Field>

      {!isAutomation && (
        <Field label="Key features / specs">
          <textarea
            value={keyFeatures}
            onChange={(e) => setKeyFeatures(e.target.value)}
            placeholder="What can it do? Any limits, pricing tier, or requirements a reader should know?"
            className={`${inputClass} min-h-[80px]`}
          />
        </Field>
      )}

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

      <div className="grid gap-4 sm:grid-cols-2 rounded-lg bg-light-grey-bg p-4">
        <div className="sm:col-span-2">
          <p className="text-xs text-warm-grey">
            Don&apos;t see a phase or process that fits? Pick the closest one
            above (required), and optionally suggest a new one below — an
            editor will decide whether it&apos;s really needed.
          </p>
        </div>
        <Field label="Suggest a new phase name (optional)">
          <input
            value={proposedPhaseName}
            onChange={(e) => setProposedPhaseName(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Suggest a new process name (optional)">
          <input
            value={proposedProcessName}
            onChange={(e) => setProposedProcessName(e.target.value)}
            className={inputClass}
          />
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

      {isAutomation && (
        <>
          <Field label="Why it's useful">
            <RichTextField value={whyUseful} onChange={setWhyUseful} />
          </Field>
          <Field label="Who it's for">
            <RichTextField value={whoFor} onChange={setWhoFor} />
          </Field>

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
            <Field label="Tools required">
              <input
                value={toolsRequired}
                onChange={(e) => setToolsRequired(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
          </div>

          <Field label="Expected output">
            <input
              value={expectedOutput}
              onChange={(e) => setExpectedOutput(e.target.value)}
              className={inputClass}
            />
          </Field>

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
                      setWorkflowSteps((steps) => steps.filter((_, idx) => idx !== i))
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
                  setWorkflowSteps((steps) => [...steps, { title: "", detail: "" }])
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
              <FileUploadField label="Upload a file" onUploaded={setTemplateUrl} />
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
        </>
      )}

      <Field label="URL">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          className={inputClass}
        />
      </Field>

      {!isAutomation && (
        <FileUploadField label="Or upload a supporting file" onUploaded={setUrl} />
      )}

      {!isAutomation && (
        <Field label="How it works">
          <textarea
            value={howItWorks}
            onChange={(e) => setHowItWorks(e.target.value)}
            className={`${inputClass} min-h-[100px]`}
          />
        </Field>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name">
          <input
            required
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
        <Field label="Email">
          <input
            type="email"
            required
            value={contributorEmail}
            onChange={(e) => setContributorEmail(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Mobile number">
          <input
            type="tel"
            required
            value={contributorPhone}
            onChange={(e) => setContributorPhone(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
      <p className="text-xs text-warm-grey">
        Your email and phone number are private — used only if we need to reach
        you about your submission. They&apos;re never shown publicly. Your name
        and website will be credited as the Author if published.
      </p>

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
