# Cafe-Style Board Design

## Overview

Add a simple cafe-style board to this Next.js starter.

Scope for v1:

- Post list
- Post creation
- Post detail
- Comment creation

Non-goals for v1:

- Post edit/delete
- Comment edit/delete
- Categories or multiple boards
- Notices, likes, view counts, attachments

Access policy:

- Anyone can read posts and comments
- Only signed-in users can create posts and comments

## Product Goal

The feature should make the app feel more like a community space instead of only an auth demo. A signed-in user should be able to write a post, open it, and leave a comment with minimal friction.

## Existing Project Context

Current stack and patterns already in place:

- Next.js 16 App Router
- Auth.js v5 with server-side `auth()`
- Prisma 7 with PostgreSQL
- Protected `/dashboard` route through middleware
- Shared Prisma access in `src/lib/db.ts`

This feature should follow the existing server-first style and avoid introducing extra client state libraries.

## Recommended Approach

Use a single public board with server-rendered pages and Prisma-backed writes.

Why this approach:

- Fits the current codebase with minimal architectural change
- Delivers the core board experience quickly
- Keeps the data model simple while leaving room for later expansion

Alternatives considered:

### Option A: Single board with `Post` and `Comment` models

Recommended.

Pros:

- Smallest useful scope
- Clean route structure
- Easy to extend later with categories or moderation

Trade-off:

- Future board/category support will require additive schema changes

### Option B: Add `Board` model now for future expansion

Pros:

- Future-ready for multiple sections

Trade-off:

- Adds complexity before the product needs it

### Option C: Fully client-driven board UI

Pros:

- Can feel more dynamic

Trade-off:

- Unnecessary complexity for v1
- Does not match the current server-heavy project shape

## User Experience

### Reading flow

1. User opens `/posts`
2. User sees a list of recent posts
3. User selects a post
4. User sees post content and existing comments at `/posts/[id]`

### Writing flow

1. Signed-in user opens `/posts/new`
2. User submits title and content
3. User is redirected to the created post or the post list

### Comment flow

1. Signed-in user opens a post detail page
2. User writes a comment in the comment form
3. User submits and sees the new comment on the same page

### Anonymous user behavior

- Anonymous users can browse `/posts` and `/posts/[id]`
- Anonymous users cannot create posts
- Anonymous users cannot create comments
- If they try to access write actions, they are redirected to `/sign-in`

## Routes

Create these routes:

- `src/app/posts/page.tsx`
  - Public post list page
- `src/app/posts/new/page.tsx`
  - Signed-in-only post creation page
- `src/app/posts/[id]/page.tsx`
  - Public post detail page with comments

Navigation update:

- Add a `Board` link to the main navbar

Route placement decision:

- Keep board pages outside `src/app/(dashboard)` because read access is public
- Enforce auth only for create flows

## Data Model

Add two Prisma models and extend the existing `User` model relations.

### `Post`

- `id`
- `title`
- `content`
- `authorId`
- `createdAt`
- `updatedAt`

### `Comment`

- `id`
- `content`
- `postId`
- `authorId`
- `createdAt`
- `updatedAt`

### Relationships

- One `User` has many `Post`
- One `User` has many `Comment`
- One `Post` has many `Comment`
- One `Post` belongs to one `User`
- One `Comment` belongs to one `User`
- One `Comment` belongs to one `Post`

### Suggested Prisma shape

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  posts         Post[]
  comments      Comment[]
  createdAt     DateTime  @default(now())
}

model Post {
  id        String    @id @default(cuid())
  title     String
  content   String
  authorId  String
  author    User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments  Comment[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([createdAt])
  @@index([authorId])
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  postId    String
  authorId  String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([postId, createdAt])
  @@index([authorId])
}
```

## UI Structure

### Post list page

Show:

- Page title
- Button to create a new post
- List of posts in reverse chronological order
- Each row shows:
  - post title
  - author name or fallback
  - created date
  - comment count

### Post creation page

Show:

- Title input
- Content textarea
- Submit button

Validation:

- Title is required
- Content is required
- Trim whitespace before validation

### Post detail page

Show:

- Post title
- Post body
- Author
- Created date
- Comment list
- Comment form below the list

Comment form validation:

- Comment content is required
- Trim whitespace before validation

## Architecture

Use server-rendered data reads plus server-side form handling.

### Reads

- Server components fetch posts and comments directly with Prisma
- `src/lib/db.ts` remains the only Prisma client entry point

### Writes

- Create post and create comment should run on the server
- Use server actions or dedicated server handlers that fit the current app style
- Keep v1 implementation simple and avoid introducing a separate API layer unless needed

### Auth checks

- Gate `/posts/new` by checking `auth()`
- Gate comment submission by checking `auth()`
- Redirect unauthenticated users to `/sign-in`

## Data Fetching Details

### `/posts`

Query posts ordered by newest first.

Include:

- author basic info
- comment count

### `/posts/[id]`

Query one post by id.

Include:

- author basic info
- comments ordered oldest to newest
- each comment author basic info

If the post is missing:

- return 404 with `notFound()`

## Error Handling

### User-facing rules

- Unauthenticated write attempts redirect to `/sign-in`
- Empty title/content/comment submissions are rejected
- Invalid or missing post id shows 404
- Database write failures show a short error message near the form

### Developer rules

- Keep validation close to write handlers
- Do not trust client-side checks alone
- Fail safely and return clear messages for expected form errors

## Testing Strategy

Minimum acceptance checks for v1:

1. Signed-in user can open `/posts/new`
2. Signed-in user can create a post
3. Created post appears in `/posts`
4. Public user can open `/posts`
5. Public user can open `/posts/[id]`
6. Signed-in user can add a comment on `/posts/[id]`
7. Created comment appears on the same detail page
8. Public user cannot submit post creation
9. Public user cannot submit comment creation
10. Missing post id returns 404

## Implementation Notes

Likely file additions or updates:

- `prisma/schema.prisma`
- `src/app/posts/page.tsx`
- `src/app/posts/new/page.tsx`
- `src/app/posts/[id]/page.tsx`
- `src/components/navbar.tsx`
- new board-related form or list components if the pages become too large

Recommended boundary:

- Keep page-level data loading in route files
- Extract reusable UI pieces only when duplication becomes real
- Avoid premature abstraction in v1

## Future Expansion

Possible next steps after v1:

- Edit and delete for posts/comments
- Board categories
- Pinned notices
- Likes
- View counts
- Rich text editor
- Attachments
- Basic moderation tools

## Success Criteria

The feature is successful when:

- The app has a visible board entry point in the navbar
- Anyone can browse posts and comments
- Signed-in users can create posts
- Signed-in users can create comments
- The board feels coherent without requiring extra onboarding
- The implementation follows the current server-first structure
