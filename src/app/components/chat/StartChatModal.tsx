'use client';

import { useState, useEffect } from 'react';
import { AiOutlineSearch, AiOutlineClose } from 'react-icons/ai';
import { MdPersonAdd } from 'react-icons/md';
import { searchUsers } from '@/app/services/uthService';
import { createChat } from '../../services/chatService';
import { Chat } from '../../types/chat';
import { Profile } from '../../types/auth';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface StartChatModalProps {
  onClose: () => void;
  onChatCreated: (chat: Chat) => void;
}

export default function StartChatModal({ onClose, onChatCreated }: StartChatModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Search users with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        handleSearchUsers(searchTerm);
      } else {
        setUsers([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearchUsers = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const results = await searchUsers(query);
      setUsers(results);
    } catch (err) {
      setError('Failed to search users');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (user: Profile) => {
    try {
      setCreating(user.id);
      setError(null);
      
      // Fixed: Match the createChat function signature from your service
      const newChat = await createChat(
        user.full_name || user.email,
        'direct',
        user?.email || undefined,
        [user.id] // Pass as array of participant IDs
      );

      onChatCreated(newChat);
    } catch (err) {
      setError('Failed to create chat');
      console.error('Chat creation error:', err);
    } finally {
      setCreating(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Start New Chat</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <AiOutlineClose className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              autoFocus
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Users List */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 px-4">
              {searchTerm.trim().length < 2 ? (
                <div className="text-gray-500">
                  <MdPersonAdd className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Type at least 2 characters to search for users</p>
                </div>
              ) : (
                <div className="text-gray-500">
                  <p className="text-sm">No users found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleStartChat(user)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.full_name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    {creating === user.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <MdPersonAdd className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}