import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { GitBranch, Pencil } from 'lucide-react';

const ConditionalNode = ({ data, selected }) => {
  const [editing, setEditing] = useState(false);
  const [condition, setCondition] = useState(data.condition || '');
  const [trueLabel, setTrueLabel] = useState(data.trueLabel || 'Yes');
  const [falseLabel, setFalseLabel] = useState(data.falseLabel || 'No');

  const handleSave = () => {
    data.condition = condition;
    data.trueLabel = trueLabel;
    data.falseLabel = falseLabel;
    setEditing(false);
  };

  return (
    <div className={`px-4 py-3 rounded-lg bg-node-condition border ${selected ? 'border-indigo-400' : 'border-indigo-200'} min-w-[220px]`}>
      <Handle type="target" position={Position.Top} />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <GitBranch className="mr-2 text-indigo-500" size={16} />
          <div className="text-sm font-medium text-indigo-800">Conditional Split</div>
        </div>
        <button onClick={() => setEditing(!editing)} className="text-indigo-500 hover:text-indigo-700">
          <Pencil size={14} />
        </button>
      </div>

      {editing ? (
        <div className="flex items-center flex-col gap-2 mb-2">
          <input
            className="w-full text-xs px-2 py-1 border rounded border-indigo-200"
            placeholder="Condition (e.g., input == 'repair')"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          />
          <input
            className="w-full text-xs px-2 py-1 border rounded border-green-200"
            placeholder="True Label"
            value={trueLabel}
            onChange={(e) => setTrueLabel(e.target.value)}
          />
          <input
            className="w-full text-xs px-2 py-1 border rounded border-red-200"
            placeholder="False Label"
            value={falseLabel}
            onChange={(e) => setFalseLabel(e.target.value)}
          />
          <button
            onClick={handleSave}
            className="text-xs bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600"
          >
            Save
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white p-2 rounded border border-indigo-100 mb-3 text-xs text-gray-700">
            {condition || 'No condition set'}
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-green-50 border border-green-100 rounded p-1 text-xs text-green-700">
              {trueLabel}
            </div>
            <div className="bg-red-50 border border-red-100 rounded p-1 text-xs text-red-700">
              {falseLabel}
            </div>
          </div>
        </>
      )}

      <Handle type="source" position={Position.Bottom} id="true" style={{ left: '30%' }} />
      <Handle type="source" position={Position.Bottom} id="false" style={{ left: '70%' }} />
    </div>
  );
};

export default memo(ConditionalNode);
