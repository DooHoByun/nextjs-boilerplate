# Next.js Boilerplate Design Spec

**Date:** 2026-05-28  
**Status:** Approved

---

## Overview

A minimal Next.js boilerplate that provides a clean, production-ready starting point with authentication, database, and UI tooling pre-configured. The goal is zero unnecessary code — every file in the boilerplate serves a purpose on any project that uses it.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Auth | NextAuth.js v5 (Auth.js) |
| Auth Provider | Google OAuth only |
| ORM | Prisma |
| Database | PostgreSQL |
| Package Manager | pnpm |

---

## Project Structure

```
src/
  app/
    (auth)/
      login/
        page.tsx              # Login page — Google sign-in button
    (protected)/
      dashboard/
        page.tsx              # Authenticated users only
    layout.tsx                # Root layout — SessionProvider, ThemeProvider, Geist font
    page.tsx                  # Home page (public)
  components/
    ui/                       # shadcn/ui components
    auth/
      sign-in-button.tsx      # Google OAuth sign-in button
    theme-toggle.tsx          # Dark/light mode toggle
  lib/
    auth.ts                   # NextAuth v5 config — Google provider, Prisma adapter
    db.ts                     # Prisma client singleton
  types/
    next-auth.d.ts            # Session type augmentation (adds user.id)
prisma/
  schema.prisma               # DB schema
middleware.ts                 # Route protection
.env.example                  # Required environment variables
```

---

## Authentication & Database

### NextAuth v5

- Google OAuth provider
- Prisma adapter — sessions stored in DB (not JWT)
- Session strategy: `database`
- `Session` type extended to include `user.id`

### Prisma Schema

Four NextAuth-required tables:

- `User` — `id`, `name`, `email`, `image`, `emailVerified`, `createdAt`
- `Account` — OAuth account linking
- `Session` — active sessions
- `VerificationToken` — email verification tokens

Database provider: `postgresql`, connection via `DATABASE_URL` env var.

### Middleware

File: `middleware.ts`

- Protects `/dashboard` and all paths beneath it
- Unauthenticated requests redirect to `/login`
- Authenticated users visiting `/login` redirect to `/dashboard`

### Environment Variables

```
DATABASE_URL=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
```

---

## Pages

### Home (`/`)

Public page. Brief service description and a "Get Started" button linking to `/login`.

### Login (`/login`)

Single shadcn `Card` containing a Google sign-in button. No username/password fields.

### Dashboard (`/dashboard`)

Displays the signed-in user's avatar, name, and email. Includes a sign-out button via `DropdownMenu`.

---

## UI & Theming

**shadcn/ui components installed at init:**
`Button`, `Card`, `Avatar`, `DropdownMenu`, `Separator`

**Dark mode:** `next-themes` — `ThemeToggle` component placed in the header.

**Font:** Geist Sans via `next/font/google`.

---

## Tooling & DX

**TypeScript:** `strict` mode, `@/*` path alias mapped to `src/`.

**Linting/Formatting:**
- ESLint with Next.js default config
- Prettier with `prettier-plugin-tailwindcss`

**package.json scripts:**

```json
{
  "dev": "next dev",
  "build": "next build",
  "db:push": "prisma db push",
  "db:studio": "prisma studio"
}
```

**README covers:**
1. Clone and install
2. Copy `.env.example` to `.env` and fill values
3. Google OAuth console setup (with link)
4. `pnpm db:push` to sync schema
5. `pnpm dev` to start

---

## Out of Scope

- Email/password credentials auth
- Additional OAuth providers (GitHub, etc.)
- CRUD example pages
- Monorepo structure
- Deployment configuration (Vercel, Docker, etc.)
