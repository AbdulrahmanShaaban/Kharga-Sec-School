# Security Posture

Summary of the security decisions in this portal (referenced from
`school-portal-production-spec.md`).

## Authentication & authorization

- **No public sign-up.** Better Auth runs with `disableSignUp: true`
  (`lib/auth.ts`). Accounts exist only through `scripts/bootstrap-admin.ts`
  (production) or `scripts/dev-admin.ts` (development, refuses production).
- **Role never trusted from the client.** Every admin page and admin API calls
  `requireAdmin()` (`lib/session.ts`), which re-reads the user's role from the
  database on each request.
- **Sessions**: HttpOnly cookies, `Secure` in production, `SameSite=Lax`,
  7-day expiry.
- **Secrets fail fast.** In production the app refuses to boot with a missing
  or short `BETTER_AUTH_SECRET` instead of silently using a weak default.
- **Login brute force**: Better Auth built-in rate limiting (10 requests/min
  per IP on auth endpoints).

## Public forms (complaints / suggestions)

- **Honeypot** field: bots that fill it receive a fake success and nothing is
  stored (`lib/form-guard.ts`).
- **Rate limiting** with IP-keyed hashed identifiers persisted in Neon
  (`lib/rate-limit.ts`) — shared across serverless instances, 5 requests per
  15 minutes per route.
- **Size limits**: request bodies capped at 10 KB at the route level;
  Zod schemas cap every field (complaint/suggestion text ≤ 2000 chars).
- There is intentionally **no captcha** — the school decided against it; the
  honeypot + rate limit remain.

## Privacy

- Complaints are never listed publicly; only admins can read them. The public
  response contains a random reference code only — the message and submitter
  data are never echoed back or logged.
- Suggestions become public only after an admin approves them, and then **only
  the text** is copied into `PublishedSuggestion` — no name, email, or phone.
- The audit log (`AdminAuditLog`) records actor/action/entity ids and safe
  metadata only — never complaint or suggestion content.

## Media

- Uploads are **signed server-side** and go directly from the admin's browser
  to Cloudinary; the signature pins folder and public_id.
- Before an asset is registered, the server verifies it really exists in the
  school's own cloud (`assetExistsInCloudinary`).
- Deletion goes through the server, which refuses to delete an asset still
  referenced by content (409).
- Only `school/content/` and `school/site/` folders are allowed.

## Dependency & repo hygiene

- `.env` is git-ignored; `.env.example` contains placeholders only.
- `vercel.json` contains no environment secrets.
- If secrets were ever committed, rotate them: Better Auth secret (generate a
  new one), Cloudinary API key/secret (Cloudinary dashboard → API keys), and
  update the hosting environment.

## Reporting

Report security issues privately to the school administration — do not open
public GitHub issues for vulnerabilities.
