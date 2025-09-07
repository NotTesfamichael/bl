import { marked } from "marked";
import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";
import slugify from "slugify";

// Create DOMPurify instance
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window as any);

export async function compileMarkdownToHtml(markdown: string): Promise<string> {
  try {
    // Configure marked options
    marked.setOptions({
      breaks: true,
      gfm: true
    });

    // Convert markdown to HTML
    const html = await marked(markdown);

    // Sanitize HTML
    const sanitizedHtml = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "p",
        "br",
        "strong",
        "em",
        "u",
        "s",
        "ul",
        "ol",
        "li",
        "blockquote",
        "pre",
        "code",
        "a",
        "img",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
        "div",
        "span"
      ],
      ALLOWED_ATTR: [
        "href",
        "src",
        "alt",
        "title",
        "class",
        "id",
        "target",
        "rel",
        "width",
        "height"
      ]
    });

    return sanitizedHtml;
  } catch (error) {
    console.error("Error compiling markdown:", error);
    throw new Error("Failed to compile markdown");
  }
}

export function generateExcerpt(
  content: string,
  maxLength: number = 160
): string {
  // Remove HTML tags and get plain text
  const plainText = content.replace(/<[^>]*>/g, "");

  // Truncate to max length
  if (plainText.length <= maxLength) {
    return plainText;
  }

  // Find the last complete word within the limit
  const truncated = plainText.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");

  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex) + "...";
  }

  return truncated + "...";
}

export function generateSlug(title: string): string {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
}
