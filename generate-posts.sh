#!/bin/bash

# Generate Posts Script for Notes Blog
# This script creates 60+ sample posts to test pagination

echo "Starting post generation..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "ERROR: .env file not found. Please copy env.example to .env and configure it first."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check if required environment variables are set
if [ -z "$SEED_ADMIN_EMAIL" ] || [ -z "$SEED_ADMIN_PASSWORD" ]; then
    echo "ERROR: SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env"
    echo "Add these to your .env file:"
    echo "SEED_ADMIN_EMAIL=admin@yourdomain.com"
    echo "SEED_ADMIN_PASSWORD=secure_password_123"
    exit 1
fi

# Wait for database to be ready
echo "Waiting for database to be ready..."
until docker exec notes-blog-postgres pg_isready -U postgres -d notes_blog; do
    echo "  Database not ready, waiting 2 seconds..."
    sleep 2
done
echo "Database is ready!"

# Create a temporary Node.js script to generate posts
cat > /tmp/generate_posts.js << 'EOF'
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Sample post data
const postTemplates = [
  {
    title: "Getting Started with React Hooks",
    content: `# Getting Started with React Hooks

React Hooks revolutionized how we write React components by allowing us to use state and other React features in functional components.

## What are Hooks?

Hooks are functions that let you "hook into" React state and lifecycle features from function components. They were introduced in React 16.8.

## Common Hooks

### useState
The useState hook lets you add state to functional components:

\`\`\`javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

### useEffect
The useEffect hook lets you perform side effects in functional components:

\`\`\`javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## Best Practices

1. Only call hooks at the top level
2. Only call hooks from React functions
3. Use multiple useState calls for different state variables
4. Use useEffect for side effects

Hooks make React code more reusable and easier to test. They're a powerful addition to the React ecosystem!`,
    tags: ["React", "JavaScript", "Web Development"]
  },
  {
    title: "Understanding TypeScript Generics",
    content: `# Understanding TypeScript Generics

Generics are one of TypeScript's most powerful features, allowing you to create reusable components that work with multiple types.

## What are Generics?

Generics allow you to create components that can work over a variety of types rather than a single one. This provides flexibility while maintaining type safety.

## Basic Generic Function

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg;
}

let output = identity<string>("myString");
let output2 = identity<number>(123);
\`\`\`

## Generic Interfaces

\`\`\`typescript
interface GenericIdentityFn<T> {
  (arg: T): T;
}

function identity<T>(arg: T): T {
  return arg;
}

let myIdentity: GenericIdentityFn<number> = identity;
\`\`\`

## Generic Classes

\`\`\`typescript
class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function(x, y) { return x + y; };
\`\`\`

## Constraints

You can constrain generic types using the \`extends\` keyword:

\`\`\`typescript
interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}
\`\`\`

Generics provide a way to make components more flexible and reusable while maintaining type safety throughout your application.`,
    tags: ["TypeScript", "Programming", "Web Development"]
  },
  {
    title: "CSS Grid vs Flexbox: When to Use Which",
    content: `# CSS Grid vs Flexbox: When to Use Which

Both CSS Grid and Flexbox are powerful layout tools, but they serve different purposes and work best in different scenarios.

## CSS Grid

CSS Grid is a two-dimensional layout system that allows you to create complex layouts with rows and columns.

### When to Use Grid:
- Two-dimensional layouts
- Complex page layouts
- When you need precise control over both rows and columns
- Creating card layouts with consistent sizing

### Example:
\`\`\`css
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto 1fr auto;
  gap: 20px;
  height: 100vh;
}

.header { grid-column: 1 / -1; }
.sidebar { grid-row: 2; }
.main { grid-column: 2 / -1; }
.footer { grid-column: 1 / -1; }
\`\`\`

## Flexbox

Flexbox is a one-dimensional layout method for laying out items in a single direction (row or column).

### When to Use Flexbox:
- One-dimensional layouts
- Aligning items within a container
- Distributing space between items
- Creating responsive navigation bars
- Centering content

### Example:
\`\`\`css
.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.flex-item {
  flex: 1;
  min-width: 200px;
}
\`\`\`

## Key Differences

| Feature | Grid | Flexbox |
|---------|------|---------|
| Dimensions | 2D (rows + columns) | 1D (row OR column) |
| Use Case | Page layout | Component layout |
| Browser Support | Modern browsers | Excellent |
| Learning Curve | Steeper | Gentler |

## Best Practice

Use both together! Grid for overall page layout and Flexbox for individual components and content alignment.`,
    tags: ["CSS", "Web Development", "Frontend"]
  },
  {
    title: "Node.js Performance Optimization Tips",
    content: `# Node.js Performance Optimization Tips

Node.js applications can benefit from various optimization techniques to improve performance and scalability.

## 1. Use Clustering

Take advantage of multiple CPU cores:

\`\`\`javascript
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Worker process
  require('./app');
}
\`\`\`

## 2. Implement Caching

Use Redis or in-memory caching for frequently accessed data:

\`\`\`javascript
const redis = require('redis');
const client = redis.createClient();

async function getCachedData(key) {
  const cached = await client.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const data = await fetchDataFromDatabase();
  await client.setex(key, 3600, JSON.stringify(data));
  return data;
}
\`\`\`

## 3. Optimize Database Queries

- Use connection pooling
- Implement query optimization
- Use indexes effectively
- Consider read replicas

## 4. Use Compression

Enable gzip compression:

\`\`\`javascript
const compression = require('compression');
app.use(compression());
\`\`\`

## 5. Monitor Memory Usage

\`\`\`javascript
setInterval(() => {
  const used = process.memoryUsage();
  console.log({
    rss: Math.round(used.rss / 1024 / 1024) + ' MB',
    heapTotal: Math.round(used.heapTotal / 1024 / 1024) + ' MB',
    heapUsed: Math.round(used.heapUsed / 1024 / 1024) + ' MB'
  });
}, 30000);
\`\`\`

## 6. Use Streams for Large Data

\`\`\`javascript
const fs = require('fs');
const stream = fs.createReadStream('large-file.txt');
stream.pipe(response);
\`\`\`

These optimizations can significantly improve your Node.js application's performance and scalability.`,
    tags: ["Node.js", "Performance", "Backend"]
  },
  {
    title: "Docker Best Practices for Development",
    content: `# Docker Best Practices for Development

Docker has revolutionized how we develop, ship, and run applications. Here are some best practices for using Docker in development.

## 1. Use Multi-stage Builds

Reduce image size with multi-stage builds:

\`\`\`dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## 2. Optimize Dockerfile

- Use specific base image tags
- Order commands by frequency of change
- Use .dockerignore file
- Combine RUN commands to reduce layers

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## 3. Use Docker Compose for Development

\`\`\`yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
\`\`\`

## 4. Health Checks

Add health checks to your containers:

\`\`\`dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
\`\`\`

## 5. Security Best Practices

- Don't run as root
- Use specific image tags
- Scan images for vulnerabilities
- Use secrets management

\`\`\`dockerfile
# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs
\`\`\`

These practices will help you build more efficient, secure, and maintainable Docker applications.`,
    tags: ["Docker", "DevOps", "Development"]
  }
];

// Generate additional post variations
const topics = [
  "JavaScript", "TypeScript", "React", "Vue.js", "Angular", "Node.js", 
  "Python", "Java", "Go", "Rust", "CSS", "HTML", "Web Development",
  "Mobile Development", "DevOps", "Docker", "Kubernetes", "AWS", "Azure",
  "Database Design", "SQL", "NoSQL", "MongoDB", "PostgreSQL", "Redis",
  "API Design", "REST", "GraphQL", "Microservices", "Architecture",
  "Testing", "Unit Testing", "Integration Testing", "E2E Testing",
  "Performance", "Optimization", "Security", "Authentication", "Authorization",
  "Machine Learning", "AI", "Data Science", "Analytics", "Monitoring",
  "CI/CD", "Git", "GitHub", "GitLab", "Code Review", "Agile", "Scrum"
];

const adjectives = [
  "Advanced", "Complete", "Comprehensive", "Essential", "Practical", 
  "Modern", "Effective", "Efficient", "Scalable", "Robust", "Secure",
  "Fast", "Quick", "Simple", "Easy", "Beginner", "Intermediate", "Expert"
];

const nouns = [
  "Guide", "Tutorial", "Tips", "Tricks", "Best Practices", "Patterns",
  "Techniques", "Strategies", "Solutions", "Examples", "Recipes",
  "Fundamentals", "Basics", "Deep Dive", "Overview", "Introduction"
];

async function generatePosts() {
  try {
    console.log("Starting post generation...");

    // Get admin user
    const admin = await prisma.user.findUnique({
      where: { email: process.env.SEED_ADMIN_EMAIL }
    });

    if (!admin) {
      console.error("Admin user not found. Please run seed.ts first.");
      process.exit(1);
    }

    // Get or create tags
    const tagMap = new Map();
    for (const topic of topics) {
      const tag = await prisma.tag.upsert({
        where: { name: topic },
        update: {},
        create: {
          name: topic,
          slug: topic.toLowerCase().replace(/\s+/g, "-")
        }
      });
      tagMap.set(topic, tag);
    }

    // Generate posts
    const postsToCreate = [];
    const totalPosts = 60;

    // First, add the template posts
    for (const template of postTemplates) {
      const slug = template.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      postsToCreate.push({
        title: template.title,
        slug: slug,
        contentMarkdown: template.content,
        contentHtml: template.content, // In a real app, you'd convert markdown to HTML
        status: "PUBLISHED",
        visibility: "PUBLIC",
        excerpt: template.content.split('\n')[0].replace(/^#+\s*/, ''),
        authorId: admin.id,
        publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        tags: template.tags
      });
    }

    // Generate additional random posts
    for (let i = postTemplates.length; i < totalPosts; i++) {
      const topic = topics[Math.floor(Math.random() * topics.length)];
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      
      const title = `${adjective} ${topic} ${noun}`;
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      const content = `# ${title}

This is a comprehensive guide about ${topic.toLowerCase()}. 

## Introduction

${topic} is an essential topic in modern development. This ${noun.toLowerCase()} will help you understand the key concepts and ${adjective.toLowerCase()} techniques.

## Key Concepts

- **Concept 1**: Understanding the fundamentals
- **Concept 2**: Advanced techniques and patterns
- **Concept 3**: Best practices and common pitfalls
- **Concept 4**: Real-world applications and examples

## Getting Started

Here's how you can get started with ${topic.toLowerCase()}:

\`\`\`javascript
// Example code
function example() {
  console.log("Hello, ${topic}!");
}
\`\`\`

## Advanced Topics

### Performance Considerations

When working with ${topic.toLowerCase()}, consider these performance factors:

1. Optimization techniques
2. Memory management
3. Caching strategies
4. Monitoring and debugging

### Best Practices

- Follow established patterns
- Write clean, maintainable code
- Test thoroughly
- Document your work

## Conclusion

${topic} is a powerful tool that can significantly improve your development workflow. With the right approach and understanding, you can leverage its full potential.

## Resources

- Official documentation
- Community forums
- Tutorial videos
- Example projects

Happy coding!`;

      // Select 2-4 random tags
      const selectedTags = [];
      const numTags = Math.floor(Math.random() * 3) + 2; // 2-4 tags
      const shuffledTopics = [...topics].sort(() => 0.5 - Math.random());
      
      for (let j = 0; j < numTags; j++) {
        if (shuffledTopics[j]) {
          selectedTags.push(shuffledTopics[j]);
        }
      }

      postsToCreate.push({
        title: title,
        slug: slug,
        contentMarkdown: content,
        contentHtml: content,
        status: "PUBLISHED",
        visibility: "PUBLIC",
        excerpt: `This is a comprehensive guide about ${topic.toLowerCase()}.`,
        authorId: admin.id,
        publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        tags: selectedTags
      });
    }

    // Create posts in batches
    console.log(`Creating ${postsToCreate.length} posts...`);
    
    for (const postData of postsToCreate) {
      const { tags, ...postCreateData } = postData;
      
      // Check if post with same slug already exists
      const existingPost = await prisma.post.findUnique({
        where: { slug: postCreateData.slug }
      });

      if (existingPost) {
        console.log(`Post with slug "${postCreateData.slug}" already exists, skipping...`);
        continue;
      }
      
      const post = await prisma.post.create({
        data: postCreateData
      });

      // Create post-tag relationships
      for (const tagName of tags) {
        const tag = tagMap.get(tagName);
        if (tag) {
          // Check if relationship already exists
          const existingRelation = await prisma.postTag.findUnique({
            where: {
              postId_tagId: {
                postId: post.id,
                tagId: tag.id
              }
            }
          });

          if (!existingRelation) {
            await prisma.postTag.create({
              data: {
                postId: post.id,
                tagId: tag.id
              }
            });
          }
        }
      }

      console.log(`Created post: ${post.title}`);
    }

    console.log(`Successfully created ${postsToCreate.length} posts!`);
    
    // Create some view counts for posts
    const allPosts = await prisma.post.findMany({
      select: { id: true }
    });

    for (const post of allPosts) {
      // Check if view already exists for this post
      const existingView = await prisma.view.findUnique({
        where: { postId: post.id }
      });

      if (!existingView) {
        const viewCount = Math.floor(Math.random() * 100) + 1;
        await prisma.view.create({
          data: {
            postId: post.id,
            count: viewCount
          }
        });
      }
    }

    console.log("Added view counts to posts");

  } catch (error) {
    console.error("Error generating posts:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

generatePosts();
EOF

# Run the post generation script
echo "Running post generation script..."
docker exec -e SEED_ADMIN_EMAIL="$SEED_ADMIN_EMAIL" -e SEED_ADMIN_PASSWORD="$SEED_ADMIN_PASSWORD" notes-blog-backend node -e "$(cat /tmp/generate_posts.js)"

# Clean up
rm /tmp/generate_posts.js

echo "Post generation completed!"
echo "You now have 60+ posts to test pagination functionality."
echo "Visit http://localhost:3000 to see the posts with pagination."
