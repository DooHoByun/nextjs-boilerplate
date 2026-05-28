"use client"

import { useActionState } from "react"
import {
  createCommentAction,
  initialFormState,
} from "@/app/posts/actions"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

type CommentFormProps = {
  postId: string
}

export function CommentForm({ postId }: CommentFormProps) {
  const [state, formAction, pending] = useActionState(
    createCommentAction,
    initialFormState
  )

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="postId" value={postId} />
      <div className="space-y-2">
        <Label htmlFor="content">Comment</Label>
        <textarea
          id="content"
          name="content"
          required
          rows={5}
          className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none"
          placeholder="Leave a thoughtful reply."
        />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting..." : "Add comment"}
      </Button>
    </form>
  )
}
