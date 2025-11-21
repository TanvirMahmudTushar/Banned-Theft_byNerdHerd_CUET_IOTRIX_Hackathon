import { type NextRequest, NextResponse } from "next/server"
import { MOCK_USERS_DB } from "../mock-db"

// Backend API URL - change to your backend URL
const BACKEND_URL = "http://localhost:8001"

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()

    console.log("Login attempt:", { email, role })

    // Always try backend API first
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      })

      if (backendRes.ok) {
        const data = await backendRes.json()
        console.log("Login successful via backend:", email)
        return NextResponse.json(data, { status: 200 })
      } else {
        const error = await backendRes.json()
        console.log("Backend login failed:", error)
        return NextResponse.json({ message: error.detail || "Invalid credentials" }, { status: backendRes.status })
      }
    } catch (err) {
      console.error("Backend connection failed:", err)
      return NextResponse.json({ message: "Authentication service unavailable" }, { status: 503 })
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
