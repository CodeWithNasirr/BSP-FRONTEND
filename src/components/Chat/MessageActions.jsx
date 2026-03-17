// // ═══════════════════════════════════════════════════════════════════════════════
// // src/components/Chat/MessageActions.jsx
// // WhatsApp-style hover/long-press action menu for messages
// //
// // CHANGES:
// // ✅ Forward button now ENABLED with onForward callback
// // ✅ All three actions: Copy, Reply, Forward
// // ═══════════════════════════════════════════════════════════════════════════════

// import React, { useEffect, useRef } from "react";

// const MessageActions = ({ msg, onCopy, onReply, onForward, onClose, isOutbound }) => {
//   const menuRef = useRef(null);

//   // Close on outside click
//   useEffect(() => {
//     const handleClick = (e) => {
//       if (menuRef.current && !menuRef.current.contains(e.target)) {
//         onClose();
//       }
//     };
//     document.addEventListener("mousedown", handleClick);
//     document.addEventListener("touchstart", handleClick);
//     return () => {
//       document.removeEventListener("mousedown", handleClick);
//       document.removeEventListener("touchstart", handleClick);
//     };
//   }, [onClose]);

//   return (
//     <div
//       ref={menuRef}
//       className={`absolute z-50 bg-white rounded-xl shadow-xl border border-gray-200 
//                   overflow-hidden animate-scaleIn min-w-[140px]
//                   ${isOutbound ? "right-0" : "left-0"} -top-2 -translate-y-full`}
//       style={{
//         animation: "scaleIn 0.15s ease-out",
//       }}
//     >
//       {/* Copy */}
//       <button
//         onClick={() => {
//           onCopy(msg);
//           onClose();
//         }}
//         className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 
//                    hover:bg-gray-50 active:bg-gray-100 transition-colors"
//       >
//         <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
//           />
//         </svg>
//         Copy
//       </button>

//       {/* Reply */}
//       <button
//         onClick={() => {
//           onReply(msg);
//           onClose();
//         }}
//         className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 
//                    hover:bg-gray-50 active:bg-gray-100 transition-colors"
//       >
//         <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
//           />
//         </svg>
//         Reply
//       </button>

//       {/* Forward — ✅ NOW ENABLED */}
//       <button
//         onClick={() => {
//           onForward(msg);
//           onClose();
//         }}
//         className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 
//                    hover:bg-gray-50 active:bg-gray-100 transition-colors"
//       >
//         <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"
//           />
//         </svg>
//         Forward
//       </button>
//     </div>
//   );
// };

// export default MessageActions;

// ═══════════════════════════════════════════════════════════════════════════════
// src/components/Chat/MessageActions.jsx — Message Action Menu
// ═══════════════════════════════════════════════════════════════════════════════
//
// Hover/Long-press menu for message actions including:
// ✅ Reply
// ✅ Copy text
// ✅ Save to Clipboard
// ✅ Forward (if implemented)
// ✅ Delete (if outbound)
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// src/components/Chat/MessageActions.jsx — FIXED
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState, useCallback } from "react";
import SaveToClipboardButton from "./SaveToClipboardButton";

const MessageActions = ({ msg, onCopy, onReply, onForward, onClose, isOutbound }) => {
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className={`absolute z-50 bg-white rounded-xl shadow-xl border border-gray-200 
                  overflow-hidden animate-scaleIn min-w-[140px]
                  ${isOutbound ? "right-0" : "left-0"} -top-2 -translate-y-full`}
      style={{
        animation: "scaleIn 0.15s ease-out",
      }}
    >
      {/* Copy */}
      {msg?.text_content && (
        <button
          onClick={() => {
            onCopy(msg);
            onClose();
          }}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 
                     hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
            />
          </svg>
          Copy
        </button>
      )}

      {/* Reply */}
      <button
        onClick={() => {
          onReply(msg);
          onClose();
        }}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 
                   hover:bg-gray-50 active:bg-gray-100 transition-colors"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
          />
        </svg>
        Reply
      </button>

      {/* ✅ NEW: Save to Clipboard */}
      <SaveToClipboardButton 
        message={msg} 
        variant="menu-item" 
        onSuccess={onClose}
      />

      {/* Forward */}
      <button
        onClick={() => {
          onForward(msg);
          onClose();
        }}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 
                   hover:bg-gray-50 active:bg-gray-100 transition-colors"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"
          />
        </svg>
        Forward
      </button>
    </div>
  );
};

export default MessageActions;