"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "@/components/navbar"

export default function StudentLogin() {
  const [credentials, setCredentials] = useState({ studentId: "", pin: "" })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Mock login
      alert(`Logged in as ${credentials.studentId}`)
      setCredentials({ studentId: "", pin: "" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="text-3xl">🍽️</div>
              </div>
              <h1 className="text-2xl font-bold text-white">Student Portal</h1>
              <p className="text-zinc-400 mt-2">Sign in to access your meal services</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Student ID</label>
                <input
                  type="text"
                  value={credentials.studentId}
                  onChange={(e) => setCredentials({ ...credentials, studentId: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                  placeholder="21CS001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">PIN</label>
                <input
                  type="password"
                  value={credentials.pin}
                  onChange={(e) => setCredentials({ ...credentials, pin: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                  placeholder="••••"
                  maxLength={4}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
              <p className="text-xs text-zinc-400">Demo credentials:</p>
              <p className="text-sm text-zinc-300 mt-1">
                ID: <span className="font-mono">21CS001</span>
              </p>
              <p className="text-sm text-zinc-300">
                PIN: <span className="font-mono">1234</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
