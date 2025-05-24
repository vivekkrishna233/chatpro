"use client";
import { useState } from 'react';
import { Chat } from '../../types/chat';
import Sidebar from '../sidebar/Sidebar';
import ChatList from '../chat/ChatList';
import ChatWindow from '../chat/ChatWindow';

export default function MainLayout() {
  const [selectedChat, setSelectedChat] = useState<Chat | undefined>();

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Chat List */}
      <ChatList 
        onChatSelect={handleChatSelect}
        selectedChatId={selectedChat?.id}
      />
      
      {/* Chat Window */}
      <ChatWindow selectedChat={selectedChat} />
    </div>
  );
}