// Server-side email helpers (Resend). Deliberately NOT a "use server" module:
// that would expose these functions to browsers as callable endpoints, letting
// anyone send mail from our domain. Import only from server actions.
import { BASE_PATH } from "@/lib/base-path";

const ADMIN_EMAIL = "nutan@stacknarrative.com";
const FROM = "StackNarrative Guide <contributions@stacknarrative.com>";
const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://stacknarrative.com";

export const guideUrl = `${SITE_ORIGIN}${BASE_PATH}`;
export const contributeUrl = `${guideUrl}/contribute`;

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Returns true only if Resend accepted the message.
async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: opts.to,
        reply_to: ADMIN_EMAIL,
        subject: opts.subject,
        html: opts.html,
      }),
      signal: AbortSignal.timeout(10000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function notifyNewContribution(details: {
  type: string;
  title: string;
  contributorName: string;
  contributorEmail: string;
  contributorPhone: string;
  contributorWebsite: string;
  reviewUrl: string;
}) {
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `New contribution: ${details.title}`,
    html: `
    <p>A new contribution was submitted to the B2B AI Content Operations Guide and is waiting for your review.</p>
    <ul>
      <li><strong>Type:</strong> ${esc(details.type)}</li>
      <li><strong>Title:</strong> ${esc(details.title)}</li>
      <li><strong>Contributor:</strong> ${esc(details.contributorName) || "(not provided)"}</li>
      <li><strong>Email:</strong> ${esc(details.contributorEmail) || "(not provided)"}</li>
      <li><strong>Phone:</strong> ${esc(details.contributorPhone) || "(not provided)"}</li>
      <li><strong>Website:</strong> ${esc(details.contributorWebsite) || "(not provided)"}</li>
    </ul>
    <p><a href="${details.reviewUrl}">Review in admin dashboard</a></p>`,
  });
}

export async function emailContributorApproved(d: {
  to: string;
  name: string;
  title: string;
  kind: string; // e.g. "automation", "tool"
  link: string;
  linkIsOwnPage: boolean;
  location?: string; // "Phase › Process" for standalone resources
  website?: string | null;
}) {
  const firstName = d.name.trim().split(/s+/)[0] || "there";
  const where = d.linkIsOwnPage
    ? `<p><a href="${d.link}">${d.link}</a></p>`
    : `<p>It's listed under <strong>${esc(d.location ?? "its process")}</strong> in the guide:<br><a href="${d.link}">${d.link}</a></p>`;
  const credit = d.website
    ? `<p>We've credited you as the Author, with a link to ${esc(d.website)}, so others in the community can discover your work too.</p>`
    : `<p>We've credited you as the Author, so others in the community can discover your work too.</p>`;
  return sendEmail({
    to: d.to,
    subject: "Your contribution is live! Thank you for being part of this.",
    html: `
    <p>Hi ${esc(firstName)},</p>
    <p>Thank you for contributing to the B2B AI Content Operations Guide! Your ${esc(d.kind)}, <strong>${esc(d.title)}</strong>, has been reviewed and is now live:</p>
    ${where}
    ${credit}
    <p>We're building this guide around a simple idea: the best knowledge doesn't always come from industry reports or paid resources. It often comes from people who experiment, discover what works, and generously share what they've learned with others.</p>
    <p>That's exactly what makes your contribution valuable.</p>
    <p>A couple of things we'd love your help with:</p>
    <ol>
      <li><strong>Spread the word.</strong> If you find a moment, share your contribution on LinkedIn, with a colleague, or in a marketing community you're part of. It could help another content or marketing professional discover something genuinely useful.</li>
      <li><strong>Keep sharing what works.</strong> If you come across another tool, prompt, template, or workflow worth sharing, we'd be delighted to feature it: <a href="${contributeUrl}">${contributeUrl}</a></li>
    </ol>
    <p>Most importantly, thank you for giving your time and knowledge to something that's meant to benefit the wider marketing community. This guide will only become more valuable as people like you contribute to it.</p>
    <p>We're glad to have you as part of it!</p>
    <p>Warm regards,<br>The StackNarrative team</p>`,
  });
}

export async function emailContributorRejected(d: {
  to: string;
  name: string;
  title: string;
  reason: string;
}) {
  const firstName = d.name.trim().split(/\s+/)[0] || "there";
  return sendEmail({
    to: d.to,
    subject: "An update on your contribution to the B2B AI Content Operations Guide",
    html: `
    <p>Hi ${esc(firstName)},</p>
    <p>Thank you for taking the time to share \u201C${esc(d.title)}\u201D with the B2B AI Content Operations Guide. We genuinely appreciate your willingness to share your knowledge and experience with the wider marketing community.</p>
    <p>After reviewing your submission, we feel it needs a little more work before it can be included in the guide. Here's some feedback from our editor that we hope will help:</p>
    <blockquote style="border-left:3px solid #93C572;margin:12px 0;padding:4px 12px;color:#2b2b2b;white-space:pre-line">${esc(d.reason)}</blockquote>
    <p>Please don't let this discourage you. Every submission helps us understand what people in the community are building, experimenting with, and learning. And sometimes, a few small changes can make a good contribution even more useful to others.</p>
    <p>If you'd like to revisit your submission, we'd be happy to review a revised version. We'd also love to hear about other tools, prompts, templates, or workflows you've found valuable along the way: <a href="${contributeUrl}">${contributeUrl}</a></p>
    <p>And if anything in the feedback needs clarification, just hit reply. We're happy to talk it through.</p>
    <p>Thank you again for being willing to share what you know. Communities become stronger when people share their experiences openly, and we're grateful you're part of ours.</p>
    <p>Warm regards,<br>The StackNarrative team</p>`,
  });
}
