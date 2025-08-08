"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BrainCircuit, Loader, Paperclip, Send, Smile, Sparkles, X } from "lucide-react"
import type { Message } from "@/lib/types"
import { Card, CardContent } from "./ui/card"

interface ChatComposerProps {
  onSendMessage: (message: string) => void
  replyingTo: Message | null
  onClearReply: () => void
  isThinking: boolean
}

export function ChatComposer({ onSendMessage, replyingTo, onClearReply, isThinking }: ChatComposerProps) {
  const [message, setMessage] = React.useState("")
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (message.trim() && !isThinking) {
      onSendMessage(message)
      setMessage("")
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  React.useEffect(() => {
    if (replyingTo) {
      textareaRef.current?.focus()
    }
  }, [replyingTo])


  return (
    <div className="flex flex-col gap-2">
      {replyingTo && (
        <Card className="bg-muted/50">
          <CardContent className="p-2 flex items-center justify-between">
            <p className="text-sm text-muted-foreground truncate">
              Replying to: "{replyingTo.text}"
            </p>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClearReply}>
              <X size={16} />
            </Button>
          </CardContent>
        </Card>
      )}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="pr-24 min-h-[52px] resize-none"
          rows={1}
          disabled={isThinking}
        />
        <Button size="icon" variant="ghost" className="absolute right-12 top-1/2 -translate-y-1/2" disabled={isThinking}>
          <Paperclip />
        </Button>
        <Button size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={handleSend} disabled={isThinking}>
          {isThinking ? <Loader className="animate-spin" /> : <Send />}
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" disabled={isThinking}>
            <Sparkles className="mr-2" />
            Explain
          </Button>
          <Button variant="outline" size="sm" disabled={isThinking}>
            <BrainCircuit className="mr-2" />
            Think Longer
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Smile className="text-muted-foreground hidden sm:block" />
          <Select defaultValue="casual">
            <SelectTrigger className="w-[120px]" disabled={isThinking}>
              <SelectValue placeholder="Tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="understanding">Understanding</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
