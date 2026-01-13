"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "./dashboard-sidebar"
import { PatientsList } from "./patients-list"
import { AlertsList } from "./alerts-list"
import { MaiaLogo } from "@/components/maia-logo"
import { isAuthenticated, getUserRole } from "@/lib/auth"
import { getPatients, type Patient } from "@/lib/api"
import { Loader2 } from "lucide-react"

// Alert type - API not yet implemented in backend
export interface Alert {
  id: string
  patient_id: string
  patient_name: string
  risk_level: "low" | "medium" | "high"
  urgency: string
  created_at: string
}

export function TherapistDashboard() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [activeTab, setActiveTab] = useState<"patients" | "alerts">("patients")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    const role = getUserRole()
    if (role !== "therapist") {
      router.push("/chat")
      return
    }

    loadData()
  }, [router])

  async function loadData() {
    try {
      // Note: Alerts API not yet implemented in backend
      const patientsData = await getPatients()
      setPatients(patientsData)
      setAlerts([]) // Alerts API not yet available
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <MaiaLogo className="h-16 w-16 animate-pulse" />
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-background">
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        patientCount={patients.length}
        alertCount={alerts.filter((a) => a.risk_level === "high").length}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-background/80 backdrop-blur-sm">
          <div>
            <h1 className="font-semibold text-foreground">
              {activeTab === "patients" ? "My Patients" : "Safety Alerts"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeTab === "patients"
                ? `${patients.length} patient${patients.length !== 1 ? "s" : ""} assigned`
                : `${alerts.length} alert${alerts.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "patients" ? <PatientsList patients={patients} /> : <AlertsList alerts={alerts} />}
        </div>
      </main>
    </div>
  )
}
