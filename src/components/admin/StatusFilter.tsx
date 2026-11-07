"use client";

const STATUSES = ["all", "pending", "published", "rejected"] as const;
export type StatusFilterValue = (typeof STATUSES)[number];

export function StatusFilter({
  value,
  onChange,
  counts,
}: {
  value: StatusFilterValue;
  onChange: (v: StatusFilterValue) => void;
  counts: Record<string, number>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={`border px-3 py-1 font-mono text-[11px] uppercase tracking-widest ${
            value === s
              ? "border-pistachio bg-pistachio/10 text-premium-black"
              : "border-light-grey-bg text-warm-grey hover:border-pistachio"
          }`}
        >
          {s} ({counts[s] ?? 0})
        </button>
      ))}
    </div>
  );
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function SubmissionHistory({
  createdAt,
  reviewedAt,
  status,
  rejectionReason,
}: {
  createdAt: string;
  reviewedAt: string | null;
  status: string;
  rejectionReason: string | null;
}) {
  return (
    <div className="mt-1 text-xs text-warm-grey">
      Submitted {fmt(createdAt)}
      {reviewedAt && status !== "pending" && <> · {status} {fmt(reviewedAt)}</>}
      {status === "rejected" && rejectionReason && (
        <p className="mt-1 whitespace-pre-line italic text-red-600">
          Rejection reason sent to contributor: {rejectionReason}
        </p>
      )}
    </div>
  );
}
