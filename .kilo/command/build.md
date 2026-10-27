---
description: Run TypeScript typecheck and Next.js build
agent: code
---
# Build

Verify the project compiles cleanly with TypeScript 7 and Next.js 16.

## Commands

```bash
npx tsc --noEmit
npm run build
```

## Expected Output

- TypeScript: no errors
- Next.js build: 36 routes, all prerendered except API routes