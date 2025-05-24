"use client";

import { useState, useEffect } from 'react';
import { AiOutlineSearch, AiOutlineMore, AiOutlineInfoCircle } from 'react-icons/ai';
import { MdOutlineGroup } from 'react-icons/md';
import { Chat, Message } from '../../types/chat';
import { mockMessages } from '../../data/mockData';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import Avatar from '../ui/Avatar';

interface ChatWindowProps {
  selectedChat?: Chat;
}

export default function ChatWindow({ selectedChat }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (selectedChat) {
      // Filter messages for selected chat
      const chatMessages = mockMessages.filter(msg => msg.chatId === selectedChat.id);
      setMessages(chatMessages);
    }
  }, [selectedChat]);

  const handleSendMessage = (content: string) => {
    if (!selectedChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      chatId: selectedChat.id,
      sender: 'You',
      content,
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      type: 'sent',
      status: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <MdOutlineGroup className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Select a chat to start messaging</h3>
          <p className="text-sm">Choose from your existing chats or start a new conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar 
              fallback={selectedChat.name}
              size="md"
              isOnline={selectedChat.isOnline}
            />
            <div>
              <h2 className="font-semibold text-gray-900">{selectedChat.name}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Rooh Arnal, Roohrag de, Bharat Kumar Ramesh, Periskope</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-600">+3</span>
              <div className="flex -space-x-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Avatar key={i} size="sm" fallback={`U${i}`} className="border-2 border-white" />
                ))}
              </div>
            </div>
            <AiOutlineSearch className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700" />
            <AiOutlineMore className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700" />
            <AiOutlineInfoCircle className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Date Separators and Messages */}
        <div className="flex justify-center">
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
            22-01-2025
          </span>
        </div>

        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        ) : (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}

        <div className="flex justify-center">
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
            23-01-2025
          </span>
        </div>
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}
