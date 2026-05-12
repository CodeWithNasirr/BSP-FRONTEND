// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import API_BASE_URL from '../../config';
// import { Variable, Search } from 'lucide-react';

// /**
//  * VariablePicker — dropdown that inserts {{variable}} tokens into a textarea.
//  *
//  * Usage:
//  *   <VariablePicker textareaRef={myRef} onInsert={(newText) => setMessage(newText)} />
//  *
//  * Props:
//  *   textareaRef — React ref to the <textarea> being edited
//  *   onInsert    — callback(newText) with the updated text (after insertion)
//  *   currentText — current textarea value (we don't read from DOM to stay
//  *                 in sync with React state)
//  */
// const VariablePicker = ({ textareaRef, onInsert, currentText = '' }) => {
//   const [open, setOpen] = useState(false);
//   const [variables, setVariables] = useState({ builtin: [], custom: [] });
//   const [loading, setLoading] = useState(false);
//   const [query, setQuery] = useState('');
//   const dropdownRef = useRef(null);

//   // Fetch available variables once on first open
//   useEffect(() => {
//     if (!open || variables.builtin.length > 0) return;
//     const token = localStorage.getItem('authToken');
//     setLoading(true);
//     axios
//       .get(`${API_BASE_URL}/api/flows/variables/`, {
//         headers: { Authorization: `Token ${token}` },
//       })
//       .then((res) => {
//         if (res.data?.success) {
//           setVariables({
//             builtin: res.data.builtin || [],
//             custom: res.data.custom || [],
//           });
//         }
//       })
//       .catch(() => {
//         // Fail silent — picker still works with built-ins baked in below
//       })
//       .finally(() => setLoading(false));
//   }, [open]);

//   // Close on outside click
//   useEffect(() => {
//     if (!open) return;
//     const handleClick = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClick);
//     return () => document.removeEventListener('mousedown', handleClick);
//   }, [open]);

//   const handleInsert = (varKey) => {
//     const token = `{{${varKey}}}`;
//     const textarea = textareaRef?.current;

//     if (textarea) {
//       // Insert at cursor position
//       const start = textarea.selectionStart ?? currentText.length;
//       const end = textarea.selectionEnd ?? currentText.length;
//       const newText = currentText.slice(0, start) + token + currentText.slice(end);
//       onInsert(newText);

//       // Restore cursor position after the inserted token
//       setTimeout(() => {
//         textarea.focus();
//         const newPos = start + token.length;
//         textarea.setSelectionRange(newPos, newPos);
//       }, 0);
//     } else {
//       // Fallback: append
//       onInsert(currentText + token);
//     }

//     setOpen(false);
//     setQuery('');
//   };

//   const allVariables = [...variables.builtin, ...variables.custom];
//   const filtered = query
//     ? allVariables.filter(
//         (v) =>
//           v.key.toLowerCase().includes(query.toLowerCase()) ||
//           v.label.toLowerCase().includes(query.toLowerCase())
//       )
//     : allVariables;

//   return (
//     <div className="relative inline-block" ref={dropdownRef}>
//       <button
//         type="button"
//         onClick={() => setOpen(!open)}
//         className="flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 px-2 py-1 rounded"
//         title="Insert variable"
//       >
//         <Variable size={12} />
//         {`{{ }}`}
//       </button>

//       {open && (
//         <div className="absolute z-50 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg max-h-72 overflow-hidden flex flex-col">
//           <div className="p-2 border-b border-gray-100">
//             <div className="relative">
//               <Search size={12} className="absolute left-2 top-2.5 text-gray-400" />
//               <input
//                 type="text"
//                 autoFocus
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder="Search variables..."
//                 className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
//               />
//             </div>
//           </div>

//           <div className="overflow-y-auto flex-1">
//             {loading && (
//               <div className="p-3 text-xs text-gray-500 text-center">Loading...</div>
//             )}
//             {!loading && filtered.length === 0 && (
//               <div className="p-3 text-xs text-gray-500 text-center">
//                 No variables match "{query}"
//               </div>
//             )}
//             {!loading &&
//               filtered.map((v) => (
//                 <button
//                   key={v.key}
//                   type="button"
//                   onClick={() => handleInsert(v.key)}
//                   className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-50 flex items-start"
//                 >
//                   <div className="flex-1 min-w-0">
//                     <div className="text-xs font-mono text-blue-700 truncate">
//                       {`{{${v.key}}}`}
//                     </div>
//                     <div className="text-xs text-gray-500 truncate">{v.label}</div>
//                   </div>
//                   {v.example && (
//                     <div className="text-xs text-gray-400 ml-2 shrink-0">
//                       → {v.example}
//                     </div>
//                   )}
//                 </button>
//               ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VariablePicker;

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { Variable, Search } from 'lucide-react';

const VariablePicker = ({ textareaRef, onInsert, currentText = '' }) => {
  const [open, setOpen] = useState(false);
  const [variables, setVariables] = useState({ builtin: [], custom: [] });
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!open || variables.builtin.length > 0) return;
    const token = localStorage.getItem('authToken');
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/api/flows/variables/`, { headers: { Authorization: `Token ${token}` } })
      .then((res) => {
        if (res.data?.success) {
          setVariables({ builtin: res.data.builtin || [], custom: res.data.custom || [] });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleInsert = (varKey) => {
    const token = `{{${varKey}}}`;
    const textarea = textareaRef?.current;
    if (textarea) {
      const start = textarea.selectionStart ?? currentText.length;
      const end = textarea.selectionEnd ?? currentText.length;
      const newText = currentText.slice(0, start) + token + currentText.slice(end);
      onInsert(newText);
      setTimeout(() => {
        textarea.focus();
        const newPos = start + token.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 0);
    } else {
      onInsert(currentText + token);
    }
    setOpen(false);
    setQuery('');
  };

  const allVariables = [...variables.builtin, ...variables.custom];
  const filtered = query
    ? allVariables.filter((v) => v.key.toLowerCase().includes(query.toLowerCase()) || v.label.toLowerCase().includes(query.toLowerCase()))
    : allVariables;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg transition-all active:scale-95"
        title="Insert variable"
      >
        <Variable size={12} />
        {`{{ }}`}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-64 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl dark:shadow-2xl max-h-72 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-100 dark:border-white/5">
            <div className="relative">
              <Search size={12} className="absolute left-2 top-2.5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search variables..."
                className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#111827] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {loading && <div className="p-3 text-xs text-gray-500 dark:text-gray-400 text-center">Loading...</div>}
            {!loading && filtered.length === 0 && (
              <div className="p-3 text-xs text-gray-500 dark:text-gray-400 text-center">No variables match "{query}"</div>
            )}
            {!loading && filtered.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => handleInsert(v.key)}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-500/10 border-b border-gray-50 dark:border-white/5 flex items-start transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-blue-700 dark:text-blue-300 truncate">{`{{${v.key}}}`}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{v.label}</div>
                </div>
                {v.example && <div className="text-xs text-gray-400 dark:text-gray-500 ml-2 shrink-0">→ {v.example}</div>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VariablePicker;