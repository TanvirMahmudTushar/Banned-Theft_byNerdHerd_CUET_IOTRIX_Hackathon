"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { LogOut, Home } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  if (pathname.startsWith("/auth/")) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push("/auth/login")
  }

  const getNavItems = () => {
    if (!user) return []

    if (user.role === "manager") {
      return [{ label: "Dashboard", href: "/manager/dashboard" }]
    } else if (user.role === "admin") {
      return [
        { label: "Dashboard", href: "/admin/dashboard" },
        { label: "Students", href: "/admin/students" },
        { label: "Enrollment", href: "/admin/enroll" },
      ]
    } else if (user.role === "student") {
      return [
        { label: "Dashboard", href: "/student/dashboard" },
        { label: "Profile", href: "/student/profile" },
      ]
    }
    return []
  }

  const navItems = getNavItems()

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={user ? `/${user.role}/dashboard` : "/"} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white hidden sm:inline">Banned Theft</span>
          </Link>

          <div className="flex gap-1 items-center">
            {navItems.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === href ? "bg-blue-600 text-white" : "text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {label}
              </Link>
            ))}

            {user && (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-zinc-700">
                <span className="text-sm text-zinc-400">
                  {user.name} <span className="text-xs bg-zinc-800 px-2 py-1 rounded ml-2">{user.role}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-zinc-400 hover:text-red-400 transition p-2 hover:bg-zinc-800 rounded-lg"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
