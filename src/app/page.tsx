import { ChatArea } from '@/components/chat-area';
import { LexiSidebar } from '@/components/lexi-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ChatProvider } from '@/hooks/use-chat';

export default function Home() {
  return (
    <ChatProvider>
      <SidebarProvider>
        <LexiSidebar />
        <SidebarInset>
          <ChatArea />
        </SidebarInset>
      </SidebarProvider>
    </ChatProvider>
  );
}
