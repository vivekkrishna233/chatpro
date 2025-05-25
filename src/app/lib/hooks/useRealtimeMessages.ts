import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { getMessages, markMessagesAsRead } from '@/app/services/chatService'
import { Message, formatMessageFromDB } from '@/app/types/chat'

const supabase = createClient()

export function useRealtimeMessages(chatId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMessages = useCallback(async () => {
    if (!chatId) {
      setMessages([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const fetchedMessages = await getMessages(chatId)
      setMessages(fetchedMessages)
      
      // Mark messages as read
      await markMessagesAsRead(chatId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [chatId])

  useEffect(() => {
    if (!chatId) {
      setMessages([])
      return
    }

    loadMessages()

    // Set up realtime subscription for this specific chat
    const channel = supabase
      .channel(`messages_${chatId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        async (payload) => {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return

          const newMessage = formatMessageFromDB(payload.new as any, user.id)
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            if (prev.find(msg => msg.id === newMessage.id)) {
              return prev
            }
            return [...prev, newMessage]
          })
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        async (payload) => {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return

          const updatedMessage = formatMessageFromDB(payload.new as any, user.id)
          setMessages(prev => 
            prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
          )
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatId, loadMessages])

  return { 
    messages, 
    loading, 
    error, 
    refetch: loadMessages 
  }
}

// hooks/useAuth.ts (Updated to work with your existing auth system)
import { useAuth as useExistingAuth } from '@/app/components/auth/AuthProvider'

export function useAuth() {
  const auth = useExistingAuth()
  
  return {
    ...auth,
    userId: auth.user?.id,
    userEmail: auth.user?.email,
    userName: auth.user?.full_name || auth.user?.email?.split('@')[0] || 'Unknown'
  }
}