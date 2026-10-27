# Admin Setup

This document describes how to set up the first administrator account.

## Prerequisites

1. The school must have approved the use of the email `alkhargasecondaryschoolforboys@gmail.com`
2. The database must be provisioned and `DATABASE_URL` configured
3. Cloudinary and hCaptcha accounts must be set up

## Bootstrap Admin

Run this command in a trusted environment (e.g., a secure server or local machine):

```bash
npx tsx scripts/bootstrap-admin.ts
```

The script will:
1. Verify the email matches `ADMIN_BOOTSTRAP_EMAIL` env variable
2. Create the user if they don't exist
3. Set their role to `ADMIN`
4. Prompt for a password (securely, not logged)

**Never** run this in production without proper security measures.

## Manual Setup via SQL

If the bootstrap script is not available, you can create the admin directly:

```sql
INSERT INTO "User" (id, name, email, "emailVerified", role, "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Admin', 'alkhargasecondaryschoolforboys@gmail.com', true, 'ADMIN', now(), now())
ON CONFLICT (email) DO UPDATE SET role = 'ADMIN';
```

Then sign in via the login page with the password you set.

## Security Notes

- The admin email is not a secret, but it must match the approved email
- Passwords are hashed using bcrypt via Better Auth
- Sessions are stored as HttpOnly cookies
- MFA should be enabled before production launch