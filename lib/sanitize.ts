import DOMPurify from "isomorphic-dompurify";
import { decode } from "html-entities";

/**
 * Tag/attribute allow-list for WordPress HTML. Everything else — Elementor
 * wrapper classes, inline styles, ids, data-* attributes, scripts, forms,
 * iframes, SVG — is dropped so our Tailwind styles control the look.
 */
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "a",
  "img",
  "ul",
  "ol",
  "li",
  "blockquote",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "div",
  "span",
  "figure",
  "figcaption",
];
const ALLOWED_ATTR = ["href", "src", "alt", "width", "height", "title", "colspan", "rowspan"];

export function sanitizeWpHtml(html: string): string {
  if (!html) return "";
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  });
  // Drop empty elements (Elementor icon wrappers, blank paragraphs), innermost first.
  let out = clean;
  for (let prev = ""; prev !== out;) {
    prev = out;
    out = out.replace(/<(p|span|i|b|strong|em|div|li)>(\s|&nbsp;|<br\s*\/?>)*<\/\1>/gi, "");
  }
  return out.replace(/\s{2,}/g, " ").trim();
}

/** Plain text from HTML, with entities (e.g. &#8211;) decoded. */
export function toPlainText(html: string | undefined | null): string {
  if (!html) return "";
  return decode(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ") // \s also covers &nbsp; (U+00A0)
    .trim();
}
