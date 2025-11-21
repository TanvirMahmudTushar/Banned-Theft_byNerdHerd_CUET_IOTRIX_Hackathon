"use client"

import { useEffect, useState } from "react"
import { getManagerStats, getApprovals, approveRequest, denyRequest } from "@/lib/api"
import { ThumbsUp, ThumbsDown, Clock, AlertTriangle } from "lucide-react"

interface ApprovalItem {
  id: number
  student_id: number
  student_name: string
  student_id_number?: string
  token_id?: string
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
  student_id_number?: string
  token_id?: string
  meal_type: string
  served_at: string
  face_confidence: number
  verified_by: number
}

export default function ManagerDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [approvals, setApprovals] = useState<ApprovalItem[]>([])
  const [mealLogs, setMealLogs] = useState<MealLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Check if student already ate this meal today
  // Flag all approvals with matching token_id and mealType as already served (student_id can differ)
  // Also, if multiple pending approvals have the same token_id and mealType, flag all as 'Already Served'
  const getAlreadyServedTokenSet = () => {
    const servedSet = new Set<string>()
    mealLogs.forEach((log) => {
      if (log.token_id) {
        servedSet.add(`${log.token_id}|${log.meal_type.toLowerCase()}`)
      }
    })
    return servedSet
  }
  const alreadyServedTokenSet = getAlreadyServedTokenSet()

  // Find duplicate token_id + mealType in pending approvals
  const getDuplicatePendingTokens = () => {
    const countMap: Record<string, number> = {}
    approvals.forEach((a) => {
      if (a.token_id) {
        const key = `${a.token_id}|${a.requested_meal.toLowerCase()}`
        countMap[key] = (countMap[key] || 0) + 1
      }
    })
    return new Set(Object.keys(countMap).filter((k) => countMap[k] > 1))
  }
  const duplicatePendingTokens = getDuplicatePendingTokens()

  const checkIfAlreadyAte = (tokenId: string | undefined, mealType: string): boolean => {
    if (!tokenId) return false
    const key = `${tokenId}|${mealType.toLowerCase()}`
    return alreadyServedTokenSet.has(key) || duplicatePendingTokens.has(key)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, approvalsData, logsData] = await Promise.all([
          getManagerStats(), 
          getApprovals(),
          fetch("http://127.0.0.1:8001/api/manager/meal-logs/today").then(res => res.json())
        ])

        // Patch mealLogs to include student_id_number and token_id from approvals if missing
        const patchedMealLogs = logsData.map((log: any) => {
          // Try to find matching approval for extra info
          const approval = approvalsData.find((a: any) =>
            a.student_id === log.student_id &&
            a.requested_meal.toLowerCase() === log.meal_type.toLowerCase()
          )
          return {
            ...log,
            student_id_number: log.student_id_number || approval?.student_id_number,
            token_id: log.token_id || approval?.token_id,
          }
        })

        setStats(statsData)
        setApprovals(approvalsData)
        setMealLogs(patchedMealLogs)

        console.log("✅ Set approvals:", approvalsData)
        console.log("✅ Set meal logs:", patchedMealLogs)
        
      } catch (err) {
        setError("Failed to load data")
        console.error("❌ Error fetching data:", err)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Manager Dashboard</h1>
          <p className="text-zinc-400">Real-time approval management</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Pending Approvals ({approvals.length})
            </h2>
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
              <div className="text-zinc-400">No pending approvals</div>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {approvals.map((approval) => {
                const alreadyAte = checkIfAlreadyAte(approval.token_id, approval.requested_meal)
                
                return (
                  <div
                    key={approval.id}
                    className={`p-6 hover:bg-zinc-800/50 transition flex justify-between items-start gap-4 ${
                      alreadyAte ? "border-2 border-red-600 bg-red-950/20" : ""
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-white flex items-center gap-2">
                        {approval.student_name}
                        {alreadyAte && (
                          <span className="inline-flex items-center gap-1 text-xs bg-red-600 text-white px-2 py-1 rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                            Already Served
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-zinc-400 mt-1">
                        Requesting: <span className="text-yellow-500 font-medium">{approval.requested_meal}</span>
                      </div>
                      <div className="text-sm text-zinc-400 mt-1 flex gap-4">
                        <span>Student ID: <span className="text-blue-400 font-medium">{approval.student_id_number || 'N/A'}</span></span>
                        <span>Token: <span className="text-green-400 font-medium">{approval.token_id || 'N/A'}</span></span>
                      </div>
                      {alreadyAte && (
                        <div className="text-xs text-red-400 mt-2 font-medium">
                          ⚠️ This student already received {approval.requested_meal} today!
                        </div>
                      )}
                      <div className="text-xs text-zinc-500 mt-2">
                        Face Confidence: {(approval.face_confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(approval.id)}
                        disabled={alreadyAte}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                          alreadyAte 
                            ? "bg-zinc-700 text-zinc-500 cursor-not-allowed" 
                            : "bg-green-600 hover:bg-green-500 text-white"
                        }`}
                        title={alreadyAte ? "Student already received this meal today" : "Approve request"}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="hidden sm:inline">Approve</span>
                      </button>
                      <button
                        onClick={() => handleDeny(approval.id)}
                        className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span className="hidden sm:inline">Deny</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
