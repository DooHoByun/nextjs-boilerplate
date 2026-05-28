# AGENT.md

## Overview

This repository is a Next.js 16 starter template for authenticated apps.

- Framework: Next.js 16 App Router
- Auth: Auth.js v5 with GitHub and Google providers
- Database: PostgreSQL with Prisma 7
- UI: Tailwind CSS v4 and shadcn/ui
- Language: TypeScript
- Package manager: pnpm

## Common Commands

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
```

## Environment

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

## Database Notes

- Prisma uses `prisma/schema.prisma` for models.
- Prisma connection config is managed in `prisma.config.ts`.
- This repo includes explicit Prisma generation hooks in `package.json`:
  - `postinstall`
  - `prebuild`
- If Prisma types look missing, run:

```bash
pnpm prisma generate
```

## Project Structure

```text
src/
  app/
    (auth)/sign-in/page.tsx
    (dashboard)/dashboard/page.tsx
    api/auth/[...nextauth]/
    layout.tsx
    page.tsx
  components/
    navbar.tsx
    providers.tsx
    ui/
  lib/
    auth.config.ts
    auth.ts
    db.ts
    utils.ts
  middleware.ts
prisma/
  schema.prisma
```

## Key Implementation Notes

- `src/lib/db.ts` creates the shared Prisma client using `@prisma/adapter-pg`.
- `src/lib/auth.ts` wires Auth.js to Prisma through `@auth/prisma-adapter`.
- `src/lib/auth.config.ts` defines provider configuration.
- `src/middleware.ts` protects authenticated routes.
- `src/components/providers.tsx` provides the Auth.js session context on the client.

## Working Agreements For Agents

- Prefer minimal, targeted changes over broad refactors.
- Preserve the existing App Router structure and current auth flow.
- Keep Prisma schema, auth config, and route protection consistent with each other.
- When changing authentication behavior, review both `src/lib/auth.ts` and `src/middleware.ts`.
- When changing database access, verify `prisma/schema.prisma`, `prisma.config.ts`, and `src/lib/db.ts` together.

## Known Gotchas

- A missing generated Prisma client can surface as:
  - `Module '"@prisma/client"' has no exported member 'PrismaClient'`
- In restricted or offline environments, `pnpm build` may fail when `next/font` tries to fetch Google fonts.
- Next.js may warn that `middleware.ts` should move to the newer `proxy` convention in future updates.
