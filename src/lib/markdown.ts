import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import { rehype } from "rehype";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import readingTime from "reading-time";

const options = {
  theme: "github-dark",
  keepBackground: false,
  onVisitLine(node: unknown) {
    // Prevent lines with no content from being collapsed
    if (
      node &&
      typeof node === "object" &&
      "children" in node &&
      Array.isArray((node as Record<string, unknown>).children) &&
      ((node as Record<string, unknown>).children as unknown[]).length === 0
    ) {
      ((node as Record<string, unknown>).children as unknown[]) = [
        { type: "text", value: " " }
      ];
    }
  },
  onVisitHighlightedLine(node: unknown) {
    if (
      node &&
      typeof node === "object" &&
      "properties" in node &&
      ((node as Record<string, unknown>).properties as Record<string, unknown>)
        ?.className &&
      Array.isArray(
        (
          (node as Record<string, unknown>).properties as Record<
            string,
            unknown
          >
        ).className
      )
    ) {
      (
        (
          (node as Record<string, unknown>).properties as Record<
            string,
            unknown
          >
        ).className as string[]
      ).push("highlighted");
    }
  },
  onVisitHighlightedChars(node: unknown) {
    if (node && typeof node === "object" && "properties" in node) {
      (
        (node as Record<string, unknown>).properties as Record<string, unknown>
      ).className = ["word"];
    }
  }
};

export async function compileMarkdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(markdown);

  const html = await rehype()
    .data("settings", { fragment: true })
    // @ts-expect-error - rehype-pretty-code options type issue
    .use(rehypePrettyCode, options)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(result.toString());

  return html.toString();
}

export function calculateReadingTime(content: string): number {
  const stats = readingTime(content);
  return Math.ceil(stats.minutes);
}

export function generateExcerpt(
  content: string,
  maxLength: number = 160
): string {
  // Remove markdown syntax and HTML tags to get plain text
  const plainText = content
    .replace(/<[^>]*>/g, "") // Remove all HTML tags
    .replace(/#{1,6}\s+/g, "") // Remove headers
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
    .replace(/\*(.*?)\*/g, "$1") // Remove italic
    .replace(/`(.*?)`/g, "$1") // Remove inline code
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links but keep text
    .replace(/\n+/g, " ") // Replace newlines with spaces
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength).replace(/\s+\S*$/, "") + "...";
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();
}
