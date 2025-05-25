// File: components/chat/MessageBubble.tsx
"use client";

import { Message } from '../../types/chat';
import { MdCheck, MdDoneAll } from 'react-icons/md';
import Avatar from '../ui/Avatar';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isSent = message.type === 'sent';
  
  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-xs lg:max-w-md ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar for received messages */}
        {!isSent && (
          <div className="flex-shrink-0 mr-2">
            <Avatar
              fallback={message.sender}
              size="sm"
            />
          </div>
        )}
        
        <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'}`}>
          {/* Sender name for received messages */}
          {!isSent && (
            <span className="text-xs text-gray-600 mb-1 ml-3">
              {message.sender}
            </span>
          )}
          
          {/* Message bubble */}
          <div
            className={`relative px-4 py-2 rounded-lg shadow-sm ${
              isSent
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-900 border border-gray-200'
            }`}
          >
            {/* Reply indicator */}
            {message.replyToId && (
              <div className={`text-xs mb-2 p-2 rounded ${
                isSent ? 'bg-green-600' : 'bg-gray-100'
              }`}>
                <div className="flex items-center">
                  <div className={`w-1 h-4 ${isSent ? 'bg-green-300' : 'bg-green-500'} mr-2`}></div>
                  <span className={isSent ? 'text-green-100' : 'text-gray-600'}>
                    Replying to message
                  </span>
                </div>
              </div>
            )}

            {/* Message content based on type */}
            {message.messageType === 'text' && (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}

            {message.messageType === 'image' && (
              <div>
                {/* <div className="relative w-full max-w-[250px] h-auto aspect-video mb-2 rounded overflow-hidden">
                  <Image
                    src={message.fileUrl}
                    alt="Sent image"
                    fill
                    className="object-cover rounded"
                    unoptimized // remove this if using images from a trusted static domain
                  />
                </div> */}
                {message.content && (
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                )}
              </div>
            )}

            {message.messageType === 'file' && (
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded ${isSent ? 'bg-green-600' : 'bg-gray-100'}`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 18h12V6l-4-4H4v16zm8-14v4h4l-4-4z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">{message.fileName}</p>
                  {message.fileSize && (
                    <p className="text-xs opacity-75">
                      {formatFileSize(message.fileSize)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {message.messageType === 'audio' && (
              <div className="flex items-center space-x-2 min-w-[200px]">
                <button className={`p-2 rounded-full ${isSent ? 'bg-green-600' : 'bg-gray-100'}`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 5v10l7-5-7-5z"/>
                  </svg>
                </button>
                <div className="flex-1">
                  <div className={`h-1 rounded-full ${isSent ? 'bg-green-300' : 'bg-gray-300'}`}>
                    <div className={`h-1 rounded-full w-1/3 ${isSent ? 'bg-white' : 'bg-green-500'}`}></div>
                  </div>
                </div>
                <span className="text-xs opacity-75">0:30</span>
              </div>
            )}

            {message.messageType === 'system' && (
              <p className="text-xs italic opacity-75">
                {message.content}
              </p>
            )}

            {/* Message tail */}
            <div
              className={`absolute top-2 ${
                isSent ? '-right-1' : '-left-1'
              } w-2 h-2 transform rotate-45 ${
                isSent ? 'bg-green-500' : 'bg-white border-l border-b border-gray-200'
              }`}
            ></div>
          </div>
          
          {/* Message info */}
          <div className={`flex items-center mt-1 space-x-1 ${isSent ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <span className="text-xs text-gray-500">
              {message.timestamp}
            </span>
            
            {/* Status indicators for sent messages */}
            {isSent && message.status && (
              <div className="flex items-center">
                {message.status === 'sent' && (
                  <MdCheck className="w-3 h-3 text-gray-400" />
                )}
                {message.status === 'delivered' && (
                  <MdDoneAll className="w-3 h-3 text-gray-400" />
                )}
                {message.status === 'read' && (
                  <MdDoneAll className="w-3 h-3 text-blue-500" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format file sizes
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
