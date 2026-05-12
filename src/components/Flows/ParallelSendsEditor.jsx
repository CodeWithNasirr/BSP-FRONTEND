// import React, { useState } from 'react';
// import { Layers, Plus, Trash2, X, MessageSquare, Image as ImageIcon } from 'lucide-react';
// import VariablePicker from './VariablePicker';
// import { uploadFlowMedia } from './uploadFlowMedia';
// import { toast } from 'react-toastify';

// /**
//  * ParallelSendsEditor — adds extra messages to send from one node.
//  *
//  * Integrates into MessageNode / TextButtonsNode / TextImageNode editors.
//  * Stores config at node.data.parallel_sends as an array of items.
//  *
//  * Item shapes:
//  *   { type: "text",  content: "..." }
//  *   { type: "media", media_url: "...", media_type: "...", caption: "..." }
//  *
//  * Usage:
//  *   <ParallelSendsEditor
//  *     parallelSends={data.parallel_sends || []}
//  *     onChange={(next) => { data.parallel_sends = next; setSomething(); }}
//  *   />
//  *
//  * Sends fire AFTER the main message. Follow-ups only trigger after
//  * the entire node (main + parallel) completes.
//  */

// const MAX_ITEMS = 5;
// const MAX_TEXT_LENGTH = 1024;

// const makeEmptyItem = (type = 'text') => (
//   type === 'media'
//     ? { type: 'media', media_url: '', media_type: '', caption: '' }
//     : { type: 'text', content: '' }
// );

// const ParallelSendsEditor = ({ parallelSends = [], onChange }) => {
//   const [expanded, setExpanded] = useState(false);
//   const [uploadingIdx, setUploadingIdx] = useState(null);
//   const textareaRefs = React.useRef({});

//   const persist = (next) => onChange(next);

//   const addItem = (type) => {
//     if (parallelSends.length >= MAX_ITEMS) {
//       toast.warning(`Max ${MAX_ITEMS} parallel messages per node`);
//       return;
//     }
//     persist([...parallelSends, makeEmptyItem(type)]);
//   };

//   const removeItem = (idx) => {
//     persist(parallelSends.filter((_, i) => i !== idx));
//     delete textareaRefs.current[idx];
//   };

//   const updateItem = (idx, patch) => {
//     const next = [...parallelSends];
//     next[idx] = { ...next[idx], ...patch };
//     persist(next);
//   };

//   const handleMediaUpload = async (idx, file) => {
//     if (!file) return;
//     setUploadingIdx(idx);
//     try {
//       const result = await uploadFlowMedia(file);
//       if (result?.url) {
//         updateItem(idx, {
//           media_url: result.url,
//           media_type: result.media_type || file.type,
//         });
//       } else {
//         toast.error('Upload failed');
//       }
//     } catch (e) {
//       toast.error(`Upload error: ${e.message || 'unknown'}`);
//     } finally {
//       setUploadingIdx(null);
//     }
//   };

//   // ── Collapsed summary ──
//   if (!expanded) {
//     return (
//       <div className="mt-2 border-t border-gray-100 pt-2">
//         <button
//           type="button"
//           onClick={() => setExpanded(true)}
//           className="flex items-center justify-between w-full text-xs text-gray-600 hover:text-gray-800 group"
//         >
//           <div className="flex items-center gap-1">
//             <Layers size={12} className="text-teal-500" />
//             <span>Extra sends</span>
//             {parallelSends.length > 0 && (
//               <span className="bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded text-[10px] font-medium ml-1">
//                 +{parallelSends.length}
//               </span>
//             )}
//           </div>
//           <span className="text-[10px] text-gray-400 group-hover:text-gray-600">
//             {parallelSends.length === 0 ? 'none' : `${parallelSends.length} extra message(s)`}
//           </span>
//         </button>
//       </div>
//     );
//   }

//   // ── Expanded editor ──
//   return (
//     <div className="mt-2 border-t border-gray-100 pt-2 space-y-2">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-1">
//           <Layers size={12} className="text-teal-500" />
//           <span className="text-xs font-medium text-gray-700">Extra sends</span>
//           <span className="text-[10px] text-gray-500">
//             ({parallelSends.length}/{MAX_ITEMS})
//           </span>
//         </div>
//         <button
//           type="button"
//           onClick={() => setExpanded(false)}
//           className="text-gray-400 hover:text-gray-600"
//           title="Collapse"
//         >
//           <X size={12} />
//         </button>
//       </div>

//       <div className="text-[10px] text-gray-500 bg-teal-50 p-1.5 rounded">
//         Fires after main message. Best-effort: individual failures don't stop others.
//       </div>

//       {parallelSends.length === 0 && (
//         <div className="text-[10px] text-gray-400 italic text-center py-1">
//           No extra sends. Add one below.
//         </div>
//       )}

//       {parallelSends.map((item, idx) => (
//         <div
//           key={idx}
//           className="bg-gray-50 border border-gray-200 rounded p-2 space-y-1.5"
//         >
//           <div className="flex items-center justify-between">
//             <span className="text-[10px] font-semibold text-gray-600">
//               Extra {idx + 1} · {item.type}
//             </span>
//             <button
//               type="button"
//               onClick={() => removeItem(idx)}
//               className="text-red-400 hover:text-red-600"
//               title="Remove"
//             >
//               <Trash2 size={10} />
//             </button>
//           </div>

//           {item.type === 'text' && (
//             <div className="space-y-1">
//               <div className="flex items-center justify-between">
//                 <span className="text-[10px] text-gray-600">Text</span>
//                 <VariablePicker
//                   textareaRef={{ current: textareaRefs.current[idx] }}
//                   currentText={item.content || ''}
//                   onInsert={(newText) => updateItem(idx, { content: newText })}
//                 />
//               </div>
//               <textarea
//                 ref={(el) => { textareaRefs.current[idx] = el; }}
//                 rows={2}
//                 maxLength={MAX_TEXT_LENGTH}
//                 value={item.content || ''}
//                 onChange={(e) => updateItem(idx, { content: e.target.value })}
//                 placeholder="Extra message text. Use {{username}} for variables."
//                 className="w-full text-[10px] px-1.5 py-1 border border-gray-200 rounded resize-none"
//               />
//               <div className="text-[9px] text-gray-400 text-right">
//                 {(item.content || '').length}/{MAX_TEXT_LENGTH}
//               </div>
//             </div>
//           )}

//           {item.type === 'media' && (
//             <div className="space-y-1">
//               {item.media_url ? (
//                 <div className="bg-white border border-gray-200 rounded p-1.5 text-[10px]">
//                   <div className="flex items-center justify-between">
//                     <span className="text-green-700 truncate flex-1">
//                       ✓ {item.media_type || 'file'}
//                     </span>
//                     <button
//                       type="button"
//                       onClick={() => updateItem(idx, { media_url: '', media_type: '' })}
//                       className="text-red-500 hover:text-red-700 ml-1"
//                     >
//                       <Trash2 size={10} />
//                     </button>
//                   </div>
//                   <div className="text-gray-500 truncate">{item.media_url}</div>
//                 </div>
//               ) : (
//                 <label className="block cursor-pointer">
//                   <input
//                     type="file"
//                     accept="image/*,video/*,audio/*,application/pdf"
//                     onChange={(e) => handleMediaUpload(idx, e.target.files?.[0])}
//                     className="hidden"
//                     disabled={uploadingIdx === idx}
//                   />
//                   <div className="text-xs text-center py-2 border-2 border-dashed border-gray-300 rounded hover:bg-gray-50">
//                     {uploadingIdx === idx ? 'Uploading…' : '+ Upload media'}
//                   </div>
//                 </label>
//               )}

//               <input
//                 type="text"
//                 value={item.caption || ''}
//                 onChange={(e) => updateItem(idx, { caption: e.target.value })}
//                 placeholder="Caption (optional)"
//                 maxLength={200}
//                 className="w-full text-[10px] px-1.5 py-1 border border-gray-200 rounded"
//               />
//             </div>
//           )}
//         </div>
//       ))}

//       <div className="flex gap-1">
//         <button
//           type="button"
//           onClick={() => addItem('text')}
//           disabled={parallelSends.length >= MAX_ITEMS}
//           className={`flex-1 text-[10px] py-1 rounded border border-dashed flex items-center justify-center gap-1 ${
//             parallelSends.length >= MAX_ITEMS
//               ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
//               : 'bg-white text-teal-600 border-teal-200 hover:bg-teal-50'
//           }`}
//         >
//           <MessageSquare size={10} /> Add text
//         </button>
//         <button
//           type="button"
//           onClick={() => addItem('media')}
//           disabled={parallelSends.length >= MAX_ITEMS}
//           className={`flex-1 text-[10px] py-1 rounded border border-dashed flex items-center justify-center gap-1 ${
//             parallelSends.length >= MAX_ITEMS
//               ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
//               : 'bg-white text-teal-600 border-teal-200 hover:bg-teal-50'
//           }`}
//         >
//           <ImageIcon size={10} /> Add media
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ParallelSendsEditor;


import React, { useState } from 'react';
import { Layers, Plus, Trash2, X, MessageSquare, Image as ImageIcon } from 'lucide-react';
import VariablePicker from './VariablePicker';
import { uploadFlowMedia } from './uploadFlowMedia';
import { toast } from 'react-toastify';

const MAX_ITEMS = 5;
const MAX_TEXT_LENGTH = 1024;

const makeEmptyItem = (type = 'text') => (
  type === 'media'
    ? { type: 'media', media_url: '', media_type: '', caption: '' }
    : { type: 'text', content: '' }
);

const inputBaseClass = `
  w-full text-[10px] px-1.5 py-1 border border-gray-200 dark:border-gray-700 rounded-lg
  bg-white dark:bg-[#111827] text-gray-900 dark:text-gray-100
  placeholder:text-gray-400 dark:placeholder:text-gray-600
  focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all
`;

const ParallelSendsEditor = ({ parallelSends = [], onChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const textareaRefs = React.useRef({});

  const persist = (next) => onChange(next);

  const addItem = (type) => {
    if (parallelSends.length >= MAX_ITEMS) {
      toast.warning(`Max ${MAX_ITEMS} parallel messages per node`);
      return;
    }
    persist([...parallelSends, makeEmptyItem(type)]);
  };

  const removeItem = (idx) => {
    persist(parallelSends.filter((_, i) => i !== idx));
    delete textareaRefs.current[idx];
  };

  const updateItem = (idx, patch) => {
    const next = [...parallelSends];
    next[idx] = { ...next[idx], ...patch };
    persist(next);
  };

  const handleMediaUpload = async (idx, file) => {
    if (!file) return;
    setUploadingIdx(idx);
    try {
      const result = await uploadFlowMedia(file);
      if (result?.url) {
        updateItem(idx, {
          media_url: result.url,
          media_type: result.media_type || file.type,
        });
      } else {
        toast.error('Upload failed');
      }
    } catch (e) {
      toast.error(`Upload error: ${e.message || 'unknown'}`);
    } finally {
      setUploadingIdx(null);
    }
  };

  if (!expanded) {
    return (
      <div className="mt-2 border-t border-gray-100 dark:border-gray-700 pt-2">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex items-center justify-between w-full text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 group"
        >
          <div className="flex items-center gap-1">
            <Layers size={12} className="text-teal-500" />
            <span>Extra sends</span>
            {parallelSends.length > 0 && (
              <span className="bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 px-1.5 py-0.5 rounded text-[10px] font-medium ml-1">
                +{parallelSends.length}
              </span>
            )}
          </div>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300">
            {parallelSends.length === 0 ? 'none' : `${parallelSends.length} extra message(s)`}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2 border-t border-gray-100 dark:border-gray-700 pt-2 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Layers size={12} className="text-teal-500" />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Extra sends</span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">
            ({parallelSends.length}/{MAX_ITEMS})
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Collapse"
        >
          <X size={12} />
        </button>
      </div>

      <div className="text-[10px] text-gray-500 dark:text-gray-400 bg-teal-50 dark:bg-teal-500/10 p-1.5 rounded-lg border border-teal-100 dark:border-teal-500/20">
        Fires after main message. Best-effort: individual failures don't stop others.
      </div>

      {parallelSends.length === 0 && (
        <div className="text-[10px] text-gray-400 dark:text-gray-500 italic text-center py-1">
          No extra sends. Add one below.
        </div>
      )}

      {parallelSends.map((item, idx) => (
        <div
          key={idx}
          className="bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">
              Extra {idx + 1} · {item.type}
            </span>
            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="text-red-400 hover:text-red-600 dark:text-red-400/70 dark:hover:text-red-400 transition-colors"
              title="Remove"
            >
              <Trash2 size={10} />
            </button>
          </div>

          {item.type === 'text' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-600 dark:text-gray-400">Text</span>
                <VariablePicker
                  textareaRef={{ current: textareaRefs.current[idx] }}
                  currentText={item.content || ''}
                  onInsert={(newText) => updateItem(idx, { content: newText })}
                />
              </div>
              <textarea
                ref={(el) => { textareaRefs.current[idx] = el; }}
                rows={2}
                maxLength={MAX_TEXT_LENGTH}
                value={item.content || ''}
                onChange={(e) => updateItem(idx, { content: e.target.value })}
                placeholder="Extra message text. Use {{username}} for variables."
                className={inputBaseClass + ' resize-none'}
              />
              <div className="text-[9px] text-gray-400 dark:text-gray-500 text-right">
                {(item.content || '').length}/{MAX_TEXT_LENGTH}
              </div>
            </div>
          )}

          {item.type === 'media' && (
            <div className="space-y-1">
              {item.media_url ? (
                <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-lg p-1.5 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-green-700 dark:text-green-400 truncate flex-1">
                      ✓ {item.media_type || 'file'}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateItem(idx, { media_url: '', media_type: '' })}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-1 transition-colors"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 truncate">{item.media_url}</div>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,video/*,audio/*,application/pdf"
                    onChange={(e) => handleMediaUpload(idx, e.target.files?.[0])}
                    className="hidden"
                    disabled={uploadingIdx === idx}
                  />
                  <div className="text-xs text-center py-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors">
                    {uploadingIdx === idx ? 'Uploading…' : '+ Upload media'}
                  </div>
                </label>
              )}

              <input
                type="text"
                value={item.caption || ''}
                onChange={(e) => updateItem(idx, { caption: e.target.value })}
                placeholder="Caption (optional)"
                maxLength={200}
                className={inputBaseClass}
              />
            </div>
          )}
        </div>
      ))}

      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => addItem('text')}
          disabled={parallelSends.length >= MAX_ITEMS}
          className={`flex-1 text-[10px] py-1 rounded-lg border border-dashed flex items-center justify-center gap-1 transition-all ${
            parallelSends.length >= MAX_ITEMS
              ? 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed'
              : 'bg-white dark:bg-[#111827] text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-500/30 hover:bg-teal-50 dark:hover:bg-teal-500/10'
          }`}
        >
          <MessageSquare size={10} /> Add text
        </button>
        <button
          type="button"
          onClick={() => addItem('media')}
          disabled={parallelSends.length >= MAX_ITEMS}
          className={`flex-1 text-[10px] py-1 rounded-lg border border-dashed flex items-center justify-center gap-1 transition-all ${
            parallelSends.length >= MAX_ITEMS
              ? 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed'
              : 'bg-white dark:bg-[#111827] text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-500/30 hover:bg-teal-50 dark:hover:bg-teal-500/10'
          }`}
        >
          <ImageIcon size={10} /> Add media
        </button>
      </div>
    </div>
  );
};

export default ParallelSendsEditor;