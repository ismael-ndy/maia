"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { User, ChevronRight, Mail } from "lucide-react"
import type { Patient } from "@/lib/api"

interface PatientsListProps {
  patients: Patient[]
}

export function PatientsList({ patients }: PatientsListProps) {
  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No patients yet</h3>
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
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {patient.full_name}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{patient.email}</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
