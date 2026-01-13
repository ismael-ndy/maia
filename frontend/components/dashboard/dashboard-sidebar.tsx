"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { MaiaLogo } from "@/components/maia-logo"
import { Button } from "@/components/ui/button"
import { Users, AlertTriangle, LogOut, UserPlus } from "lucide-react"
import { logout } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { AddPatientDialog } from "./add-patient-dialog"

interface DashboardSidebarProps {
  activeTab: "patients" | "alerts"
  onTabChange: (tab: "patients" | "alerts") => void
  patientCount: number
  alertCount: number
}

export function DashboardSidebar({ activeTab, onTabChange, patientCount, alertCount }: DashboardSidebarProps) {
  const router = useRouter()
  const [showAddPatient, setShowAddPatient] = useState(false)

  function handleLogout() {
    logout()
    router.push("/")
  }

  return (
    <>
      <aside className="w-72 h-screen border-r border-border/50 flex flex-col bg-sidebar">
        {/* Logo */}
        <div className="h-16 border-b border-border/50 flex items-center px-6 gap-3">
          <Link href="/" className="flex items-center gap-3">
            <MaiaLogo className="h-8 w-8" />
            <span className="text-xl font-semibold text-foreground">Maia</span>
          </Link>
        </div>

        {/* Add Patient Button */}
        <div className="p-4">
          <Button className="w-full gap-2" onClick={() => setShowAddPatient(true)}>
            <UserPlus className="h-4 w-4" />
            Add Patient
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => onTabChange("patients")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors",
              activeTab === "patients"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/50",
            )}
          >
            <Users className="h-5 w-5" />
            <span className="font-medium">Patients</span>
            <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full">{patientCount}</span>
          </button>

          <button
            onClick={() => onTabChange("alerts")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors",
              activeTab === "alerts"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/50",
            )}
          >
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Alerts</span>
            {alertCount > 0 && (
              <span className="ml-auto text-xs bg-destructive text-white px-2 py-0.5 rounded-full">{alertCount}</span>
            )}
          </button>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border/50">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-3" />
            Sign out
          </Button>
        </div>
      </aside>

      <AddPatientDialog open={showAddPatient} onOpenChange={setShowAddPatient} />
    </>
  )
}
