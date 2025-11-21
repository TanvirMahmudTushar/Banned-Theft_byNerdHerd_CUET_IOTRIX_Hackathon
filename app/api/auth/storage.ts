// Simple file-based storage for user persistence
import { MockUser } from "./mock-db"

const STORAGE_KEY = "banned_theft_users"

// Initialize with default users
const DEFAULT_USERS: MockUser[] = [
  {
    id: "1",
    name: "John Manager",
    email: "manager@test.com",
    password: "password123",
    role: "manager",
  },
  {
    id: "2",
    name: "Admin User",
    email: "admin@test.com",
    password: "password123",
    role: "admin",
  },
  {
    id: "3",
    name: "Sarah Student",
    email: "student@test.com",
    password: "password123",
    role: "student",
  },
]

// In-memory cache (since we can't use filesystem in Edge Runtime)
let usersCache: MockUser[] | null = null

export function getUsers(): MockUser[] {
  if (usersCache === null) {
    // Try to load from browser storage via server
    try {
      // For server-side, we'll use in-memory storage
      // On first load, initialize with defaults
      usersCache = [...DEFAULT_USERS]
    } catch {
      usersCache = [...DEFAULT_USERS]
    }
  }
  return usersCache
}

export function saveUser(user: MockUser): void {
  const users = getUsers()
  users.push(user)
  usersCache = users
}

export function findUser(
  email: string,
  password: string,
  role: string
): MockUser | undefined {
  const users = getUsers()
  return users.find(
    (u) => u.email === email && u.password === password && u.role === role
  )
}

export function userExists(email: string): boolean {
  const users = getUsers()
  return users.some((u) => u.email === email)
}

export function getNextUserId(): string {
  const users = getUsers()
  return String(users.length + 1)
}
