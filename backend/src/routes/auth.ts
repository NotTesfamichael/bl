import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "passport";
import { PrismaClient } from "@prisma/client";
import { body, validationResult } from "express-validator";
import { AuthRequest } from "../types/auth";

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateLogin = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 })
];

const validateRegister = [
  body("name").trim().isLength({ min: 2, max: 50 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 })
];

// Login endpoint
router.post(
  "/login",
  validateLogin,
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user || !user.password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate JWT token
      const token = (jwt.sign as any)(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Register endpoint
router.post(
  "/register",
  validateRegister,
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array()
        });
      }

      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword
        }
      });

      // Generate JWT token
      const token = (jwt.sign as any)(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      return res.status(201).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Verify token endpoint
router.get("/verify", async (req: express.Request, res: express.Response) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    // Don't log JWT verification errors as they're expected for invalid tokens
    return res.status(401).json({ error: "Invalid token" });
  }
});

// Google OAuth routes (only if configured)
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_ID !== "" &&
  process.env.GOOGLE_CLIENT_SECRET !== ""
) {
  router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", {
      failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
    }),
    async (req: express.Request, res: express.Response) => {
      try {
        const user = req.user as any;

        if (!user) {
          return res.redirect(
            `${process.env.FRONTEND_URL}/login?error=user_not_found`
          );
        }

        // Generate JWT token for the user
        const token = (jwt.sign as any)(
          {
            userId: user.id,
            email: user.email,
            role: user.role
          },
          process.env.JWT_SECRET!,
          { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );

        // Redirect to frontend with token
        res.redirect(
          `${process.env.FRONTEND_URL}/auth/callback?token=${token}`
        );
      } catch (error) {
        console.error("Google OAuth callback error:", error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
      }
    }
  );
} else {
  // Return error if Google OAuth is not configured
  router.get("/google", (req: express.Request, res: express.Response) => {
    res.status(501).json({ error: "Google OAuth is not configured" });
  });
}

export default router;
