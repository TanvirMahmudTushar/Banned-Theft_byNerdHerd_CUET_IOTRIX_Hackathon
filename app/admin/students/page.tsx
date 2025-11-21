"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { getStudents } from "@/lib/api"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function StudentManagement() {
  const [students, setStudents] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await getStudents(page, 10)
        setStudents(data.students)
        setTotal(data.total)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [page])

  const totalPages = Math.ceil(total / 10)

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Student Management</h1>
            <p className="text-zinc-400">Manage enrolled students</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800 border-b border-zinc-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-300 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-300 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-300 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-300 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-300 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-300 uppercase">Face Enrolled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                        Loading students...
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                        No students found
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.id} className="hover:bg-zinc-800/50 transition">
                        <td className="px-6 py-4 text-sm text-zinc-300">{student.student_id}</td>
                        <td className="px-6 py-4 text-sm font-medium text-white">{student.name}</td>
                        <td className="px-6 py-4 text-sm text-zinc-400">{student.email}</td>
                        <td className="px-6 py-4 text-sm text-zinc-400">{student.department}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${student.is_active ? "bg-green-900 text-green-200" : "bg-red-900 text-red-200"}`}
                          >
                            {student.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${student.face_enrolled ? "bg-blue-900 text-blue-200" : "bg-zinc-700 text-zinc-300"}`}
                          >
                            {student.face_enrolled ? "Yes" : "No"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
                <div className="text-sm text-zinc-400">
                  Showing page {page} of {totalPages} ({total} total)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
                  >
                    <ChevronLeft className="w-5 h-5 text-zinc-400" />
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-2 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
                  >
                    <ChevronRight className="w-5 h-5 text-zinc-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
