---
description: Bootstrap admin account
agent: code
---
# Bootstrap Admin

Create the first admin user for the Kharga portal.

## Prerequisites

- `ADMIN_BOOTSTRAP_EMAIL` must equal `alkhargasecondaryschoolforboys@gmail.com`
- Database must be provisioned and migrations applied

## Command

```bash
ADMIN_BOOTSTRAP_EMAIL=alkhargasecondaryschoolforboys@gmail.com npx tsx scripts/bootstrap-admin.ts
```

The script will prompt for a password (min 8 chars). It creates the user via Prisma directly with bcrypt hash.

## Security

- Run only in a trusted environment
- Never commit the admin password
- The email is not a secret but must match the approved address