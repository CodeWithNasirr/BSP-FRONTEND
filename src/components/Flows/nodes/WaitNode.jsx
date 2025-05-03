import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Clock } from 'lucide-react';

const WaitNode = ({ data, selected }) => {
  return (
    <div className={`px-4 py-3 rounded-lg bg-node-wait border ${selected ? 'border-amber-400' : 'border-amber-200'} min-w-[180px]`}>
      <Handle type="target" position={Position.Top} />

      <div className="flex items-center mb-2">
        <Clock className="mr-2 text-amber-500" size={16} />
        <div className="text-sm font-medium text-amber-800">Wait for Reply</div>
      </div>

      {data.message && (
        <div className="bg-white p-2 rounded border border-amber-100 mb-2">
          <div className="text-xs text-gray-600">
            {data.message}
          </div>
        </div>
      )}

      <div className="bg-white p-2 rounded border border-amber-100 mb-2">
        <div className="text-xs text-gray-600">
          Timeout: <span className="font-medium text-gray-800">{data.timeout > 0 ? `${data.timeout}s` : 'None'}</span>
        </div>
      </div>
      
      <div className="bg-white p-2 rounded border border-amber-100">
        <div className="text-xs text-gray-600">
          Save as: <span className="font-medium text-gray-800">{data.variable || 'response'}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(WaitNode);
