// Cloudflare Worker: proxies stacknarrative.com/AI-content-ops-guide/* to the
// separate Vercel deployment of this app, per spec §9. Path-based (not a
// subdomain) so SEO/domain authority stays consolidated on stacknarrative.com.
//
// The Next.js app has `basePath: "/AI-content-ops-guide"` set (next.config.ts),
// so the full path is forwarded as-is — no prefix stripping/rewriting needed.
//
// Deploy: Cloudflare dashboard -> Workers & Pages -> Create -> paste this file
// -> add a Route on the stacknarrative.com zone: AI-content-ops-guide/*
// This is a separate Worker from the existing homepage's Cloudflare Pages
// project and does not touch it.

const VERCEL_ORIGIN = "ai-content-ops-guide.vercel.app";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    url.hostname = VERCEL_ORIGIN;
    url.protocol = "https:";

    const upstreamRequest = new Request(url.toString(), request);
    return fetch(upstreamRequest);
  },
};
