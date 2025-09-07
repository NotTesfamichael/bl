import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  compileMarkdownToHtml,
  generateExcerpt,
  generateSlug
} from "@/lib/markdown";
import {
  validatePostTitle,
  validatePostContent,
  validatePostSlug
} from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      contentMarkdown,
      excerpt,
      tagIds = [],
      status = "DRAFT"
    } = body;

    // Validate input
    const titleValidation = validatePostTitle(title);
    const contentValidation = validatePostContent(contentMarkdown);
    const slugValidation = slug
      ? validatePostSlug(slug)
      : { isValid: true, errors: [] };

    if (
      !titleValidation.isValid ||
      !contentValidation.isValid ||
      !slugValidation.isValid
    ) {
      const errors = [
        ...titleValidation.errors,
        ...contentValidation.errors,
        ...slugValidation.errors
      ];
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    // Use sanitized values
    const sanitizedTitle = titleValidation.sanitizedValue!;
    const sanitizedContent = contentValidation.sanitizedValue!;
    const sanitizedSlug =
      slugValidation.sanitizedValue || generateSlug(sanitizedTitle);

    // Ensure slug is unique
    let uniqueSlug = sanitizedSlug;
    let counter = 1;
    while (await db.post.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${sanitizedSlug}-${counter}`;
      counter++;
    }

    // Compile markdown to HTML
    const contentHtml = await compileMarkdownToHtml(sanitizedContent);
    const finalExcerpt = excerpt || generateExcerpt(sanitizedContent);

    // Validate tag IDs if provided
    let validTagIds: string[] = [];
    if (tagIds && tagIds.length > 0) {
      const existingTags = await db.tag.findMany({
        where: { id: { in: tagIds } },
        select: { id: true }
      });
      validTagIds = existingTags.map((tag) => tag.id);

      if (validTagIds.length !== tagIds.length) {
        console.log(
          "Some tag IDs are invalid, using only valid ones:",
          validTagIds
        );
      }
    }

    // Create post
    const post = await db.post.create({
      data: {
        title: sanitizedTitle,
        slug: uniqueSlug,
        contentMarkdown: sanitizedContent,
        contentHtml,
        excerpt: finalExcerpt,
        status,
        authorId: session.user.id,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        ...(validTagIds.length > 0 && {
          tags: {
            create: validTagIds.map((tagId: string) => ({
              tagId
            }))
          }
        })
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const tag = searchParams.get("tag");
    const status = searchParams.get("status") || "PUBLISHED";

    const where: Record<string, unknown> = { status };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { contentMarkdown: { contains: search, mode: "insensitive" } }
      ];
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            slug: tag
          }
        }
      };
    }

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        include: {
          author: {
            select: {
              name: true,
              image: true
            }
          },
          tags: {
            include: {
              tag: true
            }
          },
          views: true,
          reactions: true
        },
        orderBy: {
          publishedAt: "desc"
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.post.count({ where })
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
