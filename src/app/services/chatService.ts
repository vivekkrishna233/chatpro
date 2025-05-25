// services/chatService.ts
import { createClient } from '@/app/lib/supabase/client'
import { Chat, Message, formatChatFromDB, formatMessageFromDB } from '@/app/types/chat'

const supabase = createClient()

// Get all chats for the current user
export async function getChats(): Promise<Chat[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get chats where user is a participant
    const { data: chatParticipants, error: participantsError } = await supabase
      .from('chat_participants')
      .select(`
        chat_id,
        chats!inner (
          id,
          name,
          chat_type,
          phone_number,
          avatar_url,
          is_archived,
          created_by,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id)

    if (participantsError) throw participantsError

    // Get last message for each chat
    const chatIds = chatParticipants?.map(cp => cp.chat_id) || []
    const chatsWithMessages = await Promise.all(
      chatIds.map(async (chatId) => {
        const chat = chatParticipants?.find(cp => cp.chat_id === chatId)?.chats
        if (!chat) return null

        // Get last message
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return formatChatFromDB(chat, lastMessage)
      })
    )

    return chatsWithMessages.filter((chat): chat is Chat => chat !== null)
  } catch (error) {
    console.error('Error fetching chats:', error)
    throw error
  }
}

// Get messages for a specific chat
export async function getMessages(chatId: string): Promise<Message[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (error) throw error

    return messages?.map(msg => formatMessageFromDB(msg, user.id)) || []
  } catch (error) {
    console.error('Error fetching messages:', error)
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

    if (error) throw error

    // Update chat's updated_at timestamp
    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId)

    return formatMessageFromDB(message, user.id)
  } catch (error) {
    console.error('Error sending message:', error)
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

    if (chatError) throw chatError

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

    if (participantsError) throw participantsError

    return formatChatFromDB(chat)
  } catch (error) {
    console.error('Error creating chat:', error)
    throw error
  }
}

// Search chats
export async function searchChats(query: string): Promise<Chat[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: chatParticipants, error } = await supabase
      .from('chat_participants')
      .select(`
        chat_id,
        chats!inner (
          id,
          name,
          chat_type,
          phone_number,
          avatar_url,
          is_archived,
          created_by,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id)
      .ilike('chats.name', `%${query}%`)

    if (error) throw error

    const chatsWithMessages = await Promise.all(
      (chatParticipants || []).map(async (cp) => {
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', cp.chat_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return formatChatFromDB(cp.chats, lastMessage)
      })
    )

    return chatsWithMessages
  } catch (error) {
    console.error('Error searching chats:', error)
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