import { Message } from '../../types/chat';
import { BsCheck2All, BsCheck2 } from 'react-icons/bs';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isFromCurrentUser = message.type === 'sent';

  return (
    <div className={`flex mb-4 ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isFromCurrentUser
          ? 'bg-green-100 text-gray-800'
          : 'bg-white border border-gray-200 text-gray-800'
      }`}>
        {!isFromCurrentUser && (
          <div className="text-xs font-medium text-green-600 mb-1">
            {message.sender}
          </div>
        )}
        
        <div className="text-sm">
          {message.content}
        </div>
        
        <div className={`flex items-center justify-end mt-1 space-x-1 ${
          isFromCurrentUser ? 'text-gray-500' : 'text-gray-400'
        }`}>
          <span className="text-xs">
            {message.timestamp}
          </span>
          {isFromCurrentUser && (
            <div className="text-xs">
              {message.status === 'read' ? (
                <BsCheck2All className="w-3 h-3 text-blue-500" />
              ) : (
                <BsCheck2 className="w-3 h-3" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}