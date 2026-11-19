import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getResourceBySlug } from "@/lib/content";
import { safeHref } from "@/lib/safe-url";

export const revalidate = 60;

const TYPE_LABELS: Record<string, string> = {
  prompt: "Prompt",
  template: "Template",
  tool: "Tool",
  ai_agent: "AI Agent",
  workflow: "Workflow",
  video: "Video",
  pdf: "PDF",
  tutorial: "Tutorial",
  case_study: "Case Study",
  example: "Example",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);
  if (!resource) return { title: "Not found | StackNarrative" };

  const title = `${resource.title} | B2B AI Content Operations Guide`;
  const description = (resource.description ?? `${resource.title} — a community-contributed ${TYPE_LABELS[resource.type] ?? "resource"} from the B2B AI Content Operations Guide.`)
    .replace(/\s+/g, " ")
    .slice(0, 160);

  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary", title, description },
  };
}

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);
  if (!resource) notFound();

  const link = safeHref(resource.url);
  const author = resource.contributor_name || "StackNarrative Team";
  const authorHref = safeHref(resource.contributor_website) || "https://stacknarrative.com";
  const isVideo = resource.type === "video" && link && /youtube\.com|youtu\.be|loom\.com|vimeo\.com/.test(link);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-warm-grey">
        <Link href="/" target="_blank" rel="noopener noreferrer" className="hover:text-pistachio">
          {resource.phaseName ?? "Guide"}
        </Link>
        {resource.processName && <> &rsaquo; {resource.processName}</>}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-3xl text-premium-black sm:text-4xl">
          {resource.title}
        </h1>
        <span className="border border-pistachio px-2 py-1 font-mono text-xs uppercase tracking-widest text-pistachio">
          {TYPE_LABELS[resource.type] ?? resource.type}
        </span>
      </div>

      <p className="mt-4 text-sm text-soft-charcoal">
        <span className="font-mono text-[11px] uppercase tracking-widest text-warm-grey">
          Author
        </span>{" "}
        <a href={authorHref} target="_blank" rel="noopener noreferrer" className="text-pistachio hover:underline">
          {author}
        </a>
      </p>

      {resource.automation && (
        <p className="mt-2 text-sm text-soft-charcoal">
          Part of the guide:{" "}
          <Link
            href={`/automation/${resource.automation.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pistachio hover:underline"
          >
            {resource.automation.title}
          </Link>
        </p>
      )}

      {resource.description && (
        <div className="mt-10 whitespace-pre-line text-soft-charcoal">
          {resource.description}
        </div>
      )}

      {isVideo && (
        <div className="mt-8 aspect-video w-full">
          <iframe src={link!} className="h-full w-full" allowFullScreen />
        </div>
      )}

      {link && !isVideo && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-block border border-pistachio px-4 py-2 text-sm text-premium-black hover:bg-pistachio/10"
        >
          Open {TYPE_LABELS[resource.type]?.toLowerCase() ?? "resource"} ↗
        </a>
      )}

      <p className="mt-16 border-t border-light-grey-bg pt-6 text-sm text-warm-grey">
        Built something useful?{" "}
        <Link href="/contribute" target="_blank" rel="noopener noreferrer" className="text-pistachio hover:underline">
          Contribute your own AI tool or automation
        </Link>
        .
      </p>
    </div>
  );
}
