"use client"

import { useEffect, useState } from "react"
import { getAnalytics, getRecentActivity, getStudents } from "@/lib/api"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsData, activityData, studentsData] = await Promise.all([
          getAnalytics(),
          getRecentActivity(),
          getStudents(1, 5),
        ])
        setAnalytics(analyticsData)
        setActivity(activityData)
        setStudents(studentsData.students)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-zinc-400">System analytics and management</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-4">7-Day Meal Trends</h2>
              {analytics ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.daily_meals || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="date" stroke="#a1a1aa" />
                    <YAxis stroke="#a1a1aa" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px" }}
                      cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                    />
                    <Legend />
                    <Bar dataKey="breakfast" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="lunch" stackId="a" fill="#22c55e" />
                    <Bar dataKey="dinner" stackId="a" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-zinc-400">Loading...</div>
              )}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4">Key Metrics</h2>
            {analytics ? (
              <div className="space-y-4">
                <div>
                  <div className="text-zinc-400 text-sm">Total Meals (7d)</div>
                  <div className="text-2xl font-bold text-green-500">{analytics.total_meals || 0}</div>
                </div>
                <div>
                  <div className="text-zinc-400 text-sm">Unique Students</div>
                  <div className="text-2xl font-bold text-blue-500">{analytics.unique_students || 0}</div>
                </div>
                <div>
                  <div className="text-zinc-400 text-sm">Avg Confidence</div>
                  <div className="text-2xl font-bold text-cyan-500">
                    {analytics.avg_confidence ? (analytics.avg_confidence * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-zinc-400">Loading...</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {activity.slice(0, 5).map((item: any, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-zinc-800 last:border-b-0">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm text-white">{item.description}</div>
                    <div className="text-xs text-zinc-500">{item.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4">Recent Students</h2>
            <div className="space-y-3">
              {students.map((student: any) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between pb-3 border-b border-zinc-800 last:border-b-0"
                >
                  <div>
                    <div className="text-sm font-medium text-white">{student.name}</div>
                    <div className="text-xs text-zinc-500">{student.student_id}</div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${student.is_active ? "bg-green-900 text-green-200" : "bg-red-900 text-red-200"}`}
                  >
                    {student.is_active ? "Active" : "Inactive"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
