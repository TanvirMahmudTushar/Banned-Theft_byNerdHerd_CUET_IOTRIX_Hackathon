export interface ApprovalItem {
  id: number
  student_id: number
  student_name: string
  student_id_number?: string
  token_id?: string
  requested_meal: string
  face_confidence: number
  created_at: string
}

export interface Student {
  id: number
  student_id: string
  name: string
  email: string
  department: string
  batch: number
  is_active: boolean
  face_enrolled: boolean
  created_at: string
}

export interface MealLog {
  id: number
  student_name: string
  meal_type: string
  served_at: string
  face_confidence: number
}

export interface DashboardStats {
  today_approvals: number
  today_meals: number
  pending_requests: number
  active_students: number
}

function getMockManagerStats(): DashboardStats {
  return {
    today_approvals: 24,
    today_meals: 156,
    pending_requests: 5,
    active_students: 342,
  }
}

function getMockApprovals(): ApprovalItem[] {
  return [
    {
      id: 1,
      student_id: 21,
      student_name: "Arjun Kumar",
      requested_meal: "Biryani",
      face_confidence: 0.94,
      created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    {
      id: 2,
      student_id: 45,
      student_name: "Priya Sharma",
      requested_meal: "Paneer Tikka",
      face_confidence: 0.87,
      created_at: new Date(Date.now() - 8 * 60000).toISOString(),
    },
    {
      id: 3,
      student_id: 12,
      student_name: "Rahul Singh",
      requested_meal: "Dosa",
      face_confidence: 0.91,
      created_at: new Date(Date.now() - 3 * 60000).toISOString(),
    },
    {
      id: 4,
      student_id: 67,
      student_name: "Ananya Patel",
      requested_meal: "Sambar Rice",
      face_confidence: 0.89,
      created_at: new Date(Date.now() - 2 * 60000).toISOString(),
    },
    {
      id: 5,
      student_id: 33,
      student_name: "Vikram Reddy",
      requested_meal: "Roti & Curry",
      face_confidence: 0.92,
      created_at: new Date(Date.now() - 1 * 60000).toISOString(),
    },
  ]
}

function getMockStudents(page = 1, limit = 10) {
  const allStudents: Student[] = [
    {
      id: 1,
      student_id: "21CS001",
      name: "Arjun Kumar",
      email: "arjun@college.edu",
      department: "CSE",
      batch: 2021,
      is_active: true,
      face_enrolled: true,
      created_at: "2024-01-01",
    },
    {
      id: 2,
      student_id: "21CS002",
      name: "Priya Sharma",
      email: "priya@college.edu",
      department: "CSE",
      batch: 2021,
      is_active: true,
      face_enrolled: true,
      created_at: "2024-01-02",
    },
    {
      id: 3,
      student_id: "21ECE001",
      name: "Rahul Singh",
      email: "rahul@college.edu",
      department: "ECE",
      batch: 2021,
      is_active: true,
      face_enrolled: false,
      created_at: "2024-01-03",
    },
    {
      id: 4,
      student_id: "21ME001",
      name: "Ananya Patel",
      email: "ananya@college.edu",
      department: "ME",
      batch: 2021,
      is_active: false,
      face_enrolled: true,
      created_at: "2024-01-04",
    },
    {
      id: 5,
      student_id: "21CE001",
      name: "Vikram Reddy",
      email: "vikram@college.edu",
      department: "CE",
      batch: 2021,
      is_active: true,
      face_enrolled: true,
      created_at: "2024-01-05",
    },
  ]

  const start = (page - 1) * limit
  const end = start + limit
  return {
    students: allStudents.slice(start, end),
    total: allStudents.length,
  }
}

function getMockAnalytics(days = 7) {
  const dailyMeals = Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - i - 1))
    return {
      date: date.toISOString().split("T")[0],
      breakfast: Math.floor(Math.random() * 50) + 20,
      lunch: Math.floor(Math.random() * 80) + 40,
      dinner: Math.floor(Math.random() * 60) + 30,
    }
  })

  const totalMeals = dailyMeals.reduce((sum, day) => sum + day.breakfast + day.lunch + day.dinner, 0)

  return {
    daily_meals: dailyMeals,
    total_meals: totalMeals,
    unique_students: 187,
    avg_confidence: 0.91,
  }
}

function getMockRecentActivity() {
  return [
    {
      description: "Arjun Kumar accessed meal at 12:45 PM",
      timestamp: "5 mins ago",
    },
    {
      description: "Admin approved 3 new student enrollments",
      timestamp: "15 mins ago",
    },
    {
      description: "System alert: 2 failed face recognition attempts",
      timestamp: "32 mins ago",
    },
    {
      description: "Priya Sharma enrolled successfully",
      timestamp: "1 hour ago",
    },
    {
      description: "Manager approved 5 pending meal requests",
      timestamp: "2 hours ago",
    },
  ]
}

// Manager API - All using mock data
export async function getManagerStats(): Promise<DashboardStats> {
  try {
    const response = await fetch("http://127.0.0.1:8001/api/manager/stats")
    if (!response.ok) {
      console.error("Failed to fetch stats:", response.status)
      return { today_approvals: 0, today_meals: 0, pending_requests: 0, active_students: 0 }
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching stats:", error)
    return { today_approvals: 0, today_meals: 0, pending_requests: 0, active_students: 0 }
  }
}

export async function getApprovals(): Promise<ApprovalItem[]> {
  try {
    const response = await fetch("http://127.0.0.1:8001/api/manager/approvals")
    if (!response.ok) {
      console.error("Failed to fetch approvals:", response.status)
      return []
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching approvals:", error)
    return []
  }
}

export async function approveRequest(approvalId: number): Promise<any> {
  try {
    const response = await fetch(`http://127.0.0.1:8001/api/manager/approve/${approvalId}`, {
      method: "POST"
    })
    return await response.json()
  } catch (error) {
    console.error("Error approving request:", error)
    throw error
  }
}

export async function denyRequest(approvalId: number, reason = ""): Promise<any> {
  try {
    const response = await fetch(`http://127.0.0.1:8001/api/manager/deny/${approvalId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason })
    })
    return await response.json()
  } catch (error) {
    console.error("Error denying request:", error)
    throw error
  }
}

// Admin API - All using mock data
export async function getStudents(page = 1, limit = 10): Promise<{ students: Student[]; total: number }> {
  return new Promise((resolve) => setTimeout(() => resolve(getMockStudents(page, limit)), 300))
}

export async function getStudentById(id: number): Promise<Student> {
  const students = getMockStudents(1, 100)
  const student = students.students.find((s) => s.id === id)
  return new Promise((resolve) => setTimeout(() => resolve(student!), 300))
}

export async function getAnalytics(days = 7): Promise<any> {
  return new Promise((resolve) => setTimeout(() => resolve(getMockAnalytics(days)), 300))
}

export async function getRecentActivity(): Promise<any[]> {
  return new Promise((resolve) => setTimeout(() => resolve(getMockRecentActivity()), 300))
}

// Student API - All using mock data
export async function studentLogin(studentId: string, pin: string): Promise<any> {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      if (studentId === "21CS001" && pin === "1234") {
        resolve({ success: true, student_name: "Arjun Kumar" })
      } else {
        reject(new Error("Invalid credentials"))
      }
    }, 300),
  )
}

export async function getStudentProfile(studentId: number): Promise<any> {
  const students = getMockStudents(1, 100)
  const student = students.students.find((s) => s.id === studentId)
  return new Promise((resolve) => setTimeout(() => resolve(student), 300))
}

// Enrollment API - All using mock data
export async function submitBasicInfo(data: {
  name: string
  student_id: string
  email: string
  department: string
  gender: string
}): Promise<any> {
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 300))
}

export async function submitFaceData(studentId: string): Promise<any> {
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 300))
}

export async function submitRFID(studentId: string, rfidUid: string): Promise<any> {
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 300))
}

export async function setupPIN(studentId: string, pin: string): Promise<any> {
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 300))
}

export async function assignMealPlan(studentId: string, planType: string): Promise<any> {
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 300))
}

export async function confirmEnrollment(data: {
  name: string
  student_id: string
  email: string
  department: string
  gender: string
  rfid_uid: string
  pin: string
  plan_type: string
}): Promise<any> {
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 300))
}
