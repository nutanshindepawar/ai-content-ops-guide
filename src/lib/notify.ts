"use server";

const NOTIFY_TO = "nutan@stacknarrative.com";
const NOTIFY_FROM = "contributions@stacknarrative.com";

export async function notifyNewContribution(details: {
  type: string;
  title: string;
  contributorName: string;
  contributorEmail: string;
  contributorPhone: string;
  contributorWebsite: string;
  reviewUrl: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const html = `
    <p>A new contribution was submitted to the B2B AI Content Operations Guide.</p>
    <ul>
      <li><strong>Type:</strong> ${details.type}</li>
      <li><strong>Title:</strong> ${details.title}</li>
      <li><strong>Contributor:</strong> ${details.contributorName || "(not provided)"}</li>
      <li><strong>Email:</strong> ${details.contributorEmail || "(not provided)"}</li>
      <li><strong>Phone:</strong> ${details.contributorPhone || "(not provided)"}</li>
      <li><strong>Website:</strong> ${details.contributorWebsite || "(not provided)"}</li>
    </ul>
    <p><a href="${details.reviewUrl}">Review in admin dashboard</a></p>
  `;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `StackNarrative Guide <${NOTIFY_FROM}>`,
        to: NOTIFY_TO,
        subject: `New contribution: ${details.title}`,
        html,
      }),
    });
  } catch {
    // Notification failure shouldn't block the actual submission.
  }
}
