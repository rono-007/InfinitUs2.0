"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ChatMessage } from "./chat-message"
import { SuggestionCarousel } from "./suggestion-carousel"
import { ChatComposer } from "./chat-composer"
import type { Message } from "@/lib/types"
import { chat } from "@/ai/flows/chat"
import { useToast } from "@/hooks/use-toast"
import type { ChatInput } from "@/lib/ai-types"

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    text: "Hello! I'm Lexi AI. How can I assist you today?",
    timestamp: Date.now() - 20000,
  },
];

export function ChatArea() {
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const [isReplying, setIsReplying] = React.useState<Message | null>(null)
  const [isThinking, setIsThinking] = React.useState(false)
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const handleSendMessage = async (text: string) => {
    const newMessage: Message = {
      id: String(Date.now()),
      role: 'user',
      text,
      timestamp: Date.now(),
      ...(isReplying && { inReplyTo: isReplying.id, metadata: { isReplying: true, originalText: isReplying.text } })
    }
    const newMessages = [...messages, newMessage]
    setMessages(newMessages)
    setIsReplying(null)
    setIsThinking(true)

    try {
      const history = newMessages.slice(-10).map(m => ({ role: m.role, text: m.text, isUser: m.role === 'user' }));
      const result = await chat({ message: text, history } as ChatInput);
      const assistantMessage: Message = {
        id: String(Date.now()),
        role: 'assistant',
        text: result.message,
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Failed to get AI response:", error)
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsThinking(false)
    }
  }

  const handleReply = (message: Message) => {
    setIsReplying(message)
  }

  React.useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.children[0] as HTMLDivElement;
        if(viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages])


  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold font-headline">Chat</h2>
        <div className="flex items-center gap-4">
          <Select defaultValue="gemini-2.0-flash">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Switch id="privacy-mode" />
            <Label htmlFor="privacy-mode">Privacy</Label>
          </div>
        </div>
      </header>
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} onReply={handleReply} />
          ))}
          {isThinking && <ChatMessage key="thinking" message={{id: "thinking", role: "assistant", text: "...", timestamp: Date.now()}} onReply={() => {}} />}
        </div>
        <ScrollBar />
      </ScrollArea>
      <div className="p-4 border-t bg-background">
        <div className="max-w-4xl mx-auto">
          <SuggestionCarousel onSuggestionClick={handleSendMessage} />
          <ChatComposer onSendMessage={handleSendMessage} replyingTo={isReplying} onClearReply={() => setIsReplying(null)} isThinking={isThinking} />
        </div>
      </div>
    </div>
  )
}
