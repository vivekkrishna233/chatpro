// hooks/useRealtimeChats.ts
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { getChats, searchChats as searchChatsService } from '@/app/services/chatService'
import { Chat } from '@/app/types/chat'

const supabase = createClient()

export function useRealtimeChats() {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isInitialLoad = useRef(true)
  const isLoadingRef = useRef(false)
  const currentSearchQuery = useRef<string>('')

  const loadChats = useCallback(async (showLoading = false) => {
    // Prevent multiple simultaneous loads
    if (isLoadingRef.current) {
      console.log('⏳ Load already in progress, skipping...')
      return
    }

    try {
      isLoadingRef.current = true
      
      // Only show loading spinner on initial load or explicit refresh
      if (showLoading || isInitialLoad.current) {
        setLoading(true)
      }
      
      setError(null)
      console.log('🔄 Loading chats...')
      
      const fetchedChats = await getChats()
      console.log('✅ Successfully loaded chats:', fetchedChats.length)
      
      setChats(fetchedChats || [])
      
      if (isInitialLoad.current) {
        isInitialLoad.current = false
        console.log('✅ Initial load completed')
      }
    } catch (err) {
      console.error('❌ Error loading chats:', err)
      
      // Create a more user-friendly error message
      let errorMessage = 'Failed to load chats'
      
      if (err instanceof Error) {
        if (err.message.includes('Authentication')) {
          errorMessage = 'Please log in to view your chats'
        } else if (err.message.includes('Network')) {
          errorMessage = 'Network error - please check your connection'
        } else if (err.message.includes('Permission')) {
          errorMessage = 'Permission denied - please contact support'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      // Set empty array on error so we show empty state instead of loading forever
      setChats([])
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }, [])

  // Initial load
  useEffect(() => {
    console.log('🚀 Starting initial chat load...')
    loadChats(true)
  }, []) // Remove loadChats from dependencies to prevent infinite loop

  // Set up realtime subscriptions
  useEffect(() => {
    // Only set up subscriptions after initial load
    if (isInitialLoad.current) {
      console.log('⏳ Waiting for initial load before setting up subscriptions...')
      return
    }

    console.log('🔔 Setting up realtime subscriptions...')

    const channel = supabase
      .channel('chats_realtime')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages' 
        },
        (payload) => {
          console.log('📨 Message change detected:', payload.eventType)
          // Small delay to ensure database consistency
          setTimeout(() => {
            if (currentSearchQuery.current) {
              // If we're currently searching, refresh search results
              searchChatsService(currentSearchQuery.current)
                .then(results => setChats(results || []))
                .catch(err => console.warn('⚠️ Error refreshing search:', err))
            } else {
              // Otherwise refresh all chats
              loadChats(false)
            }
          }, 100)
        }
      )
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'chats' 
        },
        (payload) => {
          console.log('💬 Chat change detected:', payload.eventType)
          setTimeout(() => {
            if (currentSearchQuery.current) {
              searchChatsService(currentSearchQuery.current)
                .then(results => setChats(results || []))
                .catch(err => console.warn('⚠️ Error refreshing search:', err))
            } else {
              loadChats(false)
            }
          }, 100)
        }
      )
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'chat_participants' 
        },
        (payload) => {
          console.log('👥 Participants change detected:', payload.eventType)
          setTimeout(() => {
            if (currentSearchQuery.current) {
              searchChatsService(currentSearchQuery.current)
                .then(results => setChats(results || []))
                .catch(err => console.warn('⚠️ Error refreshing search:', err))
            } else {
              loadChats(false)
            }
          }, 100)
        }
      )
      .subscribe((status) => {
        console.log('🔔 Realtime subscription status:', status)
      })

    return () => {
      console.log('🔕 Cleaning up realtime subscriptions...')
      supabase.removeChannel(channel)
    }
  }, [loadChats, isInitialLoad.current]) // Re-subscribe when initial load completes

  const searchChats = useCallback(async (query: string) => {
    if (isLoadingRef.current) {
      console.log('⏳ Search skipped - load in progress')
      return
    }

    try {
      isLoadingRef.current = true
      setError(null)
      currentSearchQuery.current = query.trim()
      
      console.log('🔍 Searching chats with query:', query)
      
      if (query.trim()) {
        const results = await searchChatsService(query)
        setChats(results || [])
        console.log('✅ Search completed:', results?.length || 0, 'results')
      } else {
        // Clear search query and reload all chats
        currentSearchQuery.current = ''
        await loadChats(false)
        console.log('✅ Search cleared, showing all chats')
      }
    } catch (err) {
      console.error('❌ Error searching chats:', err)
      
      let errorMessage = 'Failed to search chats'
      if (err instanceof Error) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      isLoadingRef.current = false
    }
  }, [loadChats])

  const refetch = useCallback(() => {
    console.log('🔄 Manual refetch requested')
    currentSearchQuery.current = '' // Clear any search
    loadChats(true)
  }, [loadChats])

  // Add debug logging for state changes
  useEffect(() => {
    console.log('📊 State update:', {
      chatsCount: chats.length,
      loading,
      error,
      isInitialLoad: isInitialLoad.current
    })
  }, [chats.length, loading, error])

  return {
    chats,
    loading,
    error,
    searchChats,
    refetch
  }
}