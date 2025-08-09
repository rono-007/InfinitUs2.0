"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BrainCircuit, Paperclip, Send, Sparkles, X, File as FileIcon } from "lucide-react"
import type { Message, Attachment } from "@/lib/types"
import { Card, CardContent } from "./ui/card"
import { AttachmentModal } from "./attachment-modal"
import { useChat } from "@/hooks/use-chat"
import { aiExplain } from "@/ai/flows/ai-explain"
import { useToast } from "@/hooks/use-toast"
import { ThemeSwitcher } from "./theme-switcher"

interface ChatComposerProps {
  onSendMessage: (message: string, model?: string, attachments?: Attachment[]) => void
  replyingTo: Message | null
  onClearReply: () => void
  isThinking: boolean
}

export function ChatComposer({ onSendMessage, replyingTo, onClearReply, isThinking }: ChatComposerProps) {
  const [message, setMessage] = React.useState("")
  const [attachments, setAttachments] = React.useState<Attachment[]>([])
  const [isAttachmentModalOpen, setAttachmentModalOpen] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const { activeChat, addMessage, setIsThinking } = useChat()
  const { toast } = useToast()

  const handleAddAttachments = (files: File[]) => {
    const newAttachments: Attachment[] = files.map(file => ({
        id: `${file.name}-${file.lastModified}`,
        name: file.name,
        size: file.size,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type === 'application/pdf' ? 'pdf' :
              file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? 'docx' : 'txt',
        // In a real app, you'd handle file uploads and get a URL
        url: URL.createObjectURL(file) 
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  }


  const handleSend = (model?: string) => {
    if ((message.trim() || attachments.length > 0) && !isThinking) {
      onSendMessage(message, model, attachments)
      setMessage("")
      setAttachments([])
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
       {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
            {attachments.map(att => (
                <div key={att.id} className="relative group bg-muted p-2 rounded-md flex items-center gap-2 text-sm">
                    <FileIcon size={16} />
                    <span>{att.name}</span>
                    <Button variant="ghost" size="icon" className="h-5 w-5 absolute -top-2 -right-2 opacity-0 group-hover:opacity-100" onClick={() => removeAttachment(att.id)}>
                        <X size={14} />
                    </Button>
                </div>
            ))}
        </div>
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
        <Button size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => handleSend()} disabled={isThinking || (!message.trim() && attachments.length === 0)}>
          {isThinking ? (
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/70 animate-typing-dot"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/70 animate-typing-dot [animation-delay:0.2s]"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/70 animate-typing-dot [animation-delay:0.4s]"></span>
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
      <AttachmentModal isOpen={isAttachmentModalOpen} onOpenChange={setAttachmentModalOpen} onAddAttachments={handleAddAttachments} />
    </div>
  )
}
