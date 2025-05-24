import { Chat, Message } from '../types/chat';

export const mockChats: Chat[] = [
  {
    id: '1',
    name: 'Test Skope Final 5',
    lastMessage: 'Support2: This doesn\'t go on Tuesday...',
    timestamp: 'Yesterday',
    phoneNumber: '+91 99718 44008 +1',
    tags: ['Demo'],
    unreadCount: 0
  },
  {
    id: '2',
    name: 'Periskope Team Chat',
    lastMessage: 'Periskope: Test message',
    timestamp: '26-Feb-25',
    phoneNumber: '+91 99718 44008 +1',
    tags: ['Demo', 'Internal'],
    unreadCount: 1
  },
  {
    id: '3',
    name: '+91 99999 99999',
    lastMessage: 'Hi there, I\'m Swapnika, Co-Founder of ...',
    timestamp: '25-Feb-25',
    phoneNumber: '+91 93868 85968 +1',
    tags: ['Demo', 'Signup']
  },
  {
    id: '4',
    name: 'Test Demo17',
    lastMessage: 'Rohosen: 123',
    timestamp: '25-Feb-25',
    phoneNumber: '+91 99718 44008 +1',
    tags: ['Content', 'Demo']
  },
  {
    id: '5',
    name: 'Test El Centro',
    lastMessage: 'Roshraq: Hello, Ahmadporti',
    timestamp: '04-Feb-25',
    phoneNumber: '+91 99718 44008',
    tags: ['Demo'],
    isOnline: true
  },
  {
    id: '6',
    name: 'Testing group',
    lastMessage: 'Testing 12345',
    timestamp: '27-Jan-25',
    phoneNumber: '+91 93868 85968',
    tags: ['Demo']
  },
  {
    id: '7',
    name: 'Yasin 3',
    lastMessage: 'First Bulk Message',
    timestamp: '29-Nov-24',
    phoneNumber: '+91 99718 44008 +1',
    tags: ['Demo', 'Dont Send'],
    unreadCount: 2
  },
  {
    id: '8',
    name: 'Test Skope Final 9473',
    lastMessage: 'Heyy',
    timestamp: '07-Nov-24',
    phoneNumber: '+91 99718 44008 +1',
    tags: ['Demo']
  },
  {
    id: '9',
    name: 'Skope Demo',
    lastMessage: 'test 123',
    timestamp: '20-Dec-24',
    phoneNumber: '+91 93869 85968',
    tags: ['Demo']
  },
  {
    id: '10',
    name: 'Test Demo15',
    lastMessage: 'test 123',
    timestamp: '20-Dec-24',
    phoneNumber: '+91 93869 85968',
    tags: []
  }
];

export const mockMessages: Message[] = [
  {
    id: '1',
    chatId: '5',
    sender: 'CVE6',
    content: 'CVE6',
    timestamp: '16:51',
    type: 'received'
  },
  {
    id: '2',
    chatId: '5',
    sender: 'COERT',
    content: 'COERT',
    timestamp: '16:54',
    type: 'received'
  },
  {
    id: '3',
    chatId: '5',
    sender: 'Periskope',
    content: 'hello',
    timestamp: '12:07',
    type: 'sent',
    status: 'read'
  },
  {
    id: '4',
    chatId: '5',
    sender: 'Roshrag Artel',
    content: 'Hello, South Euna!',
    timestamp: '08:01',
    type: 'received'
  },
  {
    id: '5',
    chatId: '5',
    sender: 'System',
    content: 'Hello, Livonia!',
    timestamp: '16:03',
    type: 'received'
  },
  {
    id: '6',
    chatId: '5',
    sender: 'Periskope',
    content: 'test el centro',
    timestamp: '08:48',
    type: 'sent',
    status: 'read'
  },
  {
    id: '7',
    chatId: '5',
    sender: 'Roshrag Artel',
    content: 'COERT',
    timestamp: '09:49',
    type: 'received'
  },
  {
    id: '8',
    chatId: '5',
    sender: 'Periskope',
    content: 'testing',
    timestamp: '08:25',
    type: 'sent',
    status: 'read'
  }
];