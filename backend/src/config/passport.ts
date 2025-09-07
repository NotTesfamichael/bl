import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Configure Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${
        process.env.BACKEND_URL || "http://localhost:3001"
      }/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google account
        const existingAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: "google",
              providerAccountId: profile.id
            }
          },
          include: {
            user: true
          }
        });

        if (existingAccount) {
          // User exists, return the user
          return done(null, existingAccount.user);
        }

        // Check if user exists with the same email
        const existingUser = await prisma.user.findUnique({
          where: {
            email: profile.emails?.[0]?.value
          }
        });

        if (existingUser) {
          // User exists but doesn't have Google account linked
          // Create the account link
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: "oauth",
              provider: "google",
              providerAccountId: profile.id,
              access_token: accessToken,
              refresh_token: refreshToken,
              expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
              token_type: "Bearer",
              scope: "openid profile email",
              id_token: profile.id
            }
          });

          return done(null, existingUser);
        }

        // Create new user and account
        const newUser = await prisma.user.create({
          data: {
            name: profile.displayName,
            email: profile.emails?.[0]?.value || "",
            image: profile.photos?.[0]?.value,
            emailVerified: new Date()
          }
        });

        await prisma.account.create({
          data: {
            userId: newUser.id,
            type: "oauth",
            provider: "google",
            providerAccountId: profile.id,
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
            token_type: "Bearer",
            scope: "openid profile email",
            id_token: profile.id
          }
        });

        return done(null, newUser);
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error, undefined);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true
      }
    });
    done(null, user);
  } catch (error) {
    done(error, undefined);
  }
});

export default passport;
