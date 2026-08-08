import {
  Target,
  Users,
  Calendar,
  Search,
  FileEdit,
  PenTool,
  CheckCircle2,
  Repeat,
  Database,
  Send,
  TrendingUp,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

// Decorative only — keyed by phase number, not stored in the database.
// Purely front-end; adding/reordering phases in the taxonomy screen doesn't
// require touching this file unless a brand-new 13th phase were ever added.
export const PHASE_ICONS: Record<number, LucideIcon> = {
  1: Target,
  2: Users,
  3: Calendar,
  4: Search,
  5: FileEdit,
  6: PenTool,
  7: CheckCircle2,
  8: Repeat,
  9: Database,
  10: Send,
  11: TrendingUp,
  12: BookOpen,
};

// Placeholder copy — written by Claude, not sourced from your content.
// Review and replace before treating these as final.
export const PHASE_QUICK_TIPS: Record<number, string> = {
  1: "Align content goals with business outcomes and revenue impact from the start.",
  2: "Set up recurring alerts for competitor moves and customer language, not a one-time research sprint.",
  3: "Anchor your calendar to business moments — launches, events, earnings — not just a monthly cadence.",
  4: "Record subject-matter interviews as you go; don't rely on memory when writing later.",
  5: "A tight brief saves more editing time than a longer first draft ever will.",
  6: "Match format to the job the content needs to do, not the easiest format to produce.",
  7: "Build a checklist so quality doesn't depend on one person catching everything.",
  8: "Plan the repurposing plan before you publish, not weeks after.",
  9: "Tag content the moment it's published — retroactive tagging rarely happens.",
  10: "Pick channels based on where your buyer actually is, not where it's easiest to post.",
  11: "Track pipeline influence and AI citations, not just traffic and likes.",
  12: "Feed new customer language back into your prompts and briefs every cycle.",
};
