// Single source of truth for the app's mount path under
// stacknarrative.com/AI-content-ops-guide (spec §9). Used by next.config.ts
// (Next.js basePath) and anywhere a full URL is built manually rather than
// via <Link>/router (which apply basePath automatically) — e.g. Supabase
// Auth's emailRedirectTo and the /auth/callback route's manual redirects.
export const BASE_PATH = "/AI-content-ops-guide";
