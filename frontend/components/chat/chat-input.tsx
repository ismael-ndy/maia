"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Send, Paperclip, Mic, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSend: (content: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
    }
  }, [message])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage("")
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="p-6 bg-gradient-to-t from-background via-background to-transparent">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div 
          className={cn(
            "relative rounded-2xl border bg-card shadow-lg transition-all duration-300",
            isFocused 
              ? "border-primary/50 shadow-xl shadow-primary/5 ring-4 ring-primary/10" 
              : "border-border/50 hover:border-border"
          )}
        >
          {/* Input Area */}
          <div className="flex items-end gap-2 p-3">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Ask me anything..."
              disabled={disabled}
              rows={1}
              className="flex-1 bg-transparent resize-none px-2 py-2 text-sm outline-none placeholder:text-muted-foreground/60 disabled:opacity-50 min-h-[40px]"
            />
          </div>
          
          {/* Bottom Bar */}
          <div className="flex items-center justify-between px-3 pb-3 pt-0">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled
                className="h-8 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 gap-2"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Deep Thought</span>
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim() || disabled}
              className={cn(
                "h-9 w-9 rounded-xl transition-all duration-200",
                message.trim() 
                  ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" 
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground/60 text-center mt-3">
          Maia is an AI companion. In case of emergency, please contact professional help.
        </p>
      </form>
    </div>
  )
}
