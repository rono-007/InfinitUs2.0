"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Message, ChatSession } from '@/lib/types';

const THINK_LONGER_USAGE_KEY = 'thinkLongerUsage';

interface ThinkLongerUsage {
    count: number;
    date: string; // YYYY-MM-DD
}

interface ChatContextType {
  chatSessions: ChatSession[];
  activeChat: ChatSession | null;
  isThinking: boolean;
  setActiveChat: (chatId: string) => void;
  addMessage: (chatId: string | null, message: Message) => string | undefined;
  createNewChat: () => void;
  setIsThinking: (isThinking: boolean) => void;
  deleteChat: (chatId: string) => void;
  clearAllChats: () => void;
  getThinkLongerUsage: () => ThinkLongerUsage;
  incrementThinkLongerUsage: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkLongerUsage, setThinkLongerUsage] = useState<ThinkLongerUsage>({ count: 0, date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    try {
        const storedUsage = localStorage.getItem(THINK_LONGER_USAGE_KEY);
        if (storedUsage) {
            const parsedUsage: ThinkLongerUsage = JSON.parse(storedUsage);
            const today = new Date().toISOString().split('T')[0];
            if (parsedUsage.date === today) {
                setThinkLongerUsage(parsedUsage);
            } else {
                // Reset for the new day
                const newUsage = { count: 0, date: today };
                localStorage.setItem(THINK_LONGER_USAGE_KEY, JSON.stringify(newUsage));
                setThinkLongerUsage(newUsage);
            }
        }
    } catch (error) {
        console.error("Could not read think longer usage from localStorage", error);
    }
  }, []);

  const getThinkLongerUsage = (): ThinkLongerUsage => {
    return thinkLongerUsage;
  };

  const incrementThinkLongerUsage = () => {
    const today = new Date().toISOString().split('T')[0];
    const newUsage = {
        count: thinkLongerUsage.date === today ? thinkLongerUsage.count + 1 : 1,
        date: today,
    };
    try {
        localStorage.setItem(THINK_LONGER_USAGE_KEY, JSON.stringify(newUsage));
        setThinkLongerUsage(newUsage);
    } catch (error) {
        console.error("Could not save think longer usage to localStorage", error);
    }
  };

  const activeChat = chatSessions.find(chat => chat.id === activeChatId) || null;

  const createNewChat = useCallback(() => {
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
    setActiveChatId(chatId);
  };

  const addMessage = useCallback((chatId: string | null, message: Message): string | undefined => {
    if (!chatId) {
        const newChatId = `chat_${Date.now()}`;
        const newChat: ChatSession = {
          id: newChatId,
          title: message.text.substring(0, 30) + (message.text.length > 30 ? "..." : ""),
          messages: [message],
          timestamp: Date.now()
        };
        setChatSessions(prev => [newChat, ...prev]);
        setActiveChatId(newChatId);
        return newChatId;
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
    return chatId;
  }, []);

  const deleteChat = (chatId: string) => {
    setChatSessions(prevSessions => {
        const newSessions = prevSessions.filter(session => session.id !== chatId);
        if (activeChatId === chatId) {
            setActiveChatId(newSessions.length > 0 ? newSessions[0].id : null);
        }
        return newSessions;
    });
  };

  const clearAllChats = () => {
    setChatSessions([]);
    setActiveChatId(null);
  };


  return (
    <ChatContext.Provider value={{ chatSessions, activeChat, isThinking, setActiveChat, addMessage, createNewChat, setIsThinking, deleteChat, clearAllChats, getThinkLongerUsage, incrementThinkLongerUsage }}>
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
