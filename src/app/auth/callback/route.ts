import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BASE_PATH } from "@/lib/base-path";

// request.url's origin reflects Vercel's internal host (the Cloudflare
// Worker's outbound fetch rewrites Host to ai-content-ops-guide.vercel.app),
// not the public stacknarrative.com domain the browser is actually on — so
// origin must come from an explicit env var, never from the request itself.
const PUBLIC_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = PUBLIC_ORIGIN || requestUrl.origin;
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? `${BASE_PATH}/admin`;

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}${BASE_PATH}/admin/login?error=auth`);
}
