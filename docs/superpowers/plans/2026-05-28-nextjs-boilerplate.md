# Next.js Boilerplate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal Next.js starter boilerplate with Tailwind CSS, shadcn/ui, Auth.js v5 (GitHub + Google), and PostgreSQL via Prisma.

**Architecture:** App Router with Route Groups — `(auth)` for sign-in/sign-up and `(dashboard)` for protected pages. Auth.js handles JWT sessions with a PrismaAdapter for persisting users and accounts. Route protection via `src/middleware.ts`.

**Tech Stack:** Next.js 16 · Auth.js v5 (`next-auth@5`) · Prisma 6 · PostgreSQL · Tailwind CSS v4 · shadcn/ui · TypeScript · zod · pnpm

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `prisma/schema.prisma` | User, Account, Session, VerificationToken models |
| Create | `src/lib/db.ts` | Prisma client singleton |
| Create | `src/lib/auth.ts` | Auth.js config, exports `auth`, `signIn`, `signOut`, `handlers` |
| Create | `src/lib/utils.ts` | `cn()` helper (clsx + tailwind-merge) |
| Create | `src/app/api/auth/[...nextauth]/route.ts` | Auth.js HTTP handler |
| Create | `src/middleware.ts` | Redirect unauthenticated users away from `/dashboard` |
| Create | `src/components/providers.tsx` | Client-side `SessionProvider` wrapper |
| Create | `src/components/navbar.tsx` | Server component navbar — shows sign in/out based on session |
| Modify | `src/app/layout.tsx` | Add `Providers` + `Navbar`, update metadata |
| Modify | `src/app/page.tsx` | Replace default page with Hero + CTA landing page |
| Create | `src/app/(auth)/layout.tsx` | Centered card layout for auth pages |
| Create | `src/app/(auth)/sign-in/page.tsx` | GitHub + Google sign-in buttons |
| Create | `src/app/(auth)/sign-up/page.tsx` | Redirect to `/sign-in` |
| Create | `src/app/(dashboard)/layout.tsx` | Dashboard shell layout |
| Create | `src/app/(dashboard)/dashboard/page.tsx` | Protected page showing session info |
| Create | `.env.example` | Environment variable template |

---

## Task 1: Install dependencies

**Files:** `package.json`, `pnpm-lock.yaml`

- [ ] **Step 1: Install runtime packages**

```bash
pnpm add next-auth@5 @auth/prisma-adapter @prisma/client zod
```

Expected output: packages added successfully, no errors.

- [ ] **Step 2: Install Prisma CLI as dev dependency**

```bash
pnpm add -D prisma
```

Expected output: prisma added to devDependencies.

- [ ] **Step 3: Verify package.json has all packages**

```bash
cat package.json
```

Expected: `"next-auth"`, `"@auth/prisma-adapter"`, `"@prisma/client"`, `"zod"`, `"prisma"` are all present.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add auth, prisma, and zod dependencies"
```

---

## Task 2: Environment variables

**Files:** `.env.example`, `.gitignore`

- [ ] **Step 1: Create `.env.example`**

```bash
cat > .env.example << 'EOF'
DATABASE_URL=postgresql://user:password@localhost:5432/myapp

AUTH_SECRET=

AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
EOF
```

- [ ] **Step 2: Ensure `.env` is in `.gitignore`**

Open `.gitignore` and confirm it contains `.env`. If not, add it:

```
.env
```

- [ ] **Step 3: Create your local `.env` from the example**

```bash
cp .env.example .env
```

Then fill in:
- `AUTH_SECRET`: generate with `pnpm dlx auth secret` or any random 32-char string
- `DATABASE_URL`: your local PostgreSQL connection string
- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`: from https://github.com/settings/developers (OAuth App, callback: `http://localhost:3000/api/auth/callback/github`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: from Google Cloud Console (callback: `http://localhost:3000/api/auth/callback/google`)

- [ ] **Step 4: Commit**

```bash
git add .env.example .gitignore
git commit -m "chore: add environment variable template"
```

---

## Task 3: Prisma schema and db singleton

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/db.ts`

- [ ] **Step 1: Initialize Prisma**

```bash
pnpm dlx prisma init --datasource-provider postgresql
```

Expected: `prisma/schema.prisma` and `.env` created (if `.env` already exists, Prisma will not overwrite it).

- [ ] **Step 2: Replace `prisma/schema.prisma` with Auth.js models**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

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

- [ ] **Step 3: Run migration to create tables**

Ensure your `DATABASE_URL` in `.env` is correct, then:

```bash
pnpm dlx prisma migrate dev --name init
```

Expected: migration file created in `prisma/migrations/`, tables created in database.

- [ ] **Step 4: Generate Prisma client**

```bash
pnpm dlx prisma generate
```

Expected: `@prisma/client` types generated.

- [ ] **Step 5: Create `src/lib/db.ts`**

```typescript
// src/lib/db.ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db =
  globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
```

- [ ] **Step 6: Type-check**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add prisma/ src/lib/db.ts
git commit -m "feat: add Prisma schema and db singleton"
```

---

## Task 4: Auth.js configuration

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Create `src/lib/auth.ts`**

```typescript
// src/lib/auth.ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
})
```

- [ ] **Step 2: Create the Auth.js API route handler**

Create directory `src/app/api/auth/[...nextauth]/` then create `route.ts`:

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
```

- [ ] **Step 3: Type-check**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/auth.ts src/app/api/
git commit -m "feat: add Auth.js v5 configuration"
```

---

## Task 5: Middleware for route protection

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Create `src/middleware.ts`**

```typescript
// src/middleware.ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith("/dashboard")) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin)
    return NextResponse.redirect(signInUrl)
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add middleware for dashboard route protection"
```

---

## Task 6: shadcn/ui setup

**Files:** `components.json`, `src/app/globals.css`, `src/lib/utils.ts`, `src/components/ui/`

- [ ] **Step 1: Initialize shadcn**

```bash
pnpm dlx shadcn@latest init
```

When prompted:
- Style: **Default**
- Base color: **Neutral**
- CSS variables: **Yes**

This creates `components.json` and updates `src/app/globals.css` with CSS variable definitions and `src/lib/utils.ts` with `cn()`.

- [ ] **Step 2: Install required shadcn components**

```bash
pnpm dlx shadcn@latest add button card input label
```

Expected: files created in `src/components/ui/` — `button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`.

- [ ] **Step 3: Verify `src/lib/utils.ts` exists with `cn()`**

The file should contain:

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

If shadcn did not create it, create it manually with the code above.

- [ ] **Step 4: Type-check**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components.json src/components/ui/ src/lib/utils.ts src/app/globals.css
git commit -m "feat: initialize shadcn/ui with button, card, input, label"
```

---

## Task 7: Providers component

**Files:**
- Create: `src/components/providers.tsx`

- [ ] **Step 1: Create `src/components/providers.tsx`**

```typescript
// src/components/providers.tsx
"use client"

import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/providers.tsx
git commit -m "feat: add SessionProvider wrapper component"
```

---

## Task 8: Navbar component and root layout

**Files:**
- Create: `src/components/navbar.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create `src/components/navbar.tsx`**

```typescript
// src/components/navbar.tsx
import Link from "next/link"
import { auth, signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"

export async function Navbar() {
  const session = await auth()

  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">
          MyApp
        </Link>
        <nav className="flex items-center gap-4">
          {session ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/" })
                }}
              >
                <Button type="submit" variant="outline">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <Link href="/sign-in">
              <Button>Sign in</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Update `src/app/layout.tsx`**

Replace the entire file with:

```typescript
// src/app/layout.tsx
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Navbar } from "@/components/navbar"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "MyApp",
  description: "Next.js boilerplate with auth and database",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Type-check**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/navbar.tsx src/app/layout.tsx
git commit -m "feat: add Navbar component and update root layout"
```

---

## Task 9: Landing page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace `src/app/page.tsx` with landing page**

```typescript
// src/app/page.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">Welcome to MyApp</h1>
        <p className="text-xl text-muted-foreground max-w-md">
          A Next.js boilerplate with auth, database, and a modern UI stack.
          Ready to build on.
        </p>
      </div>
      <Link href="/sign-in">
        <Button size="lg">Get started</Button>
      </Link>
    </main>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Build check**

```bash
pnpm build
```

Expected: build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add landing page with hero and CTA"
```

---

## Task 10: Auth pages (sign-in + sign-up)

**Files:**
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/(auth)/sign-in/page.tsx`
- Create: `src/app/(auth)/sign-up/page.tsx`

- [ ] **Step 1: Create `src/app/(auth)/layout.tsx`**

```typescript
// src/app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-4">
      {children}
    </main>
  )
}
```

- [ ] **Step 2: Create `src/app/(auth)/sign-in/page.tsx`**

```typescript
// src/app/(auth)/sign-in/page.tsx
import { signIn } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function SignInPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Choose a provider to continue</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <form
          action={async () => {
            "use server"
            await signIn("github", { redirectTo: "/dashboard" })
          }}
        >
          <Button type="submit" variant="outline" className="w-full">
            Continue with GitHub
          </Button>
        </form>
        <form
          action={async () => {
            "use server"
            await signIn("google", { redirectTo: "/dashboard" })
          }}
        >
          <Button type="submit" variant="outline" className="w-full">
            Continue with Google
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: Create `src/app/(auth)/sign-up/page.tsx`**

```typescript
// src/app/(auth)/sign-up/page.tsx
import { redirect } from "next/navigation"

export default function SignUpPage() {
  redirect("/sign-in")
}
```

- [ ] **Step 4: Type-check**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(auth\)/
git commit -m "feat: add sign-in and sign-up pages"
```

---

## Task 11: Dashboard page

**Files:**
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Create `src/app/(dashboard)/layout.tsx`**

```typescript
// src/app/(dashboard)/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
```

- [ ] **Step 2: Create `src/app/(dashboard)/dashboard/page.tsx`**

```typescript
// src/app/(dashboard)/dashboard/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/sign-in")

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle>Session Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Name: </span>
            {session.user?.name ?? "—"}
          </p>
          <p>
            <span className="font-medium">Email: </span>
            {session.user?.email ?? "—"}
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
```

- [ ] **Step 3: Type-check**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Full build check**

```bash
pnpm build
```

Expected: build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(dashboard\)/
git commit -m "feat: add protected dashboard page"
```

---

## Task 12: Final verification

- [ ] **Step 1: Start dev server**

```bash
pnpm dev
```

- [ ] **Step 2: Verify these routes work**

Open `http://localhost:3000` and check:

| URL | Expected |
|-----|----------|
| `/` | Hero page with "Get started" button |
| `/sign-in` | Card with GitHub and Google buttons |
| `/sign-up` | Redirects to `/sign-in` |
| `/dashboard` | Redirects to `/sign-in` (not authenticated) |

After signing in with a provider:

| URL | Expected |
|-----|----------|
| `/dashboard` | Shows name and email from session |
| Navbar | Shows "Dashboard" link + "Sign out" button |
| Sign out | Redirects to `/` and navbar shows "Sign in" |

- [ ] **Step 3: Final commit if any fixes were made**

```bash
git add -A
git commit -m "fix: final verification fixes"
```
