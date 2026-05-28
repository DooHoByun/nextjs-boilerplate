import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">Welcome to MyApp</h1>
        <p className="text-xl text-muted-foreground max-w-md">
          A Next.js boilerplate with auth, database, and a modern UI stack.
          Ready to build on.
        </p>
      </div>
      <Link href="/sign-in">
        <Button size="lg">Get started</Button>
      </Link>
    </main>
  )
}
