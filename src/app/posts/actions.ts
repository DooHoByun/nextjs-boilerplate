"use server"

import { revalidatePath } from "next/cache"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export type FormState = {
  error: string | null
}

export const initialFormState: FormState = {
  error: null,
}

function getRequiredText(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : ""

  return text || null
}

async function requireAuthorId() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/sign-in")
  }

  const author = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!author) {
    redirect("/sign-in")
  }

  return author.id
}

export async function createPostAction(
  _previousState: FormState,
  formData: FormData
): Promise<FormState> {
  const authorId = await requireAuthorId()
  const title = getRequiredText(formData.get("title"))
  const content = getRequiredText(formData.get("content"))

  if (!title) {
    return { error: "Title is required." }
  }

  if (!content) {
    return { error: "Content is required." }
  }

  let post: { id: string }

  try {
    post = await db.post.create({
      data: {
        title,
        content,
        authorId,
      },
      select: {
        id: true,
      },
    })
  } catch {
    return { error: "Could not publish post." }
  }

  revalidatePath("/posts")
  redirect(`/posts/${post.id}`)
}

export async function createCommentAction(
  _previousState: FormState,
  formData: FormData
): Promise<FormState> {
  const authorId = await requireAuthorId()
  const postId = getRequiredText(formData.get("postId"))

  if (!postId) {
    notFound()
  }

  const post = await db.post.findUnique({
    where: { id: postId },
    select: { id: true },
  })

  if (!post) {
    notFound()
  }

  const content = getRequiredText(formData.get("content"))

  if (!content) {
    return { error: "Comment is required." }
  }

  try {
    await db.comment.create({
      data: {
        content,
        postId,
        authorId,
      },
    })
  } catch {
    return { error: "Could not add comment." }
  }

  revalidatePath("/posts")
  revalidatePath(`/posts/${postId}`)
  redirect(`/posts/${postId}`)
}
