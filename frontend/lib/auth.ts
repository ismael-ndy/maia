import { jwtDecode } from "jwt-decode"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface TokenPayload {
  sub: string
  role: "patient" | "therapist"
  exp: number
  first_name?: string
  last_name?: string
}

interface AuthResult {
  success: boolean
  error?: string
  role?: "patient" | "therapist"
}

export async function login(email: string, password: string): Promise<AuthResult> {
  try {
    const formData = new URLSearchParams()
    formData.append("username", email)
    formData.append("password", password)

    const response = await fetch(`${API_BASE_URL}/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.detail || "Invalid credentials" }
    }

    const data = await response.json()
    const decoded = jwtDecode<TokenPayload>(data.access_token)

    // Store token and user info
    localStorage.setItem("access_token", data.access_token)
    localStorage.setItem("user_role", decoded.role)
    localStorage.setItem("user_email", decoded.sub)

    return { success: true, role: decoded.role }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Connection error. Please try again." }
  }
}

interface SignupData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  role: "patient" | "therapist"
}

export async function signup(data: SignupData): Promise<AuthResult> {
  try {
    // UserIn schema: email, password, role, full_name, phone_number
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        role: data.role,
        full_name: `${data.firstName} ${data.lastName}`,
        phone_number: data.phone,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.detail || "Signup failed" }
    }

    const tokenData = await response.json()
    const decoded = jwtDecode<TokenPayload>(tokenData.access_token)

    // Store token and user info
    localStorage.setItem("access_token", tokenData.access_token)
    localStorage.setItem("user_role", decoded.role)
    localStorage.setItem("user_email", decoded.sub)

    return { success: true, role: decoded.role }
  } catch (error) {
    console.error("Signup error:", error)
    return { success: false, error: "Connection error. Please try again." }
  }
}

export function logout() {
  localStorage.removeItem("access_token")
  localStorage.removeItem("user_role")
  localStorage.removeItem("user_email")
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

export function getUserRole(): "patient" | "therapist" | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("user_role") as "patient" | "therapist" | null
}

export function isAuthenticated(): boolean {
  const token = getToken()
  if (!token) return false

  try {
    const decoded = jwtDecode<TokenPayload>(token)
    return decoded.exp * 1000 > Date.now()
  } catch {
    return false
  }
}
