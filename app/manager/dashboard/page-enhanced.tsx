"use client"

import { useEffect, useState } from "react"
import { getManagerStats, getApprovals, approveRequest, denyRequest } from "@/lib/api"
import { ThumbsUp, ThumbsDown, Clock, CheckCircle, XCircle, Utensils, AlertTriangle, TrendingUp } from "lucide-react"

interface ApprovalItem {
  id: number
  student_id: number
  student_name: string
  requested_meal: string
  face_confidence: number
  created_at: string
}

interface Stats {
  today_approvals: number
  today_meals: number
  pending_requests: number
  active_students: number
}

interface MealLog {
  id: number
  student_id: number
  student_name: string
  meal_type: string
  served_at: string
  face_confidence: number
  verified_by: string
}

export default function ManagerDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [approvals, setApprovals] = useState<ApprovalItem[]>([])
  const [mealLogs, setMealLogs] = useState<MealLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending")

  const fetchMealLogs = async () => {
    try {
      const response = await fetch("http://localhost:8001/api/manager/meal-logs/today")
      if (response.ok) {
        const logs = await response.json()
        setMealLogs(logs)
      }
    } catch (err) {
      console.log("Meal logs not available:", err)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, approvalsData] = await Promise.all([
          getManagerStats(), 
          getApprovals()
        ])
        setStats(statsData)
        setApprovals(approvalsData)
        await fetchMealLogs()
      } catch (err) {
        setError("Failed to load data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleApprove = async (id: number) => {
    try {
      await approveRequest(id)
      setApprovals(approvals.filter((a) => a.id !== id))
      
      // Refresh meal logs after approval
      setTimeout(async () => {
        await fetchMealLogs()
      }, 500)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeny = async (id: number) => {
    try {
      await denyRequest(id, "Denied by manager")
      setApprovals(approvals.filter((a) => a.id !== id))
    } catch (err) {
      console.error(err)
    }
  }
  
  const checkIfAlreadyAte = (studentName: string, mealType: string) => {
    return mealLogs.some(
      (log) => log.student_name === studentName && log.meal_type === mealType
    )
  }

  const getMealStats = () => {
    const breakfast = mealLogs.filter(log => log.meal_type === "breakfast").length
    const lunch = mealLogs.filter(log => log.meal_type === "lunch").length
    const dinner = mealLogs.filter(log => log.meal_type === "dinner").length
    return { breakfast, lunch, dinner }
  }

  const mealStats = getMealStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Manager Dashboard</h1>
          <p className="text-zinc-400">Real-time approval management & meal tracking</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-blue-600 transition">
              <div className="text-zinc-400 text-sm font-medium">Today's Approvals</div>
              <div className="text-3xl font-bold text-white mt-2">{stats.today_approvals}</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-green-600 transition">
              <div className="text-zinc-400 text-sm font-medium">Meals Served</div>
              <div className="text-3xl font-bold text-white mt-2">{stats.today_meals}</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-yellow-600 transition">
              <div className="text-zinc-400 text-sm font-medium">Pending Requests</div>
              <div className="text-3xl font-bold text-amber-500 mt-2">{stats.pending_requests}</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-cyan-600 transition">
              <div className="text-zinc-400 text-sm font-medium">Active Students</div>
              <div className="text-3xl font-bold text-white mt-2">{stats.active_students}</div>
            </div>
          </div>
        )}

        {/* Meal Type Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-orange-900/20 to-zinc-900 border border-orange-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🍳</span>
              <span className="text-zinc-400 text-sm">Breakfast</span>
            </div>
            <div className="text-2xl font-bold text-white">{mealStats.breakfast}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-900/20 to-zinc-900 border border-yellow-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🍛</span>
              <span className="text-zinc-400 text-sm">Lunch</span>
            </div>
            <div className="text-2xl font-bold text-white">{mealStats.lunch}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-900/20 to-zinc-900 border border-purple-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🍝</span>
              <span className="text-zinc-400 text-sm">Dinner</span>
            </div>
            <div className="text-2xl font-bold text-white">{mealStats.dinner}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
              activeTab === "pending"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            <Clock className="w-4 h-4" />
            Pending ({approvals.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
              activeTab === "history"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            <Utensils className="w-4 h-4" />
            Today's Meals ({mealLogs.length})
          </button>
        </div>

        {/* Pending Approvals Tab */}
        {activeTab === "pending" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Pending Approvals ({approvals.length})
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                ✓ System auto-blocks students who already ate today
              </p>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="text-zinc-400">Loading approvals...</div>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <div className="text-red-500">{error}</div>
              </div>
            ) : approvals.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <div className="text-zinc-400 font-medium">No pending approvals</div>
                <div className="text-sm text-zinc-500 mt-1">All caught up! 🎉</div>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {approvals.map((approval) => {
                  const alreadyAte = checkIfAlreadyAte(approval.student_name, approval.requested_meal)
                  
                  return (
                    <div
                      key={approval.id}
                      className={`p-6 hover:bg-zinc-800/50 transition ${
                        alreadyAte ? "bg-red-950/20 border-l-4 border-red-600" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-white text-lg">{approval.student_name}</div>
                            {alreadyAte && (
                              <div className="bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1 animate-pulse">
                                <AlertTriangle className="w-3 h-3" />
                                Already ate {approval.requested_meal}!
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-zinc-400 mt-1">
                            Requesting: <span className="text-yellow-500 font-medium capitalize">{approval.requested_meal}</span>
                          </div>
                          <div className="flex gap-4 mt-2">
                            <div className="text-xs text-zinc-500">
                              👤 Face: {(approval.face_confidence * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-zinc-500">
                              🆔 ID: {approval.student_id}
                            </div>
                            <div className="text-xs text-zinc-500">
                              ⏰ {new Date(approval.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(approval.id)}
                            disabled={alreadyAte}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                              alreadyAte
                                ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-500 text-white shadow-lg hover:shadow-green-600/50"
                            }`}
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span className="hidden sm:inline">Approve</span>
                          </button>
                          <button
                            onClick={() => handleDeny(approval.id)}
                            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-lg hover:shadow-red-600/50"
                          >
                            <ThumbsDown className="w-4 h-4" />
                            <span className="hidden sm:inline">Deny</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Meal History Tab */}
        {activeTab === "history" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Utensils className="w-5 h-5 text-green-600" />
                Today's Meal Logs ({mealLogs.length})
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                ✓ Students who already consumed meals today (auto-prevents duplicate usage)
              </p>
            </div>

            {mealLogs.length === 0 ? (
              <div className="p-12 text-center">
                <XCircle className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <div className="text-zinc-400">No meals served yet today</div>
                <div className="text-sm text-zinc-500 mt-1">Approvals will appear here after serving</div>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {mealLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-6 hover:bg-zinc-800/50 transition flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-white text-lg">{log.student_name}</div>
                      <div className="text-sm text-zinc-400 mt-1">
                        <span className="capitalize text-green-500 font-medium">{log.meal_type}</span> • Served at{" "}
                        <span className="text-zinc-300">{new Date(log.served_at).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex gap-4 mt-2">
                        <div className="text-xs text-zinc-500">
                          👤 Face: {(log.face_confidence * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-zinc-500">
                          🆔 Student ID: {log.student_id}
                        </div>
                        <div className="text-xs text-zinc-500">
                          ✓ Verified by: {log.verified_by}
                        </div>
                      </div>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
