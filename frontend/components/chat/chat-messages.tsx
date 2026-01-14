"use client"

import { useEffect, useRef, useMemo } from "react"
import Markdown from "react-markdown"
import { MaiaLogo } from "@/components/maia-logo"
import { cn } from "@/lib/utils"
import type { Message } from "@/lib/api"
import { Brain, Heart, MessageSquare, Search } from "lucide-react"

interface ChatMessagesProps {
  messages: Message[]
  streamingContent: string
  isStreaming: boolean
  userName?: string | null
  onSuggestionClick?: (suggestion: string) => void
  searchQuery?: string
}

const suggestions = [
  {
    icon: Heart,
    title: "Check In",
    description: "How are you feeling today?",
    prompt: "I'd like to check in about how I'm feeling today",
  },
  {
    icon: Brain,
    title: "Reflect",
    description: "Process thoughts and experiences",
    prompt: "I want to reflect on some thoughts I've been having",
  },
  {
    icon: MessageSquare,
    title: "Just Talk",
    description: "Have a supportive conversation",
    prompt: "I just need someone to talk to right now",
  },
]

export function ChatMessages({ 
  messages, 
  streamingContent, 
  isStreaming, 
  userName,
  onSuggestionClick,
  searchQuery
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const firstMatchRef = useRef<HTMLDivElement>(null)

  // Filter and highlight messages based on search query
  const { filteredMessages, matchingIds } = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === "") {
      return { filteredMessages: messages, matchingIds: new Set<string>() }
    }
    const query = searchQuery.toLowerCase()
    const matching = messages.filter(m => m.content.toLowerCase().includes(query))
    return { 
      filteredMessages: matching,
      matchingIds: new Set(matching.map(m => m.id))
    }
  }, [messages, searchQuery])

  useEffect(() => {
    if (searchQuery && firstMatchRef.current) {
      firstMatchRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, streamingContent, searchQuery])

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        <div className="text-center max-w-2xl space-y-8">
          {/* Glowing Orb */}
          <div className="relative mx-auto w-32 h-32 mb-8">
            {/* Outer glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400/30 via-purple-300/20 to-pink-300/30 blur-2xl animate-pulse" />
            {/* Middle glow */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-300/40 via-purple-200/30 to-fuchsia-200/40 blur-xl" />
            {/* Inner orb */}
            <div className="absolute inset-6 rounded-full bg-gradient-to-br from-violet-200 via-purple-100 to-pink-100 shadow-lg shadow-purple-200/50">
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/30 to-white/60" />
            </div>
            {/* Highlight */}
            <div className="absolute top-8 left-10 w-4 h-4 rounded-full bg-white/80 blur-sm" />
          </div>

          {/* Greeting */}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Hello{userName ? `, ${userName}` : ""}
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              How can I assist you today?
            </p>
          </div>

          {/* Suggestion Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.title}
                onClick={() => onSuggestionClick?.(suggestion.prompt)}
                className="group p-5 rounded-2xl border border-border/50 bg-card/50 hover:bg-card hover:border-border hover:shadow-lg transition-all duration-300 text-left"
              >
                <suggestion.icon className="h-5 w-5 text-primary mb-3" />
                <h3 className="font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
                  {suggestion.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {suggestion.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Helper to highlight search matches in text
  function highlightMatches(text: string, query: string) {
    if (!query || query.trim() === "") return text
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-300 dark:bg-yellow-500/50 text-foreground rounded px-0.5">
          {part}
        </mark>
      ) : part
    )
  }

  // Show search results message when filtering
  const isSearching = searchQuery && searchQuery.trim() !== ""

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Search results banner */}
        {isSearching && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-sm">
            <Search className="h-4 w-4 text-primary" />
            <span className="text-foreground">
              {filteredMessages.length === 0 
                ? `No messages found for "${searchQuery}"`
                : `Found ${filteredMessages.length} message${filteredMessages.length === 1 ? '' : 's'} matching "${searchQuery}"`
              }
            </span>
          </div>
        )}

        {filteredMessages.map((message, index) => (
          <div 
            key={message.id}
            ref={index === 0 && isSearching ? firstMatchRef : undefined}
            className={cn(
              "flex gap-4",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <div className="shrink-0 mt-1">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400/30 to-purple-400/30 blur-sm" />
                  <MaiaLogo className="relative h-8 w-8" />
                </div>
              </div>
            )}

            <div
              className={cn(
                "max-w-[75%] rounded-2xl px-4 py-3",
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted/60 text-foreground rounded-bl-md border border-border/30",
                isSearching && "ring-2 ring-primary/30"
              )}
            >
              {message.role === "assistant" ? (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-p:my-2 prose-headings:my-3">
                  {isSearching ? (
                    <p>{highlightMatches(message.content, searchQuery)}</p>
                  ) : (
                    <Markdown>{message.content}</Markdown>
                  )}
                </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {isSearching ? highlightMatches(message.content, searchQuery) : message.content}
                </p>
              )}
              <p className={cn(
                "text-xs mt-2",
                message.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground/60"
              )}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {/* Streaming message */}
        {isStreaming && (
          <div className="flex gap-4 justify-start">
            <div className="shrink-0 mt-1">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400/30 to-purple-400/30 blur-sm animate-pulse" />
                <MaiaLogo className="relative h-8 w-8" />
              </div>
            </div>
            <div className="max-w-[75%] rounded-2xl rounded-bl-md bg-muted/60 text-foreground px-4 py-3 border border-border/30">
              {streamingContent ? (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-p:my-2">
                  <Markdown>{streamingContent}</Markdown>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 py-1">
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                  <span
                    className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <span
                    className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
