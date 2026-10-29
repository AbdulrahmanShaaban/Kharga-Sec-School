# مدرسة الخارجة الثانوية بنين — البوابة الرسمية

Official Arabic (RTL) portal for **Kharga Secondary School for Boys**.

Public site: news, activities, competitions, about/contact, plus private
complaints and published-after-approval suggestions. Admin panel at `/admin`.

## Tech Stack

- **Next.js 16** (App Router, Cache Components) + TypeScript
- **Tailwind CSS 4** — custom institutional design system (navy/orange/teal, Cairo font)
- **Prisma 7** + **Neon PostgreSQL**
- **Better Auth** — email/password admin sessions, public sign-up disabled
- **Cloudinary** — signed direct browser uploads (images never pass through the server)

Anti-spam on the public forms: hidden honeypot + database-backed rate limiting.
(There is intentionally **no captcha** — the school decided against it.)

## Getting Started

```bash
cp .env.example .env
# Fill in DATABASE_URL, BETTER_AUTH_SECRET, CLOUDINARY_* (see .env.example)
npm install
npm run db:migrate        # apply migrations
npm run db:seed           # development drafts only (refuses in production)
npm run dev:admin         # create the development admin account
npm run dev
```

Sign in at <http://localhost:3000/admin/login>.

Development admin (local only): `devadmin@localhost.test` / `dev-admin-password-123`

## Admin bootstrap (production)

Admin accounts can only be created by the trusted bootstrap procedure —
see [docs/ADMIN-SETUP.md](docs/ADMIN-SETUP.md):

```bash
ADMIN_BOOTSTRAP_EMAIL=<school-approved address> npm run bootstrap:admin
```

## Environment Variables

See [.env.example](.env.example) for all required variables. Never commit `.env`.

> **Security note:** if this repository was ever pushed with a `vercel.json`
> `env` block, rotate those secrets (Better Auth secret, Cloudinary API key/secret)
> in the Cloudinary dashboard and Vercel project settings, then remove the block.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run db:migrate` | Apply pending Prisma migrations |
| `npm run db:seed` | Seed **development drafts only** (refuses in production) |
| `npm run dev:admin` | Create/refresh the development admin (refuses in production) |
| `npm run bootstrap:admin` | Trusted production admin bootstrap |

## Project Layout

- `app/` — public pages (`page`, `news`, `activities`, `competitions`, `about`,
  `contact`, `complaints`, `suggestions`, `privacy`) and `app/admin/*` (guarded panel)
- `app/api/public/*` — complaint/suggestion submission (honeypot + rate limit)
- `app/api/admin/*` — admin JSON APIs (server-side role check on every route)
- `components/site/*` — public header/footer/content primitives
- `components/admin/*` — admin form/action components
- `lib/` — auth, session guard, validation (Zod), rate limiting, audit log, Cloudinary
- `prisma/` — schema + migrations
- `scripts/` — admin bootstrap, dev admin, dev-only seed

## Documentation

- [docs/ADMIN-SETUP.md](docs/ADMIN-SETUP.md) — creating the first admin
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — deploying to Vercel
- [docs/SECURITY.md](docs/SECURITY.md) — security posture
- [docs/BACKUP-RESTORE.md](docs/BACKUP-RESTORE.md) — database backup/restore
- 
