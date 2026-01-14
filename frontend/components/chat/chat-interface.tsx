"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChatSidebar } from "./chat-sidebar"
import { ChatMessages } from "./chat-messages"
import { ChatInput } from "./chat-input"
import { TherapistPanel } from "./therapist-panel"
import { MaiaLogo } from "@/components/maia-logo"
import { Button } from "@/components/ui/button"
import { isAuthenticated, getUserRole, getUserName } from "@/lib/auth"
import { getChatHistory, streamMessage, type Message, type ThreadMessage } from "@/lib/api"
import { Loader2, MoreHorizontal, Share2, Download, BookOpen, ExternalLink, Heart, Brain, Sparkles, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function ChatInterface() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const [activeTab, setActiveTab] = useState<"chat" | "therapist" | "resources">("chat")
  const [userName, setUserName] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

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

    setUserName(getUserName())
    loadChatHistory()
  }, [router])

  async function loadChatHistory() {
    try {
      const history = await getChatHistory()
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
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      role: "user",
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])

    setIsStreaming(true)
    setStreamingContent("")

    streamMessage(
      content,
      (chunk) => {
        setStreamingContent((prev) => prev + chunk)
      },
      (fullContent) => {
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
        setIsStreaming(false)
      }
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <ChatSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen">
        {activeTab === "chat" ? (
          <>
            {/* Modern Header */}
            <header className="h-14 border-b border-border/40 flex items-center justify-between px-6 bg-background/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400/20 to-purple-400/20 blur-sm" />
                  <MaiaLogo className="relative h-7 w-7" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">Maia</span>
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {searchQuery && (
                  <span className="text-sm text-muted-foreground">
                    {messages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase())).length} results
                  </span>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 rounded-lg gap-2 text-muted-foreground">
                  <Download className="h-4 w-4" />
                  Export chat
                </Button>
              </div>
            </header>

            {/* Messages */}
            <ChatMessages 
              messages={messages} 
              streamingContent={streamingContent} 
              isStreaming={isStreaming}
              userName={userName}
              onSuggestionClick={handleSendMessage}
              searchQuery={searchQuery}
            />

            {/* Input */}
            <ChatInput onSend={handleSendMessage} disabled={isStreaming} />
          </>
        ) : activeTab === "therapist" ? (
          <>
            {/* Therapist Header */}
            <header className="h-14 border-b border-border/40 flex items-center px-6 bg-background/80 backdrop-blur-sm">
              <div>
                <h1 className="font-semibold text-foreground">Therapist Connection</h1>
                <p className="text-xs text-muted-foreground">Manage your therapist assignment</p>
              </div>
            </header>

            {/* Therapist Panel */}
            <TherapistPanel />
          </>
        ) : (
          <>
            {/* Resources Header */}
            <header className="h-14 border-b border-border/40 flex items-center px-6 bg-background/80 backdrop-blur-sm">
              <div>
                <h1 className="font-semibold text-foreground">Mental Health Resources</h1>
                <p className="text-xs text-muted-foreground">Books, articles, and helpful tools</p>
              </div>
            </header>

            {/* Resources Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                      <p className="text-sm text-muted-foreground mt-1">If you&apos;re in crisis, please reach out:</p>
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
            </div>
          </>
        )}
      </main>
    </div>
  )
}
