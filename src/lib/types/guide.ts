export type WorkflowStep = {
  title: string;
  detail: string;
};

export type RelatedAutomationRef = {
  id: string;
  slug: string;
  title: string;
};

export type ResourceItem = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  url: string | null;
  file_path: string | null;
};

export type AutomationDetail = {
  id: string;
  slug: string;
  title: string;
  tool_platform: string | null;
  last_verified_at: string | null;
  process: {
    slug: string;
    name: string;
    phase: {
      slug: string;
      name: string;
    };
  };
  guide: {
    what_it_does: string | null;
    why_useful: string | null;
    who_for: string | null;
    difficulty: string | null;
    time_required: string | null;
    tools_required: string | null;
    prerequisites: string | null;
    inputs: string | null;
    expected_output: string | null;
    workflow_steps: WorkflowStep[];
    example: string | null;
    prompt_instructions: string | null;
    template_url: string | null;
    common_mistakes: string | null;
    human_review: string | null;
    troubleshooting: string | null;
    freshness_status: string;
    next_step: RelatedAutomationRef | null;
  } | null;
  resources: ResourceItem[];
  related_automations: RelatedAutomationRef[];
};
