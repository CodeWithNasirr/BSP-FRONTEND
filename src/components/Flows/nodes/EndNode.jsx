import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Square } from 'lucide-react';

const EndNode = ({ data, selected }) => {
  return (
    <div className={`px-4 py-3 rounded-lg bg-node-end border ${selected ? 'border-red-400' : 'border-red-200'} max-w-[300px]`}>
      <Handle type="target" position={Position.Top} />

      <div className="flex items-center mb-2">
        <Square className="mr-2 text-red-500" size={16} />
        <div className="text-sm font-medium text-red-800">End Flow</div>
      </div>

      {data.endMessage && (
        <div className="bg-white p-2 rounded border border-red-100 text-xs text-gray-700">
          {data.endMessage}
        </div>
      )}
    </div>
  );
};

export default memo(EndNode);