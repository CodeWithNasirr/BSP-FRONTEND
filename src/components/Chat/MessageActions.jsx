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

import React, { useState, useCallback, useRef, useEffect, memo } from "react";
import {
  ArrowUturnLeftIcon,
  ClipboardIcon,
  ClipboardDocumentIcon,
  TrashIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import SaveToClipboardButton from "./SaveToClipboardButton";

const MessageActions = memo(({
  message,
  isOutbound,
  onReply,
  onDelete,
  onForward,
  className = "",
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);
  const timeoutRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showMenu]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Copy text to system clipboard
  const handleCopyText = useCallback(async () => {
    if (!message.text_content) return;

    try {
      await navigator.clipboard.writeText(message.text_content);
      setCopied(true);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }

    setShowMenu(false);
  }, [message.text_content]);

  // Reply handler
  const handleReply = useCallback(() => {
    onReply?.(message);
    setShowMenu(false);
  }, [message, onReply]);

  // Delete handler
  const handleDelete = useCallback(() => {
    if (confirm("Delete this message?")) {
      onDelete?.(message);
    }
    setShowMenu(false);
  }, [message, onDelete]);

  // Forward handler
  const handleForward = useCallback(() => {
    onForward?.(message);
    setShowMenu(false);
  }, [message, onForward]);

  return (
    <div
      ref={menuRef}
      className={`relative inline-flex items-center gap-0.5 ${className}`}
    >
      {/* Quick Actions (always visible on hover) */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Reply */}
        {onReply && (
          <button
            onClick={handleReply}
            className="w-7 h-7 flex items-center justify-center rounded-full
                       text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title="Reply"
          >
            <ArrowUturnLeftIcon className="w-4 h-4" />
          </button>
        )}

        {/* Copy Text */}
        {message.text_content && (
          <button
            onClick={handleCopyText}
            className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors
                       ${copied
                         ? "bg-emerald-100 text-emerald-600"
                         : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                       }`}
            title={copied ? "Copied!" : "Copy text"}
          >
            <ClipboardIcon className="w-4 h-4" />
          </button>
        )}

        {/* Save to Clipboard Library */}
        <SaveToClipboardButton message={message} variant="icon" />
      </div>

      {/* More Menu Toggle */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-7 h-7 flex items-center justify-center rounded-full
                   text-gray-400 hover:bg-gray-100 hover:text-gray-600 
                   opacity-0 group-hover:opacity-100 transition-all"
        title="More actions"
      >
        <EllipsisHorizontalIcon className="w-4 h-4" />
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div
          className={`absolute z-50 min-w-[180px] py-1 bg-white rounded-xl shadow-xl
                     border border-gray-200 animate-scaleIn
                     ${isOutbound ? "right-0" : "left-0"} top-full mt-1`}
        >
          {/* Reply */}
          {onReply && (
            <button
              onClick={handleReply}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700
                         hover:bg-gray-100 transition-colors"
            >
              <ArrowUturnLeftIcon className="w-4 h-4" />
              Reply
            </button>
          )}

          {/* Copy */}
          {message.text_content && (
            <button
              onClick={handleCopyText}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700
                         hover:bg-gray-100 transition-colors"
            >
              <ClipboardIcon className="w-4 h-4" />
              {copied ? "Copied!" : "Copy Text"}
            </button>
          )}

          {/* Save to Clipboard */}
          <SaveToClipboardButton message={message} variant="menu-item" />

          {/* Forward */}
          {onForward && (
            <button
              onClick={handleForward}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700
                         hover:bg-gray-100 transition-colors"
            >
              <ShareIcon className="w-4 h-4" />
              Forward
            </button>
          )}

          {/* Divider */}
          {isOutbound && onDelete && (
            <div className="my-1 border-t border-gray-100" />
          )}

          {/* Delete (only for outbound messages) */}
          {isOutbound && onDelete && (
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600
                         hover:bg-red-50 transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.15s ease-out;
        }
      `}</style>
    </div>
  );
});

MessageActions.displayName = "MessageActions";

export default MessageActions;


// ═══════════════════════════════════════════════════════════════════════════════
// USAGE IN MESSAGE BUBBLE
// ═══════════════════════════════════════════════════════════════════════════════
//
// <div className="group relative">
//   {/* Message Content */}
//   <div className="bg-green-200 p-3 rounded-lg">
//     {msg.text_content}
//   </div>
//
//   {/* Actions - show on hover */}
//   <div className="absolute -top-1 right-0 translate-x-full">
//     <MessageActions
//       message={msg}
//       isOutbound={msg.direction === "OUTBOUND"}
//       onReply={handleReply}
//       onDelete={handleDelete}
//     />
//   </div>
// </div>