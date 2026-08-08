"use server";

import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  r2Client,
  R2_BUCKET,
  R2_PUBLIC_BASE_URL,
  ALLOWED_UPLOAD_TYPES,
  MAX_UPLOAD_BYTES,
} from "@/lib/r2";

export async function getUploadUrl(
  fileName: string,
  contentType: string,
  fileSize: number
): Promise<
  { ok: true; uploadUrl: string; publicUrl: string } | { ok: false; error: string }
> {
  const extension = ALLOWED_UPLOAD_TYPES[contentType];
  if (!extension) {
    return { ok: false, error: `File type "${contentType}" isn't allowed.` };
  }
  if (fileSize > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "File is larger than the 25MB limit." };
  }

  const key = `ai-content-ops-guide/${randomUUID()}.${extension}`;

  const uploadUrl = await getSignedUrl(
    r2Client,
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 300 }
  );

  return {
    ok: true,
    uploadUrl,
    publicUrl: `${R2_PUBLIC_BASE_URL}/${key}`,
  };
}
