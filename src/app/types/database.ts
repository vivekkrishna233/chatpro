// types/database.ts
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          is_online: boolean
          last_seen: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          is_online?: boolean
          last_seen?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          is_online?: boolean
          last_seen?: string
          created_at?: string
          updated_at?: string
        }
      }
      chats: {
        Row: {
          id: string
          name: string
          chat_type: 'direct' | 'group'
          avatar_url: string | null
          is_archived: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          chat_type?: 'direct' | 'group'
          avatar_url?: string | null
          is_archived?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          chat_type?: 'direct' | 'group'
          avatar_url?: string | null
          is_archived?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      chat_participants: {
        Row: {
          id: string
          chat_id: string
          user_id: string
          joined_at: string
          is_admin: boolean
        }
        Insert: {
          id?: string
          chat_id: string
          user_id: string
          joined_at?: string
          is_admin?: boolean
        }
        Update: {
          id?: string
          chat_id?: string
          user_id?: string
          joined_at?: string
          is_admin?: boolean
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          sender_id: string
          content: string
          message_type: 'text' | 'image' | 'file' | 'audio' | 'video'
          reply_to_id: string | null
          file_url: string | null
          file_name: string | null
          file_size: number | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          chat_id: string
          sender_id: string
          content: string
          message_type?: 'text' | 'image' | 'file' | 'audio' | 'video'
          reply_to_id?: string | null
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          chat_id?: string
          sender_id?: string
          content?: string
          message_type?: 'text' | 'image' | 'file' | 'audio' | 'video'
          reply_to_id?: string | null
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      message_status: {
        Row: {
          id: string
          message_id: string
          user_id: string
          status: 'sent' | 'delivered' | 'read'
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          status: 'sent' | 'delivered' | 'read'
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          status?: 'sent' | 'delivered' | 'read'
          created_at?: string
        }
      }
    }
    Views: {
      chat_list_view: {
        Row: {
          id: string
          name: string
          avatar_url: string | null
          chat_type: 'direct' | 'group'
          is_archived: boolean
          last_message: string | null
          last_message_at: string | null
          unread_count: number
          is_online: boolean | null
          participant_count: number
          created_at: string
          updated_at: string
        }
      }
    }
  }
}

// types/chat.ts
export interface Chat {
  id: string
  name: string
  lastMessage?: string
  lastMessageAt?: string
  avatarUrl?: string
  chatType: 'direct' | 'group'
  isArchived: boolean
  unreadCount: number
  isOnline?: boolean
  participantCount: number
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  senderName?: string
  content: string
  messageType: 'text' | 'image' | 'file' | 'audio' | 'video'
  replyToId?: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  createdAt: string
  updatedAt: string
  deletedAt?: string
  isOwn: boolean
  status?: 'sent' | 'delivered' | 'read'
}

export interface ChatParticipant {
  id: string
  chatId: string
  userId: string
  userName?: string
  userAvatar?: string
  joinedAt: string
  isAdmin: boolean
}

// Helper functions
export function formatChatFromDB(
  dbChat: Database['public']['Views']['chat_list_view']['Row']
): Chat {
  return {
    id: dbChat.id,
    name: dbChat.name,
    lastMessage: dbChat.last_message || undefined,
    lastMessageAt: dbChat.last_message_at || undefined,
    avatarUrl: dbChat.avatar_url || undefined,
    chatType: dbChat.chat_type,
    isArchived: dbChat.is_archived,
    unreadCount: dbChat.unread_count || 0,
    isOnline: dbChat.is_online || false,
    participantCount: dbChat.participant_count,
    createdAt: dbChat.created_at,
    updatedAt: dbChat.updated_at
  }
}

export function formatMessageFromDB(
  dbMessage: Database['public']['Tables']['messages']['Row'],
  currentUserId: string,
  senderName?: string
): Message {
  return {
    id: dbMessage.id,
    chatId: dbMessage.chat_id,
    senderId: dbMessage.sender_id,
    senderName: senderName,
    content: dbMessage.content,
    messageType: dbMessage.message_type,
    replyToId: dbMessage.reply_to_id || undefined,
    fileUrl: dbMessage.file_url || undefined,
    fileName: dbMessage.file_name || undefined,
    fileSize: dbMessage.file_size || undefined,
    createdAt: dbMessage.created_at,
    updatedAt: dbMessage.updated_at,
    deletedAt: dbMessage.deleted_at || undefined,
    isOwn: dbMessage.sender_id === currentUserId
  }
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: 'numeric', 
      minute: '2-digit' 
    })
  } else if (diffInHours < 168) { // Less than a week
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  } else {
    return date.toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: 'short',
      year: '2-digit'
    })
  }
}