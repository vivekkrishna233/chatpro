// types/chat.ts - Updated to match your database structure

export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  avatar?: string;
  phoneNumber: string;
  unreadCount?: number;
  isOnline?: boolean;
  tags?: string[];
  status?: 'Demo' | 'Internal' | 'Signup' | 'Content' | 'Dont Send';
  chatType?: 'direct' | 'group';
  isArchived?: boolean;
  isPinned?: boolean;
  isMuted?: boolean;
  avatarUrl?: string; // Added for database compatibility
}

export interface Message {
  id: string;
  chatId: string;
  sender: string;
  senderId?: string;
  content: string;
  timestamp: string;
  type: 'sent' | 'received';
  status?: 'sent' | 'delivered' | 'read';
  messageType?: 'text' | 'image' | 'file' | 'audio' | 'video' | 'system';
  replyToId?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
  isOnline?: boolean;
}

// Database types matching your structure
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          phone_number: string | null;
          is_online: boolean;
          last_seen: string;
          created_at: string;
          updated_at: string;
        }
      }
      chats: {
        Row: {
          id: string;
          name: string;
          chat_type: 'direct' | 'group';
          phone_number: string | null;
          avatar_url: string | null;
          is_archived: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        }
      }
      messages: {
        Row: {
          id: string;
          chat_id: string;
          sender_id: string | null;
          sender_name: string | null;
          content: string;
          message_type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'system';
          reply_to_id: string | null;
          file_url: string | null;
          file_name: string | null;
          file_size: number | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        }
      }
      chat_participants: {
        Row: {
          id: string;
          chat_id: string;
          user_id: string;
          joined_at: string;
          is_admin: boolean;
        }
      }
      message_status: {
        Row: {
          id: string;
          message_id: string;
          user_id: string;
          status: 'sent' | 'delivered' | 'read';
          timestamp: string;
        }
      }
    }
  }
}

// Helper functions to convert between database and frontend types
export function formatChatFromDB(dbChat: any, lastMessage?: any): Chat {
  return {
    id: dbChat.id,
    name: dbChat.name,
    lastMessage: lastMessage?.content || 'No messages yet',
    timestamp: formatTimestamp(lastMessage?.created_at || dbChat.updated_at),
    avatar: dbChat.avatar_url,
    avatarUrl: dbChat.avatar_url,
    phoneNumber: dbChat.phone_number || '',
    unreadCount: 0, // Will be calculated separately
    isOnline: false, // Will be determined from participants
    tags: [],
    chatType: dbChat.chat_type,
    isArchived: dbChat.is_archived,
    isPinned: false,
    isMuted: false,
  };
}

export function formatMessageFromDB(dbMessage: any, currentUserId: string): Message {
  const isSent = dbMessage.sender_id === currentUserId;
  
  return {
    id: dbMessage.id,
    chatId: dbMessage.chat_id,
    sender: dbMessage.sender_name || 'Unknown',
    senderId: dbMessage.sender_id,
    content: dbMessage.content,
    timestamp: formatTimestamp(dbMessage.created_at),
    type: isSent ? 'sent' : 'received',
    status: 'sent', // Will be determined from message_status table
    messageType: dbMessage.message_type,
    replyToId: dbMessage.reply_to_id,
    fileUrl: dbMessage.file_url,
    fileName: dbMessage.file_name,
    fileSize: dbMessage.file_size,
  };
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else if (diffInHours < 168) { // Less than a week
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: 'short',
      year: '2-digit'
    });
  }
}