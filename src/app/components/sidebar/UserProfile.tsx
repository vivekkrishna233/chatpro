'use client'

import React, { useState } from 'react'
import { LogOut, Settings, User, ChevronUp, ChevronDown } from 'lucide-react'
import { useAuth } from '@/app/components/auth/AuthProvider'
import Avatar from '@/app/components/ui/Avatar'
// import Button from '@/app/components/ui/Button'

export default function UserProfile() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { user, signOut } = useAuth()

  if (!user) return null

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="relative">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Avatar
            src={user.avatar_url || undefined}
            alt={user.full_name || user.email || 'User'}
            fallback={user.full_name?.[0] || user.email?.[0] || 'U'}
          />
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {isExpanded && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
            <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            
            <hr className="my-2 border-gray-200 dark:border-gray-600" />
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}