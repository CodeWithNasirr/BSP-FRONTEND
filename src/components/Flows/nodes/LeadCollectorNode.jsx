import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { User, Save, Trash2 } from 'lucide-react';

const LeadCollectorNode = ({ data, selected }) => {
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState(data.fields || []); // {name, label, required, type, options}
  const [businessType, setBusinessType] = useState(data.business_type || 'generic');
  const [sheetId, setSheetId] = useState(data.sheet_id || '');

  const handleAddField = () => {
    const updatedFields = [
      ...fields,
      { name: '', label: '', required: false, type: 'text', options: '' },
    ];
    setFields(updatedFields);
    data.fields = updatedFields;
  };

  const handleDeleteField = (index) => {
    const updatedFields = [...fields];
    updatedFields.splice(index, 1);
    setFields(updatedFields);
    data.fields = updatedFields;
  };

  const handleFieldChange = (index, key, value) => {
    const newFields = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
  };

  const handleSave = () => {
    data.fields = fields.filter((f) => f.name && f.label); // only save valid
    data.business_type = businessType;
    data.sheet_id = sheetId;
    setEditing(false);
  };

  return (
    <div
      className={`px-4 py-3 rounded-lg bg-node-lead border ${
        selected ? 'border-green-400' : 'border-green-200'
      } min-w-[220px] max-w-[320px]`}
    >
      <Handle type="target" position={Position.Top} />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <User className="mr-2 text-green-500" size={16} />
          <div className="text-sm font-medium text-green-800">Lead Collector</div>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="text-green-500 hover:text-green-700"
        >
          <Save size={14} />
        </button>
      </div>

      {editing ? (
        <div className="space-y-2 mb-2 max-h-[250px] overflow-y-auto pr-1">
          {/* Sheet ID + Business Type */}
          <input
            type="text"
            className="w-full text-xs px-2 py-1 border border-green-200 rounded"
            placeholder="Google Sheet ID"
            value={sheetId}
            onChange={(e) => setSheetId(e.target.value)}
          />
          <input
            type="text"
            className="w-full text-xs px-2 py-1 border border-green-200 rounded"
            placeholder="Business Type (e.g., real_estate)"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
          />

          {/* Dynamic Fields */}
          {fields.map((field, index) => (
            <div
              key={index}
              className="space-y-1 border border-green-200 rounded p-2 bg-white shadow-sm relative"
            >
              {/* Delete button */}
              <button
                onClick={() => handleDeleteField(index)}
                className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                title="Delete Field"
              >
                <Trash2 size={14} />
              </button>

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

              <select
                className="w-full text-xs px-2 py-1 border border-green-200 rounded"
                value={field.type}
                onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="list">List</option>
              </select>

              {field.type === 'list' && (
                <input
                  type="text"
                  className="w-full text-xs px-2 py-1 border border-green-200 rounded"
                  placeholder="Options (comma-separated, e.g., Buy,Rent)"
                  value={field.options}
                  onChange={(e) => handleFieldChange(index, 'options', e.target.value)}
                />
              )}

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

          {/* Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={handleAddField}
              className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 flex-1"
            >
              + Add Field
            </button>
            <button
              onClick={handleSave}
              className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 flex-1"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-xs bg-white p-2 rounded border border-green-100 text-gray-700">
            <span className="block">Business: {businessType}</span>
            <span className="block">
              Collects: {fields.length > 0 ? fields.map((f) => f.label).join(', ') : 'No fields'}
            </span>
          </div>

          {sheetId && (
            <div className="text-xs mt-2 p-1 bg-green-50 rounded border border-green-200">
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
