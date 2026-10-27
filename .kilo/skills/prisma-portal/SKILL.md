---
name: prisma-portal
description: Prisma patterns for the Kharga Secondary School portal — schema, queries, migrations against Neon PostgreSQL
---
# Prisma Patterns — Kharga Secondary School Portal

## Database

- Provider: PostgreSQL (Neon)
- Connection: `DATABASE_URL` from `.env`
- Adapter: `@prisma/adapter-pg` (PrismaPg)
- Client: `lib/db.ts` — singleton with Proxy stub fallback

## Schema

All models in `prisma/schema.prisma`:
- `User` / `Session` / `Account` / `Verification` — Better Auth
- `SiteSettings` — single-row config
- `ContentItem` / `ContentMedia` — news, activities, competitions
- `Complaint` — fully private
- `SuggestionPrivate` / `PublishedSuggestion` — moderated
- `AdminAuditLog` — audit trail
- `RateLimitEntry` — rate limiting

## Commands

```bash
# Apply migrations
npx prisma migrate deploy

# Generate client after schema changes
npx prisma generate

# Seed initial content
npx tsx scripts/seed.ts

# Bootstrap admin
ADMIN_BOOTSTRAP_EMAIL=alkhargasecondaryschoolforboys@gmail.com npx tsx scripts/bootstrap-admin.ts
```

## Type Safety

- Use `Prisma.ContentItemGetPayload<{ include: { media: true } }>` for queries with media
- Use `findFirstOrThrow` over `findUniqueOrThrow` when filtering by non-unique fields
- Map entities to DTOs before returning from API routes
- Never use `any` — use `unknown` for untrusted input

## Common Traps

- `updateMany` returns `{ count }`, not records
- `@updatedAt` does NOT fire on `updateMany` — set manually
- `migrate deploy` in CI/CD, `migrate dev` only locally
- `migrate dev` can reset the DB on drift