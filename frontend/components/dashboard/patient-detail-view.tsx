"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Markdown from "react-markdown"
import { MaiaLogo } from "@/components/maia-logo"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText, AlertTriangle, Loader2, Plus, User, Mail } from "lucide-react"
import { isAuthenticated, getUserRole } from "@/lib/auth"
import { getPatient, getPatientReports, generateReport, type Patient, type Report } from "@/lib/api"

interface PatientDetailViewProps {
  patientId: string
}

export function PatientDetailView({ patientId }: PatientDetailViewProps) {
  const router = useRouter()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

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

    loadPatientData()
  }, [patientId, router])

  async function loadPatientData() {
    try {
      const [patientData, reportsData] = await Promise.all([getPatient(patientId), getPatientReports(patientId)])
      setPatient(patientData)
      setReports(reportsData)
    } catch (error) {
      console.error("Failed to load patient data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGenerateReport() {
    setIsGenerating(true)
    try {
      const newReport = await generateReport(patientId)
      setReports((prev) => [newReport, ...prev])
      setSelectedReport(newReport)
    } catch (error) {
      console.error("Failed to generate report:", error)
    } finally {
      setIsGenerating(false)
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

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Patient not found</h1>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border/50 flex items-center px-6 gap-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to dashboard</span>
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">
              {patient.full_name}
            </h1>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span>{patient.email}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-8 max-w-5xl">
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="h-4 w-4" />
              Weekly Reports
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            {/* Generate Report Button */}
            <div className="flex justify-end">
              <Button onClick={handleGenerateReport} disabled={isGenerating} className="gap-2">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Generate Weekly Report
                  </>
                )}
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Reports List */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground">Report History</h3>
                {reports.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No reports yet. Generate your first report.</p>
                ) : (
                  <div className="space-y-2">
                    {reports.map((report) => (
                      <button
                        key={report.id}
                        onClick={() => setSelectedReport(report)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedReport?.id === report.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <p className="font-medium text-sm text-foreground">
                          {new Date(report.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{report.content.slice(0, 60)}...</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Report Detail */}
              <div className="md:col-span-2">
                {selectedReport ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Weekly Report -{" "}
                        {new Date(selectedReport.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </CardTitle>
                      <CardDescription>AI-generated summary of the patient's weekly activity</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <Markdown>{selectedReport.content}</Markdown>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">Select a report to view details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No alerts for this patient</h3>
                <p className="text-muted-foreground max-w-sm">
                  Safety alerts specific to this patient will appear here when detected by Maia.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
