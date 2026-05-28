import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/sign-in")

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle>Session Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Name: </span>
            {session.user?.name ?? "—"}
          </p>
          <p>
            <span className="font-medium">Email: </span>
            {session.user?.email ?? "—"}
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
