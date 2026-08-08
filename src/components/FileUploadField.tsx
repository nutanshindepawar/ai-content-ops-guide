"use client";

import { useState } from "react";
import { getUploadUrl } from "@/lib/upload-actions";

export function FileUploadField({
  label,
  onUploaded,
}: {
  label: string;
  onUploaded: (publicUrl: string) => void;
}) {
  const [status, setStatus] = useState<
    "idle" | "uploading" | "done" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setErrorMessage(null);
    setFileName(file.name);

    const result = await getUploadUrl(file.name, file.type, file.size);
    if (!result.ok) {
      setStatus("error");
      setErrorMessage(result.error);
      return;
    }

    const putResponse = await fetch(result.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!putResponse.ok) {
      setStatus("error");
      setErrorMessage("Upload failed. Try again.");
      return;
    }

    setStatus("done");
    onUploaded(result.publicUrl);
  }

  return (
    <div>
      <label className="block font-mono text-[11px] uppercase tracking-widest text-warm-grey">
        {label}
      </label>
      <input
        type="file"
        onChange={handleFileChange}
        className="mt-1 block w-full text-sm text-soft-charcoal file:mr-3 file:border file:border-light-grey-bg file:bg-white file:px-3 file:py-1.5 file:text-xs file:uppercase file:tracking-widest"
      />
      {status === "uploading" && (
        <p className="mt-1 text-xs text-warm-grey">Uploading {fileName}…</p>
      )}
      {status === "done" && (
        <p className="mt-1 text-xs text-pistachio">{fileName} uploaded.</p>
      )}
      {status === "error" && (
        <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}
