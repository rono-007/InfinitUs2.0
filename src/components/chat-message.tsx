"use client"

import * as React from "react"
import type { Message } from "@/lib/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Infinity, Copy, CornerUpLeft, User, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "./ui/card"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from "next/image"


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
      description: "The message has been copied.",
    })
  }

  const isAssistant = message.role === 'assistant'
  const isThinking = message.id === 'thinking'

  const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const code = String(children).replace(/\n$/, '');

    const handleCodeCopy = () => {
      handleCopy(code);
    }

    return !inline ? (
      <div className="relative my-2">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={handleCodeCopy}
        >
          <Copy size={14} />
        </Button>
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match ? match[1] : 'text'}
          PreTag="div"
          {...props}
          customStyle={{
            borderRadius: '0.5rem',
            padding: '1rem'
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code className="bg-muted px-1 py-0.5 rounded-sm" {...props}>
        {children}
      </code>
    );
  };


  return (
    <div className={cn("flex items-start gap-4", !isAssistant && "justify-end animate-message-in")}>
      {isAssistant && (
        <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback><Infinity size={20} /></AvatarFallback>
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
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-2 grid grid-cols-2 gap-2">
              {message.attachments.map(att => (
                att.type === 'image' && att.url ? (
                  <Image key={att.id} src={att.url} alt={att.name} width={150} height={150} className="rounded-md object-cover" />
                ) : (
                  <div key={att.id} className="flex items-center gap-2 p-2 rounded-md bg-muted text-sm">
                    <Paperclip size={16} />
                    <span>{att.name}</span>
                  </div>
                )
              ))}
            </div>
          )}
          <div className={cn(
            "p-4 rounded-lg",
            isAssistant ? "bg-card rounded-tl-none" : "bg-primary text-primary-foreground rounded-br-none",
            isThinking && "p-2",
            !message.text && "p-0"
          )}>
            {isThinking ? (
              <div className="flex items-center justify-center p-2">
                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/70 animate-typing-dot"></span>
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/70 animate-typing-dot [animation-delay:0.2s]"></span>
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/70 animate-typing-dot [animation-delay:0.4s]"></span>
                </div>
              </div>
            ) : (
            message.text && <div className="prose prose-sm dark:prose-invert max-w-none prose-p:m-0 prose-headings:m-0 prose-ul:m-0 prose-ol:m-0 prose-li:my-1 prose-a:text-primary hover:prose-a:underline">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code: CodeBlock,
                  }}
                >
                  {message.text}
                </ReactMarkdown>
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
