// services/chatService.ts
import { createClient } from '@/app/lib/supabase/client'
import { Chat, Message, formatChatFromDB, formatMessageFromDB } from '@/app/types/chat'

const supabase = createClient()

// Get all chats for the current user
export async function getChats(): Promise<Chat[]> {
  try {
    console.log('🔍 Starting getChats...')
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('❌ Auth error:', userError)
      throw new Error(`Authentication error: ${userError.message}`)
    }
    
    if (!user) {
      console.error('❌ No user found')
      throw new Error('User not authenticated')
    }

    console.log('✅ User authenticated:', user.id)

    // First, get chat IDs where user is a participant
    const { data: participantData, error: participantsError } = await supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('user_id', user.id)

    if (participantsError) {
      console.error('❌ Participants error:', participantsError)
      throw new Error(`Failed to fetch chat participants: ${participantsError.message}`)
    }

    console.log('✅ Chat participants:', participantData?.length || 0)

    if (!participantData || participantData.length === 0) {
      console.log('ℹ️ No chat participants found')
      return []
    }

    const chatIds = participantData.map(p => p.chat_id)
    console.log('📋 Chat IDs:', chatIds)

    // Get chat details
    const { data: chatsData, error: chatsError } = await supabase
      .from('chats')
      .select(`
        id,
        name,
        chat_type,
        phone_number,
        avatar_url,
        is_archived,
        created_by,
        created_at,
        updated_at
      `)
      .in('id', chatIds)
      .order('updated_at', { ascending: false })

    if (chatsError) {
      console.error('❌ Chats error:', chatsError)
      throw new Error(`Failed to fetch chats: ${chatsError.message}`)
    }

    console.log('✅ Chats data:', chatsData?.length || 0)

    if (!chatsData || chatsData.length === 0) {
      console.log('ℹ️ No chats found')
      return []
    }

    // Get last message for each chat
    const chatsWithMessages = await Promise.all(
      chatsData.map(async (chat) => {
        try {
          const { data: lastMessage, error: messageError } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chat.id)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle() // Use maybeSingle instead of single to handle no messages

          if (messageError) {
            console.warn(`⚠️ Error fetching last message for chat ${chat.id}:`, messageError)
            // Don't throw, just continue without last message
          }

          return formatChatFromDB(chat, lastMessage || undefined)
        } catch (error) {
          console.warn(`⚠️ Error processing chat ${chat.id}:`, error)
          return formatChatFromDB(chat, undefined)
        }
      })
    )

    const validChats = chatsWithMessages.filter((chat): chat is Chat => chat !== null)
    console.log('✅ Final chats count:', validChats.length)
    
    return validChats

  } catch (error) {
    console.error('❌ Error in getChats:', error)
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    throw error
  }
}

// Get messages for a specific chat
export async function getMessages(chatId: string): Promise<Message[]> {
  try {
    console.log('🔍 Getting messages for chat:', chatId)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('❌ Messages error:', error)
      throw new Error(`Failed to fetch messages: ${error.message}`)
    }

    console.log('✅ Messages fetched:', messages?.length || 0)
    return messages?.map(msg => formatMessageFromDB(msg, user.id)) || []
  } catch (error) {
    console.error('❌ Error fetching messages:', error)
    throw error
  }
}

// Send a new message
export async function sendMessage(
  chatId: string, 
  content: string, 
  messageType: 'text' | 'image' | 'file' | 'audio' | 'video' = 'text',
  replyToId?: string
): Promise<Message> {
  try {
    console.log('📤 Sending message to chat:', chatId)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get user profile for sender name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const senderName = profile?.full_name || user.email?.split('@')[0] || 'Unknown'

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: user.id,
        sender_name: senderName,
        content,
        message_type: messageType,
        reply_to_id: replyToId,
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Send message error:', error)
      throw new Error(`Failed to send message: ${error.message}`)
    }

    // Update chat's updated_at timestamp
    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId)

    console.log('✅ Message sent successfully')
    return formatMessageFromDB(message, user.id)
  } catch (error) {
    console.error('❌ Error sending message:', error)
    throw error
  }
}

// Create a new chat
export async function createChat(
  name: string,
  chatType: 'direct' | 'group' = 'direct',
  phoneNumber?: string,
  participantIds: string[] = []
): Promise<Chat> {
  try {
    console.log('🆕 Creating chat:', { name, chatType, participantIds })
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Create the chat
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .insert({
        name,
        chat_type: chatType,
        phone_number: phoneNumber,
        created_by: user.id,
      })
      .select()
      .single()

    if (chatError) {
      console.error('❌ Create chat error:', chatError)
      throw new Error(`Failed to create chat: ${chatError.message}`)
    }

    // Add creator as participant
    const participants = [user.id, ...participantIds]
    const participantData = participants.map((userId, index) => ({
      chat_id: chat.id,
      user_id: userId,
      is_admin: index === 0, // Creator is admin
    }))

    const { error: participantsError } = await supabase
      .from('chat_participants')
      .insert(participantData)

    if (participantsError) {
      console.error('❌ Create participants error:', participantsError)
      throw new Error(`Failed to add participants: ${participantsError.message}`)
    }

    console.log('✅ Chat created successfully')
    return formatChatFromDB(chat)
  } catch (error) {
    console.error('❌ Error creating chat:', error)
    throw error
  }
}

// Search chats
export async function searchChats(query: string): Promise<Chat[]> {
  try {
    console.log('🔍 Searching chats with query:', query)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get chat IDs where user is a participant
    const { data: participantData, error: participantsError } = await supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('user_id', user.id)

    if (participantsError) {
      console.error('❌ Search participants error:', participantsError)
      throw new Error(`Failed to fetch chat participants: ${participantsError.message}`)
    }

    if (!participantData || participantData.length === 0) {
      return []
    }

    const chatIds = participantData.map(p => p.chat_id)

    // Search in chat names
    const { data: chatsData, error: chatsError } = await supabase
      .from('chats')
      .select(`
        id,
        name,
        chat_type,
        phone_number,
        avatar_url,
        is_archived,
        created_by,
        created_at,
        updated_at
      `)
      .in('id', chatIds)
      .ilike('name', `%${query}%`)
      .order('updated_at', { ascending: false })

    if (chatsError) {
      console.error('❌ Search chats error:', chatsError)
      throw new Error(`Failed to search chats: ${chatsError.message}`)
    }

    if (!chatsData || chatsData.length === 0) {
      return []
    }

    const chatsWithMessages = await Promise.all(
      chatsData.map(async (chat) => {
        try {
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chat.id)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          return formatChatFromDB(chat, lastMessage || undefined)
        } catch (error) {
          console.warn(`⚠️ Error processing search result for chat ${chat.id}:`, error)
          return formatChatFromDB(chat, undefined)
        }
      })
    )

    const validChats = chatsWithMessages.filter((chat): chat is Chat => chat !== null)
    console.log('✅ Search results:', validChats.length)
    
    return validChats
  } catch (error) {
    console.error('❌ Error searching chats:', error)
    throw error
  }
}

// Mark messages as read
export async function markMessagesAsRead(chatId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get unread messages in this chat (messages not sent by current user)
    const { data: messages } = await supabase
      .from('messages')
      .select('id')
      .eq('chat_id', chatId)
      .neq('sender_id', user.id)

    if (!messages || messages.length === 0) return

    // Check which messages don't have read status yet
    const { data: existingStatuses } = await supabase
      .from('message_status')
      .select('message_id')
      .eq('user_id', user.id)
      .eq('status', 'read')
      .in('message_id', messages.map(m => m.id))

    const existingMessageIds = new Set(existingStatuses?.map(s => s.message_id) || [])
    const newReadStatuses = messages
      .filter(msg => !existingMessageIds.has(msg.id))
      .map(msg => ({
        message_id: msg.id,
        user_id: user.id,
        status: 'read' as const,
      }))

    if (newReadStatuses.length > 0) {
      await supabase
        .from('message_status')
        .insert(newReadStatuses)
    }
  } catch (error) {
    console.error('Error marking messages as read:', error)
  }
}

// Get unread count for a chat
export async function getUnreadCount(chatId: string): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    // Get messages in chat not sent by current user
    const { data: messages } = await supabase
      .from('messages')
      .select('id')
      .eq('chat_id', chatId)
      .neq('sender_id', user.id)

    if (!messages || messages.length === 0) return 0

    // Get read messages
    const { data: readStatuses } = await supabase
      .from('message_status')
      .select('message_id')
      .eq('user_id', user.id)
      .eq('status', 'read')
      .in('message_id', messages.map(m => m.id))

    const readMessageIds = new Set(readStatuses?.map(s => s.message_id) || [])
    return messages.filter(msg => !readMessageIds.has(msg.id)).length
  } catch (error) {
    console.error('Error getting unread count:', error)
    return 0
  }
}