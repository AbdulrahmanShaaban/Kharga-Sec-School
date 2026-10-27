# Deployment Guide

## Prerequisites

- Vercel account with a Git repository
- Neon PostgreSQL database
- Cloudinary account
- hCaptcha account (for spam protection)

## Step 1: Connect Git to Vercel

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Vercel will auto-detect Next.js

## Step 2: Configure Environment Variables

In the Vercel dashboard, set these environment variables for each environment:

### Development
```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=...
HCAPTCHA_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Preview
```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://your-preview.vercel.app
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=...
HCAPTCHA_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Production
```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://yourschool.com
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=...
HCAPTCHA_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
PUBLIC_SITE_URL=https://yourschool.com
```

## Step 3: Run Database Migrations

```bash
npx prisma migrate deploy
npx prisma generate
```

## Step 4: Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Verify the deployment by visiting the URL

## Step 5: Verify

- [ ] All public pages load correctly
- [ ] Admin login works
- [ ] Content management works
- [ ] Complaint/suggestion forms work
- [ ] Cloudinary uploads work

## Rollback

To rollback to a previous deployment:
1. Go to Vercel dashboard
2. Click "Deployments"
3. Click the three dots on the previous deployment
4. Click "Promote to Production"

## Environment-Specific Notes

- **Development**: Use local SQLite or Neon dev database
- **Preview**: Use a separate Neon branch for testing
- **Production**: Use the production Neon database and Cloudinary account