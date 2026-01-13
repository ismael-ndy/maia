"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MaiaLogo } from "@/components/maia-logo"
import { Button } from "@/components/ui/button"
import { MessageCircle, User, LogOut } from "lucide-react"
import { logout } from "@/lib/auth"
import { getFriendRequests, type FriendRequest } from "@/lib/api"
import { cn } from "@/lib/utils"

interface ChatSidebarProps {
  activeTab: "chat" | "therapist"
  onTabChange: (tab: "chat" | "therapist") => void
}

export function ChatSidebar({ activeTab, onTabChange }: ChatSidebarProps) {
  const router = useRouter()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    loadPendingCount()
  }, [])

  async function loadPendingCount() {
    try {
      const pending = await getFriendRequests("pending")
      setPendingCount(pending.length)
    } catch (error) {
      console.error("Failed to load pending requests:", error)
    }
  }

  function handleLogout() {
    logout()
    router.push("/")
  }

  return (
    <aside className="w-72 h-screen border-r border-border/50 flex flex-col bg-sidebar">
      {/* Logo */}
      <div className="h-16 border-b border-border/50 flex items-center px-6 gap-3">
        <Link href="/" className="flex items-center gap-3">
          <MaiaLogo className="h-8 w-8" />
          <span className="text-xl font-semibold text-foreground">Maia</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => onTabChange("chat")}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors",
            activeTab === "chat"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent/50",
          )}
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">Chat with Maia</span>
        </button>

        <button
          onClick={() => onTabChange("therapist")}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors",
            activeTab === "therapist"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent/50",
          )}
        >
          <User className="h-5 w-5" />
          <span className="font-medium">My Therapist</span>
          {pendingCount > 0 && (
            <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
              {pendingCount}
            </span>
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
  )
}
