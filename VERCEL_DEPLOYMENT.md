# Vercel Deployment Guide for LinkBird

## Setting Up Environment Variables in Vercel

When deploying your LinkBird application to Vercel, you'll need to configure environment variables. Here's how to do it:

1. **Sign in to Vercel** and navigate to your project dashboard

2. **Go to Settings > Environment Variables**

3. **Add the following environment variables:**

   | Key | Value | Description |
   |-----|-------|-------------|
   | `DATABASE_URL` | `postgres://username:password@host:port/database` | Your PostgreSQL database connection string |
   | `NEXTAUTH_SECRET` | `your-random-secret-string` | A random string for NextAuth session encryption |
   | `NEXTAUTH_URL` | `https://your-vercel-domain.vercel.app` | Your Vercel deployment URL |
   | `GOOGLE_CLIENT_ID` | `your-google-client-id` | Your Google OAuth client ID |
   | `GOOGLE_CLIENT_SECRET` | `your-google-client-secret` | Your Google OAuth client secret |

4. **Click Save** to store your environment variables

## Database Setup

For your production database, you can use services like:

- [Neon](https://neon.tech/) (has a free tier)
- [Supabase](https://supabase.com/) (has a free tier)
- [Railway](https://railway.app/) (paid service)
- [PlanetScale](https://planetscale.com/) (for MySQL)

After setting up your database, update the `DATABASE_URL` environment variable in Vercel with the connection string.

## Build Configuration

In your Vercel project settings:

1. **Framework Preset**: Next.js (should be auto-detected)
2. **Build Command**: `npm run vercel-build` (this will run migrations before building)
3. **Output Directory**: `.next` (default)
4. **Install Command**: `npm install` (default)

## Troubleshooting

If you encounter issues during deployment:

1. Check Vercel's build logs for errors
2. Ensure all environment variables are correctly set
3. Verify your database connection is working
4. Check that your authentication providers (Google) are configured for your production URL

## Continuous Deployment

Vercel automatically sets up continuous deployment from your GitHub repository:

1. Any push to your main branch will trigger a new deployment
2. You can configure preview deployments for pull requests
3. You can set up branch deployments for staging environments