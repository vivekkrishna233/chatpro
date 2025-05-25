// File: components/chat/ChatItem.tsx
"use client";

import { Chat } from '../../types/chat';
import Avatar from '../ui/Avatar';

interface ChatItemProps {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
}

export default function ChatItem({ chat, isSelected, onClick }: ChatItemProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 border-l-4 transition-colors ${
        isSelected
          ? 'bg-green-50 border-green-500'
          : 'border-transparent hover:border-gray-200'
      }`}
    >
      <div className="relative">
        <Avatar
          src={chat.avatarUrl}
          fallback={chat.name}
          size="md"
          isOnline={chat.isOnline}
        />
        {chat.unreadCount && chat.unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
          </div>
        )}
      </div>

      <div className="flex-1 ml-3 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {chat.name}
          </h3>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {chat.timestamp}
          </span>
        </div>

        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-gray-600 truncate">
            {chat.lastMessage}
          </p>
          <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
            {chat.isPinned && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
            {chat.isMuted && (
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            )}
          </div>
        </div>

        {/* Tags */}
        {chat.tags && chat.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {chat.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
            {chat.tags.length > 2 && (
              <span className="text-xs text-gray-500">
                +{chat.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Phone number for direct chats */}
        {chat.phoneNumber && (
          <div className="text-xs text-gray-500 mt-1">
            {chat.phoneNumber}
          </div>
        )}
      </div>
    </div>
  );
}