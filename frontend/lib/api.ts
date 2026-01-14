import { getToken } from "./auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getToken()

  const headers: HeadersInit = {
    ...options.headers,
  }

  if (token) {
    ;(headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
  }

  if (!(options.body instanceof FormData)) {
    ;(headers as Record<string, string>)["Content-Type"] = "application/json"
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "An error occurred" }))
    throw new Error(error.detail || "Request failed")
  }

  return response
}

// User Profile API
export interface UserProfile {
  id: number
  email: string
  role: string
  full_name: string
  phone_number: string
}

export async function getProfile(): Promise<UserProfile> {
  const response = await fetchWithAuth("/auth/me")
  return response.json()
}

// Chat API
// ThreadMessage from backend - includes role for distinguishing user vs assistant messages
export interface ThreadMessage {
  timestamp: string
  content: string
  role: "user" | "assistant"
}

// Extended message for UI with id for React keys
export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: string
}

export async function getChatHistory(): Promise<ThreadMessage[]> {
  const response = await fetchWithAuth("/chats/messages")
  return response.json()
}

export function streamMessage(
  content: string, 
  onChunk: (chunk: string) => void, 
  onDone: (fullContent: string) => void,
  onError?: (error: string) => void
) {
  const token = getToken()
  let accumulatedContent = ""

  fetch(`${API_BASE_URL}/chats/messages/stream`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  }).then(async (response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Stream error" }))
      onError?.(errorData.detail || "Failed to send message")
      onDone(accumulatedContent)
      return
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      onDone(accumulatedContent)
      return
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split("\n")

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6)
          if (data === "[DONE]") {
            onDone(accumulatedContent)
            return
          }
          try {
            const parsed = JSON.parse(data)
            if (parsed.type === "error") {
              onError?.(parsed.message)
            } else if (parsed.content) {
              accumulatedContent += parsed.content
              onChunk(parsed.content)
            }
          } catch {
            // Skip non-JSON lines
          }
        }
      }
    }
    onDone(accumulatedContent)
  }).catch((error) => {
    console.error("Stream error:", error)
    onError?.("Connection error")
    onDone(accumulatedContent)
  })
}

// Therapist API
// UserOut from backend
export interface Patient {
  id: number
  email: string
  role: string
  full_name: string
  phone_number: string
}

export async function getPatients(): Promise<Patient[]> {
  const response = await fetchWithAuth("/therapists/patients")
  return response.json()
}

export async function getPatient(patientId: string | number): Promise<Patient> {
  const response = await fetchWithAuth(`/therapists/patients/${patientId}`)
  return response.json()
}

// AlertMessage from backend
export interface Alert {
  id: number
  therapist_id: number
  patient_id: number
  patient_name: string | null
  risk_level: "low" | "medium" | "high"
  cause: string
  created_at: string
}

export async function getAlerts(): Promise<Alert[]> {
  const response = await fetchWithAuth("/therapists/alerts")
  return response.json()
}

export async function getPatientAlerts(patientId: string | number): Promise<Alert[]> {
  const response = await fetchWithAuth(`/therapists/patients/${patientId}/alerts`)
  return response.json()
}

// ReportMessage from backend
export interface Report {
  id: number | null
  content: string
  patient_id: number
  created_at: string
}

export async function getPatientReports(patientId: string | number): Promise<Report[]> {
  const response = await fetchWithAuth(`/therapists/patients/${patientId}/reports`)
  return response.json()
}

export async function getPatientReport(patientId: string | number, reportId: string | number): Promise<Report> {
  const response = await fetchWithAuth(`/therapists/patients/${patientId}/reports/${reportId}`)
  return response.json()
}

export async function generateReport(patientId: string | number): Promise<Report> {
  const response = await fetchWithAuth(`/therapists/patients/${patientId}/reports`, {
    method: "POST",
  })
  return response.json()
}

// Patient Notes API
export interface PatientNote {
  id: number
  patient_id: number
  therapist_id: number
  file_name: string
  created_at: string
}

export async function getPatientNotes(patientId: string | number): Promise<PatientNote[]> {
  const response = await fetchWithAuth(`/therapists/patients/${patientId}/notes`)
  return response.json()
}

export async function uploadPatientNote(patientId: string | number, file: File): Promise<PatientNote> {
  const formData = new FormData()
  formData.append("file", file)
  
  const response = await fetchWithAuth(`/therapists/patients/${patientId}/notes`, {
    method: "POST",
    body: formData,
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `Upload failed with status ${response.status}`)
  }
  
  return response.json()
}

// Friend Requests API
// FriendRequest from backend
export interface FriendRequest {
  friend_user_id: number
  status: string
  name: string
  email: string
  phone_number: string
}

export async function getFriendRequests(status?: string): Promise<FriendRequest[]> {
  const url = status ? `/friend-requests/?fr_status=${encodeURIComponent(status)}` : "/friend-requests/"
  const response = await fetchWithAuth(url)
  return response.json()
}

export async function sendFriendRequest(patientEmail: string): Promise<{ status: string }> {
  const response = await fetchWithAuth(`/friend-requests/?patient_email=${encodeURIComponent(patientEmail)}`, {
    method: "POST",
  })
  return response.json()
}

export async function acceptFriendRequest(therapistId: number): Promise<{ status: string }> {
  const response = await fetchWithAuth(`/friend-requests/${therapistId}/accept`, {
    method: "POST",
  })
  return response.json()
}

export async function declineFriendRequest(therapistId: number): Promise<{ status: string }> {
  const response = await fetchWithAuth(`/friend-requests/${therapistId}/decline`, {
    method: "POST",
  })
  return response.json()
}

// Note: Alerts API is not yet implemented in the backend
// Note: getMyTherapist endpoint is not yet implemented in the backend
