import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Clock, Pencil } from 'lucide-react';

const WaitNode = ({ data, selected }) => {
  const [editing, setEditing] = useState(false);
  const [delay, setDelay] = useState(data.delay_seconds || 5);

  const handleSave = () => {
    let value = parseInt(delay);

    if (isNaN(value)) value = 0;
    value = Math.max(0, Math.min(300, value)); // clamp 0–300

    data.delay_seconds = value;
    setDelay(value);
    setEditing(false);
  };

  return (
    <div
      className={`px-4 py-3 rounded-lg bg-node-wait border ${
        selected ? 'border-amber-400' : 'border-amber-200'
      } min-w-[180px]`}
    >
      <Handle type="target" position={Position.Top} />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Clock className="mr-2 text-amber-500" size={16} />
          <div className="text-sm font-medium text-amber-800">
            Wait (Delay)
          </div>
        </div>

        <button
          onClick={() => setEditing(!editing)}
          className="text-amber-600 hover:text-amber-800"
        >
          <Pencil size={14} />
        </button>
      </div>

      {/* EDIT MODE */}
      {editing ? (
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-600">Delay (seconds)</label>
            <input
              type="number"
              min="0"
              max="300"
              className="w-full text-xs px-2 py-1 border border-amber-200 rounded"
              value={delay}
              onChange={(e) => setDelay(e.target.value)}
            />
          </div>

          <button
            onClick={handleSave}
            className="text-xs bg-amber-500 text-white px-2 py-1 rounded hover:bg-amber-600"
          >
            Save
          </button>
        </div>
      ) : (
        /* VIEW MODE */
        <div className="bg-white p-2 rounded border border-amber-100">
          <div className="text-xs text-gray-600">
            Delay:{' '}
            <span className="font-medium text-gray-800">
              {data.delay_seconds || 0}s
            </span>
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(WaitNode);