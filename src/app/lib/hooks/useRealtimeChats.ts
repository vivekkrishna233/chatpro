// hooks/useRealtimeChats.ts
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { getChats, searchChats as searchChatsService } from '@/app/services/chatService'
import { Chat } from '@/app/types/chat'

const supabase = createClient()

export function useRealtimeChats() {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadChats = useCallback(async () => {
    try {
      setError(null)
      const fetchedChats = await getChats()
      setChats(fetchedChats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadChats()

    // Set up realtime subscriptions
    const channel = supabase
      .channel('chats_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          // Reload chats when messages change
          loadChats()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chats' },
        () => {
          // Reload chats when chat info changes
          loadChats()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_participants' },
        () => {
          // Reload chats when participants change
          loadChats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadChats])

  const searchChats = async (query: string) => {
    try {
      setError(null)
      if (query.trim()) {
        const results = await searchChatsService(query)
        setChats(results)
      } else {
        await loadChats()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search chats')
    }
  }

  return { 
    chats, 
    loading, 
    error, 
    searchChats, 
    refetch: loadChats 
  }
}