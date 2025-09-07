import express from "express";
import { PrismaClient } from "@prisma/client";
import { body, validationResult } from "express-validator";
import { authenticateToken } from "../middleware/auth";
import { validateCommentContent } from "../utils/validation";

const router = express.Router();
const prisma = new PrismaClient();

// Get comments for a post
router.get("/posts/:postId", async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { postId },
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
    });

    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create new comment
router.post(
  "/posts/:postId",
  authenticateToken,
  [body("content").trim().isLength({ min: 5, max: 1000 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array()
        });
      }

      const { postId } = req.params;
      const { content } = req.body;

      // Validate comment content
      const validation = validateCommentContent(content);
      if (!validation.isValid) {
        return res.status(400).json({
          error: "Validation failed",
          details: validation.errors
        });
      }

      // Check if post exists
      const post = await prisma.post.findUnique({
        where: { id: postId }
      });

      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      const comment = await prisma.comment.create({
        data: {
          content: validation.sanitizedValue!,
          postId,
          authorId: req.user!.userId
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      });

      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Delete comment
router.delete("/:commentId", authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;

    // Check if comment exists and belongs to the user
    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        authorId: req.user!.userId
      }
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
