import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

// Render Markdown to HTML and strip any unsafe nodes/attributes. Used for
// product descriptions so admins can format with headings/lists, but can't
// inject <script> or onload= handlers.
export function renderMarkdownSafe(input: string): string {
  const raw = marked.parse(input ?? "", { async: false }) as string;
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "code",
      "pre",
      "blockquote",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "a",
      "hr",
      "img",
      "span",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "rel", "target"],
    ALLOWED_URI_REGEXP: /^(https?:|mailto:|\/)/i,
  });
}
