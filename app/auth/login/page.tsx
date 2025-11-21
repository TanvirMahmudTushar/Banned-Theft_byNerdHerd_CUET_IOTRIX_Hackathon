"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      console.log("Submitting login:", { email })
      
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "student" }), // role parameter kept for backend compatibility but ignored
      })

      console.log("Login response status:", res.status)
      
      const data = await res.json()
      console.log("Login response data:", data)

      if (!res.ok) {
        console.error("Login failed:", data)
        setError(data.message || "Invalid credentials")
        setLoading(false)
        return
      }

      console.log("💾 Storing auth data in localStorage")
      localStorage.setItem("authToken", data.token)
      localStorage.setItem("userRole", data.role)
      localStorage.setItem("userData", JSON.stringify(data.user))
      console.log("✅ Data stored:", { token: data.token, role: data.role })

      console.log("🔀 Redirecting to dashboard for role:", data.role)
      
      // Use window.location for guaranteed redirect
      if (data.role === "manager") {
        window.location.href = "/manager/dashboard"
      } else if (data.role === "admin") {
        window.location.href = "/admin/dashboard"
      } else {
        window.location.href = "/student/dashboard"
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Authentication service unavailable. Please check if backend is running.")
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-zinc-700">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Banned Theft System</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-950 border border-red-700 rounded-lg p-3 flex gap-2 text-sm text-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-zinc-900 border-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-zinc-900 border-zinc-700"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-zinc-400">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300">
              Sign up
            </Link>
          </p>
        </div>

        
      </CardContent>
    </Card>
  )
}
