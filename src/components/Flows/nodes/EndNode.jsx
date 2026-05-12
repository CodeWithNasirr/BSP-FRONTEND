// import React, { memo, useState } from 'react';
// import { Handle, Position } from 'reactflow';
// import { Square, Pencil } from 'lucide-react';

// const EndNode = ({ data, selected }) => {
//   const [editing, setEditing] = useState(false);
//   const [endMessage, setEndMessage] = useState(data.endMessage || '');

//   const handleSave = () => {
//     data.endMessage = endMessage;
//     setEditing(false);
//   };

//   return (
//     <div className={`px-4 py-3 rounded-lg bg-node-end border ${selected ? 'border-red-400' : 'border-red-200'} max-w-[300px]`}>
//       <Handle type="target" position={Position.Top} />

//       <div className="flex items-center justify-between mb-2">
//         <div className="flex items-center">
//           <Square className="mr-2 text-red-500" size={16} />
//           <div className="text-sm font-medium text-red-800">End Flow</div>
//         </div>
//         <button onClick={() => setEditing(!editing)} className="text-red-500 hover:text-red-700">
//           <Pencil size={14} />
//         </button>
//       </div>

//       {editing ? (
//         <div className="space-y-2 mb-2">
//           <textarea
//             className="w-full text-xs p-2 border border-red-200 rounded"
//             rows={3}
//             placeholder="Enter end message"
//             value={endMessage}
//             onChange={(e) => setEndMessage(e.target.value)}
//           />
//           <button
//             onClick={handleSave}
//             className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
//           >
//             Save
//           </button>
//         </div>
//       ) : (
//         data.endMessage && (
//           <div className="bg-white p-2 rounded border border-red-100 text-xs text-gray-700">
//             {data.endMessage}
//           </div>
//         )
//       )}
//     </div>
//   );
// };

// export default memo(EndNode);


import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Square, Pencil } from 'lucide-react';

const EndNode = ({ data, selected }) => {
  const [editing, setEditing] = useState(false);
  const [endMessage, setEndMessage] = useState(data.endMessage || '');

  const handleSave = () => {
    data.endMessage = endMessage;
    setEditing(false);
  };

  const inputBaseClass = `
    w-full text-xs p-2 border border-red-200 dark:border-red-500/30 rounded-lg 
    bg-white dark:bg-[#111827] text-gray-900 dark:text-gray-100 
    placeholder:text-gray-400 dark:placeholder:text-gray-600 
    focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all
  `;

  return (
    <div
      className={`px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border ${
        selected ? 'border-red-400 dark:border-red-400' : 'border-red-200 dark:border-red-500/20'
      } max-w-[300px] transition-colors`}
    >
      <Handle type="target" position={Position.Top} className="!bg-red-500" />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Square className="mr-2 text-red-500" size={16} />
          <div className="text-sm font-bold text-red-800 dark:text-red-300">End Flow</div>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
        >
          <Pencil size={14} />
        </button>
      </div>

      {editing ? (
        <div className="space-y-2 mb-2">
          <textarea
            className={inputBaseClass}
            rows={3}
            placeholder="Enter end message"
            value={endMessage}
            onChange={(e) => setEndMessage(e.target.value)}
          />
          <button
            onClick={handleSave}
            className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-all active:scale-95 shadow-sm"
          >
            Save
          </button>
        </div>
      ) : (
        data.endMessage && (
          <div className="bg-white dark:bg-[#111827] p-2 rounded-lg border border-red-100 dark:border-red-500/20 text-xs text-gray-700 dark:text-gray-300">
            {endMessage}
          </div>
        )
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-red-500" />
    </div>
  );
};

export default memo(EndNode);