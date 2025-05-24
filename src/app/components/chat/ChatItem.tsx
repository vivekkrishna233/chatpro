import { Chat } from '../../types/chat';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { AiOutlinePhone } from 'react-icons/ai';

interface ChatItemProps {
  chat: Chat;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function ChatItem({ chat, isSelected = false, onClick }: ChatItemProps) {
  const getBadgeVariant = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'demo': return 'demo';
      case 'internal': return 'internal';
      case 'signup': return 'signup';
      case 'content': return 'content';
      case 'dont send': return 'dont-send';
      default: return 'default';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100
        ${isSelected ? 'bg-green-50 border-r-2 border-r-green-500' : ''}
      `}
    >
      <div className="flex-shrink-0 mr-3">
        <Avatar 
          fallback={chat.name} 
          isOnline={chat.isOnline}
          size="md"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {chat.name}
          </h3>
          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
            {chat.timestamp}
          </span>
        </div>

        <p className="text-sm text-gray-600 truncate mb-2">
          {chat.lastMessage}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <AiOutlinePhone className="w-3 h-3" />
            <span>{chat.phoneNumber}</span>
          </div>
          
          {chat.unreadCount && chat.unreadCount > 0 && (
            <div className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {chat.unreadCount}
            </div>
          )}
        </div>

        {chat.tags && chat.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {chat.tags.map((tag, index) => (
              <Badge key={index} variant={getBadgeVariant(tag)}>
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}