'use client';

import { useState, useEffect, useCallback } from 'react';
import { AiOutlineFilter, AiOutlineSearch, AiOutlineMore } from 'react-icons/ai';
import { MdRefresh, MdHelp, MdPhone } from 'react-icons/md';
import { Chat } from '../../types/chat';
import { useRealtimeChats } from '@/app/lib/hooks/useRealtimeChats';
import ChatItem from './ChatItem';
import StartChatModal from './StartChatModal';

interface ChatListProps {
  onChatSelect?: (chat: Chat) => void;
  selectedChatId?: string;
}

export default function ChatList({ onChatSelect, selectedChatId }: ChatListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showStartChatModal, setShowStartChatModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { chats, loading, error, searchChats, refetch } = useRealtimeChats();

  // Memoize the search function to prevent infinite loops
  const handleSearch = useCallback(async (term: string) => {
    if (term.trim()) {
      setIsSearching(true);
      try {
        await searchChats(term);
      } finally {
        setIsSearching(false);
      }
    } else {
      setIsSearching(false);
      // Only refetch if we were previously searching
      if (searchTerm.trim()) {
        await refetch();
      }
    }
  }, [searchChats, refetch, searchTerm]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]); // Remove handleSearch from dependencies to prevent infinite loop

  const handleRefresh = useCallback(() => {
    setSearchTerm(''); // Clear search term
    refetch();
  }, [refetch]);

  const handleStartChat = () => {
    setShowStartChatModal(true);
  };

  const handleChatCreated = (newChat: Chat) => {
    setShowStartChatModal(false);
    onChatSelect?.(newChat);
    refetch(); // Refresh the chat list
  };

  // Show loading state while searching or loading
  const isLoading = loading || isSearching;

  if (error) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-500">
            <p className="mb-2">Error loading chats</p>
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-semibold text-gray-900">chats</h1>
              <div className="flex items-center space-x-2">
                <MdRefresh 
                  className={`w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700 ${isLoading ? 'animate-spin' : ''}`}
                  onClick={handleRefresh}
                />
                <MdHelp className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700" />
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <MdPhone className="w-4 h-4" />
                  <span>5 / 6 phones</span>
                </div>
                <AiOutlineMore className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2 mb-3">
            <button className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
              <AiOutlineFilter className="w-4 h-4" />
              <span>Custom filter</span>
            </button>
            <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
              Save
            </button>
            <div className="flex items-center space-x-1 ml-auto">
              <span className="text-sm text-gray-600">Filtered</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search chats or users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
              </div>
            )}
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && chats.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm.trim() ? `No chats found for "${searchTerm}"` : 'No chats yet'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchTerm.trim() ? 'Try a different search term' : 'Start a conversation with someone'}
              </p>
              <button
                onClick={handleStartChat}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Start Chat
              </button>
            </div>
          ) : (
            chats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isSelected={selectedChatId === chat.id}
                onClick={() => onChatSelect?.(chat)}
              />
            ))
          )}
        </div>
      </div>

      {/* Start Chat Modal */}
      {showStartChatModal && (
        <StartChatModal
          onClose={() => setShowStartChatModal(false)}
          onChatCreated={handleChatCreated}
        />
      )}
    </>
  );
}