import Link from "next/link"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { getPostById } from "@/lib/posts"
import { CommentForm } from "@/app/posts/_components/comment-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type PostDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const [{ id }, session] = await Promise.all([params, auth()])
  const post = await getPostById(id)

  if (!post) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link href="/posts">
          <Button variant="ghost" className="px-0">
            Back to board
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{post.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {post.author.name ?? post.author.email ?? "Unknown author"} |{" "}
            {new Intl.DateTimeFormat("ko-KR", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(post.createdAt)}
          </p>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm leading-7">{post.content}</div>
        </CardContent>
      </Card>

      <section className="mb-8 space-y-4">
        <h2 className="text-xl font-semibold">Comments</h2>
        {post.comments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No comments yet.
            </CardContent>
          </Card>
        ) : (
          post.comments.map((comment) => (
            <Card key={comment.id}>
              <CardHeader className="pb-3">
                <p className="text-sm text-muted-foreground">
                  {comment.author.name ?? comment.author.email ?? "Unknown author"} |{" "}
                  {new Intl.DateTimeFormat("ko-KR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(comment.createdAt)}
                </p>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm leading-7">
                  {comment.content}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Leave a comment</h2>
        {session ? (
          <CommentForm postId={post.id} />
        ) : (
          <Card>
            <CardContent className="flex items-center justify-between gap-4 py-6">
              <p className="text-sm text-muted-foreground">
                Sign in to join the conversation.
              </p>
              <Link href={`/sign-in?redirectTo=/posts/${post.id}`}>
                <Button>Sign in</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  )
}
