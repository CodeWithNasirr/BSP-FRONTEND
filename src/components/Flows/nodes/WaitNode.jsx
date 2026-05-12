import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Clock, Pencil } from 'lucide-react';

const WaitNode = ({ data, selected }) => {
  const [editing, setEditing] = useState(false);
  const [delay, setDelay] = useState(data.delay_seconds || 5);

  const handleSave = () => {
    let value = parseInt(delay, 10);
    if (isNaN(value)) value = 0;
    value = Math.max(0, Math.min(300, value));
    data.delay_seconds = value;
    setDelay(value);
    setEditing(false);
  };

  const inputBaseClass = `
    w-full text-xs p-2 border border-amber-200 dark:border-amber-500/30 rounded-lg 
    bg-white dark:bg-[#111827] text-gray-900 dark:text-gray-100 
    placeholder:text-gray-400 dark:placeholder:text-gray-600 
    focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all
  `;

  return (
    <div
      className={`px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border ${
        selected ? 'border-amber-400 dark:border-amber-400' : 'border-amber-200 dark:border-amber-500/20'
      } min-w-[180px] transition-colors`}
    >
      <Handle type="target" position={Position.Top} className="!bg-amber-500" />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Clock className="mr-2 text-amber-500" size={16} />
          <div className="text-sm font-bold text-amber-800 dark:text-amber-300">
            Wait (Delay)
          </div>
        </div>

        <button
          onClick={() => setEditing(!editing)}
          className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
        >
          <Pencil size={14} />
        </button>
      </div>

      {/* EDIT MODE */}
      {editing ? (
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400">Delay (seconds)</label>
            <input
              type="number"
              min="0"
              max="300"
              className={inputBaseClass}
              value={delay}
              onChange={(e) => setDelay(e.target.value)}
            />
          </div>

          <button
            onClick={handleSave}
            className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-all active:scale-95 shadow-sm"
          >
            Save
          </button>
        </div>
      ) : (
        /* VIEW MODE */
        <div className="bg-white dark:bg-[#111827] p-2 rounded-lg border border-amber-100 dark:border-amber-500/20">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Delay:{' '}
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {data.delay_seconds || 0}s
            </span>
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-amber-500" />
    </div>
  );
};

export default memo(WaitNode);