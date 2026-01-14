"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MaiaLogo } from "@/components/maia-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  MessageCircle, 
  User, 
  LogOut, 
  Plus, 
  Search, 
  BookOpen, 
  CircleUser
} from "lucide-react"
import { logout } from "@/lib/auth"
import { getFriendRequests } from "@/lib/api"
import { cn } from "@/lib/utils"
import { ProfileDialog } from "./profile-dialog"

interface ChatSidebarProps {
  activeTab: "chat" | "therapist" | "resources"
  onTabChange: (tab: "chat" | "therapist" | "resources") => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function ChatSidebar({ activeTab, onTabChange, searchQuery, onSearchChange }: ChatSidebarProps) {
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

  function handleNewChat() {
    onTabChange("chat")
  }

  return (
    <aside className="w-72 h-screen border-r border-border/40 flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <MaiaLogo className="h-8 w-8 transition-transform group-hover:scale-105" />
            <div className="absolute -inset-1 bg-primary/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Maia
          </span>
        </Link>
      </div>

      {/* New Chat Button */}
      <div className="px-4 mb-4">
        <Button 
          onClick={handleNewChat}
          className="w-full justify-start gap-3 h-11 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
        >
          <Plus className="h-4 w-4" />
          <span>New chat</span>
        </Button>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-muted/50 border-transparent focus:border-primary/50 focus:bg-background transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <span className="text-xs">✕</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-4 space-y-1 mb-6">
        <button
          onClick={() => onTabChange("chat")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200",
            activeTab === "chat"
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          <MessageCircle className="h-5 w-5" />
          <span>Chat</span>
        </button>

        <button
          onClick={() => onTabChange("therapist")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200",
            activeTab === "therapist"
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          <User className="h-5 w-5" />
          <span>My Therapist</span>
          {pendingCount > 0 && (
            <span className="ml-auto bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange("resources")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200",
            activeTab === "resources"
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          <BookOpen className="h-5 w-5" />
          <span>Resources</span>
        </button>
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User Section */}
      <div className="p-4 border-t border-border/40 space-y-1">
        <ProfileDialog>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl" 
          >
            <CircleUser className="h-4 w-4 mr-3" />
            My Profile
          </Button>
        </ProfileDialog>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl" 
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign out
        </Button>
      </div>
    </aside>
  )
}
