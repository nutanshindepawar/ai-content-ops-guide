// Minimal allowlist HTML sanitizer for guide content. Deliberately not using
// DOMPurify/jsdom: that dependency chain breaks at runtime in Vercel's
// bundled serverless function (ESM/CJS interop error deep in jsdom's
// html-encoding-sniffer -> @exodus/bytes), and isn't necessary here — guide
// HTML only ever comes from our own Tiptap StarterKit editor (Editor/Admin
// only, gated by RLS), a small fixed set of tags, not arbitrary public input.
const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "em",
  "h3",
  "ul",
  "ol",
  "li",
  "pre",
  "code",
  "blockquote",
  "a",
]);

export function sanitizeHtml(html: string): string {
  return html.replace(
    /<\/?([a-zA-Z0-9]+)([^>]*)>/g,
    (full, rawTag: string, attrs: string) => {
      const tag = rawTag.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return "";

      const isClosing = full.startsWith("</");
      if (isClosing) return `</${tag}>`;

      if (tag === "a") {
        const hrefMatch = attrs.match(/href\s*=\s*"([^"]*)"/i);
        const href = hrefMatch ? hrefMatch[1] : "";
        if (!/^https?:\/\//i.test(href)) return "";
        return `<a href="${href.replace(/"/g, "&quot;")}" target="_blank" rel="noopener noreferrer">`;
      }

      return `<${tag}>`;
    }
  );
}
