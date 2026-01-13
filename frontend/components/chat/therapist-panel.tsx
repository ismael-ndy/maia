"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, Bell, Check, X, Loader2, Mail, Phone } from "lucide-react"
import { getFriendRequests, acceptFriendRequest, declineFriendRequest, type FriendRequest } from "@/lib/api"
import { cn } from "@/lib/utils"

type TherapistSubTab = "my-therapist" | "requests"

export function TherapistPanel() {
  const [activeSubTab, setActiveSubTab] = useState<TherapistSubTab>("my-therapist")
  const [acceptedTherapists, setAcceptedTherapists] = useState<FriendRequest[]>([])
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setIsLoading(true)
    try {
      const [accepted, pending] = await Promise.all([
        getFriendRequests("accepted"),
        getFriendRequests("pending"),
      ])
      setAcceptedTherapists(accepted)
      setPendingRequests(pending)
    } catch (error) {
      console.error("Failed to load therapist data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAcceptRequest(therapistId: number) {
    try {
      await acceptFriendRequest(therapistId)
      await loadData()
    } catch (error) {
      console.error("Failed to accept request:", error)
    }
  }

  async function handleDeclineRequest(therapistId: number) {
    try {
      await declineFriendRequest(therapistId)
      await loadData()
    } catch (error) {
      console.error("Failed to decline request:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center p-8">
      {/* Centered Tabs */}
      <div className="flex items-center justify-center gap-1 p-1 bg-muted/50 rounded-lg mb-8">
        <button
          onClick={() => setActiveSubTab("my-therapist")}
          className={cn(
            "px-6 py-2.5 rounded-md text-sm font-medium transition-colors",
            activeSubTab === "my-therapist"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          My Therapist
        </button>
        <button
          onClick={() => setActiveSubTab("requests")}
          className={cn(
            "px-6 py-2.5 rounded-md text-sm font-medium transition-colors relative",
            activeSubTab === "requests"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Therapist Assignment Requests
          {pendingRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="w-full max-w-2xl">
        {activeSubTab === "my-therapist" ? (
          <MyTherapistContent therapists={acceptedTherapists} />
        ) : (
          <RequestsContent 
            requests={pendingRequests} 
            onAccept={handleAcceptRequest}
            onDecline={handleDeclineRequest}
          />
        )}
      </div>
    </div>
  )
}

interface MyTherapistContentProps {
  therapists: FriendRequest[]
}

function MyTherapistContent({ therapists }: MyTherapistContentProps) {
  if (therapists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No assigned therapist</h3>
        <p className="text-muted-foreground max-w-sm">
          You don't currently have an assigned therapist. When a therapist sends you an assignment request, you can accept it from the "Therapist Assignment Requests" tab.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {therapists.map((therapist) => (
        <Card key={therapist.friend_user_id}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{therapist.name}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Mail className="h-3 w-3" />
                  <span>{therapist.email}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                  <Phone className="h-3 w-3" />
                  <span>{therapist.phone_number}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

interface RequestsContentProps {
  requests: FriendRequest[]
  onAccept: (therapistId: number) => void
  onDecline: (therapistId: number) => void
}

function RequestsContent({ requests, onAccept, onDecline }: RequestsContentProps) {
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Bell className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No assignment requests</h3>
        <p className="text-muted-foreground max-w-sm">
          You don't have any pending therapist assignment requests. When a therapist wants to connect with you, their request will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.friend_user_id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{request.name}</p>
                  <p className="text-sm text-muted-foreground">Wants to be your therapist</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onAccept(request.friend_user_id)}
                  className="gap-1"
                >
                  <Check className="h-4 w-4" />
                  Accept
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onDecline(request.friend_user_id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
