"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { ChevronRight } from "lucide-react"

interface EnrollmentStep {
  id: number
  title: string
  description: string
}

const steps: EnrollmentStep[] = [
  { id: 1, title: "Basic Info", description: "Student details" },
  { id: 2, title: "Face Capture", description: "Take photos" },
  { id: 3, title: "RFID Card", description: "Register card" },
  { id: 4, title: "Setup PIN", description: "Security PIN" },
  { id: 5, title: "Meal Plan", description: "Select plan" },
  { id: 6, title: "Review", description: "Confirm & enroll" },
]

export default function EnrollmentWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    department: "",
    batch: new Date().getFullYear(),
    phone: "",
    gender: "",
    rfid: "",
    pin: "",
    mealPlan: "monthly",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNext = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1)
  }

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = () => {
    console.log("Enrollment data:", formData)
    alert("Enrollment submitted successfully!")
    setCurrentStep(1)
    setFormData({
      name: "",
      email: "",
      studentId: "",
      department: "",
      batch: new Date().getFullYear(),
      phone: "",
      gender: "",
      rfid: "",
      pin: "",
      mealPlan: "monthly",
    })
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Student Enrollment</h1>
            <p className="text-zinc-400">
              Step {currentStep} of {steps.length}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex gap-2 mb-8 overflow-x-auto">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold transition ${
                    currentStep === step.id
                      ? "bg-blue-600 text-white"
                      : currentStep > step.id
                        ? "bg-green-600 text-white"
                        : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {currentStep > step.id ? "✓" : step.id}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-4 h-1 ${currentStep > step.id ? "bg-green-600" : "bg-zinc-800"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Form Content */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">{steps[currentStep - 1].title}</h2>

            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Student ID *</label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                    placeholder="21CS001"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                      placeholder="Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center">
                  <div className="text-zinc-400 mb-4">📸 Camera Placeholder</div>
                  <div className="text-sm text-zinc-500">
                    In production, this would capture face photos using react-webcam
                  </div>
                </div>
                <div className="bg-blue-900/20 border border-blue-900 rounded-lg p-4 text-sm text-blue-200">
                  Capture at least 3 clear photos from different angles for better face recognition accuracy.
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">RFID Card ID *</label>
                  <input
                    type="text"
                    name="rfid"
                    value={formData.rfid}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none font-mono"
                    placeholder="A1B2C3D4E5F6"
                  />
                </div>
                <div className="bg-cyan-900/20 border border-cyan-900 rounded-lg p-4 text-sm text-cyan-200">
                  Tap the RFID card to the reader to register it.
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Create PIN (4 digits) *</label>
                  <input
                    type="password"
                    name="pin"
                    value={formData.pin}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                    placeholder="••••"
                    maxLength={4}
                  />
                </div>
                <div className="bg-amber-900/20 border border-amber-900 rounded-lg p-4 text-sm text-amber-200">
                  Use a 4-digit PIN for security. Remember this for meal access.
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Meal Plan</label>
                  <select
                    name="mealPlan"
                    value={formData.mealPlan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="monthly">Monthly - All meals included</option>
                    <option value="semester">Semester - Discounted rate</option>
                    <option value="token">Token Based - Pay per meal</option>
                  </select>
                </div>
                <div className="bg-green-900/20 border border-green-900 rounded-lg p-4 text-sm text-green-200">
                  Meal plans include breakfast, lunch, and dinner as applicable.
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-4">
                <div className="bg-zinc-800 rounded-lg p-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Name:</span>
                    <span className="text-white font-medium">{formData.name}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-700 pt-3">
                    <span className="text-zinc-400">Student ID:</span>
                    <span className="text-white font-medium">{formData.studentId}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-700 pt-3">
                    <span className="text-zinc-400">Department:</span>
                    <span className="text-white font-medium">{formData.department}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-700 pt-3">
                    <span className="text-zinc-400">Meal Plan:</span>
                    <span className="text-white font-medium capitalize">{formData.mealPlan}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-700 pt-3">
                    <span className="text-zinc-400">Face Enrolled:</span>
                    <span className="text-green-500 font-medium">Yes</span>
                  </div>
                </div>
                <div className="bg-green-900/20 border border-green-900 rounded-lg p-4 text-sm text-green-200">
                  Ready to enroll! Click the button below to complete the enrollment process.
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
              >
                Previous
              </button>
              {currentStep === steps.length ? (
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  Complete Enrollment
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
