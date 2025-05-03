import React from 'react';
import { Square } from 'lucide-react';

const EndNodeEditor = ({ data, onChange }) => {
  const handleEndMessageChange = (e) => {
    onChange({ ...data, endMessage: e.target.value });
  };

  return (
    <div className="space-y-4">
      <div className="bg-red-50 p-3 rounded-md">
        <div className="flex items-center text-red-700 mb-2">
          <Square size={16} className="mr-2" />
          <span className="font-medium">End Message (Optional)</span>
        </div>
        <textarea
          value={data.endMessage}
          onChange={handleEndMessageChange}
          placeholder="Thank you for using our service!"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px] text-sm"
        />
        <div className="mt-2 text-xs text-gray-500">
          Final message to send before ending the conversation flow.
        </div>
      </div>

      <div className="bg-yellow-50 p-3 rounded-md">
        <h4 className="text-sm font-medium text-yellow-700 mb-1">Tips</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Use this node to properly close the conversation</li>
          <li>• Include a thank you message or next steps</li>
          <li>• Consider adding a way for users to restart the flow</li>
        </ul>
      </div>
    </div>
  );
};

export default EndNodeEditor;