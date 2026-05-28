import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PostForm } from "@/app/posts/_components/post-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function NewPostPage() {
  const session = await auth()

  if (!session) {
    redirect("/sign-in?redirectTo=/posts/new")
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Write a post</CardTitle>
        </CardHeader>
        <CardContent>
          <PostForm />
        </CardContent>
      </Card>
    </main>
  )
}
