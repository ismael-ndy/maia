"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "./dashboard-sidebar"
import { PatientsList } from "./patients-list"
import { AlertsList } from "./alerts-list"
import { MaiaLogo } from "@/components/maia-logo"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { isAuthenticated, getUserRole } from "@/lib/auth"
import { getPatients, getAlerts, type Patient, type Alert } from "@/lib/api"
import { Loader2, Users, AlertTriangle, Activity, Search, TrendingUp } from "lucide-react"

export function TherapistDashboard() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [activeTab, setActiveTab] = useState<"patients" | "alerts">("patients")
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

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
      const [patientsData, alertsData] = await Promise.all([
        getPatients(),
        getAlerts(),
      ])
      setPatients(patientsData)
      setAlerts(alertsData)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter patients based on search query
  const filteredPatients = patients.filter(patient => 
    patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculate stats
  const highAlerts = alerts.filter(a => a.risk_level === "high").length
  const activePatients = patients.length // In future, filter by recent activity

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400/30 to-purple-400/30 blur-xl animate-pulse" />
            <MaiaLogo className="relative h-16 w-16" />
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-background via-muted/30 to-background">
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        patientCount={patients.length}
        alertCount={highAlerts}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border/40 flex items-center justify-between px-6 bg-background/70 backdrop-blur-md">
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "patients" ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-md transition-all duration-200">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{patients.length}</p>
                        <p className="text-sm text-muted-foreground">Total Patients</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-md transition-all duration-200">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center">
                        <Activity className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{activePatients}</p>
                        <p className="text-sm text-muted-foreground">Active This Week</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`border-border/50 backdrop-blur-sm hover:shadow-md transition-all duration-200 ${highAlerts > 0 ? 'bg-destructive/5 border-destructive/20' : 'bg-card/50 hover:bg-card'}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${highAlerts > 0 ? 'bg-destructive/10' : 'bg-gradient-to-br from-amber-500/10 to-orange-500/10'}`}>
                        <AlertTriangle className={`h-6 w-6 ${highAlerts > 0 ? 'text-destructive' : 'text-amber-600'}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{highAlerts}</p>
                        <p className="text-sm text-muted-foreground">Urgent Alerts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search patients by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 rounded-xl bg-card/50 border-border/50 focus:border-primary/50 focus:bg-background transition-colors"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Search Results Info */}
              {searchQuery && (
                <p className="text-sm text-muted-foreground">
                  {filteredPatients.length === 0 
                    ? `No patients found matching "${searchQuery}"`
                    : `Showing ${filteredPatients.length} of ${patients.length} patients`
                  }
                </p>
              )}

              {/* Patients List */}
              <PatientsList patients={filteredPatients} />
            </>
          ) : (
            <AlertsList alerts={alerts} />
          )}
        </div>
      </main>
    </div>
  )
}
