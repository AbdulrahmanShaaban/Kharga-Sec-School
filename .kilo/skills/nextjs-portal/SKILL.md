---
name: nextjs-portal
description: Next.js 16 patterns for the Kharga portal — App Router, API routes, auth, TypeScript 7
---
# Next.js Patterns — Kharga Secondary School Portal

## Framework

- Next.js 16.4.3 (App Router)
- React 19.3.0
- TypeScript 7.0.2 (native Go port)
- Tailwind CSS 4 + shadcn/ui

## Project Structure

```
app/
  (public pages)     — layout, home, news, activities, competitions, etc.
  admin/             — admin dashboard, content, complaints, suggestions, settings, media
  api/
    admin/           — authenticated API routes
    public/          — public form submission routes
lib/                 — db, auth, validation, rate-limit, cloudinary, utils
components/          — ui/, layout.tsx
scripts/             — seed.ts, bootstrap-admin.ts
```

## Key Patterns

### Auth

- Better Auth 1.7.14
- Session checked via `auth.api.getSession({ headers: await headers() })`
- Admin routes check `session.user.role === "ADMIN"`
- No public registration — admin bootstrapped via `scripts/bootstrap-admin.ts`

### API Routes

- All admin routes: check auth, return 403 if not admin
- Public routes: rate limit + hCaptcha + honeypot
- Error responses: consistent `{ error: "message" }` format
- Never log sensitive data (messages, hCaptcha tokens, PII)

### Pages

- Public pages: static prerender with `await` for data
- Detail pages: use `notFound()` when item is null (not `redirect()`)
- Admin pages: client components with `useEffect` + `fetch`

## TypeScript 7 Rules

- `target: "ES2022"`, `rootDir: "."`, `types: []`
- No `any` — use proper Prisma types or `unknown`
- No `@ts-nocheck`
- Run `npx tsc --noEmit` before build

## Build

```bash
npm run build
```

Build output: 36 routes, all prerendered except API routes.