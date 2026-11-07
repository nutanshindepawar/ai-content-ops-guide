// Only http(s) URLs are allowed anywhere user-supplied links are stored or
// rendered — blocks javascript:/data: URLs now that public contributions
// publish without review.
export function safeHref(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}
