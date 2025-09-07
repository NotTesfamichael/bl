import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create Author User
  const authorEmail = "author@example.com";
  const authorPassword = "password123";

  const existingAuthor = await prisma.user.findUnique({
    where: { email: authorEmail }
  });

  if (!existingAuthor) {
    const hashedAuthorPassword = await bcrypt.hash(authorPassword, 10);
    const author = await prisma.user.create({
      data: {
        email: authorEmail,
        password: hashedAuthorPassword,
        name: "Test Author",
        role: "AUTHOR"
      }
    });
    console.log("✅ Author user created:", author.email);
  } else {
    console.log("ℹ️  Author user already exists:", existingAuthor.email);
  }

  // Create Admin User
  const adminEmail = "admin@example.com";
  const adminPassword = "admin123";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedAdminPassword,
        name: "Admin User",
        role: "ADMIN"
      }
    });
    console.log("✅ Admin user created:", admin.email);
  } else {
    console.log("ℹ️  Admin user already exists:", existingAdmin.email);
  }

  // Create some sample tags
  const tags = [
    "Technology",
    "Programming",
    "Web Development",
    "JavaScript",
    "TypeScript"
  ];

  for (const tagName of tags) {
    const existingTag = await prisma.tag.findUnique({
      where: { name: tagName }
    });

    if (!existingTag) {
      const tag = await prisma.tag.create({
        data: {
          name: tagName,
          slug: tagName.toLowerCase().replace(/\s+/g, "-")
        }
      });
      console.log("✅ Tag created:", tag.name);
    } else {
      console.log("ℹ️  Tag already exists:", existingTag.name);
    }
  }

  console.log("🎉 Database seeding completed!");
  console.log("\n📋 Default Users Created:");
  console.log("👤 Author: author@example.com / password123");
  console.log("👑 Admin: admin@example.com / admin123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
