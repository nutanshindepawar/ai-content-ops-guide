"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Result = { ok: true } | { ok: false; error: string };

export function PublishedActions({
  status,
  onUnpublish,
  onRepublish,
}: {
  status: "published" | "unpublished";
  onUnpublish: () => Promise<Result>;
  onRepublish: () => Promise<Result>;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<Result>, message: string) {
    setBusy(true);
    setError(null);
    const result = await fn();
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(message);
    setConfirming(false);
    setTimeout(() => router.refresh(), 2500);
  }

  if (done) return <p className="mt-3 text-xs text-pistachio">{done}</p>;

  if (status === "unpublished") {
    return (
      <div className="mt-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => run(onRepublish, "Republished — it's live again.")}
          className="border border-pistachio px-3 py-1 text-xs uppercase tracking-widest text-premium-black hover:bg-pistachio/10 disabled:opacity-50"
        >
          {busy ? "Republishing…" : "Republish"}
        </button>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="mt-3 max-w-xl rounded-lg border border-warm-grey/30 bg-light-grey-bg/60 p-3">
        <p className="text-xs text-premium-black">
          Unpublish this? It will disappear from the public site and search
          results. The record, history and contributor details are kept, and
          you can republish it any time.
        </p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => run(onUnpublish, "Unpublished — hidden from the public site.")}
            className="border border-premium-black bg-premium-black px-3 py-1 text-xs uppercase tracking-widest text-white hover:bg-soft-charcoal disabled:opacity-50"
          >
            {busy ? "Unpublishing…" : "Yes, unpublish"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirming(false)}
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
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="border border-warm-grey/30 px-3 py-1 text-xs uppercase tracking-widest text-warm-grey hover:border-premium-black hover:text-premium-black"
      >
        Unpublish
      </button>
    </div>
  );
}
