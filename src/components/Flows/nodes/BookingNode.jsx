// import React, { memo, useState } from 'react';
// import { Handle, Position } from 'reactflow';
// import { FileText, Pencil } from 'lucide-react';

// const BookingNode = ({ data, selected }) => {
//   const [editing, setEditing] = useState(false);
//   const [fields, setFields] = useState(data.fields || [
//     { name: 'name', label: 'Full Name', type: 'text', required: true },
//     { name: 'phone', label: 'Phone Number', type: 'text', required: true },
//     { name: 'device_brand', label: 'Laptop Brand/Model', type: 'text', required: true },
//     { name: 'issue', label: 'Issue Description', type: 'text', required: true }
//   ]);

//   const handleSave = () => {
//     data.fields = fields;
//     setEditing(false);
//   };

//   const updateField = (index, key, value) => {
//     const newFields = [...fields];
//     newFields[index] = { ...newFields[index], [key]: value };
//     setFields(newFields);
//   };

//   const addField = () => {
//     setFields([...fields, { name: '', label: '', type: 'text', required: false }]);
//   };

//   const removeField = (index) => {
//     setFields(fields.filter((_, i) => i !== index));
//   };

//   return (
//     <div className={`px-4 py-3 rounded-lg bg-node-booking border ${selected ? 'border-blue-400' : 'border-blue-200'} min-w-[200px] max-w-[300px]`}>
//       <Handle type="target" position={Position.Top} />

//       <div className="flex items-center justify-between mb-2">
//         <div className="flex items-center">
//           <FileText className="mr-2 text-blue-500" size={16} />
//           <div className="text-sm font-medium text-blue-800">Booking Form</div>
//         </div>
//         <button onClick={() => setEditing(!editing)} className="text-blue-500 hover:text-blue-700">
//           <Pencil size={14} />
//         </button>
//       </div>

//       {editing ? (
//         <div className="space-y-2 mb-2">
//           {fields.map((field, index) => (
//             <div key={index} className="space-y-1">
//               <input
//                 type="text"
//                 className="w-full text-xs px-2 py-1 border border-blue-200 rounded"
//                 placeholder="Field Name"
//                 value={field.name}
//                 onChange={(e) => updateField(index, 'name', e.target.value)}
//               />
//               <input
//                 type="text"
//                 className="w-full text-xs px-2 py-1 border border-blue-200 rounded"
//                 placeholder="Field Label"
//                 value={field.label}
//                 onChange={(e) => updateField(index, 'label', e.target.value)}
//               />
//               <select
//                 className="w-full text-xs p-2 border border-blue-200 rounded"
//                 value={field.type}
//                 onChange={(e) => updateField(index, 'type', e.target.value)}
//               >
//                 <option value="text">Text</option>
//                 <option value="number">Number</option>
//                 <option value="date">Date</option>
//               </select>
//               <label className="flex items-center">
//                 <input
//                   type="checkbox"
//                   checked={field.required}
//                   onChange={(e) => updateField(index, 'required', e.target.checked)}
//                   className="mr-2"
//                 />
//                 <span className="text-xs">Required</span>
//               </label>
//               <button
//                 onClick={() => removeField(index)}
//                 className="text-xs text-red-500 hover:text-red-700"
//               >
//                 Remove
//               </button>
//             </div>
//           ))}
//           <button
//             onClick={addField}
//             className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
//           >
//             Add Field
//           </button>
//           <button
//             onClick={handleSave}
//             className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
//           >
//             Save
//           </button>
//         </div>
//       ) : (
//         <div className="bg-white p-2 rounded border border-blue-100 mb-2">
//           <div className="text-xs font-medium text-blue-700">Fields:</div>
//           <div className="text-xs text-gray-500">
//             {fields.map(f => f.label).join(', ') || 'No fields set'}
//           </div>
//         </div>
//       )}

//       <Handle type="source" position={Position.Bottom} />
//     </div>
//   );
// };

// export default memo(BookingNode);



import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { FileText, Pencil } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../../config';

const BookingNode = ({ data, selected }) => {
  const [editing, setEditing] = useState(false);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [selectedServiceType, setSelectedServiceType] = useState(data.service_type_id || '');
  const token = localStorage.getItem('authToken');

  // Fetch ServiceTypes on mount
  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/service-types/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setServiceTypes(response.data);
      } catch (error) {
        console.error('Error fetching service types:', error);
      }
    };
    fetchServiceTypes();
  }, []);

  const handleSave = () => {
    data.service_type_id = selectedServiceType;
    delete data.fields; // Remove legacy fields
    setEditing(false);
  };

  const selectedServiceTypeData = serviceTypes.find(st => st.id === parseInt(selectedServiceType));

  return (
    <div className={`px-4 py-3 rounded-lg bg-node-booking border ${selected ? 'border-blue-400' : 'border-blue-200'} min-w-[200px] max-w-[300px]`}>
      <Handle type="target" position={Position.Top} />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <FileText className="mr-2 text-blue-500" size={16} />
          <div className="text-sm font-medium text-blue-800">Booking Form</div>
        </div>
        <button onClick={() => setEditing(!editing)} className="text-blue-500 hover:text-blue-700">
          <Pencil size={14} />
        </button>
      </div>

      {editing ? (
        <div className="space-y-2 mb-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Service Type</label>
            <select
              className="w-full text-xs px-2 py-1 border border-blue-200 rounded"
              value={selectedServiceType}
              onChange={(e) => setSelectedServiceType(e.target.value)}
            >
              <option value="">Select a Service Type</option>
              {serviceTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          {selectedServiceTypeData && (
            <div className="text-xs text-gray-500">
              Fields: {selectedServiceTypeData.detail_fields.join(', ') || 'No fields defined'}
            </div>
          )}
          <button
            onClick={handleSave}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            disabled={!selectedServiceType}
          >
            Save
          </button>
        </div>
      ) : (
        <div className="bg-white p-2 rounded border border-blue-100 mb-2">
          <div className="text-xs font-medium text-blue-700">Service Type:</div>
          <div className="text-xs text-gray-500">
            {selectedServiceTypeData ? selectedServiceTypeData.name : 'No service type selected'}
          </div>
          {selectedServiceTypeData && (
            <>
              <div className="text-xs font-medium text-blue-700 mt-2">Fields:</div>
              <div className="text-xs text-gray-500">
                {selectedServiceTypeData.detail_fields.join(', ') || 'No fields defined'}
              </div>
            </>
          )}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(BookingNode);