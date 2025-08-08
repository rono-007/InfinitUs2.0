"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BrainCircuit, Paperclip, Send, Sparkles, X } from "lucide-react"
import type { Message } from "@/lib/types"
import { Card, CardContent } from "./ui/card"
import { AttachmentModal } from "./attachment-modal"
import { useChat } from "@/hooks/use-chat"
import { aiExplain } from "@/ai/flows/ai-explain"
import { useToast } from "@/hooks/use-toast"
import { ThemeSwitcher } from "./theme-switcher"

interface ChatComposerProps {
  onSendMessage: (message: string, model?: string) => void
  replyingTo: Message | null
  onClearReply: () => void
  isThinking: boolean
}

export function ChatComposer({ onSendMessage, replyingTo, onClearReply, isThinking }: ChatComposerProps) {
  const [message, setMessage] = React.useState("")
  const [isAttachmentModalOpen, setAttachmentModalOpen] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const { activeChat, addMessage, setIsThinking } = useChat()
  const { toast } = useToast()

  const handleSend = (model?: string) => {
    if (message.trim() && !isThinking) {
      onSendMessage(message, model)
      setMessage("")
    }
  }

  const handleThinkLonger = () => {
    handleSend("googleai/gemini-2.5-pro")
  }

  const handleExplain = async () => {
    if (!activeChat || activeChat.messages.length === 0 || isThinking) {
        toast({
            title: "Nothing to explain",
            description: "There are no messages in the chat to explain.",
        })
      return
    }

    setIsThinking(true)
    try {
      const lastMessage = activeChat.messages[activeChat.messages.length - 1]
      const result = await aiExplain({ text: lastMessage.text })
      
      const assistantMessage: Message = {
        id: String(Date.now()),
        role: 'assistant',
        text: result.explanation,
        timestamp: Date.now(),
      }
      addMessage(activeChat.id, assistantMessage)

    } catch (error) {
      console.error("Failed to get explanation:", error)
      toast({
        title: "Error",
        description: "Failed to get an explanation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsThinking(false)
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
        <Button size="icon" variant="ghost" className="absolute right-12 top-1/2 -translate-y-1/2" disabled={isThinking} onClick={() => setAttachmentModalOpen(true)}>
          <Paperclip />
        </Button>
        <Button size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => handleSend()} disabled={isThinking}>
          {isThinking ? (
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/70 animate-bounce-dot [animation-delay:-0.3s]"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/70 animate-bounce-dot [animation-delay:-0.15s]"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/70 animate-bounce-dot"></span>
            </div>
          ) : <Send />}
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" disabled={isThinking} onClick={handleExplain}>
            <Sparkles className="mr-2 h-4 w-4" />
            Explain
          </Button>
          <Button variant="outline" size="sm" disabled={isThinking} onClick={handleThinkLonger}>
            <BrainCircuit className="mr-2 h-4 w-4" />
            Think Longer
          </Button>
        </div>
        <div className="flex items-center gap-2">
            <ThemeSwitcher />
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
      <AttachmentModal isOpen={isAttachmentModalOpen} onOpenChange={setAttachmentModalOpen} />
    </div>
  )
}
