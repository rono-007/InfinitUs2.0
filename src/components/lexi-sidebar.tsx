"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot, MessageSquarePlus, Settings, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChat } from "@/hooks/use-chat"
import { formatDistanceToNow } from "date-fns"

export function LexiSidebar() {
  const { chatSessions, activeChat, setActiveChat, createNewChat, deleteChat } = useChat();

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    deleteChat(chatId);
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Bot className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold font-headline">Lexi AI</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-0">
        <div className="p-2">
          <Button variant="secondary" className="w-full justify-start" onClick={createNewChat}>
            <MessageSquarePlus className="mr-2" />
            <span className="group-data-[collapsible=icon]:hidden">New Chat</span>
          </Button>
        </div>
        <ScrollArea className="h-full px-2">
          <SidebarMenu>
            {chatSessions.map((chat) => (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton 
                  className="h-auto flex-col items-start p-2" 
                  tooltip={chat.title}
                  isActive={activeChat?.id === chat.id}
                  onClick={() => setActiveChat(chat.id)}
                >
                  <span className="w-full font-semibold">{chat.title}</span>
                  <span className="w-full text-xs text-muted-foreground truncate">{chat.messages[chat.messages.length -1]?.text || "New Chat"}</span>
                  <span className="w-full text-xs text-muted-foreground/70 self-end text-right">
                    {chat.messages.length > 0 ? formatDistanceToNow(chat.messages[chat.messages.length - 1].timestamp, { addSuffix: true }) : ''}
                  </span>
                </SidebarMenuButton>
                <SidebarMenuAction showOnHover onClick={(e) => handleDeleteChat(e, chat.id)}>
                    <Trash2 />
                </SidebarMenuAction>
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
                 <AvatarImage src="https://placehold.co/40x40" alt="User Avatar" data-ai-hint="person face" />
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
