"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChatSidebar } from "./chat-sidebar"
import { ChatMessages } from "./chat-messages"
import { ChatInput } from "./chat-input"
import { TherapistPanel } from "./therapist-panel"
import { MaiaLogo } from "@/components/maia-logo"
import { isAuthenticated, getUserRole } from "@/lib/auth"
import { getChatHistory, streamMessage, type Message, type ThreadMessage } from "@/lib/api"
import { Loader2 } from "lucide-react"

export function ChatInterface() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const [activeTab, setActiveTab] = useState<"chat" | "therapist">("chat")

  useEffect(() => {
    // Check auth and role
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    const role = getUserRole()
    if (role === "therapist") {
      router.push("/dashboard")
      return
    }

    // Load chat history
    loadChatHistory()
  }, [router])

  async function loadChatHistory() {
    try {
      const history = await getChatHistory()
      // Convert ThreadMessage[] to Message[] - backend now includes role
      const formattedMessages: Message[] = history.map((msg: ThreadMessage, index: number) => ({
        id: `msg-${index}`,
        content: msg.content,
        role: msg.role,
        timestamp: msg.timestamp,
      }))
      setMessages(formattedMessages)
    } catch (error) {
      console.error("Failed to load chat history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleSendMessage(content: string) {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      role: "user",
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Start streaming response
    setIsStreaming(true)
    setStreamingContent("")

    streamMessage(
      content,
      (chunk) => {
        setStreamingContent((prev) => prev + chunk)
      },
      (fullContent) => {
        // Add assistant message when done with the full accumulated content
        if (fullContent) {
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              content: fullContent,
              role: "assistant",
              timestamp: new Date().toISOString(),
            },
          ])
        }
        setStreamingContent("")
        setIsStreaming(false)
      },
      (error) => {
        console.error("Stream error:", error)
      }
    )
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

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <ChatSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen">
        {activeTab === "chat" ? (
          <>
            {/* Header */}
            <header className="h-16 border-b border-border/50 flex items-center px-6 gap-3 bg-background/80 backdrop-blur-sm">
              <MaiaLogo className="h-8 w-8" />
              <div>
                <h1 className="font-semibold text-foreground">Maia</h1>
                <p className="text-xs text-emerald-600">Always here for you</p>
              </div>
            </header>

            {/* Messages */}
            <ChatMessages messages={messages} streamingContent={streamingContent} isStreaming={isStreaming} />

            {/* Input */}
            <ChatInput onSend={handleSendMessage} disabled={isStreaming} />
          </>
        ) : (
          <>
            {/* Therapist Header */}
            <header className="h-16 border-b border-border/50 flex items-center px-6 gap-3 bg-background/80 backdrop-blur-sm">
              <div>
                <h1 className="font-semibold text-foreground">Therapist Connection</h1>
                <p className="text-xs text-muted-foreground">Manage your therapist assignment</p>
              </div>
            </header>

            {/* Therapist Panel */}
            <TherapistPanel />
          </>
        )}
      </main>
    </div>
  )
}
