"use client";

import Link from "next/link";
import { useState } from "react";
import { StatusFilter, SubmissionHistory, type StatusFilterValue } from "@/components/admin/StatusFilter";
import { ReviewActions } from "@/components/admin/ReviewActions";
import { setResourceStatus } from "@/app/admin/(dashboard)/resources/actions";

type Row = {
  id: string;
  title: string;
  type: string;
  status: string;
  description: string | null;
  url: string | null;
  phaseName: string | null;
  processName: string | null;
  automationTitle: string | null;
  contributorName: string | null;
  contributorWebsite: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
};

function statusColor(status: string) {
  if (status === "published") return "text-pistachio";
  if (status === "rejected") return "text-red-600";
  return "text-warm-grey";
}

function ResourceRow({ row }: { row: Row }) {
  return (
    <div className="py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] uppercase tracking-widest text-warm-grey">
            {row.type}
            {row.phaseName && ` · ${row.phaseName} › ${row.processName}`}
            {row.automationTitle && ` · attached to "${row.automationTitle}"`}
          </p>
          <Link href={`/admin/resources/${row.id}/edit`} className="mt-1 inline-block text-premium-black underline-offset-2 hover:underline">
            {row.title}
          </Link>
          {row.description && (
            <p className="mt-1 text-sm text-soft-charcoal">{row.description}</p>
          )}
          {row.url && (
            <a
              href={row.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm text-pistachio underline"
            >
              {row.url}
            </a>
          )}
        </div>
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

      {row.status === "pending" && (
        <ReviewActions
          onDecide={(status, reason) => setResourceStatus(row.id, status, reason)}
        />
      )}
    </div>
  );
}

export function ResourcesList({ rows }: { rows: Row[] }) {
  const [filter, setFilter] = useState<StatusFilterValue>("all");
  const counts: Record<string, number> = { all: rows.length };
  for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1;
  const shown = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <div>
      <StatusFilter value={filter} onChange={setFilter} counts={counts} />
      <div className="mt-4 divide-y divide-light-grey-bg border-y border-light-grey-bg">
        {shown.map((row) => (
          <ResourceRow key={row.id} row={row} />
        ))}
        {shown.length === 0 && <p className="py-6 text-sm text-warm-grey">Nothing here.</p>}
      </div>
    </div>
  );
}
