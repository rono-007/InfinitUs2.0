"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { Message, ChatSession } from '@/lib/types';

interface ChatContextType {
  chatSessions: ChatSession[];
  activeChat: ChatSession | null;
  isThinking: boolean;
  isPrivacyMode: boolean;
  setActiveChat: (chatId: string) => void;
  addMessage: (chatId: string | null, message: Message) => void;
  createNewChat: () => void;
  setIsThinking: (isThinking: boolean) => void;
  setIsPrivacyMode: (isPrivacy: boolean) => void;
  deleteChat: (chatId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [temporaryChat, setTemporaryChat] = useState<ChatSession | null>(null);


  const activeChat = isPrivacyMode && temporaryChat ? temporaryChat : chatSessions.find(chat => chat.id === activeChatId) || null;

  const createNewChat = useCallback(() => {
    setIsPrivacyMode(false);
    setTemporaryChat(null);
    const newChat: ChatSession = {
      id: `chat_${Date.now()}`,
      title: 'New Chat',
      messages: [],
      timestamp: Date.now()
    };
    setChatSessions(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  }, []);

  const setActiveChat = (chatId: string) => {
    setIsPrivacyMode(false);
    setTemporaryChat(null);
    setActiveChatId(chatId);
  };

  const addMessage = useCallback((chatId: string | null, message: Message) => {
    if (isPrivacyMode) {
        setTemporaryChat(prevChat => {
            const currentMessages = prevChat?.messages || [];
            const newMessages = [...currentMessages, message];
            if (!prevChat) {
                setActiveChatId(null);
                return {
                    id: `temp_${Date.now()}`,
                    title: 'Private Chat',
                    messages: newMessages,
                    timestamp: Date.now(),
                }
            }
            return { ...prevChat, messages: newMessages };
        })
        return;
    }

    if (!chatId) {
        const newChat: ChatSession = {
          id: `chat_${Date.now()}`,
          title: message.text.substring(0, 30) + (message.text.length > 30 ? "..." : ""),
          messages: [message],
          timestamp: Date.now()
        };
        setChatSessions(prev => [newChat, ...prev]);
        setActiveChatId(newChat.id);
        return;
    }

    setChatSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === chatId) {
          const newMessages = [...session.messages, message];
          let newTitle = session.title;
          if (session.title === 'New Chat' && message.role === 'user' && message.text) {
             const userMessage = newMessages.find(m => m.role === 'user');
             if (userMessage && userMessage.text) {
                newTitle = userMessage.text.substring(0, 30);
                if (userMessage.text.length > 30) {
                    newTitle += "...";
                }
             }
          }
          return { ...session, messages: newMessages, title: newTitle };
        }
        return session;
      })
    );
  }, [isPrivacyMode]);

  const deleteChat = (chatId: string) => {
    setChatSessions(prevSessions => {
        const newSessions = prevSessions.filter(session => session.id !== chatId);
        if (activeChatId === chatId) {
            setActiveChatId(newSessions.length > 0 ? newSessions[0].id : null);
        }
        return newSessions;
    });
  };

  const handleSetIsPrivacyMode = (isPrivate: boolean) => {
    if (isPrivate) {
        setTemporaryChat({
            id: `temp_${Date.now()}`,
            title: 'Private Chat',
            messages: [],
            timestamp: Date.now()
        })
    } else {
        setTemporaryChat(null);
    }
    setIsPrivacyMode(isPrivate);
  }

  return (
    <ChatContext.Provider value={{ chatSessions, activeChat, isThinking, isPrivacyMode, setActiveChat, addMessage, createNewChat, setIsThinking, setIsPrivacyMode: handleSetIsPrivacyMode, deleteChat }}>
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
