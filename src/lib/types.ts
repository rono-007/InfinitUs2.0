export type Attachment = {
  id: string;
  type: 'pdf' | 'image' | 'docx' | 'txt';
  name: string;
  size: number;
  url?: string;
  rawFile?: File;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  attachments?: Attachment[];
  timestamp: number;
  tone?: string;
  inReplyTo?: string;
  metadata?: {
    isReplying?: boolean;
    originalText?: string;
  };
};

export type ChatSession = {
    id: string;
    title: string;
    messages: Message[];
    timestamp: number;
}
