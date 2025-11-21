import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-zinc-400 mb-8">You don't have permission to access this page.</p>
        <Link href="/auth/login">
          <Button>Return to Login</Button>
        </Link>
      </div>
    </div>
  )
}
