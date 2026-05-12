// import React, { memo, useState } from 'react';
// import { Handle, Position } from 'reactflow';
// import { User, Save, Trash2 } from 'lucide-react';

// const LeadCollectorNode = ({ data, selected }) => {
//   const [editing, setEditing] = useState(false);
//   const [fields, setFields] = useState(data.fields || []); // {name, label, required, type, options}
//   const [businessType, setBusinessType] = useState(data.business_type || 'generic');
//   const [sheetId, setSheetId] = useState(data.sheet_id || '');

//   const handleAddField = () => {
//     const updatedFields = [
//       ...fields,
//       { name: '', label: '', required: false, type: 'text', options: '' },
//     ];
//     setFields(updatedFields);
//     data.fields = updatedFields;
//   };

//   const handleDeleteField = (index) => {
//     const updatedFields = [...fields];
//     updatedFields.splice(index, 1);
//     setFields(updatedFields);
//     data.fields = updatedFields;
//   };

//   const handleFieldChange = (index, key, value) => {
//     const newFields = [...fields];
//     newFields[index][key] = value;
//     setFields(newFields);
//   };

//   const handleSave = () => {
//     data.fields = fields.filter((f) => f.name && f.label); // only save valid
//     data.business_type = businessType;
//     data.sheet_id = sheetId;
//     setEditing(false);
//   };

//   return (
//     <div
//       className={`px-4 py-3 rounded-lg bg-node-lead border ${
//         selected ? 'border-green-400' : 'border-green-200'
//       } min-w-[220px] max-w-[320px]`}
//     >
//       <Handle type="target" position={Position.Top} />

//       {/* Header */}
//       <div className="flex items-center justify-between mb-2">
//         <div className="flex items-center">
//           <User className="mr-2 text-green-500" size={16} />
//           <div className="text-sm font-medium text-green-800">Lead Collector</div>
//         </div>
//         <button
//           onClick={() => setEditing(!editing)}
//           className="text-green-500 hover:text-green-700"
//         >
//           <Save size={14} />
//         </button>
//       </div>

//       {editing ? (
//         <div className="space-y-2 mb-2 max-h-[250px] overflow-y-auto pr-1">
//           {/* Sheet ID + Business Type */}
//           <input
//             type="text"
//             className="w-full text-xs px-2 py-1 border border-green-200 rounded"
//             placeholder="Google Sheet ID"
//             value={sheetId}
//             onChange={(e) => setSheetId(e.target.value)}
//           />
//           <input
//             type="text"
//             className="w-full text-xs px-2 py-1 border border-green-200 rounded"
//             placeholder="Business Type (e.g., real_estate)"
//             value={businessType}
//             onChange={(e) => setBusinessType(e.target.value)}
//           />

//           {/* Dynamic Fields */}
//           {fields.map((field, index) => (
//             <div
//               key={index}
//               className="space-y-1 border border-green-200 rounded p-2 bg-white shadow-sm relative"
//             >
//               {/* Delete button */}
//               <button
//                 onClick={() => handleDeleteField(index)}
//                 className="absolute top-1 right-1 text-red-500 hover:text-red-700"
//                 title="Delete Field"
//               >
//                 <Trash2 size={14} />
//               </button>

//               <input
//                 type="text"
//                 className="w-full text-xs px-2 py-1 border border-green-200 rounded"
//                 placeholder="Field Name (e.g., budget)"
//                 value={field.name}
//                 onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
//               />
//               <input
//                 type="text"
//                 className="w-full text-xs px-2 py-1 border border-green-200 rounded"
//                 placeholder="Field Label (e.g., What's your budget?)"
//                 value={field.label}
//                 onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
//               />

//               <select
//                 className="w-full text-xs px-2 py-1 border border-green-200 rounded"
//                 value={field.type}
//                 onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
//               >
//                 <option value="text">Text</option>
//                 <option value="number">Number</option>
//                 <option value="date">Date</option>
//                 <option value="list">List</option>
//               </select>

//               {field.type === 'list' && (
//                 <input
//                   type="text"
//                   className="w-full text-xs px-2 py-1 border border-green-200 rounded"
//                   placeholder="Options (comma-separated, e.g., Buy,Rent)"
//                   value={field.options}
//                   onChange={(e) => handleFieldChange(index, 'options', e.target.value)}
//                 />
//               )}

//               <label className="flex items-center">
//                 <input
//                   type="checkbox"
//                   checked={field.required}
//                   onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
//                   className="mr-2"
//                 />
//                 <span className="text-xs">Required</span>
//               </label>
//             </div>
//           ))}

//           {/* Buttons */}
//           <div className="flex space-x-2">
//             <button
//               onClick={handleAddField}
//               className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 flex-1"
//             >
//               + Add Field
//             </button>
//             <button
//               onClick={handleSave}
//               className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 flex-1"
//             >
//               Save
//             </button>
//           </div>
//         </div>
//       ) : (
//         <>
//           <div className="text-xs bg-white p-2 rounded border border-green-100 text-gray-700">
//             <span className="block">Business: {businessType}</span>
//             <span className="block">
//               Collects: {fields.length > 0 ? fields.map((f) => f.label).join(', ') : 'No fields'}
//             </span>
//           </div>

//           {sheetId && (
//             <div className="text-xs mt-2 p-1 bg-green-50 rounded border border-green-200">
//               Exports to Google Sheet: {sheetId}
//             </div>
//           )}
//         </>
//       )}

//       <Handle type="source" position={Position.Bottom} />
//     </div>
//   );
// };

// export default memo(LeadCollectorNode);


import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { User, Save, Trash2 } from 'lucide-react';

const inputBaseClass = `
  w-full text-xs px-2 py-1 border border-green-200 dark:border-green-500/30 rounded-lg
  bg-white dark:bg-[#111827] text-gray-900 dark:text-gray-100
  placeholder:text-gray-400 dark:placeholder:text-gray-600
  focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all
`;

const selectBaseClass = `
  w-full text-xs px-2 py-1 border border-green-200 dark:border-green-500/30 rounded-lg
  bg-white dark:bg-[#111827] text-gray-900 dark:text-gray-100
  focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all
`;

const LeadCollectorNode = ({ data, selected }) => {
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState(data.fields || []);
  const [businessType, setBusinessType] = useState(data.business_type || 'generic');
  const [sheetId, setSheetId] = useState(data.sheet_id || '');

  const handleAddField = () => {
    const updatedFields = [...fields, { name: '', label: '', required: false, type: 'text', options: '' }];
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
    data.fields = fields.filter((f) => f.name && f.label);
    data.business_type = businessType;
    data.sheet_id = sheetId;
    setEditing(false);
  };

  return (
    <div
      className={`px-4 py-3 rounded-xl bg-green-50 dark:bg-green-500/10 border ${
        selected ? 'border-green-400 dark:border-green-400' : 'border-green-200 dark:border-green-500/20'
      } min-w-[220px] max-w-[320px] transition-colors`}
    >
      <Handle type="target" position={Position.Top} className="!bg-green-500" />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <User className="mr-2 text-green-500" size={16} />
          <div className="text-sm font-bold text-green-800 dark:text-green-300">Lead Collector</div>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
        >
          <Save size={14} />
        </button>
      </div>

      {editing ? (
        <div className="space-y-2 mb-2 max-h-[250px] overflow-y-auto pr-1">
          <input
            type="text"
            className={inputBaseClass}
            placeholder="Google Sheet ID"
            value={sheetId}
            onChange={(e) => setSheetId(e.target.value)}
          />
          <input
            type="text"
            className={inputBaseClass}
            placeholder="Business Type (e.g., real_estate)"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
          />

          {fields.map((field, index) => (
            <div
              key={index}
              className="space-y-1 border border-green-200 dark:border-green-500/20 rounded-lg p-2 bg-white dark:bg-[#111827] shadow-sm relative"
            >
              <button
                onClick={() => handleDeleteField(index)}
                className="absolute top-1 right-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                title="Delete Field"
              >
                <Trash2 size={14} />
              </button>

              <input
                type="text"
                className={inputBaseClass}
                placeholder="Field Name (e.g., budget)"
                value={field.name}
                onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
              />
              <input
                type="text"
                className={inputBaseClass}
                placeholder="Field Label (e.g., What's your budget?)"
                value={field.label}
                onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
              />

              <select
                className={selectBaseClass}
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
                  className={inputBaseClass}
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
                  className="mr-2 accent-green-500"
                />
                <span className="text-xs text-gray-700 dark:text-gray-300">Required</span>
              </label>
            </div>
          ))}

          <div className="flex space-x-2">
            <button
              onClick={handleAddField}
              className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-all active:scale-95 shadow-sm flex-1"
            >
              + Add Field
            </button>
            <button
              onClick={handleSave}
              className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-all active:scale-95 shadow-sm flex-1"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-xs bg-white dark:bg-[#111827] p-2 rounded-lg border border-green-100 dark:border-green-500/20 text-gray-700 dark:text-gray-300">
            <span className="block">Business: {businessType}</span>
            <span className="block">
              Collects: {fields.length > 0 ? fields.map((f) => f.label).join(', ') : 'No fields'}
            </span>
          </div>

          {sheetId && (
            <div className="text-xs mt-2 p-1.5 bg-green-50 dark:bg-green-500/10 rounded-lg border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-300">
              Exports to Google Sheet: {sheetId}
            </div>
          )}
        </>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-green-500" />
    </div>
  );
};

export default memo(LeadCollectorNode);