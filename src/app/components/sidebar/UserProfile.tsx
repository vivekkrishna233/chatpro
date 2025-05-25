'use client'

import React, { useState } from 'react'
import { LogOut, Settings, User } from 'lucide-react'
import { useAuth } from '@/app/components/auth/AuthProvider'
import Avatar from '@/app/components/ui/Avatar'

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
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-12 h-12 rounded-full hover:ring-2 hover:ring-green-200 transition-all"
      >
        <Avatar
          src={user.avatar_url || undefined}
          alt={user.full_name || user.email || 'User'}
          fallback={user.full_name?.[0] || user.email?.[0] || 'U'}
          size="md"
          className="bg-green-500 text-white"
        />
      </button>

      {isExpanded && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Avatar
                src={user.avatar_url || undefined}
                alt={user.full_name || user.email || 'User'}
                fallback={user.full_name?.[0] || user.email?.[0] || 'U'}
                size="sm"
                className="bg-green-500 text-white"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
          
          <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          
          <hr className="my-2 border-gray-200" />
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  )
}