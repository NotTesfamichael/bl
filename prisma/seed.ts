import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  compileMarkdownToHtml,
  generateExcerpt,
  generateSlug
} from "../src/lib/markdown";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create sample user
  const hashedPassword = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "author@example.com" },
    update: {},
    create: {
      email: "author@example.com",
      name: "John Doe",
      password: hashedPassword,
      role: "AUTHOR"
    }
  });

  console.log("✅ Created user:", user.email);

  // Create sample tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: "javascript" },
      update: {},
      create: {
        name: "JavaScript",
        slug: "javascript"
      }
    }),
    prisma.tag.upsert({
      where: { slug: "react" },
      update: {},
      create: {
        name: "React",
        slug: "react"
      }
    }),
    prisma.tag.upsert({
      where: { slug: "nextjs" },
      update: {},
      create: {
        name: "Next.js",
        slug: "nextjs"
      }
    })
  ]);

  console.log(
    "✅ Created tags:",
    tags.map((t) => t.name)
  );

  // Sample markdown content
  const samplePost1 = `# Getting Started with Next.js 14

Next.js 14 introduces some exciting new features that make building React applications even more powerful. In this post, we'll explore the key improvements and how to use them in your projects.

## What's New in Next.js 14

### App Router Improvements
The App Router has been significantly enhanced with better performance and developer experience.

\`\`\`javascript
// app/page.tsx
export default function HomePage() {
  return (
    <div>
      <h1>Welcome to Next.js 14!</h1>
      <p>This is a server component by default.</p>
    </div>
  )
}
\`\`\`

### Server Actions
Server Actions allow you to run server-side code directly from client components:

\`\`\`typescript
// app/actions.ts
'use server'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  
  // Save to database
  console.log('Creating post:', { title, content })
}
\`\`\`

## Conclusion

Next.js 14 continues to push the boundaries of what's possible with React, making it easier than ever to build full-stack applications.`;

  const samplePost2 = `# Building a Modern Blog with React

Creating a blog with React has never been easier. In this tutorial, we'll build a complete blogging platform using modern React patterns and best practices.

## Setting Up the Project

First, let's create a new React project:

\`\`\`bash
npx create-react-app my-blog
cd my-blog
npm start
\`\`\`

## Creating the Blog Components

We'll need several key components for our blog:

\`\`\`jsx
// components/PostCard.jsx
import React from 'react'

function PostCard({ post }) {
  return (
    <article className="post-card">
      <h2>{post.title}</h2>
      <p>{post.excerpt}</p>
      <time>{post.publishedAt}</time>
    </article>
  )
}

export default PostCard
\`\`\`

## Styling with CSS Modules

CSS Modules provide a great way to scope your styles:

\`\`\`css
/* PostCard.module.css */
.postCard {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.postCard h2 {
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}
\`\`\`

## Conclusion

With these patterns, you can build a robust and maintainable blog using React.`;

  // Create sample posts
  const posts = await Promise.all([
    {
      title: "Getting Started with Next.js 14",
      slug: "getting-started-with-nextjs-14",
      contentMarkdown: samplePost1,
      status: "PUBLISHED" as const,
      authorId: user.id,
      publishedAt: new Date("2024-01-15")
    },
    {
      title: "Building a Modern Blog with React",
      slug: "building-modern-blog-with-react",
      contentMarkdown: samplePost2,
      status: "PUBLISHED" as const,
      authorId: user.id,
      publishedAt: new Date("2024-01-20")
    },
    {
      title: "Draft: Advanced TypeScript Patterns",
      slug: "draft-advanced-typescript-patterns",
      contentMarkdown: `# Advanced TypeScript Patterns

This is a draft post about advanced TypeScript patterns...

\`\`\`typescript
type User = {
  id: string
  name: string
  email: string
}

type CreateUserInput = Omit<User, 'id'>
\`\`\`

More content coming soon...`,
      status: "DRAFT" as const,
      authorId: user.id
    }
  ]);

  // Compile markdown to HTML and create posts
  const createdPosts = [];
  for (const postData of posts) {
    const contentHtml = await compileMarkdownToHtml(postData.contentMarkdown);
    const excerpt = generateExcerpt(postData.contentMarkdown);

    const post = await prisma.post.create({
      data: {
        ...postData,
        contentHtml,
        excerpt
      }
    });

    createdPosts.push(post);
  }

  console.log(
    "✅ Created posts:",
    createdPosts.map((p) => p.title)
  );

  // Create post-tag relationships
  await prisma.postTag.createMany({
    data: [
      { postId: createdPosts[0].id, tagId: tags[2].id }, // Next.js post -> nextjs tag
      { postId: createdPosts[0].id, tagId: tags[0].id }, // Next.js post -> javascript tag
      { postId: createdPosts[1].id, tagId: tags[1].id }, // React post -> react tag
      { postId: createdPosts[1].id, tagId: tags[0].id } // React post -> javascript tag
    ]
  });

  console.log("✅ Created post-tag relationships");

  // Create some sample reactions
  await prisma.reaction.createMany({
    data: [
      { postId: createdPosts[0].id, userId: user.id, type: "LIKE" },
      { postId: createdPosts[0].id, userId: user.id, type: "BOOKMARK" },
      { postId: createdPosts[1].id, userId: user.id, type: "LIKE" }
    ]
  });

  console.log("✅ Created sample reactions");

  // Create view counts
  await prisma.view.createMany({
    data: [
      { postId: createdPosts[0].id, count: 42 },
      { postId: createdPosts[1].id, count: 28 }
    ]
  });

  console.log("✅ Created view counts");

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
