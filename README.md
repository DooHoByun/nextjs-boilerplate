# Next.js Boilerplate

개인 프로젝트를 빠르게 시작하기 위한 Next.js 스타터 보일러플레이트입니다.

## 스택

- **Framework** — Next.js 16 (App Router)
- **Auth** — Auth.js v5 (GitHub, Google OAuth)
- **Database** — PostgreSQL + Prisma 7
- **UI** — Tailwind CSS v4 + shadcn/ui
- **Language** — TypeScript
- **Package Manager** — pnpm

## 포함된 것

- 소셜 로그인 (GitHub, Google)
- JWT 기반 세션
- 로그인 상태에 따른 Navbar
- `/dashboard` 라우트 보호 (미인증 시 `/sign-in` 리다이렉트)
- shadcn/ui 컴포넌트 (Button, Card, Input, Label)
- Prisma Auth.js 어댑터 스키마 (User, Account, Session, VerificationToken)

## 시작하기

### 1. 레포 클론

```bash
git clone https://github.com/DooHoByun/nextjs-boilerplate.git
cd nextjs-boilerplate
pnpm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열고 값을 채웁니다:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/myapp

AUTH_SECRET=                # pnpm dlx auth secret 으로 생성

AUTH_GITHUB_ID=             # GitHub OAuth App
AUTH_GITHUB_SECRET=

AUTH_GOOGLE_ID=             # Google Cloud Console
AUTH_GOOGLE_SECRET=
```

**GitHub OAuth App 설정:**
- [github.com/settings/developers](https://github.com/settings/developers) → New OAuth App
- Callback URL: `http://localhost:3000/api/auth/callback/github`

**Google OAuth 설정:**
- [Google Cloud Console](https://console.cloud.google.com/) → API 및 서비스 → 사용자 인증 정보
- Callback URL: `http://localhost:3000/api/auth/callback/google`

### 3. 데이터베이스 마이그레이션

```bash
pnpm dlx prisma migrate dev --name init
```

### 4. 개발 서버 실행

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000)에서 확인하세요.

## 프로젝트 구조

```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/page.tsx      # 소셜 로그인 페이지
│   │   └── sign-up/page.tsx      # /sign-in으로 리다이렉트
│   ├── (dashboard)/
│   │   └── dashboard/page.tsx    # 보호된 대시보드
│   ├── api/auth/[...nextauth]/   # Auth.js 핸들러
│   ├── layout.tsx                # 루트 레이아웃
│   └── page.tsx                  # 랜딩 페이지
├── components/
│   ├── ui/                       # shadcn 컴포넌트
│   ├── navbar.tsx                # 세션 기반 네비게이션
│   └── providers.tsx             # SessionProvider
├── lib/
│   ├── auth.ts                   # Auth.js 설정
│   ├── db.ts                     # Prisma 싱글톤
│   └── utils.ts                  # cn() 유틸리티
└── middleware.ts                 # 라우트 보호
prisma/
└── schema.prisma                 # DB 스키마
```

## Prisma 참고사항

이 프로젝트는 Prisma 7을 사용합니다. Prisma 7부터 데이터베이스 연결 URL은 `schema.prisma`가 아닌 `prisma.config.ts`에서 관리됩니다.

```ts
// prisma.config.ts
export default defineConfig({
  datasource: {
    url: process.env["DATABASE_URL"],
  },
})
```

## 새 컴포넌트 추가 (shadcn)

```bash
pnpm dlx shadcn@latest add <component>
```

## 라이선스

MIT
