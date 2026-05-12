// import React, { useState } from 'react';
// import { Clock, Plus, X, Trash2 } from 'lucide-react';
// import VariablePicker from './VariablePicker';

// /**
//  * FollowUpEditor — configures per-node follow-up messages.
//  *
//  * Storage shape (persists to node.data.follow_ups):
//  *   [
//  *     { delay_minutes: 30,  message: "Hey {{username}}, still there?" },
//  *     { delay_minutes: 120, message: "Last check-in 👋" },
//  *   ]
//  *
//  * Usage:
//  *   <FollowUpEditor
//  *     followUps={data.follow_ups || []}
//  *     onChange={(next) => { data.follow_ups = next; forceUpdate(); }}
//  *   />
//  *
//  * Why this uses the direct-mutation anti-pattern like your other node editors:
//  *   Consistency with MessageNode/TextButtonsNode/KeywordListenerNode where
//  *   `data.field = value` is how state gets persisted to flow save. Fighting
//  *   this convention in one component would break the save flow silently.
//  *   A codebase-wide refactor to proper React Flow state is a separate project.
//  */

// const MAX_FOLLOWUPS = 5;
// const MAX_MESSAGE_LENGTH = 1024;
// const DEFAULT_DELAY_MINUTES = 30;

// // Time preset shortcuts users commonly want
// const PRESETS = [
//   { label: '15 min',  minutes: 15 },
//   { label: '30 min',  minutes: 30 },
//   { label: '1 hour',  minutes: 60 },
//   { label: '2 hours', minutes: 120 },
//   { label: '24 hours', minutes: 1440 },
// ];

// // Backend clamps: min 1 min, max 7 days (10080 min). Frontend enforces same.
// const MIN_MINUTES = 1;
// const MAX_MINUTES = 60 * 24 * 7;

// const formatDelay = (minutes) => {
//   if (minutes < 60) return `${minutes} min`;
//   if (minutes < 1440) {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
//   }
//   const days = Math.floor(minutes / 1440);
//   const remainingHours = Math.floor((minutes % 1440) / 60);
//   return remainingHours === 0 ? `${days}d` : `${days}d ${remainingHours}h`;
// };

// const FollowUpEditor = ({ followUps = [], onChange }) => {
//   const [expanded, setExpanded] = useState(true);
//   // Per-followup textarea refs for variable picker cursor placement.
//   // Stored as an object keyed by index so refs don't shift when items reorder.
//   const textareaRefs = React.useRef({});

//   const persist = (next) => {
//     onChange(next);
//   };

//   const addFollowUp = () => {
//     if (followUps.length >= MAX_FOLLOWUPS) return;

//     // Sensible default: escalate from previous followup's delay.
//     // If first, use DEFAULT_DELAY_MINUTES. Otherwise, 2× previous.
//     const lastDelay = followUps.length > 0
//       ? followUps[followUps.length - 1].delay_minutes
//       : DEFAULT_DELAY_MINUTES;
//     const nextDelay = Math.min(MAX_MINUTES, lastDelay * 2 || DEFAULT_DELAY_MINUTES);

//     persist([
//       ...followUps,
//       { delay_minutes: nextDelay, message: '' },
//     ]);
//   };

//   const removeFollowUp = (index) => {
//     persist(followUps.filter((_, i) => i !== index));
//     // Clean up ref to avoid stale references
//     delete textareaRefs.current[index];
//   };

//   const updateFollowUp = (index, field, value) => {
//     const next = [...followUps];
//     next[index] = { ...next[index], [field]: value };
//     persist(next);
//   };

//   const updateDelay = (index, rawValue) => {
//     let value = parseInt(rawValue, 10);
//     if (isNaN(value)) value = MIN_MINUTES;
//     value = Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, value));
//     updateFollowUp(index, 'delay_minutes', value);
//   };

//   const applyPreset = (index, minutes) => {
//     updateFollowUp(index, 'delay_minutes', minutes);
//   };

//   // ─────────────────────────────────────────────────────────
//   // COLLAPSED SUMMARY (when editor is closed)
//   // ─────────────────────────────────────────────────────────
//   if (!expanded) {
//     return (
//       <div className="mt-2 border-t border-gray-100 pt-2">
//         <button
//           type="button"
//           onClick={() => setExpanded(true)}
//           className="flex items-center justify-between w-full text-xs text-gray-600 hover:text-gray-800 group"
//         >
//           <div className="flex items-center gap-1">
//             <Clock size={12} className="text-indigo-500" />
//             <span>Follow-ups</span>
//             {followUps.length > 0 && (
//               <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-medium ml-1">
//                 {followUps.length}
//               </span>
//             )}
//           </div>
//           <span className="text-[10px] text-gray-400 group-hover:text-gray-600">
//             {followUps.length === 0 ? 'none' : followUps.map(f => formatDelay(f.delay_minutes)).join(' → ')}
//           </span>
//         </button>
//       </div>
//     );
//   }

//   // ─────────────────────────────────────────────────────────
//   // EXPANDED EDITOR
//   // ─────────────────────────────────────────────────────────
//   return (
//     <div className="mt-2 border-t border-gray-100 pt-2 space-y-2">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-1">
//           <Clock size={12} className="text-indigo-500" />
//           <span className="text-xs font-medium text-gray-700">Follow-ups</span>
//           <span className="text-[10px] text-gray-500">({followUps.length}/{MAX_FOLLOWUPS})</span>
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

//       <div className="text-[10px] text-gray-500 bg-indigo-50 p-1.5 rounded">
//         Sent if user doesn't reply. Cancelled on any user message or bot advance.
//       </div>

//       {followUps.length === 0 && (
//         <div className="text-[10px] text-gray-400 italic text-center py-1">
//           No follow-ups. Add one below.
//         </div>
//       )}

//       {followUps.map((followup, index) => (
//         <div
//           key={index}
//           className="bg-gray-50 border border-gray-200 rounded p-2 space-y-1.5"
//         >
//           <div className="flex items-center justify-between">
//             <span className="text-[10px] font-semibold text-gray-600">
//               Step {index + 1}
//             </span>
//             <button
//               type="button"
//               onClick={() => removeFollowUp(index)}
//               className="text-red-400 hover:text-red-600"
//               title="Remove"
//             >
//               <Trash2 size={10} />
//             </button>
//           </div>

//           {/* Delay input + presets */}
//           <div className="space-y-1">
//             <label className="text-[10px] text-gray-600">Wait before sending</label>
//             <div className="flex gap-1 items-center">
//               <input
//                 type="number"
//                 min={MIN_MINUTES}
//                 max={MAX_MINUTES}
//                 value={followup.delay_minutes}
//                 onChange={(e) => updateDelay(index, e.target.value)}
//                 className="w-16 text-[10px] px-1.5 py-1 border border-gray-200 rounded"
//               />
//               <span className="text-[10px] text-gray-500">minutes</span>
//               <span className="text-[10px] text-gray-400 ml-auto">
//                 = {formatDelay(followup.delay_minutes)}
//               </span>
//             </div>
//             <div className="flex gap-1 flex-wrap">
//               {PRESETS.map((p) => (
//                 <button
//                   key={p.minutes}
//                   type="button"
//                   onClick={() => applyPreset(index, p.minutes)}
//                   className={`text-[9px] px-1.5 py-0.5 rounded border ${
//                     followup.delay_minutes === p.minutes
//                       ? 'bg-indigo-500 text-white border-indigo-500'
//                       : 'bg-white text-gray-600 border-gray-200 hover:bg-indigo-50'
//                   }`}
//                 >
//                   {p.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Message body + variable picker */}
//           <div className="space-y-1">
//             <div className="flex items-center justify-between">
//               <label className="text-[10px] text-gray-600">Message</label>
//               <VariablePicker
//                 textareaRef={{ current: textareaRefs.current[index] }}
//                 currentText={followup.message || ''}
//                 onInsert={(newText) => updateFollowUp(index, 'message', newText)}
//               />
//             </div>
//             <textarea
//               ref={(el) => { textareaRefs.current[index] = el; }}
//               rows={2}
//               maxLength={MAX_MESSAGE_LENGTH}
//               value={followup.message || ''}
//               onChange={(e) => updateFollowUp(index, 'message', e.target.value)}
//               placeholder="Hey {{username}}, still there?"
//               className="w-full text-[10px] px-1.5 py-1 border border-gray-200 rounded resize-none"
//             />
//             <div className="flex justify-between items-center">
//               <span className="text-[9px] text-gray-400">
//                 {(followup.message || '').length}/{MAX_MESSAGE_LENGTH}
//               </span>
//               {!(followup.message || '').trim() && (
//                 <span className="text-[9px] text-amber-600">⚠ Empty — will be skipped</span>
//               )}
//             </div>
//           </div>
//         </div>
//       ))}

//       <button
//         type="button"
//         onClick={addFollowUp}
//         disabled={followUps.length >= MAX_FOLLOWUPS}
//         className={`flex items-center justify-center gap-1 w-full text-[10px] py-1.5 rounded border border-dashed ${
//           followUps.length >= MAX_FOLLOWUPS
//             ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
//             : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'
//         }`}
//       >
//         <Plus size={10} />
//         {followUps.length >= MAX_FOLLOWUPS
//           ? `Max ${MAX_FOLLOWUPS} follow-ups`
//           : 'Add follow-up step'}
//       </button>
//     </div>
//   );
// };

// export default React.memo(FollowUpEditor);


import React, { useState } from 'react';
import { Clock, Plus, X, Trash2 } from 'lucide-react';
import VariablePicker from './VariablePicker';

const MAX_FOLLOWUPS = 5;
const MAX_MESSAGE_LENGTH = 1024;
const DEFAULT_DELAY_MINUTES = 30;

const PRESETS = [
  { label: '15 min',  minutes: 15 },
  { label: '30 min',  minutes: 30 },
  { label: '1 hour',  minutes: 60 },
  { label: '2 hours', minutes: 120 },
  { label: '24 hours', minutes: 1440 },
];

const MIN_MINUTES = 1;
const MAX_MINUTES = 60 * 24 * 7;

const formatDelay = (minutes) => {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
  }
  const days = Math.floor(minutes / 1440);
  const remainingHours = Math.floor((minutes % 1440) / 60);
  return remainingHours === 0 ? `${days}d` : `${days}d ${remainingHours}h`;
};

const inputBaseClass = `
  w-full text-[10px] px-1.5 py-1 border border-gray-200 dark:border-gray-700 rounded-lg
  bg-white dark:bg-[#111827] text-gray-900 dark:text-gray-100
  placeholder:text-gray-400 dark:placeholder:text-gray-600
  focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all
`;

const FollowUpEditor = ({ followUps = [], onChange }) => {
  const [expanded, setExpanded] = useState(true);
  const textareaRefs = React.useRef({});

  const persist = (next) => onChange(next);

  const addFollowUp = () => {
    if (followUps.length >= MAX_FOLLOWUPS) return;
    const lastDelay = followUps.length > 0
      ? followUps[followUps.length - 1].delay_minutes
      : DEFAULT_DELAY_MINUTES;
    const nextDelay = Math.min(MAX_MINUTES, lastDelay * 2 || DEFAULT_DELAY_MINUTES);
    persist([...followUps, { delay_minutes: nextDelay, message: '' }]);
  };

  const removeFollowUp = (index) => {
    persist(followUps.filter((_, i) => i !== index));
    delete textareaRefs.current[index];
  };

  const updateFollowUp = (index, field, value) => {
    const next = [...followUps];
    next[index] = { ...next[index], [field]: value };
    persist(next);
  };

  const updateDelay = (index, rawValue) => {
    let value = parseInt(rawValue, 10);
    if (isNaN(value)) value = MIN_MINUTES;
    value = Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, value));
    updateFollowUp(index, 'delay_minutes', value);
  };

  const applyPreset = (index, minutes) => {
    updateFollowUp(index, 'delay_minutes', minutes);
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
            <Clock size={12} className="text-indigo-500" />
            <span>Follow-ups</span>
            {followUps.length > 0 && (
              <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded text-[10px] font-medium ml-1">
                {followUps.length}
              </span>
            )}
          </div>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300">
            {followUps.length === 0 ? 'none' : followUps.map(f => formatDelay(f.delay_minutes)).join(' → ')}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2 border-t border-gray-100 dark:border-gray-700 pt-2 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Clock size={12} className="text-indigo-500" />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Follow-ups</span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">({followUps.length}/{MAX_FOLLOWUPS})</span>
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

      <div className="text-[10px] text-gray-500 dark:text-gray-400 bg-indigo-50 dark:bg-indigo-500/10 p-1.5 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
        Sent if user doesn't reply. Cancelled on any user message or bot advance.
      </div>

      {followUps.length === 0 && (
        <div className="text-[10px] text-gray-400 dark:text-gray-500 italic text-center py-1">
          No follow-ups. Add one below.
        </div>
      )}

      {followUps.map((followup, index) => (
        <div
          key={index}
          className="bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">
              Step {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeFollowUp(index)}
              className="text-red-400 hover:text-red-600 dark:text-red-400/70 dark:hover:text-red-400 transition-colors"
              title="Remove"
            >
              <Trash2 size={10} />
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-600 dark:text-gray-400">Wait before sending</label>
            <div className="flex gap-1 items-center">
              <input
                type="number"
                min={MIN_MINUTES}
                max={MAX_MINUTES}
                value={followup.delay_minutes}
                onChange={(e) => updateDelay(index, e.target.value)}
                className="w-16 text-[10px] px-1.5 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#111827] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
              <span className="text-[10px] text-gray-500 dark:text-gray-400">minutes</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-auto">
                = {formatDelay(followup.delay_minutes)}
              </span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {PRESETS.map((p) => (
                <button
                  key={p.minutes}
                  type="button"
                  onClick={() => applyPreset(index, p.minutes)}
                  className={`text-[9px] px-1.5 py-0.5 rounded-lg border transition-all ${
                    followup.delay_minutes === p.minutes
                      ? 'bg-indigo-500 text-white border-indigo-500'
                      : 'bg-white dark:bg-[#111827] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-gray-600 dark:text-gray-400">Message</label>
              <VariablePicker
                textareaRef={{ current: textareaRefs.current[index] }}
                currentText={followup.message || ''}
                onInsert={(newText) => updateFollowUp(index, 'message', newText)}
              />
            </div>
            <textarea
              ref={(el) => { textareaRefs.current[index] = el; }}
              rows={2}
              maxLength={MAX_MESSAGE_LENGTH}
              value={followup.message || ''}
              onChange={(e) => updateFollowUp(index, 'message', e.target.value)}
              placeholder="Hey {{username}}, still there?"
              className={inputBaseClass + ' resize-none'}
            />
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-gray-400 dark:text-gray-500">
                {(followup.message || '').length}/{MAX_MESSAGE_LENGTH}
              </span>
              {!(followup.message || '').trim() && (
                <span className="text-[9px] text-amber-600 dark:text-amber-400">⚠ Empty — will be skipped</span>
              )}
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addFollowUp}
        disabled={followUps.length >= MAX_FOLLOWUPS}
        className={`flex items-center justify-center gap-1 w-full text-[10px] py-1.5 rounded-lg border border-dashed transition-all ${
          followUps.length >= MAX_FOLLOWUPS
            ? 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed'
            : 'bg-white dark:bg-[#111827] text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
        }`}
      >
        <Plus size={10} />
        {followUps.length >= MAX_FOLLOWUPS
          ? `Max ${MAX_FOLLOWUPS} follow-ups`
          : 'Add follow-up step'}
      </button>
    </div>
  );
};

export default React.memo(FollowUpEditor);