export type AutomationCard = {
  id: string;
  slug: string;
  title: string;
  tool_platform: string | null;
};

export type ProcessWithAutomations = {
  id: string;
  slug: string;
  number: number;
  name: string;
  description: string | null;
  often_overlooked: string | null;
  automations: AutomationCard[];
};

export type PhaseWithProcesses = {
  id: string;
  slug: string;
  number: number;
  name: string;
  description: string | null;
  often_overlooked: string | null;
  processes: ProcessWithAutomations[];
};
