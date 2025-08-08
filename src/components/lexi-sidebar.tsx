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
import { MessageSquarePlus, Settings, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChat } from "@/hooks/use-chat"
import { formatDistanceToNow } from "date-fns"

const InfinitUsLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 12"
      {...props}
    >
        <path 
            d="M15.7,6.2c0,1.9-1.2,3.4-2.6,3.4s-2.6-1.5-2.6-3.4c0-1.9,1.2-3.4,2.6-3.4S15.7,4.3,15.7,6.2z M8.3,6.2
            c0,1.9-1.2,3.4-2.6,3.4S3,8.1,3,6.2s1.2-3.4,2.6-3.4S8.3,4.3,8.3,6.2z M20.9,6.2c0,3.5-2.2,6.4-5,6.4s-5-2.9-5-6.4
            c0-3.5,2.2-6.4,5-6.4S20.9,2.7,20.9,6.2z M12.5,6.2c0,3.5-2.2,6.4-5,6.4S2.5,9.7,2.5,6.2c0-3.5,2.2-6.4,5-6.4
            S12.5,2.7,12.5,6.2z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeMiterlimit="10"
        />
    </svg>
)


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
          <div className="bg-primary p-2.5 rounded-lg">
            <InfinitUsLogo className="h-4 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold font-headline">InfinitUs 2.0</h1>
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
