import type { NextConfig } from "next";
import { BASE_PATH } from "./src/lib/base-path";

const nextConfig: NextConfig = {
  // Served under stacknarrative.com/AI-content-ops-guide via Cloudflare path
  // proxy (spec §9). Required so every internal link, redirect, and static
  // asset path resolves correctly under that prefix instead of the domain root.
  basePath: BASE_PATH,
  // Server Actions have built-in CSRF protection that checks the request's
  // Origin header against the server's own host. The Cloudflare Worker proxy
  // forwards requests to Vercel with a different Host, so without this every
  // Server Action call (forms, taxonomy editor) is silently rejected when
  // accessed through stacknarrative.com.
  experimental: {
    serverActions: {
      allowedOrigins: [
        "stacknarrative.com",
        "ai-content-ops-guide.vercel.app",
        "localhost:3000",
      ],
    },
  },
  // isomorphic-dompurify's jsdom dependency breaks when Turbopack bundles it
  // for the serverless function (ESM/CJS interop error at runtime). Keeping
  // it external forces Node's native require, which resolves correctly.
  serverExternalPackages: ["isomorphic-dompurify", "jsdom"],
};

export default nextConfig;
