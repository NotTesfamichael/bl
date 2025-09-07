import express from "express";
import { PrismaClient } from "@prisma/client";
import { body, validationResult } from "express-validator";
import { authenticateToken } from "../middleware/auth";
import {
  compileMarkdownToHtml,
  generateExcerpt,
  generateSlug
} from "../utils/markdown";
import {
  validatePostTitle,
  validatePostContent,
  validatePostSlug
} from "../utils/validation";
import { AuthRequest } from "../types/auth";
import { cache, cacheInvalidation } from "../utils/cache";

const router = express.Router();
const prisma = new PrismaClient();

// Get all posts
router.get("/", cache({ ttl: 300 }), async (req, res) => {
  try {
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const tag = searchParams.get("tag");
    const status = searchParams.get("status") || "PUBLISHED";
    const visibility = searchParams.get("visibility");

    const where: Record<string, unknown> = { status };

    // Handle visibility filtering
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      // User is authenticated - show PUBLIC posts and their own PRIVATE posts
      try {
        const token = authHeader.substring(7);
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        if (visibility) {
          // If specific visibility is requested
          if (visibility === "PRIVATE") {
            where.AND = [
              { visibility: "PRIVATE" },
              { authorId: decoded.userId }
            ];
          } else if (visibility === "PUBLIC") {
            // For "Public" view, show only user's own public posts
            where.AND = [
              { visibility: "PUBLIC" },
              { authorId: decoded.userId }
            ];
          }
        } else {
          // Default behavior: show all PUBLIC posts (from all users)
          where.visibility = "PUBLIC";
        }
      } catch (error) {
        // Invalid token, only show public posts (don't log as this is expected)
        where.visibility = "PUBLIC";
      }
    } else {
      // User is not authenticated - only show public posts
      where.visibility = "PUBLIC";
    }

    if (search) {
      const searchConditions = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { contentMarkdown: { contains: search, mode: "insensitive" } }
      ];

      if (where.OR) {
        // Combine visibility OR with search conditions
        where.AND = [{ OR: where.OR }, { OR: searchConditions }];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
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
      prisma.post.findMany({
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
      prisma.post.count({ where })
    ]);

    return res.json({
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
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get single post by slug
router.get("/slug/:slug", cache({ ttl: 600 }), async (req, res) => {
  try {
    const { slug } = req.params;

    // Check if user is authenticated
    const authHeader = req.headers.authorization;
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7);
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        userId = decoded.userId;
      } catch (error) {
        // Invalid token, userId remains null (don't log as this is expected)
      }
    }

    const post = await prisma.post.findUnique({
      where: {
        slug,
        status: "PUBLISHED"
      },
      include: {
        author: {
          select: {
            id: true,
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
        reactions: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check visibility permissions
    if (post.visibility === "PRIVATE") {
      if (!userId || post.authorId !== userId) {
        return res.status(404).json({ error: "Post not found" });
      }
    }

    // Increment view count
    await prisma.view.upsert({
      where: { postId: post.id },
      update: { count: { increment: 1 } },
      create: { postId: post.id, count: 1 }
    });

    return res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get user's posts (including drafts)
(router.get as any)("/my-posts", authenticateToken, cache({ ttl: 60 }), (async (
  req: AuthRequest,
  res: express.Response
) => {
  try {
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status"); // Optional filter by status

    const where: Record<string, unknown> = {
      authorId: req.user!.userId
    };

    // If status is specified, filter by it, otherwise get all user's posts
    if (status) {
      where.status = status;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
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
          updatedAt: "desc"
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.post.count({ where })
    ]);

    return res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}) as any);

// Get single post by ID (for editing)
(router.get as any)("/:id", authenticateToken, cache({ ttl: 60 }), (async (
  req: AuthRequest,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const post = await prisma.post.findFirst({
      where: {
        id,
        authorId: userId // Ensure user can only access their own posts
      },
      include: {
        author: {
          select: {
            id: true,
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
      }
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}) as any);

// Create new post
router.post(
  "/",
  authenticateToken as any,
  [
    body("title").trim().isLength({ min: 1, max: 200 }),
    body("contentMarkdown").trim().isLength({ min: 1 }),
    body("status").optional().isIn(["DRAFT", "PUBLISHED"]),
    body("visibility").optional().isIn(["PUBLIC", "PRIVATE"])
  ],
  (async (req: AuthRequest, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array()
        });
      }

      const {
        title,
        slug,
        contentMarkdown,
        excerpt,
        tagIds = [],
        status = "DRAFT",
        visibility = "PUBLIC"
      } = req.body;

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
        return res.status(400).json({
          error: "Validation failed",
          details: errors
        });
      }

      // Use sanitized values
      const sanitizedTitle = titleValidation.sanitizedValue!;
      const sanitizedContent = contentValidation.sanitizedValue!;
      const sanitizedSlug =
        slugValidation.sanitizedValue || generateSlug(sanitizedTitle);

      // Ensure slug is unique
      let uniqueSlug = sanitizedSlug;
      let counter = 1;
      while (await prisma.post.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${sanitizedSlug}-${counter}`;
        counter++;
      }

      // Compile markdown to HTML
      const contentHtml = await compileMarkdownToHtml(sanitizedContent);
      const finalExcerpt = excerpt || generateExcerpt(sanitizedContent);

      // Validate tag IDs if provided
      let validTagIds: string[] = [];
      if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
        const existingTags = await prisma.tag.findMany({
          where: { id: { in: tagIds } }
        });
        validTagIds = existingTags.map((tag) => tag.id);
      }

      // Create post
      const post = await prisma.post.create({
        data: {
          title: sanitizedTitle,
          slug: uniqueSlug,
          contentMarkdown: sanitizedContent,
          contentHtml,
          excerpt: finalExcerpt,
          status,
          visibility,
          authorId: req.user!.userId,
          publishedAt: status === "PUBLISHED" ? new Date() : null
        },
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
          }
        }
      });

      // Create PostTag relationships if valid tags exist
      if (validTagIds.length > 0) {
        await prisma.postTag.createMany({
          data: validTagIds.map((tagId) => ({
            postId: post.id,
            tagId
          }))
        });
      }

      // Invalidate relevant caches
      await cacheInvalidation.invalidatePost(post.id);

      return res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }) as any
);

// Update post
(router.put as any)("/:id", authenticateToken, (async (
  req: AuthRequest,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      contentMarkdown,
      excerpt,
      status,
      visibility,
      tagIds
    } = req.body;

    // Validate required fields
    if (!title || !slug || !contentMarkdown) {
      return res.status(400).json({
        error: "Missing required fields: title, slug, or content"
      });
    }

    // Verify the post exists and belongs to the user
    const existingPost = await prisma.post.findFirst({
      where: {
        id: id,
        authorId: req.user!.userId
      }
    });

    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Compile markdown to HTML
    const contentHtml = await compileMarkdownToHtml(contentMarkdown);
    const finalExcerpt = excerpt || generateExcerpt(contentHtml);

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id: id },
      data: {
        title,
        slug,
        contentMarkdown,
        contentHtml,
        excerpt: finalExcerpt,
        status,
        visibility,
        publishedAt:
          status === "PUBLISHED" ? new Date() : existingPost.publishedAt,
        updatedAt: new Date()
      }
    });

    // Update tags if provided
    if (tagIds && Array.isArray(tagIds)) {
      // Remove existing tags
      await prisma.postTag.deleteMany({
        where: { postId: id }
      });

      // Add new tags if valid
      if (tagIds.length > 0) {
        const existingTags = await prisma.tag.findMany({
          where: { id: { in: tagIds } }
        });
        const validTagIds = existingTags.map((tag) => tag.id);

        if (validTagIds.length > 0) {
          await prisma.postTag.createMany({
            data: validTagIds.map((tagId) => ({
              postId: id,
              tagId
            }))
          });
        }
      }
    }

    // Invalidate relevant caches
    await cacheInvalidation.invalidatePost(id);

    return res.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}) as any);

// Delete post
(router.delete as any)("/:id", authenticateToken, (async (
  req: AuthRequest,
  res: express.Response
) => {
  try {
    const { id } = req.params;

    // Verify the post exists and belongs to the user
    const post = await prisma.post.findFirst({
      where: {
        id: id,
        authorId: req.user!.userId
      }
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    await prisma.post.delete({
      where: { id: id }
    });

    // Invalidate relevant caches
    await cacheInvalidation.invalidatePost(id);

    return res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}) as any);

// Unpublish post (move to draft)
(router.post as any)("/:id/unpublish", authenticateToken, (async (
  req: AuthRequest,
  res: express.Response
) => {
  try {
    const { id } = req.params;

    // Verify the post exists and belongs to the user
    const existingPost = await prisma.post.findFirst({
      where: {
        id: id,
        authorId: req.user!.userId,
        status: "PUBLISHED" // Only allow unpublishing published posts
      }
    });

    if (!existingPost) {
      return res.status(404).json({ error: "Published post not found" });
    }

    // Update the post status to DRAFT
    const updatedPost = await prisma.post.update({
      where: { id: id },
      data: {
        status: "DRAFT",
        updatedAt: new Date()
      }
    });

    // Invalidate relevant caches
    await cacheInvalidation.invalidatePost(id);

    return res.json({
      message: "Post unpublished successfully",
      post: updatedPost
    });
  } catch (error) {
    console.error("Error unpublishing post:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}) as any);

// Like/Unlike post
(router.post as any)("/:id/like", authenticateToken, (async (
  req: AuthRequest,
  res: express.Response
) => {
  try {
    const { id } = req.params;

    // Check if user already liked this post
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        postId_userId_type: {
          postId: id,
          userId: req.user!.userId,
          type: "LIKE"
        }
      }
    });

    if (existingReaction) {
      // Unlike
      await prisma.reaction.delete({
        where: { id: existingReaction.id }
      });

      // Invalidate post cache to update like count
      await cacheInvalidation.invalidatePost(id);

      return res.json({ liked: false });
    } else {
      // Like
      await prisma.reaction.create({
        data: {
          postId: id,
          userId: req.user!.userId,
          type: "LIKE"
        }
      });

      // Invalidate post cache to update like count
      await cacheInvalidation.invalidatePost(id);

      return res.json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}) as any);

export default router;
