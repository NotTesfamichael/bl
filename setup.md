# Setup Instructions

## Quick Start

1. **Copy environment variables:**

   ```bash
   cp .env.example .env.local
   ```

2. **Update .env.local with your database URL:**

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/notes_blog?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

3. **Set up the database:**

   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Default Login

- **Email:** author@example.com
- **Password:** password123

## Features Available

✅ **Rich Text Editor** - TipTap with code syntax highlighting
✅ **Authentication** - NextAuth with email/password
✅ **Database** - PostgreSQL with Prisma
✅ **Writer Dashboard** - Manage drafts and published posts
✅ **Public Blog** - View published posts
✅ **Markdown Support** - Full markdown with code blocks
✅ **Autosave** - Drafts save automatically
✅ **Publishing Workflow** - Draft → Preview → Publish

## Next Steps

- Add Google OAuth (optional)
- Configure image uploads
- Add RSS feed and sitemap
- Add e2e tests
