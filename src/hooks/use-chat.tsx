"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Message, ChatSession } from '@/lib/types';

interface ChatContextType {
  chatSessions: ChatSession[];
  activeChat: ChatSession | null;
  isThinking: boolean;
  isPrivacyMode: boolean;
  setActiveChat: (chatId: string) => void;
  addMessage: (chatId: string | null, message: Message) => void;
  createNewChat: () => ChatSession;
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

  const createNewChat = () => {
    setIsPrivacyMode(false); // Creating a new chat turns off privacy mode
    setTemporaryChat(null); // Clear any temp chat
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
    setIsPrivacyMode(false); // Switching chats turns off privacy mode
    setTemporaryChat(null); // Clear any temp chat
    setActiveChatId(chatId);
  };

  const addMessage = (chatId: string | null, message: Message) => {
    if (isPrivacyMode) {
        setTemporaryChat(prevChat => {
            const currentMessages = prevChat?.messages || [];
            const newMessages = [...currentMessages, message];
            if (!prevChat) {
                // This is the first message of a new private chat
                setActiveChatId(null); // Ensure no "real" chat is active
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

    // This block handles non-privacy mode
    if (!chatId) { // This case happens when sending first message in a new, non-private chat
        const newChat = createNewChat();
        chatId = newChat.id;
    }

    setChatSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === chatId) {
          const newMessages = [...session.messages, message];
          let newTitle = session.title;
          if (newMessages.length === 2 && newTitle === 'New Chat') {
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

  const handleSetIsPrivacyMode = (isPrivate: boolean) => {
    if (isPrivate) {
        // When entering privacy mode, create a new temporary chat
        setTemporaryChat({
            id: `temp_${Date.now()}`,
            title: 'Private Chat',
            messages: [],
            timestamp: Date.now()
        })
    } else {
        // When leaving privacy mode, clear the temporary chat
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
