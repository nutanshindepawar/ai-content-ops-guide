"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  contactEmail: string | null;
  contactPhone: string | null;
};

function statusColor(status: string) {
  if (status === "published") return "text-pistachio";
  if (status === "rejected") return "text-red-600";
  return "text-warm-grey";
}

function AutomationRow({ row }: { row: Row }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleStatus(status: "published" | "rejected") {
    setBusy(true);
    await setAutomationStatus(row.id, status);
    setBusy(false);
    router.refresh();
  }

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

      {row.reviewNotes && (
        <p className="mt-1 text-xs italic text-warm-grey">{row.reviewNotes}</p>
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

export function AutomationsList({ rows }: { rows: Row[] }) {
  return (
    <div className="divide-y divide-light-grey-bg border-y border-light-grey-bg">
      {rows.map((row) => (
        <AutomationRow key={row.id} row={row} />
      ))}
    </div>
  );
}
