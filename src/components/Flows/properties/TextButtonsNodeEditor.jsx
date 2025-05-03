import React from 'react';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';

const TextButtonsNodeEditor = ({ data, onChange }) => {
  const handleMessageChange = (e) => {
    onChange({ ...data, message: e.target.value });
  };

  const handleAddButton = () => {
    const buttons = [...(data.buttons || [])];
    if (buttons.length < 3) {
      buttons.push({ text: '', value: '' });
      onChange({ ...data, buttons });
    }
  };

  const handleButtonChange = (index, field, value) => {
    const buttons = [...(data.buttons || [])];
    buttons[index] = { ...buttons[index], [field]: value };
    onChange({ ...data, buttons });
  };

  const handleRemoveButton = (index) => {
    const buttons = [...(data.buttons || [])];
    buttons.splice(index, 1);
    onChange({ ...data, buttons });
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-md">
        <div className="flex items-center text-blue-700 mb-2">
          <MessageSquare size={16} className="mr-2" />
          <span className="font-medium">Message Text</span>
        </div>
        <textarea
          value={data.message || ''}
          onChange={handleMessageChange}
          placeholder="Enter your message text here..."
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] text-sm"
        />
      </div>

      <div className="bg-blue-50 p-3 rounded-md">
        <div className="flex items-center justify-between text-blue-700 mb-2">
          <span className="font-medium">Buttons</span>
          {(!data.buttons || data.buttons.length < 3) && (
            <button
              onClick={handleAddButton}
              className="flex items-center text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
            >
              <Plus size={14} className="mr-1" />
              Add Button
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          {data.buttons?.map((button, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={button.text}
                onChange={(e) => handleButtonChange(index, 'text', e.target.value)}
                placeholder="Button text"
                className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={() => handleRemoveButton(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-md"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        
        {(!data.buttons || data.buttons.length === 0) && (
          <div className="text-sm text-gray-500 text-center py-4">
            No buttons added yet
          </div>
        )}
      </div>

      <div className="bg-yellow-50 p-3 rounded-md">
        <h4 className="text-sm font-medium text-yellow-700 mb-1">Tips</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Maximum 3 buttons allowed</li>
          <li>• Keep button text short and clear</li>
          <li>• Use action-oriented text for better engagement</li>
        </ul>
      </div>
    </div>
  );
};

export default TextButtonsNodeEditor;