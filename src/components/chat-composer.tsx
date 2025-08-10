"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BrainCircuit, Paperclip, Send, Sparkles, X, File as FileIcon, Loader2 } from "lucide-react"
import type { Message, Attachment } from "@/lib/types"
import { Card, CardContent } from "./ui/card"
import { AttachmentModal } from "./attachment-modal"
import { useChat } from "@/hooks/use-chat"
import { aiExplain } from "@/ai/flows/ai-explain"
import { useToast } from "@/hooks/use-toast"
import { ThemeSwitcher } from "./theme-switcher"
import * as pdfjs from "pdfjs-dist";
import mammoth from "mammoth/mammoth.browser";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


interface ChatComposerProps {
  onSendMessage: (message: string, model?: string, attachments?: Attachment[], documentText?: string, thinkLonger?: boolean) => void
  replyingTo: Message | null
  onClearReply: () => void
  isThinking: boolean
}

export function ChatComposer({ onSendMessage, replyingTo, onClearReply, isThinking }: ChatComposerProps) {
  const [message, setMessage] = React.useState("")
  const [attachments, setAttachments] = React.useState<Attachment[]>([])
  const [documentText, setDocumentText] = React.useState<string | undefined>(undefined);
  const [isParsing, setIsParsing] = React.useState(false);
  const [isAttachmentModalOpen, setAttachmentModalOpen] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const { activeChat, addMessage, setIsThinking, getThinkLongerUsage, incrementThinkLongerUsage, setIsThinkingLonger } = useChat()
  const { toast } = useToast()

  const parseDocument = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          if (!arrayBuffer) {
            return reject(new Error("File could not be read."));
          }

          if (file.type === 'application/pdf') {
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            let textContent = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const text = await page.getTextContent();
              textContent += text.items.map(item => (item as any).str).join(' ');
            }
            resolve(textContent);
          } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ arrayBuffer });
            resolve(result.value);
          } else if (file.type.startsWith('text/')) {
            resolve(new TextDecoder().decode(arrayBuffer));
          } else {
            reject(new Error(`Unsupported file type: ${file.type}`));
          }
        } catch (error) {
          console.error("Error parsing document:", error);
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleAddRawFiles = async (files: File[]) => {
    const documentFiles = files.filter(file => !file.type.startsWith('image/'));
    
    if (documentFiles.length > 0) {
      setIsParsing(true);
      // We only support one document at a time for parsing for now.
      const documentFile = documentFiles[0];
      
      try {
        const text = await parseDocument(documentFile);
        setDocumentText(text);
      } catch (error: any) {
        console.error(error);
        toast({
          title: "Error Parsing Document",
          description: error.message || "There was an error parsing your document. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsParsing(false);
      }
    }
    
    const newAttachmentsPromises = files.map(file => {
      return new Promise<Attachment>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          const attachment: Attachment = {
            id: `${file.name}-${file.lastModified}`,
            name: file.name,
            size: file.size,
            type: file.type.startsWith('image/') ? 'image' : 
                  file.type === 'application/pdf' ? 'pdf' :
                  file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? 'docx' : 'txt',
            url: url,
            rawFile: file,
          };
          resolve(attachment);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newAttachmentsPromises).then(newAttachments => {
        setAttachments(prev => [...prev, ...newAttachments]);
    })
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
        const attachmentToRemove = prev.find(att => att.id === id);
        if (attachmentToRemove && attachmentToRemove.type !== 'image') {
            setDocumentText(undefined);
        }
        return prev.filter(att => att.id !== id);
    });
  }


  const handleSend = () => {
    if ((message.trim() || attachments.length > 0) && !isThinking) {
      onSendMessage(message, undefined, attachments, documentText)
      setMessage("")
      setAttachments([])
      setDocumentText(undefined)
    }
  }

  const handleThinkLonger = async () => {
    const usage = getThinkLongerUsage();
    if (usage.count >= 5) {
      toast({
        title: "Think Longer Limit Reached",
        description: "You have used your 5 'Think Longer' credits for today. Please try again tomorrow.",
        variant: "destructive",
      });
      return;
    }
  
    if (!message.trim()) {
      toast({
        title: "Nothing to think about",
        description: "Please type a message before using Think Longer.",
      });
      return;
    }
    
    // Store values before clearing
    const messageToSend = message;
    const attachmentsToSend = attachments;
    const documentTextToSend = documentText;
    
    // Clear the input fields immediately
    setMessage("");
    setAttachments([]);
    setDocumentText(undefined);
    
    // Immediately send the user's message and then call the AI
    onSendMessage(messageToSend, "googleai/gemini-2.5-pro", attachmentsToSend, documentTextToSend, true);
    incrementThinkLongerUsage();
  }

  const handleExplain = async () => {
    const textToExplain = message.trim();
    const lastMessage = activeChat?.messages?.[activeChat.messages.length - 1];

    let explanationTarget = textToExplain;
    let chatId = activeChat?.id;

    if (!textToExplain && (!lastMessage || !lastMessage.text)) {
      toast({
        title: "Nothing to explain",
        description: "Type a message or have a conversation to use Explain.",
      });
      return;
    }

    if (isThinking) return;


    if (textToExplain) {
        explanationTarget = textToExplain;
        const userMessage: Message = {
            id: String(Date.now() + 1),
            role: 'user',
            text: `Explain - "${textToExplain}"`,
            timestamp: Date.now() - 1
        };
        chatId = addMessage(chatId, userMessage);
        setMessage("");
    } else {
        explanationTarget = lastMessage?.text;
    }


    setIsThinking(true);
    try {
      const result = await aiExplain({ text: explanationTarget });
      
      const assistantMessage: Message = {
        id: String(Date.now()),
        role: 'assistant',
        text: result.explanation,
        timestamp: Date.now(),
      }

      if (chatId) {
        addMessage(chatId, assistantMessage);
      }

    } catch (error) {
      console.error("Failed to get explanation:", error)
      toast({
        title: "Error",
        description: "Failed to get an explanation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsThinking(false)
    }
  }


  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  React.useEffect(() => {
    if (replyingTo) {
      textareaRef.current?.focus()
    }
  }, [replyingTo])


  return (
    <div className="flex flex-col gap-2">
      {replyingTo && (
        <Card className="bg-muted/50">
          <CardContent className="p-2 flex items-center justify-between">
            <p className="text-sm text-muted-foreground truncate">
              Replying to: "{replyingTo.text}"
            </p>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClearReply}>
              <X size={16} />
            </Button>
          </CardContent>
        </Card>
      )}
       {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
            {attachments.map(att => (
                <div key={att.id} className="relative group bg-muted p-2 rounded-md flex items-center gap-2 text-sm">
                    <FileIcon size={16} />
                    <span>{att.name}</span>
                    {isParsing && att.type !== 'image' && <Loader2 className="h-4 w-4 animate-spin" />}
                    <Button variant="ghost" size="icon" className="h-5 w-5 absolute -top-2 -right-2 opacity-0 group-hover:opacity-100" onClick={() => removeAttachment(att.id)}>
                        <X size={14} />
                    </Button>
                </div>
            ))}
        </div>
      )}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything that's on your mind..."
          className="pr-24 min-h-[52px] resize-none"
          rows={1}
          disabled={isThinking || isParsing}
        />
        <Button size="icon" variant="ghost" className="absolute right-12 top-1/2 -translate-y-1/2" disabled={isThinking || isParsing} onClick={() => setAttachmentModalOpen(true)}>
          <Paperclip />
        </Button>
        <Button size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => handleSend()} disabled={isThinking || isParsing || (!message.trim() && attachments.length === 0)}>
          {isThinking ? (
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/70 animate-typing-dot"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/70 animate-typing-dot [animation-delay:0.2s]"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/70 animate-typing-dot [animation-delay:0.4s]"></span>
            </div>
          ) : <Send />}
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" disabled={isThinking || isParsing} onClick={handleExplain}>
            <Sparkles className="mr-2 h-4 w-4" />
            Explain
          </Button>
          <Button variant="outline" size="sm" disabled={isThinking || isParsing} onClick={handleThinkLonger}>
            <BrainCircuit className="mr-2 h-4 w-4" />
            Think Longer
          </Button>
        </div>
        <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Select defaultValue="casual">
                <SelectTrigger className="w-[120px]" disabled={isThinking || isParsing}>
                <SelectValue placeholder="Tone" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="understanding">Understanding</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
      <AttachmentModal isOpen={isAttachmentModalOpen} onOpenChange={setAttachmentModalOpen} onAddAttachments={handleAddRawFiles} />
    </div>
  )
}
