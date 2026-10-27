---
description: Run database migrations and seed
agent: code
---
# Deploy Database

Apply pending Prisma migrations to Neon PostgreSQL and seed initial content.

## Steps

1. Run `npx prisma migrate deploy` to apply migrations
2. Run `npx prisma generate` to regenerate client types
3. Run `npx tsx scripts/seed.ts` to populate initial content

## Commands

```bash
npx prisma migrate deploy
npx prisma generate
npx tsx scripts/seed.ts
```

## Notes

- `migrate deploy` is safe for production — it only applies pending migrations
- `migrate dev` resets the database on drift — NEVER use in production
- Seed script uses `upsert` so it's idempotent