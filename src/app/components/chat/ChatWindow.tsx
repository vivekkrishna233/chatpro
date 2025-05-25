"use client";

import { useState, useEffect, useRef } from 'react';
import { AiOutlineSearch, AiOutlineMore, AiOutlineInfoCircle } from 'react-icons/ai';
import { MdOutlineGroup } from 'react-icons/md';
import { Chat, Message } from '../../types/chat';
import { useRealtimeMessages } from '@/app/lib/hooks/useRealtimeMessages';
import { sendMessage } from '../../services/chatService';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import Avatar from '../ui/Avatar';

interface ChatWindowProps {
  selectedChat?: Chat;
}

export default function ChatWindow({ selectedChat }: ChatWindowProps) {
  // Use real-time messages hook instead of mock data
  const { messages, loading, error } = useRealtimeMessages(selectedChat?.id || null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle sending messages to database
  const handleSendMessage = async (content: string) => {
    if (!selectedChat || sending || !content.trim()) return;

    try {
      setSending(true);
      await sendMessage(selectedChat.id, content.trim());
      // Message will be added automatically via real-time subscription
    } catch (error) {
      console.error('Failed to send message:', error);
      // You can add toast notification here
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Group messages by date for date separators
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const formatDateSeparator = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    }
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

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-500">
          <h3 className="text-lg font-medium mb-2">Error loading messages</h3>
          <p className="text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar
              fallback={selectedChat.name}
              src={selectedChat.avatarUrl}
              size="md"
              isOnline={selectedChat.isOnline}
            />
            <div>
            <h2 className="font-semibold text-gray-900">{selectedChat.name}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{selectedChat.phoneNumber || 'No phone number'}</span>
                {selectedChat.isOnline ? (
                  <span className="text-green-500 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    Online
                  </span>
                ) : (
                  <span>Last seen recently</span>
                )}
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
    
      {/* Messages with Background Image */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          backgroundImage: 'url(https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
              <span className="text-gray-500 text-sm">Loading messages...</span>
            </div>
          </div>
        )}

        {/* Messages grouped by date */}
        {!loading && (
          <>
            {Object.keys(messageGroups).length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              Object.entries(messageGroups).map(([dateString, dayMessages]) => (
                <div key={dateString} className="space-y-4">
                  {/* Date Separator */}
                  <div className="flex justify-center">
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                      {formatDateSeparator(dateString)}
                    </span>
                  </div>
                  
                  {/* Messages for this date */}
                  {dayMessages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </div>
              ))
            )}
          </>
        )}

        {/* Typing indicator (if someone is typing) */}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    
      {/* Message Input */}
      <MessageInput 
        onSendMessage={handleSendMessage} 
        disabled={sending || loading}
      />
    </div>
  );
}