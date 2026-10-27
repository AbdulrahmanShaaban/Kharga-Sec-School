<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Agent Rules

### Skill Usage (MANDATORY)
- **Always check available skills before starting any non-trivial task.** Use the `skill` tool to load a skill when its description matches the task.
- **Never guess or reason from memory alone** when a skill exists for the task. Skills contain up-to-date, repo-specific guidance.
- If no skill matches, proceed with standard best practices — but log which skills were checked and why none applied.
- After completing a task, consider using `agent-self-evaluation` to rate your output.

### TypeScript Discipline (MANDATORY)
- **NEVER use `any` unless absolutely unavoidable.** Use proper types from `@prisma/client`, Zod schemas, or custom interfaces.
- **NEVER use `@ts-nocheck`** in production code. Fix the underlying type error instead.
- Run `npx prisma generate` after schema changes to regenerate client types.
- Use `npx tsc --noEmit` to verify type safety before build.
- Prefer `unknown` over `any` for untrusted input; use type guards or Zod for parsing.

### Prisma Best Practices
- Always use `npx prisma generate` to generate types after schema changes.
- Use the generated `PrismaClient` type — do not cast to `any`.
- For build-time safe stubs, create a properly typed mock that implements the Prisma delegate interface.

### Code Quality
- Run `npm run lint` and `npm run build` after every change.
- Do not commit secrets — verify `.env` is in `.gitignore`.
- Follow existing code conventions; mimic surrounding code style.