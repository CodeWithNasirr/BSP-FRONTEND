import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { MessageSquare, Plus, Pencil, Trash2,Image } from 'lucide-react';

const TextButtonsNode = ({ data, selected }) => {
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState(data.message || '');
  const [footer, setFooter] = useState(data.footerText || '');
  const [buttons, setButtons] = useState(data.buttons || []);
  const [mediaUrl, setMediaUrl] = useState(data.image || '');
   
 
  const handleAddButton = () => {
    const newButton = { text: `Button ${buttons.length + 1}` };
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

  const handleSave = () => {
    data.message = message;
    data.buttons = buttons;
    data.image = mediaUrl;
    data.footerText = footer;
    setEditing(false);
  };

  return (
    <div className={`px-4 py-3 rounded-lg bg-node-message border ${selected ? 'border-blue-400' : 'border-blue-200'} min-w-[220px] max-w-[300px]`}>
      <Handle type="target" position={Position.Top} />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <MessageSquare className="mr-2 text-blue-500" size={16} />
          <div className="text-sm font-medium text-blue-800">Image + Text + Buttons</div>
        </div>
        <button onClick={() => setEditing(!editing)} className="text-blue-500 hover:text-blue-700">
          <Pencil size={14} />
        </button>
      </div>

      {editing ? (
        <div className="space-y-2 mb-2">

            <input
            type="text"
            className="w-full text-xs px-2 py-1 border border-blue-200 rounded"
            placeholder="Image URL "
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
          />
          <textarea
            className="w-full text-xs p-2 border border-blue-200 rounded"
            rows={3}
            placeholder="Enter message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
           <textarea
            className="w-full text-xs p-2 border border-blue-200 rounded"
            rows={3}
            placeholder="Enter footer message"
            value={footer}
            onChange={(e) => setFooter(e.target.value)}
          />

          {buttons.map((btn, index) => (
            <div key={index} className="flex items-center text-xs">
              <input
                type="text"
                value={btn.text}
                onChange={(e) => {
                  const updated = [...buttons];
                  updated[index].text = e.target.value;
                  setButtons(updated);
                }}
                className="w-full p-1 border border-blue-200 rounded mr-1"
              />
              <button onClick={() => handleDeleteButton(index)} className="text-red-500 hover:text-red-700">
                <Trash2 size={14} />
              </button>
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
          {mediaUrl && (
            <div className="flex items-center mt-2 p-1 bg-blue-50 rounded text-xs">
              <Image size={12} className="mr-1 text-blue-500" />
              <span className="truncate w-full">{mediaUrl}</span>
            </div>
          )}
          <div className="text-xs bg-white p-2 rounded border border-blue-100 text-gray-700 max-h-[80px] overflow-y-auto mb-2">
            {message || 'Empty message'}
          </div>
          <div className="text-xs bg-white p-2 rounded border border-blue-100 text-gray-700 max-h-[80px] overflow-y-auto mb-2">
            {footer || 'Empty footer message'}
          </div>

          <div className="space-y-1">
            {buttons.length > 0 ? (
              buttons.map((button, index) => (
                <div key={index} className="bg-blue-50 text-xs p-1.5 rounded border border-blue-100 text-blue-700 flex items-center justify-between">
                  {button.text}
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
