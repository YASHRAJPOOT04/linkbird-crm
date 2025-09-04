# LinkBird CRM

LinkBird is a modern CRM application built with Next.js, Drizzle ORM, and NextAuth for authentication. This project was bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment Guide

### Prerequisites

1. A GitHub account
2. A Vercel account
3. A PostgreSQL database (Neon, Supabase, Railway, etc.)
4. Google OAuth credentials (for authentication)

### Environment Variables

Copy the `.env.example` file to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Required environment variables:

- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_SECRET`: A random string for NextAuth session encryption
- `NEXTAUTH_URL`: Your application URL (http://localhost:3000 for development)
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret

### Database Setup

Generate database migrations:

```bash
npm run db:generate
```

Apply migrations to your database:

```bash
npm run db:migrate
```

### Deploy on Vercel

1. Push your code to GitHub:

```bash
git push -u origin main
```

2. Import your repository in Vercel:
   - Go to [Vercel](https://vercel.com/new)
   - Connect to your GitHub repository
   - Configure environment variables
   - Use `npm run vercel-build` as the build command
   - Deploy

3. Your application will be available at the provided Vercel URL.

For more details, check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
