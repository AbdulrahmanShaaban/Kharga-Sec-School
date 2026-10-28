# Admin Setup

How to create and manage the first administrator account.

## Prerequisites

1. The school must have approved the admin email address
   (`alkhargasecondaryschoolforboys@gmail.com` unless changed)
2. The database must be provisioned and `DATABASE_URL` configured
3. `BETTER_AUTH_SECRET` must be set (random string, ≥ 32 characters)

## Bootstrap (trusted procedure)

Run in a trusted environment (local machine or secure server), **never** from a
public surface:

```bash
ADMIN_BOOTSTRAP_EMAIL=alkhargasecondaryschoolforboys@gmail.com npm run bootstrap:admin
```

The script will:

1. Refuse to run if `ADMIN_BOOTSTRAP_EMAIL` is missing or differs from the
   school-approved address
2. Prompt for a password interactively (≥ 10 characters; never logged or stored)
3. Create the user with role `ADMIN` and a Better Auth credential (scrypt hash)
4. Re-running never overwrites an existing ADMIN account's password

Then sign in at `/admin/login`.

## Development admin

For local work only:

```bash
npm run dev:admin
# devadmin@localhost.test / dev-admin-password-123
```

This script refuses to run when `NODE_ENV=production` and uses a clearly fake
address that can never collide with the school-approved admin.

## Why there is no public sign-up

Public registration is disabled in `lib/auth.ts`
(`emailAndPassword.disableSignUp`). The only account-creation paths are the
bootstrap script and the development script — both run outside the web app
(spec §10).

## Security Notes

- Passwords are hashed by Better Auth's own hasher (scrypt) — the bootstrap
  uses `better-auth/crypto.hashPassword` so hashes always match sign-in
- Sessions are HttpOnly cookies (Secure + SameSite=Lax in production)
- Every admin page and admin API re-reads the role from the database
  (`lib/session.ts#requireAdmin`) — the session cookie is never trusted for role
- Sign-in endpoints are rate-limited by Better Auth (10 requests/min per IP)
- Every admin action is written to `AdminAuditLog` without personal data
- Deleting an admin account: delete the `User` row (cascades to sessions and
  accounts) from a trusted environment
