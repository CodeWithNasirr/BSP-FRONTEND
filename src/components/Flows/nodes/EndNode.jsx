import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Square, Pencil } from 'lucide-react';

const EndNode = ({ data, selected }) => {
  const [editing, setEditing] = useState(false);
  const [endMessage, setEndMessage] = useState(data.endMessage || '');

  const handleSave = () => {
    data.endMessage = endMessage;
    setEditing(false);
  };

  return (
    <div className={`px-4 py-3 rounded-lg bg-node-end border ${selected ? 'border-red-400' : 'border-red-200'} max-w-[300px]`}>
      <Handle type="target" position={Position.Top} />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Square className="mr-2 text-red-500" size={16} />
          <div className="text-sm font-medium text-red-800">End Flow</div>
        </div>
        <button onClick={() => setEditing(!editing)} className="text-red-500 hover:text-red-700">
          <Pencil size={14} />
        </button>
      </div>

      {editing ? (
        <div className="space-y-2 mb-2">
          <textarea
            className="w-full text-xs p-2 border border-red-200 rounded"
            rows={3}
            placeholder="Enter end message"
            value={endMessage}
            onChange={(e) => setEndMessage(e.target.value)}
          />
          <button
            onClick={handleSave}
            className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
          >
            Save
          </button>
        </div>
      ) : (
        data.endMessage && (
          <div className="bg-white p-2 rounded border border-red-100 text-xs text-gray-700">
            {data.endMessage}
          </div>
        )
      )}
    </div>
  );
};

export default memo(EndNode);
