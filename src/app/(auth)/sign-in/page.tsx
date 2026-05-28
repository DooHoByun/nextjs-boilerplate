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

type SignInPageProps = {
  searchParams: Promise<{ redirectTo?: string }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { redirectTo } = await searchParams
  const safeRedirectTo =
    redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard"

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
            await signIn("github", { redirectTo: safeRedirectTo })
          }}
        >
          <Button type="submit" variant="outline" className="w-full">
            Continue with GitHub
          </Button>
        </form>
        <form
          action={async () => {
            "use server"
            await signIn("google", { redirectTo: safeRedirectTo })
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
