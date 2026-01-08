import React from 'react';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';

const MAX_BUTTONS = 3;
const MAX_TEXT_LENGTH = 20;

const TextButtonsNodeEditor = ({ data, onChange }) => {
  const handleMessageChange = (e) => {
    onChange({ ...data, message: e.target.value });
  };

  const handleAddButton = () => {
    const buttons = [...(data.buttons || [])];

    if (buttons.length >= MAX_BUTTONS) return;

    buttons.push({ text: '' });
    onChange({ ...data, buttons });
  };

  const handleButtonChange = (index, field, value) => {
    if (field === 'text') {
      value = value.slice(0, MAX_TEXT_LENGTH); // 🛑 hard limit
    }

    const buttons = [...(data.buttons || [])];
    buttons[index] = { ...buttons[index], [field]: value };

    onChange({ ...data, buttons });
  };

  const handleRemoveButton = (index) => {
    const buttons = [...(data.buttons || [])];
    buttons.splice(index, 1);
    onChange({ ...data, buttons });
  };

  const buttons = data.buttons || [];

  return (
    <div className="space-y-4">
      {/* Message */}
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

      {/* Buttons */}
      <div className="bg-blue-50 p-3 rounded-md">
        <div className="flex items-center justify-between text-blue-700 mb-2">
          <span className="font-medium">Buttons</span>

          <button
            onClick={handleAddButton}
            disabled={buttons.length >= MAX_BUTTONS}
            className={`flex items-center text-xs px-2 py-1 rounded
              ${
                buttons.length >= MAX_BUTTONS
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
              }`}
          >
            <Plus size={14} className="mr-1" />
            Add Button
          </button>
        </div>

        <div className="space-y-2">
          {buttons.map((button, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-grow">
                <input
                  type="text"
                  value={button.text}
                  maxLength={MAX_TEXT_LENGTH}
                  onChange={(e) =>
                    handleButtonChange(index, 'text', e.target.value)
                  }
                  placeholder="Button text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <div className="text-xs text-gray-400 text-right mt-0.5">
                  {button.text.length}/{MAX_TEXT_LENGTH}
                </div>
              </div>

              <button
                onClick={() => handleRemoveButton(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-md"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {buttons.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-4">
            No buttons added yet
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-yellow-50 p-3 rounded-md">
        <h4 className="text-sm font-medium text-yellow-700 mb-1">Tips</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Maximum 3 buttons allowed</li>
          <li>• Button text limited to 20 characters</li>
          <li>• Use action-oriented text for better engagement</li>
        </ul>
      </div>
    </div>
  );
};

export default TextButtonsNodeEditor;
