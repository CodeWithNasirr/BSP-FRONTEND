// ═══════════════════════════════════════════════════════════════════════════════
// src/components/Chat/ReplyPreview.jsx
// Shows the reply context: (1) above input when composing, (2) inside sent messages
// ═══════════════════════════════════════════════════════════════════════════════

import React from "react";

/**
 * Reply preview bar shown above the chat input when replying to a message.
 * Props:
 * - replyTo: { message_id, preview_text, sender, direction }
 * - onCancel: () => void
 * - onScrollTo: (messageId) => void  (optional - clicking scrolls to original)
 */
export const ReplyInputPreview = ({ replyTo, onCancel, onScrollTo }) => {
  if (!replyTo) return null;

  return (
    <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 animate-slideUp">
      <div className="flex items-center gap-3">
        {/* Accent bar */}
        <div className="w-1 h-10 bg-emerald-500 rounded-full flex-shrink-0" />

        {/* Content */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onScrollTo?.(replyTo.message_id)}
        >
          <p className="text-xs font-semibold text-emerald-600 truncate">
            {replyTo.sender}
          </p>
          <p className="text-sm text-gray-600 truncate">
            {replyTo.preview_text}
          </p>
        </div>

        {/* Cancel */}
        <button
          onClick={onCancel}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center 
                     rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

/**
 * Reply bubble shown INSIDE a message bubble, indicating what it's replying to.
 * Props:
 * - replyToPreview: string
 * - replyToSender: string
 * - isOutbound: boolean
 * - onClick: () => void  (scroll to original message)
 */
export const ReplyBubble = ({ replyToPreview, replyToSender, isOutbound, onClick }) => {
  if (!replyToPreview) return null;

  return (
    <div
      onClick={onClick}
      className={`mb-2 px-3 py-2 rounded-lg cursor-pointer border-l-4 transition-colors
        ${isOutbound
          ? "bg-green-100 border-green-400 hover:bg-green-50"
          : "bg-gray-100 border-gray-400 hover:bg-gray-50"}`}
    >
      <p
        className={`text-xs font-semibold ${
          isOutbound ? "text-green-700" : "text-gray-700"
        }`}
      >
        {replyToSender || "Unknown"}
      </p>
      <p
        className={`text-xs mt-0.5 truncate ${
          isOutbound ? "text-green-600" : "text-gray-600"
        }`}
      >
        {replyToPreview}
      </p>
    </div>
  );
};

export default ReplyInputPreview;