import Link from "next/link"
import { auth } from "@/lib/auth"
import { getPosts } from "@/lib/posts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function PostsPage() {
  const [session, posts] = await Promise.all([auth(), getPosts()])

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Board</h1>
          <p className="text-sm text-muted-foreground">
            Read community posts and join the conversation.
          </p>
        </div>
        <Link href={session ? "/posts/new" : "/sign-in?redirectTo=/posts/new"}>
          <Button>Write post</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No posts yet. Be the first to write one.
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">
                  <Link href={`/posts/${post.id}`} className="hover:underline">
                    {post.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
                <span>{post.author.name ?? post.author.email ?? "Unknown author"}</span>
                <span>
                  {post._count.comments} comments |{" "}
                  {new Intl.DateTimeFormat("ko-KR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(post.createdAt)}
                </span>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  )
}
