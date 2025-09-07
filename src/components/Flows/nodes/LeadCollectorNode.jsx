import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { User, Save } from 'lucide-react';

const LeadCollectorNode = ({ data, selected }) => {
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState(data.fields || []); // Array of {name, label, required}
  const [sheetId, setSheetId] = useState(data.sheet_id || '');

  const handleAddField = () => {
    setFields([...fields, { name: '', label: '', required: false }]);
  };

  const handleFieldChange = (index, key, value) => {
    const newFields = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
  };

  const handleSave = () => {
    data.fields = fields.filter(f => f.name && f.label); // Only save valid fields
    data.sheet_id = sheetId;
    setEditing(false);
  };

  return (
    <div className={`px-4 py-3 rounded-lg bg-node-lead border ${selected ? 'border-green-400' : 'border-green-200'} min-w-[200px] max-w-[300px]`}>
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <User className="mr-2 text-green-500" size={16} />
          <div className="text-sm font-medium text-green-800">Lead Collector</div>
        </div>
        <button onClick={() => setEditing(!editing)} className="text-green-500 hover:text-green-700">
          <Save size={14} />
        </button>
      </div>

      {editing ? (
        <div className="space-y-2 mb-2">
          <input
            type="text"
            className="w-full text-xs px-2 py-1 border border-green-200 rounded"
            placeholder="Google Sheet ID"
            value={sheetId}
            onChange={(e) => setSheetId(e.target.value)}
          />
          {fields.map((field, index) => (
            <div key={index} className="space-y-1">
              <input
                type="text"
                className="w-full text-xs px-2 py-1 border border-green-200 rounded"
                placeholder="Field Name (e.g., budget)"
                value={field.name}
                onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
              />
              <input
                type="text"
                className="w-full text-xs px-2 py-1 border border-green-200 rounded"
                placeholder="Field Label (e.g., What's your budget?)"
                value={field.label}
                onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
              />
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-xs">Required</span>
              </label>
            </div>
          ))}
          <button
            onClick={handleAddField}
            className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
          >
            Add Field
          </button>
          <button
            onClick={handleSave}
            className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
          >
            Save
          </button>
        </div>
      ) : (
        <>
          <div className="text-xs bg-white p-2 rounded border border-green-100 text-gray-700">
            Collects: {fields.length > 0 ? fields.map(f => f.label).join(', ') : 'No fields configured'}
          </div>
          {sheetId && (
            <div className="text-xs mt-2 p-1 bg-green-50 rounded">
              Exports to Google Sheet: {sheetId}
            </div>
          )}
        </>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(LeadCollectorNode);