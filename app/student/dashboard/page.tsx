"use client"

import { useAuth } from "@/lib/auth-context"
import { Coffee, Utensils, Moon, Send, CheckCircle } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"

export default function StudentDashboard() {
  const { user } = useAuth()
  const [selectedMeal, setSelectedMeal] = useState<string>("")
  const [studentName, setStudentName] = useState<string>("")
  const [studentId, setStudentId] = useState<string>("")
  const [tokenId, setTokenId] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  const handleMealRequest = async () => {
    if (!selectedMeal) {
      setMessage({ type: 'error', text: 'Please select a meal type' })
      return
    }

    if (!studentName) {
      setMessage({ type: 'error', text: 'Please enter your Name' })
      return
    }

    if (!studentId) {
      setMessage({ type: 'error', text: 'Please enter your Student ID' })
      return
    }

    if (!tokenId) {
      setMessage({ type: 'error', text: 'Please enter your Token ID' })
      return
    }

    setSubmitting(true)
    setMessage(null)

    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      
      const response = await fetch("http://127.0.0.1:8001/api/student/request-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: userData.id,
          student_name: studentName,
          student_id_number: studentId,
          token_id: tokenId,
          requested_meal: selectedMeal,
          face_confidence: 0.95
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Meal request sent to manager successfully!' })
        setSelectedMeal("")
        setStudentName("")
        setStudentId("")
        setTokenId("")
      } else {
        setMessage({ type: 'error', text: data.detail || 'Failed to send meal request' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error connecting to server' })
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return <Coffee className="w-12 h-12 text-blue-400" />
      case "lunch":
        return <Utensils className="w-12 h-12 text-green-400" />
      case "dinner":
        return <Moon className="w-12 h-12 text-yellow-400" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome, {user?.name}</h1>
          <p className="text-zinc-400">Request your meal access</p>
        </div>

        {/* Meal Request Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Request Meal</h2>
          
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-950 border border-green-700 text-green-200' 
                : 'bg-red-950 border border-red-700 text-red-200'
            }`}>
              {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
              <span>{message.text}</span>
            </div>
          )}

          <p className="text-zinc-400 mb-6">Enter your details and select the meal you want to request:</p>

          {/* Student ID and Token ID Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div>
              <label htmlFor="studentName" className="block text-sm font-medium text-zinc-300 mb-2">
                Name
              </label>
              <Input
                id="studentName"
                type="text"
                placeholder="e.g., Arjun Kumar"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-zinc-300 mb-2">
                Student ID
              </label>
              <Input
                id="studentId"
                type="text"
                placeholder="e.g., 2021001"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label htmlFor="tokenId" className="block text-sm font-medium text-zinc-300 mb-2">
                Token ID
              </label>
              <Input
                id="tokenId"
                type="text"
                placeholder="e.g., TK12345"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </div>

          <p className="text-zinc-400 mb-6">Select meal type:</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => setSelectedMeal("breakfast")}
              className={`p-6 rounded-lg border-2 transition-all ${
                selectedMeal === "breakfast"
                  ? "border-blue-500 bg-blue-950/30"
                  : "border-zinc-700 hover:border-zinc-600"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <Coffee className="w-12 h-12 text-blue-400" />
                <span className="text-lg font-semibold text-white">Breakfast</span>
                <span className="text-sm text-zinc-400">Morning Meal</span>
              </div>
            </button>

            <button
              onClick={() => setSelectedMeal("lunch")}
              className={`p-6 rounded-lg border-2 transition-all ${
                selectedMeal === "lunch"
                  ? "border-green-500 bg-green-950/30"
                  : "border-zinc-700 hover:border-zinc-600"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <Utensils className="w-12 h-12 text-green-400" />
                <span className="text-lg font-semibold text-white">Lunch</span>
                <span className="text-sm text-zinc-400">Afternoon Meal</span>
              </div>
            </button>

            <button
              onClick={() => setSelectedMeal("dinner")}
              className={`p-6 rounded-lg border-2 transition-all ${
                selectedMeal === "dinner"
                  ? "border-yellow-500 bg-yellow-950/30"
                  : "border-zinc-700 hover:border-zinc-600"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <Moon className="w-12 h-12 text-yellow-400" />
                <span className="text-lg font-semibold text-white">Dinner</span>
                <span className="text-sm text-zinc-400">Evening Meal</span>
              </div>
            </button>
          </div>

          <button
            onClick={handleMealRequest}
            disabled={submitting || !selectedMeal || !studentName || !studentId || !tokenId}
            className={`w-full py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
              submitting || !selectedMeal || !studentName || !studentId || !tokenId
                ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
          >
            <Send className="w-5 h-5" />
            {submitting ? "Sending Request..." : "Send Request to Manager"}
          </button>
        </div>
      </div>
    </div>
  )
}
