'use client'

import { useContext } from 'react'
import { AuthContext } from '@/app/components/auth/AuthProvider'
import { AuthContextType } from '@/app/types/auth'

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

// Alternative hook for checking authentication status
export const useAuthStatus = () => {
  const { user, loading } = useAuth()
  
  return {
    isAuthenticated: !!user,
    isLoading: loading,
    user,
  }
}

// Hook for protected actions
export const useAuthActions = () => {
  const { signIn, signUp, signOut, resetPassword, updateProfile } = useAuth()
  
  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  }
}