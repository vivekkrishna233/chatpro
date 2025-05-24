import { useState } from 'react';
import { 
  AiOutlinePaperClip, 
  AiOutlineSmile, 
  AiOutlineSend,
  AiOutlineCamera,
  AiOutlinePicture 
} from 'react-icons/ai';
import { MdMic, MdAttachFile } from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';

interface MessageInputProps {
  onSendMessage?: (message: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* WhatsApp/Private Note Toggle */}
      <div className="flex items-center justify-center py-2 border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
            <FaWhatsapp className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
            <span>Private Note</span>
          </button>
        </div>
      </div>

      {/* Message Input */}
      <div className="flex items-end space-x-3 p-4">
        <div className="flex space-x-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <AiOutlinePaperClip className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <AiOutlineSmile className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <AiOutlineCamera className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <AiOutlinePicture className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <MdAttachFile className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <MdMic className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex items-end space-x-3">
          <div className="flex-1 min-h-[40px] max-h-32 border border-gray-300 rounded-lg focus-within:ring-1 focus-within:ring-green-500 focus-within:border-green-500">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message..."
              disabled={disabled}
              className="w-full p-3 resize-none outline-none rounded-lg"
              rows={1}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <AiOutlineSend className="w-5 h-5" />
          </button>
        </div>

        {/* Periskope Dropdown */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Periskope</span>
          <select className="border-none outline-none bg-transparent">
            <option>Default</option>
          </select>
        </div>
      </div>
    </div>
  );
}