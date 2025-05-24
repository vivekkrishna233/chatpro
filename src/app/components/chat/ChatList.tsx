import { useState } from 'react';
import { AiOutlineFilter, AiOutlineSearch, AiOutlineMore } from 'react-icons/ai';
import { MdRefresh, MdHelp, MdPhone } from 'react-icons/md';
import { Chat } from '../../types/chat';
import { mockChats } from '../../data/mockData';
import ChatItem from './ChatItem';
// import Badge from '../ui/Badge';

interface ChatListProps {
  onChatSelect?: (chat: Chat) => void;
  selectedChatId?: string;
}

export default function ChatList({ onChatSelect, selectedChatId }: ChatListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [chats] = useState(mockChats);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-semibold text-gray-900">chats</h1>
            <div className="flex items-center space-x-2">
              <MdRefresh className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700" />
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
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => (
          <ChatItem
            key={chat.id}
            chat={chat}
            isSelected={selectedChatId === chat.id}
            onClick={() => onChatSelect?.(chat)}
          />
        ))}
      </div>
    </div>
  );
}