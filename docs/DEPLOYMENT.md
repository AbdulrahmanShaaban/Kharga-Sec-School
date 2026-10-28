# Deployment Guide

## Prerequisites

- Vercel account with a Git repository
- Neon PostgreSQL database
- Cloudinary account (for the media library)

## Step 1: Connect Git to Vercel

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Vercel auto-detects Next.js; `vercel.json` sets the build commands
   (`prisma migrate deploy && prisma generate && next build`)

## Step 2: Configure Environment Variables

Set these in the Vercel dashboard (Project → Settings → Environment Variables)
for each environment. **Never** put secrets in `vercel.json`.

```
DATABASE_URL=postgresql://...            # Neon connection string
BETTER_AUTH_SECRET=...                   # random, ≥ 32 chars
BETTER_AUTH_URL=https://yourschool.com   # production URL (http://localhost:3000 in dev)
NEXT_PUBLIC_SITE_URL=https://yourschool.com
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Development-only extras (do NOT set in production):

```
DEV_ADMIN_EMAIL=devadmin@localhost.test
DEV_ADMIN_PASSWORD=dev-admin-password-123
```

## Step 3: Verify the deployment

- [ ] All public pages load (`/`, `/news`, `/activities`, `/competitions`, `/about`, `/contact`)
- [ ] `/complaints` submits and returns a reference code
- [ ] `/suggestions` submits; approving from the admin publishes text only
- [ ] Admin login works at `/admin/login`
- [ ] Content create/edit/archive works
- [ ] Media upload (sign → Cloudinary → register) and delete work
- [ ] Settings save and appear on the public site
- [ ] Anonymous requests to `/api/admin/*` return 403
- [ ] `/sitemap.xml` uses the real domain (not localhost)
- [ ] `robots.txt` disallows `/admin`

## Rollback

1. Vercel dashboard → Deployments
2. Three dots on the previous healthy deployment → "Promote to Production"

## Environment-Specific Notes

- **Development**: local `.env` + Neon dev database; `npm run db:seed` and
  `npm run dev:admin` refuse to run in production
- **Preview**: use a separate Neon branch; point its `DATABASE_URL` at the branch
- **Production**: production Neon database + the school-approved Cloudinary;
  bootstrap the admin once via `npm run bootstrap:admin` (docs/ADMIN-SETUP.md)

## Vercel Hobby limits

- Function bodies are capped at 4.5 MB — that is why images upload **directly**
  to Cloudinary with server-signed parameters instead of through the API routes
- Serverless duration limits: all queries are indexed (see `prisma/schema.prisma`)
