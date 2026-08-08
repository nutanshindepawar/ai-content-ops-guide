import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Served under stacknarrative.com/AI-content-ops-guide via Cloudflare path
  // proxy (spec §9). Required so every internal link, redirect, and static
  // asset path resolves correctly under that prefix instead of the domain root.
  basePath: "/AI-content-ops-guide",
};

export default nextConfig;
