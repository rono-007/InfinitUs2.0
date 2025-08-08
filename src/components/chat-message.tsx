"use client"

import * as React from "react"
import type { Message } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bot, Copy, CornerUpLeft, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "./ui/card"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessageProps {
  message: Message
  onReply: (message: Message) => void
}

export function ChatMessage({ message, onReply }: ChatMessageProps) {
  const { toast } = useToast()
  const [formattedTimestamp, setFormattedTimestamp] = React.useState("")

  React.useEffect(() => {
    if (message.timestamp) {
      setFormattedTimestamp(new Date(message.timestamp).toLocaleTimeString())
    }
  }, [message.timestamp])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard!",
      description: "The code has been copied.",
    })
  }

  const isAssistant = message.role === 'assistant'
  const isThinking = message.id === 'thinking'

  const formatMessage = (text: string) => {
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    const parts = text.split(codeBlockRegex);

    return parts.map((part, index) => {
      if (index % 3 === 2) { // This is the code content
        const language = parts[index - 1] || 'plaintext';
        return (
          <div key={index} className="relative my-4">
             <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => handleCopy(part)}
              >
                <Copy size={14} />
              </Button>
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              customStyle={{ margin: 0, borderRadius: '0.5rem' }}
              codeTagProps={{ style: { fontFamily: 'inherit' } }}
            >
              {part}
            </SyntaxHighlighter>
          </div>
        );
      } else if (index % 3 === 0) { // This is regular text
        return part.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i !== part.split('\n').length - 1 && <br />}
          </span>
        ));
      }
      return null;
    });
  }


  return (
    <div className={cn("flex items-start gap-4", !isAssistant && "justify-end")}>
      {isAssistant && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback>{isThinking ? 
            <div className="flex items-center justify-center p-2">
                <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70 animate-bounce-dot [animation-delay:-0.3s]"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70 animate-bounce-dot [animation-delay:-0.15s]"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70 animate-bounce-dot"></span>
                </div>
            </div>
            : <Bot size={20} />}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn("flex flex-col gap-1 w-auto max-w-[80%]", !isAssistant && "items-end")}>
        <div className="group relative max-w-max">
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
            isThinking && "p-2"
          )}>
            {isThinking ? (
              <div className="flex items-center justify-center p-2">
                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/70 animate-bounce-dot [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/70 animate-bounce-dot [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/70 animate-bounce-dot"></span>
                </div>
              </div>
            ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:m-0">
                {formatMessage(message.text)}
            </div>
            )}
          </div>
          {!isThinking && !isAssistant && (
            <div className="absolute top-0 left-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1 p-1 bg-card/50 backdrop-blur-sm rounded-md border">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onReply(message)}>
                  <CornerUpLeft size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(message.text)}>
                  <Copy size={14} />
                </Button>
              </div>
            </div>
          )}
          {!isThinking && isAssistant && (
            <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1 p-1 bg-card/50 backdrop-blur-sm rounded-md border">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(message.text)}>
                        <Copy size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onReply(message)}>
                        <CornerUpLeft size={14} />
                    </Button>
                </div>
            </div>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {formattedTimestamp}
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
