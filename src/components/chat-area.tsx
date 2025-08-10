"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ChatMessage } from "./chat-message"
import { SuggestionCarousel } from "./suggestion-carousel"
import { ChatComposer } from "./chat-composer"
import type { Message, Attachment } from "@/lib/types"
import { chat } from "@/ai/flows/chat"
import { useToast } from "@/hooks/use-toast"
import type { ChatInput } from "@/lib/ai-types"
import { useChat } from "@/hooks/use-chat"
import { BrainCircuit, Infinity } from "lucide-react"
import { SidebarTrigger } from "./ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"

export function ChatArea() {
  const { activeChat, addMessage, isThinking, setIsThinking, isThinkingLonger, setIsThinkingLonger } = useChat();
  const [isReplying, setIsReplying] = React.useState<Message | null>(null)
  const [selectedModel, setSelectedModel] = React.useState("googleai/gemini-2.0-flash")
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const isMobile = useIsMobile()

  const handleSendMessage = async (text: string, model?: string, attachments?: Attachment[], documentText?: string, thinkLonger?: boolean) => {
    let chatId = activeChat?.id;
    
    const newMessage: Message = {
      id: String(Date.now()),
      role: 'user',
      text,
      attachments,
      timestamp: Date.now(),
      ...(thinkLonger && { thinkLonger: true }),
      ...(isReplying && { inReplyTo: isReplying.id, metadata: { isReplying: true, originalText: isReplying.text } })
    }
    
    const newChatId = addMessage(chatId, newMessage);
    if (!chatId && newChatId) {
      chatId = newChatId;
    }
    
    setIsReplying(null)

    if (thinkLonger) {
      setIsThinkingLonger(true);
    } else {
      setIsThinking(true);
    }

    try {
      const chatHistory = (activeChat?.messages || []).slice(-10);

      const history = chatHistory.map(m => ({ isUser: m.role === 'user', text: m.text, role: m.role as 'user' | 'assistant' }));
      
      const imageAttachment = attachments?.find(att => att.type === 'image' && att.url);
      const imageUrl = imageAttachment?.url;

      const result = await chat({ 
        message: text, 
        history, 
        model: model || selectedModel,
        ...(imageUrl && {imageUrl}),
        ...(documentText && {documentText}),
        thinkLonger: !!thinkLonger,
      } as ChatInput);

      const assistantMessage: Message = {
        id: String(Date.now()),
        role: 'assistant',
        text: result.message,
        timestamp: Date.now(),
      }
      addMessage(chatId, assistantMessage)
    } catch (error) {
      console.error("Failed to get AI response:", error)
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      })
    } finally {
      if (thinkLonger) {
        setIsThinkingLonger(false);
      } else {
        setIsThinking(false);
      }
    }
  }

  const handleReply = (message: Message) => {
    setIsReplying(message)
  }

  React.useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [activeChat?.messages, isThinking, isThinkingLonger])


  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2 flex-1">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold font-headline">Chat</h2>
        </div>
        <div className="flex-1 flex justify-center">
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
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">
        </div>
      </header>

      {activeChat && activeChat.messages.length > 0 ? (
        <ScrollArea className="flex-grow p-4" viewportRef={viewportRef}>
          <div className="space-y-6 max-w-4xl mx-auto">
            {activeChat.messages.map((message) => (
              <ChatMessage key={message.id} message={message} onReply={handleReply} />
            ))}
            {isThinking && !isThinkingLonger && <ChatMessage key="thinking" message={{id: "thinking", role: "assistant", text: "...", timestamp: Date.now()}} onReply={() => {}} />}
            {isThinkingLonger && (
                <div className="flex flex-col justify-center items-center py-4 gap-2">
                    <div className="relative flex items-center justify-center w-20 h-20">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse-glow"></div>
                        <BrainCircuit size={40} className="text-primary z-10 animate-pulse" />
                    </div>
                    <p className="text-sm text-muted-foreground animate-pulse">thinking...</p>
                </div>
            )}
          </div>
          <ScrollBar />
        </ScrollArea>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center p-4">
            <div className="relative flex items-center justify-center w-20 h-20">
                <div className="absolute inset-0 bg-white rounded-full blur-2xl opacity-50 animate-pulse-glow"></div>
                <Infinity size={40} className="text-primary z-10" />
            </div>
            <div className="text-center">
                <h2 className="text-2xl font-bold text-center font-headline mt-4">InfinitUs 2.0</h2>
                <p className="text-muted-foreground mt-2">Infinite possibilities, one question away.</p>
            </div>
        </div>
      )}

      <div className="p-4 bg-background">
        <div className="max-w-4xl mx-auto">
          {(!activeChat || activeChat.messages.length === 0) && !isMobile && <SuggestionCarousel onSuggestionClick={(suggestion) => handleSendMessage(suggestion)} />}
          <ChatComposer onSendMessage={handleSendMessage} replyingTo={isReplying} onClearReply={() => setIsReplying(null)} isThinking={isThinking || isThinkingLonger} />
        </div>
      </div>
    </div>
  )
}
