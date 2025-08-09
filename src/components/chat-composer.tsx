"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BrainCircuit, Paperclip, Send, Sparkles, X, File as FileIcon, Loader2 } from "lucide-react"
import type { Message, Attachment } from "@/lib/types"
import { Card, CardContent } from "./ui/card"
import { AttachmentModal } from "./attachment-modal"
import { useChat } from "@/hooks/use-chat"
import { aiExplain } from "@/ai/flows/ai-explain"
import { useToast } from "@/hooks/use-toast"
import { ThemeSwitcher } from "./theme-switcher"

interface ChatComposerProps {
  onSendMessage: (message: string, model?: string, attachments?: Attachment[], documentText?: string) => void
  replyingTo: Message | null
  onClearReply: () => void
  isThinking: boolean
}

export function ChatComposer({ onSendMessage, replyingTo, onClearReply, isThinking }: ChatComposerProps) {
  const [message, setMessage] = React.useState("")
  const [attachments, setAttachments] = React.useState<Attachment[]>([])
  const [documentText, setDocumentText] = React.useState<string | undefined>(undefined);
  const [isParsing, setIsParsing] = React.useState(false);
  const [isAttachmentModalOpen, setAttachmentModalOpen] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const { activeChat, addMessage, setIsThinking } = useChat()
  const { toast } = useToast()

  const handleAddRawFiles = async (files: File[]) => {
    const documentFiles = files.filter(file => !file.type.startsWith('image/'));
    
    if (documentFiles.length > 0) {
      setIsParsing(true);
      // We only support one document at a time for parsing for now.
      const documentFile = documentFiles[0];
      const formData = new FormData();
      formData.append('file', documentFile);

      try {
        const response = await fetch('/api/parse-document', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
           const errorData = await response.json();
          throw new Error(errorData.details || 'Failed to parse document');
        }
        const { text } = await response.json();
        setDocumentText(text);
      } catch (error: any) {
        console.error(error);
        toast({
          title: "Error Parsing Document",
          description: error.message || "There was an error parsing your document. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsParsing(false);
      }
    }
    
    const newAttachmentsPromises = files.map(file => {
      return new Promise<Attachment>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          const attachment: Attachment = {
            id: `${file.name}-${file.lastModified}`,
            name: file.name,
            size: file.size,
            type: file.type.startsWith('image/') ? 'image' : 
                  file.type === 'application/pdf' ? 'pdf' :
                  file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? 'docx' : 'txt',
            url: url,
            rawFile: file,
          };
          resolve(attachment);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newAttachmentsPromises).then(newAttachments => {
        setAttachments(prev => [...prev, ...newAttachments]);
    })
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
        const attachmentToRemove = prev.find(att => att.id === id);
        if (attachmentToRemove && attachmentToRemove.type !== 'image') {
            setDocumentText(undefined);
        }
        return prev.filter(att => att.id !== id);
    });
  }


  const handleSend = (model?: string) => {
    if ((message.trim() || attachments.length > 0) && !isThinking) {
      onSendMessage(message, model, attachments, documentText)
      setMessage("")
      setAttachments([])
      setDocumentText(undefined)
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
                    {isParsing && att.type !== 'image' && <Loader2 className="h-4 w-4 animate-spin" />}
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
          disabled={isThinking || isParsing}
        />
        <Button size="icon" variant="ghost" className="absolute right-12 top-1/2 -translate-y-1/2" disabled={isThinking || isParsing} onClick={() => setAttachmentModalOpen(true)}>
          <Paperclip />
        </Button>
        <Button size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => handleSend()} disabled={isThinking || isParsing || (!message.trim() && attachments.length === 0)}>
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
          <Button variant="outline" size="sm" disabled={isThinking || isParsing} onClick={handleExplain}>
            <Sparkles className="mr-2 h-4 w-4" />
            Explain
          </Button>
          <Button variant="outline" size="sm" disabled={isThinking || isParsing} onClick={handleThinkLonger}>
            <BrainCircuit className="mr-2 h-4 w-4" />
            Think Longer
          </Button>
        </div>
        <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Select defaultValue="casual">
                <SelectTrigger className="w-[120px]" disabled={isThinking || isParsing}>
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
      <AttachmentModal isOpen={isAttachmentModalOpen} onOpenChange={setAttachmentModalOpen} onAddAttachments={handleAddRawFiles} />
    </div>
  )
}
