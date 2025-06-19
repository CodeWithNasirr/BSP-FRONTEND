import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { MessageSquare, Plus, Pencil, Trash2 } from 'lucide-react';

const TextButtonsNode = ({ data, selected }) => {
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState(data.message || '');
  const [buttons, setButtons] = useState(
    data.buttons || [{ text: 'Button 1', value: '1', collect_cart: false, collect_payment_method: false, checkout: false }]
  );

  const handleAddButton = () => {
    const newButton = {
      text: `Button ${buttons.length + 1}`,
      value: `${buttons.length + 1}`,
      collect_cart: false,
      collect_payment_method: false,
      checkout: false
    };
    const updatedButtons = [...buttons, newButton];
    setButtons(updatedButtons);
    data.buttons = updatedButtons;
  };

  const handleDeleteButton = (index) => {
    const updatedButtons = [...buttons];
    updatedButtons.splice(index, 1);
    setButtons(updatedButtons);
    data.buttons = updatedButtons;
  };

  const handleButtonChange = (index, field, value) => {
    const updatedButtons = [...buttons];
    updatedButtons[index] = { ...updatedButtons[index], [field]: value };
    setButtons(updatedButtons);
    data.buttons = updatedButtons;
  };

  const handleSave = () => {
    data.message = message;
    data.buttons = buttons;
    setEditing(false);
  };

  return (
    <div className={`px-4 py-3 rounded-lg bg-node-message border ${selected ? 'border-blue-400' : 'border-blue-200'} min-w-[220px] max-w-[300px]`}>
      <Handle type="target" position={Position.Top} />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <MessageSquare className="mr-2 text-blue-500" size={16} />
          <div className="text-sm font-medium text-blue-800">Text + Buttons</div>
        </div>
        <button onClick={() => setEditing(!editing)} className="text-blue-500 hover:text-blue-700">
          <Pencil size={14} />
        </button>
      </div>

      {editing ? (
        <div className="space-y-2 mb-2">
          <textarea
            className="w-full text-xs p-2 border border-blue-200 rounded"
            rows={3}
            placeholder="Enter message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          {buttons.map((btn, index) => (
            <div key={index} className="space-y-1 border p-2 rounded">
              <div className="flex items-center">
                <input
                  type="text"
                  value={btn.text}
                  onChange={(e) => handleButtonChange(index, 'text', e.target.value)}
                  className="w-full text-xs p-1 border border-blue-200 rounded mr-1"
                  placeholder="Button text"
                />
                <button onClick={() => handleDeleteButton(index)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={14} />
                </button>
              </div>
              <input
                type="text"
                value={btn.value}
                onChange={(e) => handleButtonChange(index, 'value', e.target.value)}
                className="w-full text-xs p-1 border border-blue-200 rounded"
                placeholder="Button value"
              />
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={btn.collect_cart || false}
                  onChange={(e) => handleButtonChange(index, 'collect_cart', e.target.checked)}
                  className="mr-1"
                />
                <span className="text-xs">Add to Cart</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={btn.collect_payment_method || false}
                  onChange={(e) => handleButtonChange(index, 'collect_payment_method', e.target.checked)}
                  className="mr-1"
                />
                <span className="text-xs">Collect Payment Method</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={btn.checkout || false}
                  onChange={(e) => handleButtonChange(index, 'checkout', e.target.checked)}
                  className="mr-1"
                />
                <span className="text-xs">Checkout</span>
              </label>
            </div>
          ))}

          <button
            onClick={handleAddButton}
            className="flex items-center text-xs text-blue-600 hover:text-blue-800"
          >
            <Plus size={12} className="mr-1" />
            Add Button
          </button>

          <button
            onClick={handleSave}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mt-1"
          >
            Save
          </button>
        </div>
      ) : (
        <>
          <div className="text-xs bg-white p-2 rounded border border-blue-100 text-gray-700 max-h-[80px] overflow-y-auto mb-2">
            {message || 'Empty message'}
          </div>

          <div className="space-y-1">
            {buttons.length > 0 ? (
              buttons.map((button, index) => (
                <div key={index} className="bg-blue-50 text-xs p-1.5 rounded border border-blue-100 text-blue-700 flex items-center justify-between">
                  <span>{button.text}</span>
                  <div className="flex space-x-1">
                    {button.collect_cart && (
                      <span className="text-xs bg-blue-200 px-1 rounded">Cart</span>
                    )}
                    {button.collect_payment_method && (
                      <span className="text-xs bg-green-200 px-1 rounded">Payment</span>
                    )}
                    {button.checkout && (
                      <span className="text-xs bg-purple-200 px-1 rounded">Checkout</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 text-xs p-1.5 rounded border border-gray-200 text-gray-500 flex items-center justify-center">
                <Plus size={12} className="mr-1" />
                Add buttons
              </div>
            )}
          </div>
        </>
      )}

      {/* Dynamic source handles for each button */}
      {buttons.map((_, index) => (
        <Handle
          key={`handle-${index}`}
          type="source"
          position={Position.Bottom}
          id={`button${index + 1}`}
          style={{ left: `${(100 / (buttons.length + 1)) * (index + 1)}%` }}
        />
      ))}
    </div>
  );
};

export default memo(TextButtonsNode);