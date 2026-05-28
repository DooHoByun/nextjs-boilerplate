# Next.js Boilerplate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a minimal Next.js boilerplate with App Router, Tailwind CSS, shadcn/ui, NextAuth v5 (Google OAuth), and Prisma (PostgreSQL).

**Architecture:** Single Next.js App Router application with route groups `(auth)` and `(protected)` for layout separation. NextAuth v5 handles Google OAuth via Prisma adapter for database session storage. Middleware enforces route protection. All files are TypeScript-strict.

**Tech Stack:** Next.js 15+ (App Router), TypeScript (strict), Tailwind CSS, shadcn/ui, NextAuth v5 (`next-auth@beta`), `@auth/prisma-adapter`, Prisma, PostgreSQL, next-themes, pnpm

---

## File Map

| Path | Purpose |
|---|---|
| `src/app/layout.tsx` | Root layout — Geist font, Providers |
| `src/app/page.tsx` | Home page (public) |
| `src/app/(auth)/login/page.tsx` | Login page with Google button |
| `src/app/(protected)/dashboard/page.tsx` | Auth-gated dashboard |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth HTTP handlers |
| `src/components/providers.tsx` | Client providers: SessionProvider + ThemeProvider |
| `src/components/theme-toggle.tsx` | Dark/light mode toggle |
| `src/components/auth/sign-in-button.tsx` | Google sign-in button |
| `src/components/ui/` | shadcn/ui generated components |
| `src/lib/auth.ts` | NextAuth v5 config (Google, Prisma adapter) |
| `src/lib/db.ts` | Prisma client singleton |
| `src/types/next-auth.d.ts` | Session type augmentation (adds `user.id`) |
| `middleware.ts` | Route protection |
| `prisma/schema.prisma` | NextAuth DB schema |
| `.env.example` | Environment variable template |
| `README.md` | Setup instructions |

---

### Task 1: Initialize Next.js project

**Files:**
- Create: entire project scaffold via `create-next-app`

- [ ] **Step 1: Scaffold project with create-next-app**

Run from the project root (`C:\Users\HOME\harness_project\test2`):

```bash
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

When prompted about the non-empty directory, confirm **Yes**. If asked about Turbopack, accept the default (Yes).

- [ ] **Step 2: Verify the build compiles**

```bash
pnpm build
```

Expected: build completes with no errors. Output ends with `✓ Compiled successfully`.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: initialize Next.js project"
```

---

### Task 2: Add Prettier with Tailwind plugin

**Files:**
- Create: `.prettierrc`
- Create: `.prettierignore`

- [ ] **Step 1: Install packages**

```bash
pnpm add -D prettier prettier-plugin-tailwindcss
```

- [ ] **Step 2: Create `.prettierrc`**

```json
{
  "semi": false,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

- [ ] **Step 3: Create `.prettierignore`**

```
.next
node_modules
pnpm-lock.yaml
```

- [ ] **Step 4: Commit**

```bash
git add .prettierrc .prettierignore
git commit -m "chore: add Prettier with Tailwind CSS plugin"
```

---

### Task 3: Initialize shadcn/ui and install base components

**Files:**
- Create: `components.json`
- Create: `src/lib/utils.ts`
- Create: `src/components/ui/button.tsx`, `card.tsx`, `avatar.tsx`, `dropdown-menu.tsx`, `separator.tsx`

- [ ] **Step 1: Initialize shadcn/ui**

```bash
pnpm dlx shadcn@latest init -d
```

The `-d` flag accepts all defaults: New York style, zinc base color, CSS variables enabled.

- [ ] **Step 2: Install required components**

```bash
pnpm dlx shadcn@latest add button card avatar dropdown-menu separator
```

- [ ] **Step 3: Verify build**

```bash
pnpm build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add shadcn/ui with base components"
```

---

### Task 4: Install Prisma and write NextAuth schema

**Files:**
- Create: `prisma/schema.prisma`
- Modify: `.gitignore` (ensure `.env` is excluded)

- [ ] **Step 1: Install Prisma**

```bash
pnpm add @prisma/client
pnpm add -D prisma
```

- [ ] **Step 2: Initialize Prisma**

```bash
pnpm dlx prisma init --datasource-provider postgresql
```

This creates `prisma/schema.prisma` and adds `DATABASE_URL` to `.env`.

- [ ] **Step 3: Replace `prisma/schema.prisma` with the NextAuth schema**

```prisma
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
  createdAt     DateTime  @default(now())
  accounts      Account[]
  sessions      Session[]
}

model Account {
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
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([provider, providerAccountId])
}

model Session {
  sessionToken String   @unique
  userId       String
  expires      DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@id([identifier, token])
}
```

- [ ] **Step 4: Generate Prisma client**

```bash
pnpm dlx prisma generate
```

Expected: output includes `Generated Prisma Client`.

- [ ] **Step 5: Verify `.gitignore` excludes `.env`**

Open `.gitignore` and confirm `.env` is listed. If missing, add it:

```
.env
.env.local
```

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma .gitignore
git commit -m "feat: add Prisma schema with NextAuth tables"
```

---

### Task 5: Create Prisma client singleton

**Files:**
- Create: `src/lib/db.ts`

- [ ] **Step 1: Create `src/lib/db.ts`**

```typescript
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
```

- [ ] **Step 2: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/db.ts
git commit -m "feat: add Prisma client singleton"
```

---

### Task 6: Install and configure NextAuth v5

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/types/next-auth.d.ts`

- [ ] **Step 1: Install NextAuth v5 and Prisma adapter**

```bash
pnpm add next-auth@beta @auth/prisma-adapter
```

- [ ] **Step 2: Create `src/lib/auth.ts`**

```typescript
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [Google],
  session: { strategy: "database" },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
})
```

- [ ] **Step 3: Create `src/types/next-auth.d.ts`**

```typescript
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts src/types/next-auth.d.ts
git commit -m "feat: configure NextAuth v5 with Google provider and Prisma adapter"
```

---

### Task 7: Create NextAuth API route

**Files:**
- Create: `src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Create `src/app/api/auth/[...nextauth]/route.ts`**

```typescript
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
```

- [ ] **Step 2: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/auth/[...nextauth]/route.ts"
git commit -m "feat: add NextAuth API route handler"
```

---

### Task 8: Configure route-protection middleware

**Files:**
- Create: `middleware.ts` (at project root, alongside `src/`)

- [ ] **Step 1: Create `middleware.ts`**

```typescript
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat: add route protection middleware"
```

---

### Task 9: Create Providers component and update root layout

**Files:**
- Create: `src/components/providers.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Install next-themes**

```bash
pnpm add next-themes
```

- [ ] **Step 2: Create `src/components/providers.tsx`**

```typescript
"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  )
}
```

- [ ] **Step 3: Replace `src/app/layout.tsx`**

```typescript
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Next.js Boilerplate",
  description: "Next.js + Tailwind + shadcn/ui + NextAuth + Prisma",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/providers.tsx src/app/layout.tsx
git commit -m "feat: add Providers component and update root layout"
```

---

### Task 10: Create ThemeToggle component

**Files:**
- Create: `src/components/theme-toggle.tsx`

- [ ] **Step 1: Verify lucide-react is installed**

Check `package.json` — shadcn/ui installs it as a dependency. If `lucide-react` is not listed, run:

```bash
pnpm add lucide-react
```

- [ ] **Step 2: Create `src/components/theme-toggle.tsx`**

```typescript
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/theme-toggle.tsx
git commit -m "feat: add ThemeToggle component"
```

---

### Task 11: Create SignInButton component

**Files:**
- Create: `src/components/auth/sign-in-button.tsx`

- [ ] **Step 1: Create `src/components/auth/sign-in-button.tsx`**

```typescript
"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function SignInButton() {
  return (
    <Button
      className="w-full"
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
    >
      Continue with Google
    </Button>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/auth/sign-in-button.tsx
git commit -m "feat: add SignInButton component"
```

---

### Task 12: Create Home page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace `src/app/page.tsx`**

```typescript
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <h1 className="text-4xl font-bold">Next.js Boilerplate</h1>
      <p className="max-w-md text-center text-muted-foreground">
        Next.js · Tailwind · shadcn/ui · NextAuth · Prisma
      </p>
      <Button asChild>
        <Link href="/login">Get Started</Link>
      </Button>
    </main>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add home page"
```

---

### Task 13: Create Login page

**Files:**
- Create: `src/app/(auth)/login/page.tsx`

- [ ] **Step 1: Create `src/app/(auth)/login/page.tsx`**

```typescript
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SignInButton } from "@/components/auth/sign-in-button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Use your Google account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <SignInButton />
        </CardContent>
      </Card>
    </main>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(auth)/login/page.tsx"
git commit -m "feat: add login page"
```

---

### Task 14: Create UserMenu component and Dashboard page

**Files:**
- Create: `src/components/auth/user-menu.tsx`
- Create: `src/app/(protected)/dashboard/page.tsx`

- [ ] **Step 1: Create `src/components/auth/user-menu.tsx`**

This is a client component — it needs `"use client"` because DropdownMenu uses browser state.

```typescript
"use client"

import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserMenuProps {
  name: string | null | undefined
  email: string | null | undefined
  image: string | null | undefined
  initials: string
}

export function UserMenu({ name, email, image, initials }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={image ?? ""} alt={name ?? "User"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

- [ ] **Step 2: Create `src/app/(protected)/dashboard/page.tsx`**

```typescript
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/auth/user-menu"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) redirect("/login")

  const { user } = session
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "U"

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <ThemeToggle />
        <UserMenu
          name={user.name}
          email={user.email}
          image={user.image}
          initials={initials}
        />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-col items-center gap-2 text-center">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.image ?? ""} alt={user.name ?? "User"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <CardTitle>{user.name}</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          {user.email}
        </CardContent>
      </Card>
    </main>
  )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "src/components/auth/user-menu.tsx" "src/app/(protected)/dashboard/page.tsx"
git commit -m "feat: add UserMenu component and dashboard page"
```

---

### Task 15: Add package scripts and .env.example

**Files:**
- Modify: `package.json`
- Create: `.env.example`

- [ ] **Step 1: Add db scripts to `package.json`**

Open `package.json` and add two entries to the `"scripts"` object:

```json
"db:push": "prisma db push",
"db:studio": "prisma studio"
```

The complete `"scripts"` section should read:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "db:push": "prisma db push",
  "db:studio": "prisma studio"
}
```

- [ ] **Step 2: Create `.env.example`**

```
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"

# NextAuth — generate AUTH_SECRET with: openssl rand -base64 32
AUTH_SECRET=""
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
```

- [ ] **Step 3: Commit**

```bash
git add package.json .env.example
git commit -m "chore: add db scripts and .env.example"
```

---

### Task 16: Write README and run final build

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace `README.md`**

````markdown
# Next.js Boilerplate

Next.js · Tailwind CSS · shadcn/ui · NextAuth v5 (Google) · Prisma · PostgreSQL

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15+ (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | NextAuth v5 — Google OAuth |
| Database | PostgreSQL via Prisma |
| Themes | next-themes (dark / light) |

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random string — `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret |

### 3. Set up Google OAuth

1. Open [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy the Client ID and Secret into `.env`

### 4. Push database schema

```bash
pnpm db:push
```

### 5. Start development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm db:push` | Sync Prisma schema to database |
| `pnpm db:studio` | Open Prisma Studio |
````

- [ ] **Step 2: Run final production build**

```bash
pnpm build
```

Expected: build completes with no TypeScript or compilation errors.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add README with setup instructions"
```
