import Link from "next/link";

export const metadata = {
  title: "Contribute an AI Tool or Automation | B2B AI Content Operations Guide",
  description:
    "Share an AI tool, prompt, template, or workflow with the B2B AI Content Operations Guide — a free, volunteer-built resource for content and marketing teams.",
};

export default function ContributePage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-pistachio">
        StackNarrative
      </p>
      <h1 className="mt-3 font-serif text-4xl text-premium-black sm:text-5xl">
        Contribute an AI Tool or Automation
      </h1>

      <p className="mt-6 text-soft-charcoal">
        The B2B AI Content Operations Guide is a free, community-built
        library of AI-powered workflows for every stage of content
        operations — from research and briefing to production, distribution,
        and performance.
      </p>

      <div className="mt-6 rounded-lg border border-pistachio/30 bg-pistachio/10 p-4">
        <p className="text-sm text-premium-black">
          <strong>This is a volunteer contribution — there&apos;s no payment
          involved.</strong> If you&apos;ve built or know a tool, prompt,
          template, or workflow that genuinely helps B2B content and
          marketing teams work smarter with AI, we&apos;d love to include it.
          In return,
          you&apos;re credited as the Author on the published guide, with a
          link back to your site or profile.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="font-semibold text-premium-black">
          What makes a good contribution
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-soft-charcoal">
          <li>A specific, tested automation or tool — not a general idea</li>
          <li>
            Clear enough that someone else could follow it and get the same
            result
          </li>
          <li>Genuinely useful to B2B content or marketing teams</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-semibold text-premium-black">
          See an example first
        </h2>
        <p className="mt-2 text-sm text-soft-charcoal">
          Before filling out the form, look at a published guide to see the
          level of detail we&apos;re looking for.
        </p>
        <Link
          href="/automation/generate-research-backed-blog-briefs-with-a-gemini-gem"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-medium text-pistachio underline"
        >
          View example guide →
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="font-semibold text-premium-black">
          What happens after you submit
        </h2>
        <p className="mt-2 text-sm text-soft-charcoal">
          An editor reviews every submission for accuracy, clarity, and fit
          before it goes live. We may email you if we need clarification or
          changes.
        </p>
      </section>

      <Link
        href="/suggest"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-10 inline-block border border-premium-black bg-premium-black px-6 py-3 text-sm text-white transition-colors hover:bg-soft-charcoal"
      >
        Fill in the contribution form →
      </Link>
    </div>
  );
}
