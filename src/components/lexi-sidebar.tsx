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
        d="M7.13527 6C7.13527 4.34315 8.47841 3 10.1353 3C11.7921 3 13.1353 4.34315 13.1353 6C13.1353 7.65685 11.7921 9 10.1353 9C8.47841 9 7.13527 7.65685 7.13527 6ZM13.8647 3C15.5216 3 16.8647 4.34315 16.8647 6C16.8647 7.65685 15.5216 9 13.8647 9C12.2079 9 10.8647 7.65685 10.8647 6C10.8647 4.34315 12.2079 3 13.8647 3Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
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
