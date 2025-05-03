import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Globe } from 'lucide-react';

const ApiNode = ({ data, selected }) => {
  return (
    <div className={`px-4 py-3 rounded-lg bg-node-api border ${selected ? 'border-purple-400' : 'border-purple-200'} min-w-[180px]`}>
      <Handle type="target" position={Position.Top} />

      <div className="flex items-center mb-2">
        <Globe className="mr-2 text-purple-500" size={16} />
        <div className="text-sm font-medium text-purple-800">API Call</div>
      </div>

      <div className="bg-white p-2 rounded border border-purple-100 mb-2">
        <div className="text-xs font-medium text-purple-700">
          {data.method || 'GET'}
        </div>
        <div className="text-xs text-gray-500 truncate" title={data.url}>
          {data.url || 'No URL set'}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(ApiNode);