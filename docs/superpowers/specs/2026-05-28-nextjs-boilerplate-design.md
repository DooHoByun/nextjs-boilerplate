# Next.js Boilerplate Design

**Date:** 2026-05-28  
**Purpose:** Personal project starter — eliminate repetitive setup when starting new Next.js projects.

---

## Overview

A minimal, opinionated Next.js boilerplate with authentication, database, and a modern UI stack. Designed to be copied and extended quickly without unnecessary complexity.

---

## Tech Stack

| Package | Version | Role |
|---------|---------|------|
| next | 15.x | Framework |
| next-auth (Auth.js) | 5.x | Authentication |
| @prisma/client | 6.x | Database ORM |
| tailwindcss | 4.x | Styling |
| shadcn/ui | latest | UI components |
| typescript | 5.x | Type safety |
| zod | 3.x | Schema validation |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── (dashboard)/
│   │   └── dashboard/page.tsx
│   ├── api/
│   │   └── auth/[...nextauth]/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/              # shadcn auto-generated components
│   ├── navbar.tsx
│   └── providers.tsx
├── lib/
│   ├── auth.ts          # Auth.js config
│   ├── db.ts            # Prisma singleton
│   └── utils.ts         # cn() and shared utilities
└── prisma/
    └── schema.prisma
```

**Key decisions:**
- Route Groups `(auth)` and `(dashboard)` isolate layouts without affecting the URL path.
- `lib/db.ts` uses a singleton pattern to prevent Prisma client duplication in development hot-reload.
- `components/ui/` is reserved for shadcn — do not place custom components here.

---

## Authentication

- **Provider:** Auth.js v5 (NextAuth)
- **Social providers:** GitHub and Google (configured via `.env`)
- **Strategy:** No email/password — social-only keeps the auth surface small and secure
- **Session:** JWT-based (stateless), no database session table required

Route protection is handled by `middleware.ts`. Any request to `/dashboard/*` by an unauthenticated user is redirected to `/sign-in`.

Server components use the `auth()` helper directly for session checks.

---

## Database

- **Engine:** PostgreSQL
- **ORM:** Prisma 6.x

### Prisma Schema

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with Hero section and CTA button |
| `/sign-in` | Social login buttons (GitHub, Google) |
| `/sign-up` | Redirects to `/sign-in` (social-only flow) |
| `/dashboard` | Protected page showing session info |

---

## Components

- `components/ui/` — Button, Card, Input, Label (shadcn, auto-generated)
- `components/navbar.tsx` — Shows login/logout based on session state
- `components/providers.tsx` — Wraps app with SessionProvider

---

## Environment Variables

`.env.example` is committed to the repo. `.env` is gitignored.

```env
DATABASE_URL=
AUTH_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## Explicitly Out of Scope

The following are intentionally excluded to keep the boilerplate lean:

- Testing setup (Jest, Playwright)
- Internationalization (i18n)
- Email sending
- Payment integration
- Role-based access control
- Dark mode toggle (Tailwind handles via class strategy if needed later)
