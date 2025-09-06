#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");

console.log("🔍 Testing Notes & Code Blog Build...\n");

// Check if required files exist
const requiredFiles = [
  "src/components/ui/button.tsx",
  "src/components/ui/card.tsx",
  "src/components/ui/input.tsx",
  "src/components/ui/textarea.tsx",
  "src/components/ui/dropdown-menu.tsx",
  "src/components/ui/badge.tsx",
  "src/components/ui/sonner.tsx",
  "src/lib/utils.ts",
  "prisma/schema.prisma",
  "src/lib/db.ts",
  "src/lib/auth.ts",
  "src/lib/markdown.ts"
];

console.log("📁 Checking required files...");
let allFilesExist = true;
requiredFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log("\n❌ Some required files are missing. Please check the setup.");
  process.exit(1);
}

console.log("\n🔧 Testing TypeScript compilation...");
try {
  execSync("npx tsc --noEmit", { stdio: "pipe" });
  console.log("✅ TypeScript compilation successful");
} catch (error) {
  console.log("❌ TypeScript compilation failed");
  console.log(error.stdout?.toString() || error.message);
  process.exit(1);
}

console.log("\n🎉 All checks passed! The project should build successfully.");
console.log("\n📋 Next steps:");
console.log("1. Set up your database URL in .env.local");
console.log(
  "2. Run: npm run db:generate && npm run db:push && npm run db:seed"
);
console.log("3. Run: npm run dev");
console.log("4. Open http://localhost:3000");
