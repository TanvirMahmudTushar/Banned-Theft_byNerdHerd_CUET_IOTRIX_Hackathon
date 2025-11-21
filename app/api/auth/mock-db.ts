// Shared mock database for authentication
// This is used across login and signup routes

export type UserRole = "student" | "manager" | "admin"

export interface MockUser {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
}

// Shared in-memory database
export const MOCK_USERS_DB: MockUser[] = [
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
