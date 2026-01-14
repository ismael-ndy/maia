"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { User, ChevronRight, Mail, MessageSquare } from "lucide-react"
import type { Patient } from "@/lib/api"

interface PatientsListProps {
  patients: Patient[]
}

export function PatientsList({ patients }: PatientsListProps) {
  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-muted-foreground/30" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No patients found</h3>
        <p className="text-muted-foreground max-w-sm">
          Use the "Add Patient" button to send an assignment request to a patient by their email.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {patients.map((patient) => (
        <Link key={patient.id} href={`/dashboard/patients/${patient.id}`}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer group">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400/20 to-purple-400/20 blur-sm group-hover:blur-md transition-all" />
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {patient.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {patient.full_name}
                    </p>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{patient.email}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Active</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" title="Online recently" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
