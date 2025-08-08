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
import { useChat } from "@/hooks/use-chat"
import { Bot } from "lucide-react"
import { SidebarTrigger } from "./ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { ThemeSwitcher } from "./theme-switcher"

export function ChatArea() {
  const { activeChat, addMessage, createNewChat, isThinking, setIsThinking } = useChat();
  const [isReplying, setIsReplying] = React.useState<Message | null>(null)
  const [selectedModel, setSelectedModel] = React.useState("googleai/gemini-2.0-flash")
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const isMobile = useIsMobile()

  const handleSendMessage = async (text: string, model?: string) => {
    let currentChat = activeChat;
    if (!currentChat) {
      currentChat = createNewChat();
    }

    const newMessage: Message = {
      id: String(Date.now()),
      role: 'user',
      text,
      timestamp: Date.now(),
      ...(isReplying && { inReplyTo: isReplying.id, metadata: { isReplying: true, originalText: isReplying.text } })
    }
    
    addMessage(currentChat.id, newMessage);
    
    setIsReplying(null)
    setIsThinking(true)

    try {
      const history = currentChat?.messages.slice(-10).map(m => ({ isUser: m.role === 'user', text: m.text, role: m.role })) || [];
      const result = await chat({ message: text, history: [...history, { role: 'user', text, isUser: true }], model: model || selectedModel } as ChatInput);
      const assistantMessage: Message = {
        id: String(Date.now()),
        role: 'assistant',
        text: result.message,
        timestamp: Date.now(),
      }
      addMessage(currentChat.id, assistantMessage)
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
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [activeChat?.messages, isThinking])


  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold font-headline">Chat</h2>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeSwitcher />
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[140px] sm:w-[180px]">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="googleai/gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                <SelectItem value="googleai/gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                <SelectItem value="googleai/gemini-2.5-flash-lite">Gemini 2.5 Flash-Lite</SelectItem>
                <SelectItem value="googleai/gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                <SelectItem value="googleai/gemini-2.0-flash-lite">Gemini 2.0 Flash-Lite</SelectItem>
            </SelectContent>
          </Select>
          <div className="items-center gap-2 hidden sm:flex">
            <Switch id="privacy-mode" />
            <Label htmlFor="privacy-mode">Privacy</Label>
          </div>
        </div>
      </header>

      {activeChat && activeChat.messages.length > 0 ? (
        <ScrollArea className="flex-grow p-4" viewportRef={viewportRef}>
          <div className="space-y-6 max-w-4xl mx-auto">
            {activeChat.messages.map((message) => (
              <ChatMessage key={message.id} message={message} onReply={handleReply} />
            ))}
            {isThinking && <ChatMessage key="thinking" message={{id: "thinking", role: "assistant", text: "...", timestamp: Date.now()}} onReply={() => {}} />}
          </div>
          <ScrollBar />
        </ScrollArea>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center p-4">
            <div className="text-center">
                <div className="inline-block p-4 bg-primary/10 rounded-full">
                    <Bot size={40} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold mt-4">InfinitUs 2.0</h2>
                <p className="text-muted-foreground">Infinite possibilities, one question away.</p>
            </div>
        </div>
      )}

      <div className="p-4 bg-background">
        <div className="max-w-4xl mx-auto">
          {(!activeChat || activeChat.messages.length === 0) && !isMobile && <SuggestionCarousel onSuggestionClick={(suggestion) => handleSendMessage(suggestion)} />}
          <ChatComposer onSendMessage={handleSendMessage} replyingTo={isReplying} onClearReply={() => setIsReplying(null)} isThinking={isThinking} />
        </div>
      </div>
    </div>
  )
}
