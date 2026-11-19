import { sanitizeHtml } from "@/lib/sanitize-html";

export function SafeHtml({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const clean = sanitizeHtml(html);

  return (
    <div
      className={`rich-content ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
