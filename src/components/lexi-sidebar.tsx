"use client"

import * as React from "react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Infinity, MessageSquarePlus, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChat } from "@/hooks/use-chat"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"


export function LexiSidebar() {
  const { chatSessions, activeChat, setActiveChat, createNewChat, deleteChat, clearAllChats } = useChat();
  const { toast } = useToast()

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    deleteChat(chatId);
  }

  const handleClearHistory = () => {
    clearAllChats()
    toast({
      title: "Chat history cleared",
      description: "All your conversations have been deleted.",
    })
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Infinity className="h-6 w-6 text-primary" />
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <SidebarMenuButton tooltip="Clear History">
                        <Trash2 />
                        <span className="group-data-[collapsible=icon]:hidden">Clear History</span>
                    </SidebarMenuButton>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        entire chat history.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearHistory}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
    </>
  )
}
