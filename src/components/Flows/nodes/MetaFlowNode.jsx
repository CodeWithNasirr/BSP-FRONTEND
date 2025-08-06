import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { SlidersHorizontal, Pencil } from 'lucide-react';

const MetaFlowNode = ({ data, selected }) => {
  const [editing, setEditing] = useState(false);
  const [flowTitle, setFlowTitle] = useState(data.title || 'Meta Flow Form');
  const [flowId, setFlowId] = useState(data.flow_id || '');

  const handleSave = () => {
    data.title = flowTitle;
    data.flow_id = flowId;
    setEditing(false);
  };

  return (
    <div className={`px-4 py-3 rounded-lg bg-purple-100 border ${selected ? 'border-purple-500' : 'border-purple-300'} min-w-[250px]`}>
      <Handle type="target" position={Position.Top} />
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 text-purple-800 font-medium">
          <SlidersHorizontal size={16} /> Meta Flow
        </div>
        <button onClick={() => setEditing(!editing)}><Pencil size={14} /></button>
      </div>

      {editing ? (
        <div className="space-y-2 text-xs">
          <input
            type="text"
            value={flowTitle}
            onChange={(e) => setFlowTitle(e.target.value)}
            placeholder="Flow Title"
            className="w-full border p-1 rounded"
          />
          <input
            type="text"
            value={flowId}
            onChange={(e) => setFlowId(e.target.value)}
            placeholder="Meta Flow ID (from Meta UI)"
            className="w-full border p-1 rounded"
          />
          <button onClick={handleSave} className="mt-2 px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600">Save</button>
        </div>
      ) : (
        <>
          <div className="text-sm font-semibold text-purple-700 mb-1">{flowTitle}</div>
          <div className="text-xs text-purple-800">
            Flow ID: {flowId || 'Not set'}
          </div>
        </>
      )}

      <Handle type="source" position={Position.Bottom} id="metaFlow" />
    </div>
  );
};

export default memo(MetaFlowNode);