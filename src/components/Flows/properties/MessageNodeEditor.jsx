import React from 'react';
import { MessageSquare, Image } from 'lucide-react';

const MessageNodeEditor = ({ data, onChange }) => {
  const handleMessageChange = (e) => {
    onChange({ ...data, message: e.target.value });
  };

  const handleMediaUrlChange = (e) => {
    onChange({ ...data, mediaUrl: e.target.value });
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-md">
        <div className="flex items-center text-blue-700 mb-2">
          <MessageSquare size={16} className="mr-2" />
          <span className="font-medium">Message Content</span>
        </div>
        <textarea
          value={data.message}
          onChange={handleMessageChange}
          placeholder="Enter your message text here..."
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] text-sm"
        />
        <div className="mt-2 text-xs text-gray-500">
          Use clear, concise messages that provide value to your audience.
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded-md">
        <div className="flex items-center text-blue-700 mb-2">
          <Image size={16} className="mr-2" />
          <span className="font-medium">Media URL (Optional)</span>
        </div>
        <input
          type="text"
          value={data.mediaUrl || ''}
          onChange={handleMediaUrlChange}
          placeholder="https://example.com/image.jpg"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <div className="mt-2 text-xs text-gray-500">
          Add an image, video, or document URL to send along with your message.
        </div>
      </div>

      <div className="bg-yellow-50 p-3 rounded-md">
        <h4 className="text-sm font-medium text-yellow-700 mb-1">Tips</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Keep messages short and engaging</li>
          <li>• For media, ensure URLs are publicly accessible</li>
          <li>• WhatsApp supports images, videos, and documents</li>
        </ul>
      </div>
    </div>
  );
};

export default MessageNodeEditor;