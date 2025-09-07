import express from "express";
import { PrismaClient } from "@prisma/client";
import { body, validationResult } from "express-validator";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import { validateTagName } from "../utils/validation";
import slugify from "slugify";
import { AuthRequest } from "../types/auth";
import { cache, cacheInvalidation } from "../utils/cache";

const router = express.Router();
const prisma = new PrismaClient();

// Get all tags
router.get("/", cache({ ttl: 600 }), async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: "asc"
      }
    });

    return res.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Create new tag
router.post(
  "/",
  authenticateToken as any,
  [body("name").trim().isLength({ min: 2, max: 30 })],
  (async (req: AuthRequest, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array()
        });
      }

      const { name } = req.body;

      // Validate tag name
      const validation = validateTagName(name);
      if (!validation.isValid) {
        return res.status(400).json({
          error: "Validation failed",
          details: validation.errors
        });
      }

      const sanitizedName = validation.sanitizedValue!;
      const slug = slugify(sanitizedName, { lower: true, strict: true });

      // Check if tag already exists
      const existingTag = await prisma.tag.findFirst({
        where: {
          OR: [{ name: sanitizedName }, { slug: slug }]
        }
      });

      if (existingTag) {
        return res.status(409).json({ error: "Tag already exists" });
      }

      const tag = await prisma.tag.create({
        data: {
          name: sanitizedName,
          slug
        }
      });

      // Invalidate tags cache
      await cacheInvalidation.invalidateTags();

      return res.status(201).json(tag);
    } catch (error) {
      console.error("Error creating tag:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }) as any
);

// Delete tag
(router.delete as any)(
  "/:id",
  authenticateToken,
  requireAdmin as any,
  (async (req: AuthRequest, res: express.Response) => {
    try {
      const { id } = req.params;

      // Check if tag exists
      const tag = await prisma.tag.findUnique({
        where: { id }
      });

      if (!tag) {
        return res.status(404).json({ error: "Tag not found" });
      }

      // Check if tag is being used by any posts
      const postsWithTag = await prisma.postTag.findFirst({
        where: { tagId: id }
      });

      if (postsWithTag) {
        return res.status(400).json({
          error: "Cannot delete tag that is being used by posts"
        });
      }

      await prisma.tag.delete({
        where: { id }
      });

      // Invalidate tags cache
      await cacheInvalidation.invalidateTags();

      return res.json({ message: "Tag deleted successfully" });
    } catch (error) {
      console.error("Error deleting tag:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }) as any
);

// Cleanup unused tags
(router.post as any)(
  "/cleanup",
  authenticateToken,
  requireAdmin as any,
  (async (req: AuthRequest, res: express.Response) => {
    try {
      // Find all tags that are not being used by any posts
      const unusedTags = await prisma.tag.findMany({
        where: {
          posts: {
            none: {}
          }
        }
      });

      if (unusedTags.length === 0) {
        return res.json({
          message: "No unused tags found",
          deletedCount: 0
        });
      }

      // Delete unused tags
      const deleteResult = await prisma.tag.deleteMany({
        where: {
          id: {
            in: unusedTags.map((tag) => tag.id)
          }
        }
      });

      // Invalidate tags cache
      await cacheInvalidation.invalidateTags();

      return res.json({
        message: `Deleted ${deleteResult.count} unused tags`,
        deletedCount: deleteResult.count
      });
    } catch (error) {
      console.error("Error cleaning up tags:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }) as any
);

export default router;
