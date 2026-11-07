"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReviewResult } from "@/app/admin/(dashboard)/new/actions";

const EMAIL_NOTES: Record<string, string> = {
  sent: "Email sent to the contributor.",
  failed: "Saved, but the email to the contributor could not be sent.",
  "no-contact": "Saved. No contributor email on file, so no email was sent.",
};

export function ReviewActions({
  onDecide,
}: {
  onDecide: (
    status: "published" | "rejected",
    reason?: string
  ) => Promise<ReviewResult>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(status: "published" | "rejected") {
    setBusy(true);
    setError(null);
    const result = await onDecide(status, reason);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(EMAIL_NOTES[result.email]);
    setRejecting(false);
    setTimeout(() => router.refresh(), 5000);
  }

  if (message) {
    return <p className="mt-3 text-xs text-pistachio">{message}</p>;
  }

  if (rejecting) {
    return (
      <div className="mt-3 max-w-xl rounded-lg border border-red-200 bg-red-50/40 p-3">
        <label className="block text-xs font-medium text-premium-black">
          Reason for rejection (required)
        </label>
        <p className="mt-1 text-xs text-warm-grey">
          This reason will be emailed to the person who submitted the tool.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-2 min-h-[90px] w-full border border-light-grey-bg bg-white px-3 py-2 text-sm text-premium-black outline-none focus:border-pistachio"
          placeholder="What needs to change before this can be published?"
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            disabled={busy || !reason.trim()}
            onClick={() => decide("rejected")}
            className="border border-red-600 bg-red-600 px-3 py-1 text-xs uppercase tracking-widest text-white hover:bg-red-700 disabled:opacity-40"
          >
            {busy ? "Rejecting…" : "Yes, reject"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setRejecting(false);
              setError(null);
            }}
            className="border border-warm-grey/30 px-3 py-1 text-xs uppercase tracking-widest text-warm-grey hover:text-premium-black"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => decide("published")}
          className="border border-pistachio px-3 py-1 text-xs uppercase tracking-widest text-premium-black hover:bg-pistachio/10 disabled:opacity-50"
        >
          {busy ? "Publishing…" : "Publish"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setRejecting(true)}
          className="border border-warm-grey/30 px-3 py-1 text-xs uppercase tracking-widest text-warm-grey hover:border-red-600 hover:text-red-600 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
