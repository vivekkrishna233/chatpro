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
  }
  
  export interface Message {
    id: string;
    chatId: string;
    sender: string;
    content: string;
    timestamp: string;
    type: 'sent' | 'received';
    status?: 'sent' | 'delivered' | 'read';
  }
  
  export interface Contact {
    id: string;
    name: string;
    phoneNumber: string;
    avatar?: string;
    isOnline?: boolean;
  }