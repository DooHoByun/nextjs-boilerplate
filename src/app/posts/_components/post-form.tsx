"use client"

import { useActionState } from "react"
import {
  createPostAction,
  initialFormState,
} from "@/app/posts/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PostForm() {
  const [state, formAction, pending] = useActionState(
    createPostAction,
    initialFormState
  )

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="Write a clear title" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <textarea
          id="content"
          name="content"
          required
          rows={12}
          className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none"
          placeholder="Share your thoughts with the community."
        />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Publishing..." : "Publish post"}
      </Button>
    </form>
  )
}
