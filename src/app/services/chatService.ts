// services/chatService.ts - Fixed version with proper type handling
import { createClient } from '@/app/lib/supabase/client'
import { Chat, Message, formatChatFromDB, formatMessageFromDB } from '@/app/types/chat'

const supabase = createClient()

// Define proper types for the query results
type ChatParticipantWithChat = {
  chat_id: string
  chats: {
    id: string
    name: string
    chat_type: 'direct' | 'group'
    avatar_url: string | null
    is_archived: boolean
    created_by: string
    created_at: string
    updated_at: string
  } | null
}

// Get all chats for the current user
export async function getChats(): Promise<Chat[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    console.log('Getting chats for user:', user.id)

    // Get chats where user is a participant
    const { data: chatParticipants, error: participantsError } = await supabase
      .from('chat_participants')
      .select(`
        chat_id,
        chats!inner (
          id,
          name,
          chat_type,
          avatar_url,
          is_archived,
          created_by,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id) as { data: ChatParticipantWithChat[] | null, error: any }

    if (participantsError) {
      console.error('Participants error:', participantsError)
      throw participantsError
    }

    console.log('Chat participants data:', chatParticipants)

    if (!chatParticipants || chatParticipants.length === 0) {
      console.log('No chat participants found')
      return []
    }

    // Get last message for each chat
    const chatsWithMessages = await Promise.all(
      chatParticipants.map(async (cp) => {
        // Handle the chats data properly
        const chatData = cp.chats
        if (!chatData) {
          console.warn('No chat data found for participant:', cp)
          return null
        }
        
        // Get last message
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', cp.chat_id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return formatChatFromDB(chatData, lastMessage)
      })
    )

    const validChats = chatsWithMessages.filter((chat): chat is Chat => chat !== null)
    console.log('Final chats:', validChats)
    
    return validChats
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

// Create a new chat - FIXED VERSION
export async function createChat(
  name: string,
  chatType: 'direct' | 'group' = 'direct',
  phoneNumber?: string,
  participantIds: string[] = []
): Promise<Chat> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    console.log('Creating chat with params:', { name, chatType, phoneNumber, participantIds })

    // Create the chat
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .insert({
        name,
        chat_type: chatType,
        created_by: user.id,
      })
      .select()
      .single()

    if (chatError) {
      console.error('Chat creation error:', chatError)
      throw chatError
    }

    console.log('Chat created:', chat)

    // Add participants (creator + other participants)
    const allParticipants = [user.id, ...participantIds]
    const participantData = allParticipants.map((userId, index) => ({
      chat_id: chat.id,
      user_id: userId,
      is_admin: index === 0, // First participant (creator) is admin
    }))

    console.log('Adding participants:', participantData)

    const { error: participantsError } = await supabase
      .from('chat_participants')
      .insert(participantData)

    if (participantsError) {
      console.error('Participants error:', participantsError)
      // Try to clean up the chat if participant addition fails
      await supabase.from('chats').delete().eq('id', chat.id)
      throw participantsError
    }

    console.log('Participants added successfully')

    return formatChatFromDB(chat)
  } catch (error) {
    console.error('Error creating chat:', error)
    throw error
  }
}

// Alternative approach: Get chats directly without join
export async function getChatsAlternative(): Promise<Chat[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    console.log('Getting chats for user (alternative approach):', user.id)

    // First, get chat IDs where user is a participant
    const { data: participantData, error: participantsError } = await supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('user_id', user.id)

    if (participantsError) {
      console.error('Participants error:', participantsError)
      throw participantsError
    }

    if (!participantData || participantData.length === 0) {
      console.log('No chat participants found')
      return []
    }

    const chatIds = participantData.map(p => p.chat_id)

    // Then get the actual chat data
    const { data: chatsData, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .in('id', chatIds)
      .order('updated_at', { ascending: false })

    if (chatsError) {
      console.error('Chats error:', chatsError)
      throw chatsError
    }

    if (!chatsData || chatsData.length === 0) {
      return []
    }

    // Get last message for each chat
    const chatsWithMessages = await Promise.all(
      chatsData.map(async (chatData) => {
        // Get last message
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatData.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return formatChatFromDB(chatData, lastMessage)
      })
    )

    console.log('Final chats (alternative):', chatsWithMessages)
    return chatsWithMessages
  } catch (error) {
    console.error('Error fetching chats (alternative):', error)
    throw error
  }
}

// Search chats
export async function searchChats(query: string): Promise<Chat[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Use the alternative approach for searching as well
    const { data: participantData, error: participantsError } = await supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('user_id', user.id)

    if (participantsError) throw participantsError

    if (!participantData || participantData.length === 0) {
      return []
    }

    const chatIds = participantData.map(p => p.chat_id)

    // Get chats and filter by name
    const { data: chatsData, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .in('id', chatIds)
      .ilike('name', `%${query}%`)

    if (chatsError) throw chatsError

    if (!chatsData || chatsData.length === 0) {
      return []
    }

    const chatsWithMessages = await Promise.all(
      chatsData.map(async (chatData) => {
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatData.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return formatChatFromDB(chatData, lastMessage)
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
      .is('deleted_at', null)

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
      .is('deleted_at', null)

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