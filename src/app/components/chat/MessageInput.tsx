// File: components/chat/MessageInput.tsx
"use client";

import { useState, useRef } from 'react';
import { 
  AiOutlinePaperClip, 
  AiOutlineSmile, 
  AiOutlineSend,
} from 'react-icons/ai';
import { MdOutlineImage } from 'react-icons/md';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle file upload here
      console.log('File selected:', file);
      // You can implement file upload logic here
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Implement voice recording logic here
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        {/* File input (hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,audio/*,video/*,application/*"
        />

        {/* Attachment button */}
        <button
          type="button"
          onClick={handleFileSelect}
          disabled={disabled}
          className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
        >
          <AiOutlinePaperClip className="w-5 h-5" />
        </button>

        {/* Image button */}
        <button
          type="button"
          onClick={handleFileSelect}
          disabled={disabled}
          className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
        >
          <MdOutlineImage className="w-5 h-5" />
        </button>

        {/* Message input container */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={disabled}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 resize-none min-h-[48px] max-h-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
          />
          
          {/* Emoji button */}
          <button
            type="button"
            disabled={disabled}
            className="absolute right-3 bottom-3 p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            <AiOutlineSmile className="w-4 h-4" />
          </button>
        </div>

        {/* Voice recording or send button */}
        {message.trim() ? (
          <button
            type="submit"
            disabled={disabled}
            className="flex-shrink-0 p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <AiOutlineSend className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleRecording}
            disabled={disabled}
            className={`flex-shrink-0 p-3 rounded-full transition-colors disabled:opacity-50 ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {/* <AiOutlineMicrophone className="w-5 h-5" /> */}
          </button>
        )}
      </form>

      {/* Recording indicator */}
      {isRecording && (
        <div className="mt-2 flex items-center justify-center space-x-2 text-red-500">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm">Recording...</span>
          <button
            onClick={toggleRecording}
            className="text-sm underline hover:no-underline"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}