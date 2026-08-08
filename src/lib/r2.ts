import { S3Client } from "@aws-sdk/client-s3";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET = process.env.R2_BUCKET_NAME!;

// Public custom domain already attached to this bucket (spec §9).
export const R2_PUBLIC_BASE_URL = "https://resources.stacknarrative.com";

export const ALLOWED_UPLOAD_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "text/markdown": "md",
  "text/plain": "txt",
  "application/zip": "zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
};

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25MB
