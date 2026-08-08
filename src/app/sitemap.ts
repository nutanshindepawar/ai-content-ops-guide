import type { MetadataRoute } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BASE_PATH } from "@/lib/base-path";

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://stacknarrative.com";
const BASE_URL = `${SITE_ORIGIN}${BASE_PATH}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServerSupabaseClient();
  const { data: automations } = await supabase
    .from("automations")
    .select("slug, updated_at")
    .eq("status", "published");

  const automationEntries: MetadataRoute.Sitemap = (automations ?? []).map(
    (automation) => ({
      url: `${BASE_URL}/automation/${automation.slug}`,
      lastModified: automation.updated_at,
      changeFrequency: "weekly",
      priority: 0.8,
    })
  );

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/suggest`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...automationEntries,
  ];
}
