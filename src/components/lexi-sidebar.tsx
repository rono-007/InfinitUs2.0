"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot, MessageSquarePlus, Settings } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

const chatHistory = [
  { id: 1, title: "React best practices", lastMessage: "Sure, let's start with hooks...", timestamp: "2h ago" },
  { id: 2, title: "Next.js 14 features", lastMessage: "The App Router is a game changer.", timestamp: "Yesterday" },
  { id: 3, title: "How to style with Tailwind", lastMessage: "Utility-first is the way to go.", timestamp: "3d ago" },
  { id: 4, title: "Kubernetes deployment", lastMessage: "You'll need a Dockerfile first.", timestamp: "1w ago" },
]

export function LexiSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Bot className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold font-headline">Lexi AI</h1>
        </div>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent className="p-0">
        <div className="p-2">
          <Button variant="secondary" className="w-full justify-start">
            <MessageSquarePlus className="mr-2" />
            <span className="group-data-[collapsible=icon]:hidden">New Chat</span>
          </Button>
        </div>
        <ScrollArea className="h-full px-2">
          <SidebarMenu>
            {chatHistory.map((chat) => (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton className="h-auto flex-col items-start p-2" tooltip={chat.title}>
                  <span className="w-full font-semibold">{chat.title}</span>
                  <span className="w-full text-xs text-muted-foreground">{chat.lastMessage}</span>
                  <span className="w-full text-xs text-muted-foreground/70 self-end text-right">{chat.timestamp}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings />
              <span className="group-data-[collapsible=icon]:hidden">Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Profile">
              <Avatar className="h-6 w-6">
                 <AvatarImage src="https://placehold.co/40x40" alt="User Avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <span className="group-data-[collapsible=icon]:hidden">User Profile</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
