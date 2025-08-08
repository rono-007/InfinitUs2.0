"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Message, ChatSession } from '@/lib/types';

interface ChatContextType {
  chatSessions: ChatSession[];
  activeChat: ChatSession | null;
  isThinking: boolean;
  setActiveChat: (chatId: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  createNewChat: () => ChatSession;
  setIsThinking: (isThinking: boolean) => void;
  deleteChat: (chatId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const activeChat = chatSessions.find(chat => chat.id === activeChatId) || null;

  const createNewChat = () => {
    const newChat: ChatSession = {
      id: `chat_${Date.now()}`,
      title: 'New Chat',
      messages: [],
      timestamp: Date.now()
    };
    setChatSessions(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    return newChat;
  };

  const setActiveChat = (chatId: string) => {
    setActiveChatId(chatId);
  };

  const addMessage = (chatId: string, message: Message) => {
    setChatSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === chatId) {
          const newMessages = [...session.messages, message];
          let newTitle = session.title;
          if (newMessages.length === 2 && newTitle === 'New Chat') {
             // Basic title generation from first user message and assistant response
             newTitle = newMessages[0].text.substring(0, 30) + "...";
          }
          return { ...session, messages: newMessages, title: newTitle };
        }
        return session;
      })
    );
  };

  const deleteChat = (chatId: string) => {
    setChatSessions(prevSessions => {
        const newSessions = prevSessions.filter(session => session.id !== chatId);
        if (activeChatId === chatId) {
            setActiveChatId(newSessions.length > 0 ? newSessions[0].id : null);
        }
        return newSessions;
    });
  };

  return (
    <ChatContext.Provider value={{ chatSessions, activeChat, isThinking, setActiveChat, addMessage, createNewChat, setIsThinking, deleteChat }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
