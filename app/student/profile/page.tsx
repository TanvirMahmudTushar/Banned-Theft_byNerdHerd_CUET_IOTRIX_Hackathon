"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Calendar, CreditCard, LogOut, User } from "lucide-react"

export default function StudentProfile() {
  const [student] = useState({
    name: "John Doe",
    studentId: "21CS001",
    email: "john@example.com",
    department: "Computer Science",
    mealPlan: "Monthly - All meals included",
    remainingMeals: 87,
    totalMeals: 90,
  })

  const [meals] = useState([
    { id: 1, date: "2025-01-20", type: "Breakfast", time: "08:15 AM", status: "✓" },
    { id: 2, date: "2025-01-20", type: "Lunch", time: "12:45 PM", status: "✓" },
    { id: 3, date: "2025-01-19", type: "Dinner", time: "07:30 PM", status: "✓" },
    { id: 4, date: "2025-01-19", type: "Breakfast", time: "08:00 AM", status: "✓" },
  ])

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
              <p className="text-zinc-400">Student meal portal</p>
            </div>
            <button className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-zinc-300">Account</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-zinc-500">Name</div>
                  <div className="text-white font-medium">{student.name}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Student ID</div>
                  <div className="text-white font-medium">{student.studentId}</div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-5 h-5 text-green-600" />
                <h3 className="text-sm font-semibold text-zinc-300">Meal Plan</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-zinc-500">Plan Type</div>
                  <div className="text-white font-medium">Monthly</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Remaining</div>
                  <div className="text-white font-medium">
                    {student.remainingMeals}/{student.totalMeals}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-semibold text-zinc-300">Today</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-zinc-500">Date</div>
                  <div className="text-white font-medium">{new Date().toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Meals Taken</div>
                  <div className="text-white font-medium">2/3</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4">Recent Meal History</h2>
            <div className="space-y-3">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg hover:bg-zinc-800/80 transition"
                >
                  <div>
                    <div className="font-medium text-white">{meal.type}</div>
                    <div className="text-sm text-zinc-400">
                      {meal.date} · {meal.time}
                    </div>
                  </div>
                  <div className="text-green-500 font-bold text-lg">{meal.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
