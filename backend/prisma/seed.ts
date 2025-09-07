import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Get admin credentials from environment variables (required)
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error(
      "❌ SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD environment variables are required"
    );
    process.exit(1);
  }

  // Create Admin User
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
  console.log("\n📋 Users Created:");
  console.log(`👑 Admin: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
