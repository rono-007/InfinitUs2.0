"use client"

import type { Message } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bot, Copy, CornerUpLeft, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "./ui/card"

interface ChatMessageProps {
  message: Message
  onReply: (message: Message) => void
}

export function ChatMessage({ message, onReply }: ChatMessageProps) {
  const { toast } = useToast()

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text)
    toast({
      title: "Copied to clipboard!",
      description: "The message has been copied.",
    })
  }

  const isAssistant = message.role === 'assistant'

  return (
    <div className={cn("flex items-start gap-4", !isAssistant && "justify-end")}>
      {isAssistant && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback><Bot size={20} /></AvatarFallback>
        </Avatar>
      )}
      <div className={cn("flex flex-col gap-1 max-w-[75%]", !isAssistant && "items-end")}>
        <div className="group relative">
          {message.metadata?.isReplying && (
            <Card className="mb-2 bg-muted/50 border-l-4 border-primary/50">
              <CardContent className="p-2 text-sm text-muted-foreground truncate">
                <p className="italic">Replying to: "{message.metadata.originalText}"</p>
              </CardContent>
            </Card>
          )}
          <div className={cn(
            "p-4 rounded-lg",
            isAssistant ? "bg-card rounded-tl-none" : "bg-primary text-primary-foreground rounded-br-none",
          )}>
            <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: message.text.replace(/\\n/g, '<br/>').replace(/```(javascript|typescript|jsx|tsx|html|css|json)?\n([\s\S]*?)\n```/g, (match, lang, code) => `<pre><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`) }} />
          </div>
          <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1 p-1 bg-card/50 backdrop-blur-sm rounded-md border">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
                <Copy size={14} />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onReply(message)}>
                <CornerUpLeft size={14} />
              </Button>
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
      {!isAssistant && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback><User size={20} /></AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
