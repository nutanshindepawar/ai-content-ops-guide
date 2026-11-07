"use client";

import Link from "next/link";
import { useState } from "react";
import { StatusFilter, SubmissionHistory, type StatusFilterValue } from "@/components/admin/StatusFilter";
import { ReviewActions } from "@/components/admin/ReviewActions";
import { setAutomationStatus } from "@/app/admin/(dashboard)/new/actions";

type Row = {
  id: string;
  slug: string;
  title: string;
  status: string;
  phaseName: string;
  processName: string;
  contributorName: string | null;
  contributorWebsite: string | null;
  reviewNotes: string | null;
  createdAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
};

function statusColor(status: string) {
  if (status === "published") return "text-pistachio";
  if (status === "rejected") return "text-red-600";
  return "text-warm-grey";
}

function AutomationRow({ row }: { row: Row }) {
  return (
    <div className="py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/admin/automations/${row.id}/edit`}
          className="min-w-0 flex-1 hover:opacity-80"
        >
          <p className="font-mono text-[11px] uppercase tracking-widest text-warm-grey">
            {row.phaseName} &rsaquo; {row.processName}
          </p>
          <p className="mt-1 text-premium-black">{row.title}</p>
        </Link>
        <span
          className={`shrink-0 font-mono text-[11px] uppercase tracking-widest ${statusColor(row.status)}`}
        >
          {row.status}
        </span>
      </div>

      {(row.contributorName || row.contactEmail || row.contactPhone) && (
        <p className="mt-2 text-xs text-soft-charcoal">
          Contributor: {row.contributorName ?? "—"}
          {row.contributorWebsite && (
            <>
              {" "}
              (
              <a
                href={row.contributorWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pistachio underline"
              >
                site
              </a>
              )
            </>
          )}
          {row.contactEmail && <> · {row.contactEmail}</>}
          {row.contactPhone && <> · {row.contactPhone}</>}
        </p>
      )}

      <SubmissionHistory
        createdAt={row.createdAt}
        reviewedAt={row.reviewedAt}
        status={row.status}
        rejectionReason={row.rejectionReason}
      />

      {row.reviewNotes && (
        <p className="mt-1 text-xs italic text-warm-grey">{row.reviewNotes}</p>
      )}

      {row.status === "pending" && (
        <ReviewActions
          onDecide={(status, reason) => setAutomationStatus(row.id, status, reason)}
        />
      )}
    </div>
  );
}

export function AutomationsList({ rows }: { rows: Row[] }) {
  const [filter, setFilter] = useState<StatusFilterValue>("all");
  const counts: Record<string, number> = { all: rows.length };
  for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1;
  const shown = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <div>
      <StatusFilter value={filter} onChange={setFilter} counts={counts} />
      <div className="mt-4 divide-y divide-light-grey-bg border-y border-light-grey-bg">
        {shown.map((row) => (
          <AutomationRow key={row.id} row={row} />
        ))}
        {shown.length === 0 && <p className="py-6 text-sm text-warm-grey">Nothing here.</p>}
      </div>
    </div>
  );
}
