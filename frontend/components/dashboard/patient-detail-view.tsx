"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Markdown from "react-markdown"
import { MaiaLogo } from "@/components/maia-logo"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ArrowLeft, 
  FileText, 
  AlertTriangle, 
  Loader2, 
  Plus, 
  User, 
  Mail, 
  Upload, 
  FileUp,
  File,
  Calendar,
  X,
  BookOpen,
  ExternalLink,
  Heart,
  Brain,
  Sparkles
} from "lucide-react"
import { isAuthenticated, getUserRole } from "@/lib/auth"
import { 
  getPatient, 
  getPatientReports, 
  generateReport, 
  getPatientNotes,
  uploadPatientNote,
  getPatientAlerts,
  type Patient, 
  type Report,
  type PatientNote,
  type Alert
} from "@/lib/api"

interface PatientDetailViewProps {
  patientId: string
}

export function PatientDetailView({ patientId }: PatientDetailViewProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [notes, setNotes] = useState<PatientNote[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [dragActive, setDragActive] = useState(false)

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
      const [patientData, reportsData, notesData, alertsData] = await Promise.all([
        getPatient(patientId), 
        getPatientReports(patientId),
        getPatientNotes(patientId),
        getPatientAlerts(patientId)
      ])
      setPatient(patientData)
      setReports(reportsData)
      setNotes(notesData)
      setAlerts(alertsData)
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

  async function handleFileUpload(file: File) {
    // Client-side file size check (5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      setUploadError(`File too large. Maximum size is 5MB, got ${(file.size / (1024 * 1024)).toFixed(1)}MB`)
      return
    }
    
    setIsUploading(true)
    setUploadError(null)
    try {
      const newNote = await uploadPatientNote(patientId, file)
      setNotes((prev) => [newNote, ...prev])
    } catch (error) {
      console.error("Failed to upload note:", error)
      if (error instanceof Error) {
        setUploadError(error.message)
      } else {
        setUploadError("Failed to upload file. Please try again.")
      }
    } finally {
      setIsUploading(false)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

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

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Patient not found</h1>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="h-16 border-b border-border/40 flex items-center px-6 gap-4 bg-background/70 backdrop-blur-md sticky top-0 z-10">
        <Button variant="ghost" size="icon" className="rounded-xl" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to dashboard</span>
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400/20 to-purple-400/20 blur-sm" />
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
              {patient.full_name.split(" ").map(n => n[0]).join("").toUpperCase()}
            </div>
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
      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="bg-muted/50 backdrop-blur-sm border border-border/50 p-1 rounded-xl">
            <TabsTrigger value="reports" className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FileText className="h-4 w-4" />
              Weekly Reports
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Upload className="h-4 w-4" />
              Session Notes
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <AlertTriangle className="h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <BookOpen className="h-4 w-4" />
              Resources
            </TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Weekly Reports</h2>
                <p className="text-sm text-muted-foreground">AI-generated summaries of patient activity</p>
              </div>
              <Button onClick={handleGenerateReport} disabled={isGenerating} className="gap-2 rounded-xl shadow-lg shadow-primary/20">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Reports List */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground px-1">Report History</h3>
                {reports.length === 0 ? (
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="py-8 text-center">
                      <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No reports yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {reports.map((report) => (
                      <button
                        key={report.id}
                        onClick={() => setSelectedReport(report)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                          selectedReport?.id === report.id
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border/50 bg-card/50 hover:bg-card hover:border-border hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          <p className="font-medium text-sm text-foreground">
                            {new Date(report.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate pl-5">{report.content.slice(0, 60)}...</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Report Detail */}
              <div className="md:col-span-2">
                {selectedReport ? (
                  <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        Weekly Report
                      </CardTitle>
                      <CardDescription>
                        {new Date(selectedReport.created_at).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground">
                        <Markdown>{selectedReport.content}</Markdown>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                      <p className="text-muted-foreground">Select a report to view details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Session Notes</h2>
              <p className="text-sm text-muted-foreground">Upload notes from in-person therapy sessions</p>
            </div>

            {/* Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200 ${
                dragActive 
                  ? "border-primary bg-primary/5" 
                  : "border-border/50 bg-card/30 hover:bg-card/50 hover:border-border"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.md"
              />
              
              <div className="flex flex-col items-center justify-center text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                  dragActive ? "bg-primary/10" : "bg-muted/50"
                }`}>
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  ) : (
                    <FileUp className={`h-8 w-8 ${dragActive ? "text-primary" : "text-muted-foreground"}`} />
                  )}
                </div>
                
                <h3 className="font-medium text-foreground mb-1">
                  {isUploading ? "Uploading..." : "Drop your notes here"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse from your computer
                </p>
                
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="rounded-xl"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                
                <p className="text-xs text-muted-foreground mt-4">
                  Supported: PDF, DOC, DOCX, TXT, MD (max 5MB)
                </p>
                
                {uploadError && (
                  <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {uploadError}
                  </div>
                )}
              </div>
            </div>

            {/* Notes List */}
            {notes.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground">Uploaded Notes</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {notes.map((note) => (
                    <Card key={note.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-sm transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center shrink-0">
                            <File className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate" title={note.file_name}>
                              {note.file_name}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(note.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {notes.length === 0 && (
              <Card className="border-border/50 bg-card/30">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
                    <Upload className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">No notes uploaded yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Upload notes from your therapy sessions to help Maia provide better support to your patient.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            {alerts.length === 0 ? (
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
                    <AlertTriangle className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No alerts for this patient</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Safety alerts specific to this patient will appear here when detected by Maia.
                  </p>
                </CardContent>
              </Card>
            ) : (
              alerts.map((alert) => (
                <Card 
                  key={alert.id} 
                  className={`border-l-4 ${
                    alert.risk_level === "high" 
                      ? "border-l-destructive bg-destructive/5" 
                      : alert.risk_level === "medium" 
                        ? "border-l-amber-500 bg-amber-500/5" 
                        : "border-l-muted"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`h-4 w-4 ${
                            alert.risk_level === "high" 
                              ? "text-destructive" 
                              : alert.risk_level === "medium" 
                                ? "text-amber-500" 
                                : "text-muted-foreground"
                          }`} />
                          <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                            alert.risk_level === "high" 
                              ? "bg-destructive/10 text-destructive" 
                              : alert.risk_level === "medium" 
                                ? "bg-amber-100 text-amber-800" 
                                : "bg-muted text-muted-foreground"
                          }`}>
                            {alert.risk_level.charAt(0).toUpperCase() + alert.risk_level.slice(1)} Risk
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{alert.cause}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(alert.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Recommended Resources</h2>
              <p className="text-sm text-muted-foreground">Books, articles, and tools to share with your patient</p>
            </div>

            {/* Books Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Recommended Books</h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: "Feeling Good: The New Mood Therapy",
                    author: "David D. Burns, MD",
                    description: "A classic guide to cognitive behavioral therapy techniques for depression and anxiety.",
                    category: "CBT",
                    link: "https://www.amazon.com/Feeling-Good-New-Mood-Therapy/dp/0380810336"
                  },
                  {
                    title: "The Body Keeps the Score",
                    author: "Bessel van der Kolk, MD",
                    description: "Explores how trauma affects the body and mind, and pathways to recovery.",
                    category: "Trauma",
                    link: "https://www.amazon.com/Body-Keeps-Score-Healing-Trauma/dp/0143127748"
                  },
                  {
                    title: "Atomic Habits",
                    author: "James Clear",
                    description: "Practical strategies for building good habits and breaking bad ones.",
                    category: "Self-Help",
                    link: "https://www.amazon.com/Atomic-Habits-Proven-Build-Break/dp/0735211299"
                  },
                  {
                    title: "The Anxiety and Phobia Workbook",
                    author: "Edmund J. Bourne, PhD",
                    description: "Comprehensive resource with exercises for managing anxiety disorders.",
                    category: "Anxiety",
                    link: "https://www.amazon.com/Anxiety-Phobia-Workbook-Edmund-Bourne/dp/1626252157"
                  },
                  {
                    title: "Mindfulness in Plain English",
                    author: "Bhante Gunaratana",
                    description: "A clear, practical guide to mindfulness meditation practice.",
                    category: "Mindfulness",
                    link: "https://www.amazon.com/Mindfulness-Plain-English-Anniversary-Edition/dp/0861719069"
                  },
                  {
                    title: "Lost Connections",
                    author: "Johann Hari",
                    description: "Explores the root causes of depression and anxiety beyond brain chemistry.",
                    category: "Depression",
                    link: "https://www.amazon.com/Lost-Connections-Uncovering-Depression-Unexpected/dp/163286830X"
                  }
                ].map((book, index) => (
                  <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-md transition-all duration-200 group">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center shrink-0">
                          <BookOpen className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm text-foreground line-clamp-2">{book.title}</p>
                            <a href={book.link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{book.description}</p>
                          <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{book.category}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Online Resources Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Online Resources</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    title: "Psychology Today",
                    description: "Articles, therapist directory, and mental health resources.",
                    link: "https://www.psychologytoday.com",
                    icon: Brain
                  },
                  {
                    title: "Headspace",
                    description: "Guided meditation and mindfulness exercises.",
                    link: "https://www.headspace.com",
                    icon: Heart
                  },
                  {
                    title: "NAMI (National Alliance on Mental Illness)",
                    description: "Support groups, education, and advocacy resources.",
                    link: "https://www.nami.org",
                    icon: Heart
                  },
                  {
                    title: "Calm",
                    description: "Sleep stories, meditation, and relaxation exercises.",
                    link: "https://www.calm.com",
                    icon: Sparkles
                  }
                ].map((resource, index) => {
                  const IconComponent = resource.icon
                  return (
                    <a 
                      key={index} 
                      href={resource.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-md hover:border-primary/30 transition-all duration-200 h-full">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center shrink-0">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm text-foreground">{resource.title}</p>
                                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{resource.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Crisis Resources */}
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Crisis Resources</h4>
                    <p className="text-sm text-muted-foreground mt-1">If your patient is in crisis, share these resources:</p>
                    <ul className="mt-3 space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="font-medium">Talk Suicide Canada:</span>
                        <span className="text-muted-foreground">1-833-456-4566 (24/7)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="font-medium">Crisis Text Line:</span>
                        <span className="text-muted-foreground">Text CONNECT to 686868</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="font-medium">Kids Help Phone:</span>
                        <span className="text-muted-foreground">1-800-668-6868</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="font-medium">Hope for Wellness (Indigenous):</span>
                        <span className="text-muted-foreground">1-855-242-3310</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
