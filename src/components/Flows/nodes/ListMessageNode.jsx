import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { List, Plus, Pencil, Trash2 } from 'lucide-react';

const ListMessageNode = ({ data, selected }) => {
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState(data.message || '');
  const [listTitle, setListTitle] = useState(data.list_title || 'Options');
  const [options, setOptions] = useState(
    data.options || [
      { id: 'opt1', title: 'Option 1', description: 'Description 1' }
    ]
  );

  const handleAddOption = () => {
    const newOption = {
      id: `opt${options.length + 1}`,
      title: `Option ${options.length + 1}`,
      description: `Description ${options.length + 1}`
    };
    const updatedOptions = [...options, newOption];
    setOptions(updatedOptions);
    data.options = updatedOptions;
  };

  const handleDeleteOption = (index) => {
    const updatedOptions = [...options];
    updatedOptions.splice(index, 1);
    setOptions(updatedOptions);
    data.options = updatedOptions;
  };

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setOptions(updatedOptions);
    data.options = updatedOptions;
  };

  const handleSave = () => {
    data.message = message;
    data.list_title = listTitle;
    data.options = options;
    setEditing(false);
  };

  return (
    <div className={`px-4 py-3 rounded-lg bg-node-message border ${selected ? 'border-blue-400' : 'border-blue-200'} min-w-[220px] max-w-[300px]`}>
      <Handle type="target" position={Position.Top} />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <List className="mr-2 text-blue-500" size={16} />
          <div className="text-sm font-medium text-blue-800">List Message</div>
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
            placeholder="Enter message (e.g., Select a category:)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <input
            type="text"
            className="w-full text-xs p-1 border border-blue-200 rounded"
            placeholder="List title (e.g., Categories)"
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
          />

          {options.map((opt, index) => (
            <div key={index} className="space-y-1 border p-2 rounded">
              <div className="flex items-center">
                <input
                  type="text"
                  value={opt.title}
                  onChange={(e) => handleOptionChange(index, 'title', e.target.value)}
                  className="w-full text-xs p-1 border border-blue-200 rounded mr-1"
                  placeholder="Option title"
                />
                <button onClick={() => handleDeleteOption(index)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={14} />
                </button>
              </div>
              <input
                type="text"
                value={opt.id}
                onChange={(e) => handleOptionChange(index, 'id', e.target.value)}
                className="w-full text-xs p-1 border border-blue-200 rounded"
                placeholder="Option ID"
              />
              <input
                type="text"
                value={opt.description}
                onChange={(e) => handleOptionChange(index, 'description', e.target.value)}
                className="w-full text-xs p-1 border border-blue-200 rounded"
                placeholder="Option description"
              />
            </div>
          ))}

          <button
            onClick={handleAddOption}
            className="flex items-center text-xs text-blue-600 hover:text-blue-800"
          >
            <Plus size={12} className="mr-1" />
            Add Option
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

          <div className="text-xs bg-blue-50 p-2 rounded border border-blue-100 text-blue-700 mb-2">
            <strong>List Title:</strong> {listTitle}
          </div>

          <div className="space-y-1">
            {options.length > 0 ? (
              options.map((option, index) => (
                <div key={index} className="bg-blue-50 text-xs p-1.5 rounded border border-blue-100 text-blue-700">
                  <div><strong>{option.title}</strong></div>
                  <div className="text-gray-600">{option.description}</div>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 text-xs p-1.5 rounded border border-gray-200 text-gray-500 flex items-center justify-center">
                <Plus size={12} className="mr-1" />
                Add options
              </div>
            )}
          </div>
        </>
      )}

      {/* Dynamic source handles for each option */}
      {options.map((_, index) => (
        <Handle
          key={`handle-${index}`}
          type="source"
          position={Position.Bottom}
          id={options[index].id}
          style={{ left: `${(100 / (options.length + 1)) * (index + 1)}%` }}
        />
      ))}
    </div>
  );
};

export default memo(ListMessageNode);