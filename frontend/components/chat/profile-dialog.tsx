"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getProfile, type UserProfile } from "@/lib/api"
import { User, Mail, Phone, Shield, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfileDialogProps {
  children: React.ReactNode
}

export function ProfileDialog({ children }: ProfileDialogProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open && !profile) {
      loadProfile()
    }
  }, [open])

  async function loadProfile() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getProfile()
      setProfile(data)
    } catch (err) {
      setError("Failed to load profile")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">My Profile</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={loadProfile}>
              Try again
            </Button>
          </div>
        ) : profile ? (
          <div className="space-y-6 py-4">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400/30 to-purple-400/30 blur-xl" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold">
                  {profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase()}
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground">{profile.full_name}</h3>
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium mt-1",
                  profile.role === "therapist" 
                    ? "bg-emerald-100 text-emerald-700" 
                    : "bg-violet-100 text-violet-700"
                )}>
                  <Shield className="h-3 w-3" />
                  {profile.role === "therapist" ? "Therapist" : "Patient"}
                </span>
              </div>
            </div>

            {/* Info Cards */}
            <div className="space-y-3">
              <ProfileInfoCard
                icon={Mail}
                label="Email"
                value={profile.email}
              />
              <ProfileInfoCard
                icon={Phone}
                label="Phone"
                value={profile.phone_number}
              />
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function ProfileInfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
      <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  )
}
