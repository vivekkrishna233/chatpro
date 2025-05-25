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

  const loadChats = useCallback(async (showLoading = false) => {
    // Prevent multiple simultaneous loads
    if (isLoadingRef.current) return
    
    try {
      isLoadingRef.current = true
      
      // Only show loading spinner on initial load or explicit refresh
      if (showLoading || isInitialLoad.current) {
        setLoading(true)
      }
      
      setError(null)
      console.log('Loading chats...')
      
      const fetchedChats = await getChats()
      console.log('Fetched chats:', fetchedChats)
      
      setChats(fetchedChats || []) // Ensure it's always an array
      
      if (isInitialLoad.current) {
        isInitialLoad.current = false
      }
    } catch (err) {
      console.error('Error loading chats - Full error:', err)
      console.error('Error message:', err instanceof Error ? err.message : 'Unknown error')
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace')
      
      // Set a more detailed error message
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chats'
      setError(`Error: ${errorMessage}`)
      
      // Set empty array on error so we show empty state instead of loading forever
      setChats([])
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadChats(true)
  }, []) // Remove loadChats from dependencies

  // Set up realtime subscriptions separately
  useEffect(() => {
    // Only set up subscriptions after initial load
    if (isInitialLoad.current) return

    const channel = supabase
      .channel('chats_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          // Reload chats when messages change (without loading spinner)
          loadChats(false)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chats' },
        () => {
          // Reload chats when chat info changes (without loading spinner)
          loadChats(false)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_participants' },
        () => {
          // Reload chats when participants change (without loading spinner)
          loadChats(false)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chats.length]) // Only re-subscribe when chats actually change

  const searchChats = useCallback(async (query: string) => {
    if (isLoadingRef.current) return
    
    try {
      isLoadingRef.current = true
      setError(null)
      
      if (query.trim()) {
        const results = await searchChatsService(query)
        setChats(results || [])
      } else {
        await loadChats(false)
      }
    } catch (err) {
      console.error('Error searching chats:', err)
      setError(err instanceof Error ? err.message : 'Failed to search chats')
    } finally {
      isLoadingRef.current = false
    }
  }, [loadChats])

  const refetch = useCallback(() => {
    loadChats(true)
  }, [loadChats])

  return {
    chats,
    loading,
    error,
    searchChats,
    refetch
  }
}