import { type NextRequest, NextResponse } from "next/server"
import { MOCK_USERS_DB, type UserRole } from "../mock-db"

// Backend API URL
const BACKEND_URL = "http://localhost:8001"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json()

    console.log("Signup attempt:", { email, role })

    // Always try backend API first
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      })

      if (backendRes.ok) {
        const data = await backendRes.json()
        console.log("Signup successful via backend:", email)
        return NextResponse.json(data, { status: 201 })
      } else {
        const error = await backendRes.json()
        console.log("Backend signup failed:", error)
        return NextResponse.json({ message: error.detail || "Signup failed" }, { status: backendRes.status })
      }
    } catch (err) {
      console.error("Backend connection failed:", err)
      return NextResponse.json({ message: "Authentication service unavailable" }, { status: 503 })
    }
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
