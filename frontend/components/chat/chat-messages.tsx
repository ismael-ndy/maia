"use client"

import { useEffect, useRef } from "react"
import Markdown from "react-markdown"
import { MaiaLogo } from "@/components/maia-logo"
import { cn } from "@/lib/utils"
import type { Message } from "@/lib/api"

interface ChatMessagesProps {
  messages: Message[]
  streamingContent: string
  isStreaming: boolean
}

export function ChatMessages({ messages, streamingContent, isStreaming }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamingContent])

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md space-y-6">
          <MaiaLogo className="h-20 w-20 mx-auto opacity-50" />
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Hello there</h2>
            <p className="text-muted-foreground leading-relaxed">
              I'm Maia, your AI companion. I'm here to listen and support you. How are you feeling today?
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {["I'm feeling anxious", "I had a good day", "I need to talk"].map((prompt) => (
              <button
                key={prompt}
                className="px-4 py-2 rounded-full bg-muted/50 text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((message) => (
        <div key={message.id} className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
          {message.role === "assistant" && <MaiaLogo className="h-8 w-8 shrink-0 mt-1" />}

          <div
            className={cn(
              "max-w-[70%] rounded-2xl px-4 py-3",
              message.role === "user"
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-muted/80 text-foreground rounded-tl-sm",
            )}
          >
            {message.role === "assistant" ? (
              <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-p:my-1">
                <Markdown>{message.content}</Markdown>
              </div>
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            )}
            <p className="text-xs mt-2 opacity-60">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
      ))}

      {/* Streaming message */}
      {isStreaming && (
        <div className="flex gap-3 justify-start">
          <MaiaLogo className="h-8 w-8 shrink-0 mt-1" />
          <div className="max-w-[70%] rounded-2xl rounded-tl-sm bg-muted/80 text-foreground px-4 py-3">
            {streamingContent ? (
              <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-p:my-1">
                <Markdown>{streamingContent}</Markdown>
              </div>
            ) : (
              <span className="inline-flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" />
                <span
                  className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <span
                  className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </span>
            )}
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}
