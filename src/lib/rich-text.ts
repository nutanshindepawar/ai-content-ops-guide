// Helpers for contributed text. New content is HTML from the rich-text
// editor; older submissions are plain text, so those get light formatting.
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const HTML_HINT = /<(p|h[1-6]|ul|ol|li|strong|em|u|br|blockquote|pre)[\s>/]/i;

// Plain text -> readable HTML: paragraphs, line breaks, "Label:" lines become
// headings, and a leading "Label:" on a line is bolded.
export function textToHtml(text: string): string {
  return text
    .trim()
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.split("\n").map((line) => {
        const t = line.trim();
        if (/^[^.!?]{2,60}:$/.test(t)) return `<h3>${esc(t.slice(0, -1))}</h3>`;
        const m = t.match(/^([A-Z][A-Za-z0-9' \/-]{1,40}):\s+(.+)$/);
        if (m) return `<strong>${esc(m[1])}:</strong> ${esc(m[2])}`;
        return esc(t);
      });
      // headings stand alone; other lines are joined with <br>
      return lines
        .map((l) => (l.startsWith("<h3>") ? l : `<p>${l}</p>`))
        .join("")
        .replace(/<\/p><p>/g, "<br>")
        .replace(/<p>(<h3>)/g, "$1");
    })
    .join("");
}

export function toRichHtml(text: string | null | undefined): string {
  if (!text || !text.trim()) return "";
  return HTML_HINT.test(text) ? text : textToHtml(text);
}

// First paragraph as plain text, for cards and meta descriptions.
export function plainPreview(text: string | null | undefined): string {
  if (!text) return "";
  const stripped = text
    .replace(/<\/(p|h[1-6]|li|blockquote|pre)>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
  const first = stripped.split(/\n\s*\n/).map((p) => p.trim()).find(Boolean);
  return first ?? "";
}

export function isEmptyHtml(html: string | null | undefined): boolean {
  return plainPreview(html) === "";
}
