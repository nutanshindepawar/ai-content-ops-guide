"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
};

function statusColor(status: string) {
  if (status === "published") return "text-pistachio";
  if (status === "rejected") return "text-red-600";
  return "text-warm-grey";
}

function ResourceRow({ row }: { row: Row }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleStatus(status: "published" | "rejected") {
    setBusy(true);
    await setResourceStatus(row.id, status);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] uppercase tracking-widest text-warm-grey">
            {row.type}
            {row.phaseName && ` · ${row.phaseName} › ${row.processName}`}
            {row.automationTitle && ` · attached to "${row.automationTitle}"`}
          </p>
          <p className="mt-1 text-premium-black">{row.title}</p>
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

      {row.status === "pending" && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => handleStatus("published")}
            className="border border-pistachio px-3 py-1 text-xs uppercase tracking-widest text-premium-black hover:bg-pistachio/10 disabled:opacity-50"
          >
            Publish
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => handleStatus("rejected")}
            className="border border-warm-grey/30 px-3 py-1 text-xs uppercase tracking-widest text-warm-grey hover:border-red-600 hover:text-red-600 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

export function ResourcesList({ rows }: { rows: Row[] }) {
  return (
    <div className="divide-y divide-light-grey-bg border-y border-light-grey-bg">
      {rows.map((row) => (
        <ResourceRow key={row.id} row={row} />
      ))}
    </div>
  );
}
