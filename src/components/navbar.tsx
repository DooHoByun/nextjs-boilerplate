// src/components/navbar.tsx
import Link from "next/link"
import { auth, signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"

function MStripeMini() {
  return (
    <div className="flex h-4 w-1 rounded-full overflow-hidden">
      <div className="w-full h-1/3 bg-m-stripe-blue" />
      <div className="w-full h-1/3 bg-m-stripe-purple" />
      <div className="w-full h-1/3 bg-m-stripe-red" />
    </div>
  )
}

export async function Navbar() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <MStripeMini />
          <span className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
            M SERIES
          </span>
        </Link>
        
        <nav className="flex items-center gap-2">
          <Link href="/posts">
            <Button 
              variant="ghost" 
              className="text-muted-foreground hover:text-foreground hover:bg-secondary font-medium"
            >
              Board
            </Button>
          </Link>
          {session ? (
            <>
              <Link href="/dashboard">
                <Button 
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground hover:bg-secondary font-medium"
                >
                  Dashboard
                </Button>
              </Link>
              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/" })
                }}
              >
                <Button 
                  type="submit" 
                  variant="outline"
                  className="border-border hover:border-primary/50 hover:bg-secondary font-medium"
                >
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <Link href="/sign-in">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                Sign in
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
