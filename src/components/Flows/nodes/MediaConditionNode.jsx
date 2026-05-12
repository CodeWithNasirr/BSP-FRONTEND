// import React, { memo, useState } from 'react';
// import { Handle, Position } from 'reactflow';
// import { ScanLine, Pencil, X } from 'lucide-react';

// /**
//  * MediaConditionNode — routes by incoming WhatsApp message type.
//  *
//  * Behavior (backend):
//  *   - Session parks here (no send, no prompt).
//  *   - Next inbound message's type is inspected.
//  *   - Matching handle edge is followed.
//  *   - No match → fallback handle → fallback message.
//  *
//  * Data shape:
//  *   {
//  *     allowed_types: ["image", "document", "audio"],
//  *     fallback_message: "Please send an image or document."
//  *   }
//  *
//  * One source handle per allowed type + one "fallback" handle.
//  * Handle IDs match WhatsApp message types exactly — backend reads
//  * edge sourceHandle and compares to message.type.
//  */

// const ALL_MEDIA_TYPES = [
//   { key: 'image',       label: 'Image',       emoji: '📷', color: 'bg-green-100 text-green-700 border-green-300' },
//   { key: 'video',       label: 'Video',       emoji: '🎬', color: 'bg-purple-100 text-purple-700 border-purple-300' },
//   { key: 'audio',       label: 'Audio',       emoji: '🎙️', color: 'bg-orange-100 text-orange-700 border-orange-300' },
//   { key: 'document',    label: 'Document',    emoji: '📄', color: 'bg-red-100 text-red-700 border-red-300' },
//   { key: 'sticker',     label: 'Sticker',     emoji: '🏷️', color: 'bg-pink-100 text-pink-700 border-pink-300' },
//   { key: 'location',    label: 'Location',    emoji: '📍', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
//   { key: 'contacts',    label: 'Contacts',    emoji: '👤', color: 'bg-blue-100 text-blue-700 border-blue-300' },
//   { key: 'text',        label: 'Text',        emoji: '💬', color: 'bg-gray-100 text-gray-700 border-gray-300' },
//   { key: 'interactive', label: 'Interactive', emoji: '🔘', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
// ];

// const MediaConditionNode = ({ data, selected }) => {
//   const [editing, setEditing] = useState(false);

//   // State: which types are enabled (determines which handles render)
//   const [allowedTypes, setAllowedTypes] = useState(
//     Array.isArray(data.allowed_types) && data.allowed_types.length > 0
//       ? data.allowed_types
//       : ['image', 'document']
//   );
//   const [fallbackMessage, setFallbackMessage] = useState(
//     data.fallback_message || ''
//   );

//   const persist = (types, msg) => {
//     data.allowed_types = types;
//     data.fallback_message = msg;
//     setAllowedTypes(types);
//     setFallbackMessage(msg);
//   };

//   const toggleType = (key) => {
//     const next = allowedTypes.includes(key)
//       ? allowedTypes.filter((t) => t !== key)
//       : [...allowedTypes, key];

//     // Must keep at least one type
//     if (next.length === 0) return;
//     persist(next, fallbackMessage);
//   };

//   const handleFallbackChange = (e) => {
//     const msg = e.target.value;
//     setFallbackMessage(msg);
//     data.fallback_message = msg;
//   };

//   // Handle positioning: active types + fallback
//   const activeHandles = [...allowedTypes, 'fallback'];
//   const handlePosition = (idx) =>
//     `${((idx + 1) / (activeHandles.length + 1)) * 100}%`;

//   return (
//     <div
//       className={`px-4 py-3 rounded-lg bg-node-message border ${
//         selected ? 'border-rose-400' : 'border-rose-200'
//       } min-w-[250px] max-w-[320px]`}
//     >
//       <Handle type="target" position={Position.Top} />

//       {/* Header */}
//       <div className="flex items-center justify-between mb-2">
//         <div className="flex items-center">
//           <ScanLine className="mr-2 text-rose-500" size={16} />
//           <div className="text-sm font-medium text-rose-800">
//             Media Router
//           </div>
//         </div>
//         <button
//           onClick={() => setEditing(!editing)}
//           className="text-rose-500 hover:text-rose-700"
//         >
//           <Pencil size={14} />
//         </button>
//       </div>

//       {editing ? (
//         /* ── EDITOR ──────────────────────────────────── */
//         <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
//           <div className="text-xs text-gray-600 bg-rose-50 p-2 rounded">
//             Select which media types to route. Each enabled type gets its own
//             output handle. Unmatched types go to fallback.
//           </div>

//           {/* Type toggles */}
//           <div className="flex flex-wrap gap-1.5">
//             {ALL_MEDIA_TYPES.map((mt) => {
//               const isActive = allowedTypes.includes(mt.key);
//               return (
//                 <button
//                   key={mt.key}
//                   onClick={() => toggleType(mt.key)}
//                   className={`text-[10px] px-2 py-1 rounded-full border flex items-center gap-1 transition-all ${
//                     isActive
//                       ? mt.color
//                       : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
//                   }`}
//                 >
//                   <span>{mt.emoji}</span>
//                   {mt.label}
//                   {isActive && (
//                     <X size={10} className="ml-0.5 opacity-60" />
//                   )}
//                 </button>
//               );
//             })}
//           </div>

//           {/* Fallback message */}
//           <div>
//             <label className="text-xs text-gray-600 block mb-1">
//               Fallback message (when no type matches)
//             </label>
//             <textarea
//               value={fallbackMessage}
//               onChange={handleFallbackChange}
//               rows={2}
//               maxLength={500}
//               placeholder="Please send an image or document."
//               className="w-full text-xs px-2 py-1 border border-rose-200 rounded resize-none"
//             />
//           </div>

//           <button
//             onClick={() => setEditing(false)}
//             className="w-full bg-rose-500 text-white text-xs py-1.5 rounded hover:bg-rose-600"
//           >
//             Done
//           </button>
//         </div>
//       ) : (
//         /* ── COLLAPSED VIEW ──────────────────────────── */
//         <div className="space-y-1.5">
//           {/* Active type badges */}
//           <div className="flex flex-wrap gap-1">
//             {allowedTypes.map((typeKey) => {
//               const mt = ALL_MEDIA_TYPES.find((m) => m.key === typeKey);
//               if (!mt) return null;
//               return (
//                 <span
//                   key={typeKey}
//                   className={`text-[10px] px-1.5 py-0.5 rounded-full border ${mt.color}`}
//                 >
//                   {mt.emoji} {mt.label}
//                 </span>
//               );
//             })}
//           </div>

//           {/* Fallback row */}
//           <div className="bg-gray-50 text-xs p-1.5 rounded border border-gray-200 flex items-center justify-between">
//             <span className="text-gray-600 italic">
//               Fallback: {fallbackMessage
//                 ? `"${fallbackMessage.slice(0, 30)}${fallbackMessage.length > 30 ? '…' : ''}"`
//                 : '(none)'}
//             </span>
//           </div>
//         </div>
//       )}

//       {/* ── DYNAMIC SOURCE HANDLES ────────────────────────
//         One handle per allowed type + one fallback handle.
//         Handle IDs match WhatsApp type strings exactly.
//       */}
//       {allowedTypes.map((typeKey, idx) => {
//         const mt = ALL_MEDIA_TYPES.find((m) => m.key === typeKey);
//         return (
//           <Handle
//             key={typeKey}
//             id={typeKey}
//             type="source"
//             position={Position.Bottom}
//             style={{
//               left: handlePosition(idx),
//               background: '#f43f5e', // rose-500
//             }}
//             title={mt?.label || typeKey}
//           />
//         );
//       })}
//       <Handle
//         key="fallback"
//         id="fallback"
//         type="source"
//         position={Position.Bottom}
//         style={{
//           left: handlePosition(allowedTypes.length),
//           background: '#9ca3af', // gray-400
//         }}
//         title="Fallback"
//       />
//     </div>
//   );
// };

// export default memo(MediaConditionNode);


import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { ScanLine, Pencil, X } from 'lucide-react';

const ALL_MEDIA_TYPES = [
  { key: 'image',       label: 'Image',       emoji: '📷', color: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-500/30' },
  { key: 'video',       label: 'Video',       emoji: '🎬', color: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/30' },
  { key: 'audio',       label: 'Audio',       emoji: '🎙️', color: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-500/30' },
  { key: 'document',    label: 'Document',    emoji: '📄', color: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/30' },
  { key: 'sticker',     label: 'Sticker',     emoji: '🏷️', color: 'bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-300 dark:border-pink-500/30' },
  { key: 'location',    label: 'Location',    emoji: '📍', color: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30' },
  { key: 'contacts',    label: 'Contacts',    emoji: '👤', color: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/30' },
  { key: 'text',        label: 'Text',        emoji: '💬', color: 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500/30' },
  { key: 'interactive', label: 'Interactive', emoji: '🔘', color: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/30' },
];

const inputBaseClass = `
  w-full text-xs px-2 py-1 border border-rose-200 dark:border-rose-500/30 rounded-lg
  bg-white dark:bg-[#111827] text-gray-900 dark:text-gray-100
  placeholder:text-gray-400 dark:placeholder:text-gray-600
  focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all resize-none
`;

const MediaConditionNode = ({ data, selected }) => {
  const [editing, setEditing] = useState(false);
  const [allowedTypes, setAllowedTypes] = useState(
    Array.isArray(data.allowed_types) && data.allowed_types.length > 0
      ? data.allowed_types
      : ['image', 'document']
  );
  const [fallbackMessage, setFallbackMessage] = useState(data.fallback_message || '');

  const persist = (types, msg) => {
    data.allowed_types = types;
    data.fallback_message = msg;
    setAllowedTypes(types);
    setFallbackMessage(msg);
  };

  const toggleType = (key) => {
    const next = allowedTypes.includes(key)
      ? allowedTypes.filter((t) => t !== key)
      : [...allowedTypes, key];
    if (next.length === 0) return;
    persist(next, fallbackMessage);
  };

  const handleFallbackChange = (e) => {
    const msg = e.target.value;
    setFallbackMessage(msg);
    data.fallback_message = msg;
  };

  const activeHandles = [...allowedTypes, 'fallback'];
  const handlePosition = (idx) =>
    `${((idx + 1) / (activeHandles.length + 1)) * 100}%`;

  return (
    <div
      className={`px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border ${
        selected ? 'border-rose-400 dark:border-rose-400' : 'border-rose-200 dark:border-rose-500/20'
      } min-w-[250px] max-w-[320px] transition-colors`}
    >
      <Handle type="target" position={Position.Top} className="!bg-rose-500" />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <ScanLine className="mr-2 text-rose-500" size={16} />
          <div className="text-sm font-bold text-rose-800 dark:text-rose-300">Media Router</div>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
        >
          <Pencil size={14} />
        </button>
      </div>

      {editing ? (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          <div className="text-xs text-gray-600 dark:text-gray-400 bg-rose-50 dark:bg-rose-500/10 p-2 rounded-lg border border-rose-100 dark:border-rose-500/20">
            Select which media types to route. Each enabled type gets its own output handle. Unmatched types go to fallback.
          </div>

          <div className="flex flex-wrap gap-1.5">
            {ALL_MEDIA_TYPES.map((mt) => {
              const isActive = allowedTypes.includes(mt.key);
              return (
                <button
                  key={mt.key}
                  onClick={() => toggleType(mt.key)}
                  className={`text-[10px] px-2 py-1 rounded-full border flex items-center gap-1 transition-all ${
                    isActive
                      ? mt.color
                      : 'bg-white dark:bg-[#111827] text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span>{mt.emoji}</span>
                  {mt.label}
                  {isActive && <X size={10} className="ml-0.5 opacity-60" />}
                </button>
              );
            })}
          </div>

          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Fallback message (when no type matches)</label>
            <textarea
              value={fallbackMessage}
              onChange={handleFallbackChange}
              rows={2}
              maxLength={500}
              placeholder="Please send an image or document."
              className={inputBaseClass}
            />
          </div>

          <button
            onClick={() => setEditing(false)}
            className="w-full bg-rose-500 text-white text-xs py-1.5 rounded-lg hover:bg-rose-600 transition-all active:scale-95 shadow-sm"
          >
            Done
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-1">
            {allowedTypes.map((typeKey) => {
              const mt = ALL_MEDIA_TYPES.find((m) => m.key === typeKey);
              if (!mt) return null;
              return (
                <span
                  key={typeKey}
                  className={`text-[10px] px-1.5 py-0.5 rounded-full border ${mt.color}`}
                >
                  {mt.emoji} {mt.label}
                </span>
              );
            })}
          </div>

          <div className="bg-white dark:bg-[#111827] text-xs p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400 italic">
              Fallback: {fallbackMessage
                ? `"${fallbackMessage.slice(0, 30)}${fallbackMessage.length > 30 ? '…' : ''}"`
                : '(none)'}
            </span>
          </div>
        </div>
      )}

      {allowedTypes.map((typeKey, idx) => {
        const mt = ALL_MEDIA_TYPES.find((m) => m.key === typeKey);
        return (
          <Handle
            key={typeKey}
            id={typeKey}
            type="source"
            position={Position.Bottom}
            style={{ left: handlePosition(idx), background: '#f43f5e' }}
            title={mt?.label || typeKey}
          />
        );
      })}
      <Handle
        key="fallback"
        id="fallback"
        type="source"
        position={Position.Bottom}
        style={{ left: handlePosition(allowedTypes.length), background: '#9ca3af' }}
        title="Fallback"
      />
    </div>
  );
};

export default memo(MediaConditionNode);