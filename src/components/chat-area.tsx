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

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    text: "Hello! I'm Lexi AI. How can I assist you today?",
    timestamp: Date.now() - 20000,
  },
  {
    id: "2",
    role: "user",
    text: "Can you explain what React Hooks are?",
    timestamp: Date.now() - 10000,
  },
  {
    id: "3",
    role: "assistant",
    text: `Of course! React Hooks are functions that let you “hook into” React state and lifecycle features from function components. They were introduced in React 16.8 and allow you to use state and other React features without writing a class.

### Key Hooks

- **useState**: Lets you add React state to function components.
- **useEffect**: Lets you perform side effects in function components. It's a close replacement for \`componentDidMount\`, \`componentDidUpdate\`, and \`componentWillUnmount\`.
- **useContext**: Lets you subscribe to React context without introducing nesting.

Here's a quick example of a counter using \`useState\`:

\`\`\`javascript
import React, { useState } from 'react';

function Counter() {
  // Declare a new state variable, which we'll call "count"
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

Would you like to dive deeper into a specific Hook?`,
    timestamp: Date.now(),
  },
];

export function ChatArea() {
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const [isReplying, setIsReplying] = React.useState<Message | null>(null)
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: String(Date.now()),
      role: 'user',
      text,
      timestamp: Date.now(),
      ...(isReplying && { inReplyTo: isReplying.id, metadata: { isReplying: true, originalText: isReplying.text } })
    }
    setMessages(prev => [...prev, newMessage])
    setIsReplying(null)
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
          <Select defaultValue="gpt-4">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4">GPT-4 Turbo</SelectItem>
              <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
              <SelectItem value="claude-3">Claude 3 Opus</SelectItem>
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
        </div>
        <ScrollBar />
      </ScrollArea>
      <div className="p-4 border-t bg-background">
        <div className="max-w-4xl mx-auto">
          <SuggestionCarousel onSuggestionClick={handleSendMessage} />
          <ChatComposer onSendMessage={handleSendMessage} replyingTo={isReplying} onClearReply={() => setIsReplying(null)} />
        </div>
      </div>
    </div>
  )
}
