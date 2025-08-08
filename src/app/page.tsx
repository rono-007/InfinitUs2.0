import { ChatArea } from '@/components/chat-area';
import { LexiSidebar } from '@/components/lexi-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function Home() {
  return (
    <SidebarProvider>
      <LexiSidebar />
      <SidebarInset>
        <ChatArea />
      </SidebarInset>
    </SidebarProvider>
  );
}
