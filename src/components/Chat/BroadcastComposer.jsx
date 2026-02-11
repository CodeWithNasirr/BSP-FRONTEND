// ═══════════════════════════════════════════════════════════════════════════════
// src/components/Chat/BroadcastComposer.jsx
// Modal for composing broadcast message to selected recipients
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

const BroadcastComposer = ({
  recipientCount,
  onSend,
  onCancel,
  isSending = false,
}) => {
  const [messageText, setMessageText] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [messageText]);

  const handleSend = useCallback(() => {
    if (!messageText.trim()) {
      toast.error("Please enter a message");
      return;
    }
    setShowConfirm(true);
  }, [messageText]);

  const handleConfirmSend = useCallback(async () => {
    setShowConfirm(false);
    const result = await onSend(messageText.trim());
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(
        `Broadcast queued for ${result?.total_queued || recipientCount} chats` +
          (result?.skipped_expired ? ` (${result.skipped_expired} expired skipped)` : "")
      );
    }
  }, [messageText, onSend, recipientCount]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
        onClick={onCancel}
      >
        {/* Modal */}
        <div
          className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Broadcast Message
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Sending to{" "}
                <span className="font-semibold text-emerald-600">
                  {recipientCount}
                </span>{" "}
                {recipientCount === 1 ? "chat" : "chats"}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Message Input */}
          <div className="p-5">
            <div className="bg-gray-50 rounded-xl p-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-200 transition-all">
              <textarea
                ref={textareaRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your broadcast message..."
                maxLength={4096}
                rows={3}
                className="w-full bg-transparent text-gray-900 placeholder-gray-400 resize-none 
                           focus:outline-none min-h-[80px] max-h-[200px] text-[15px] leading-relaxed"
                style={{ fontSize: "16px" }}
              />
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  {messageText.length}/4096
                </span>
                <span className="text-xs text-gray-400">
                  Shift+Enter for new line
                </span>
              </div>
            </div>

            {/* Info note */}
            <div className="flex items-start gap-2 mt-3 p-3 bg-amber-50 rounded-lg">
              <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs text-amber-700">
                Messages are sent individually via WhatsApp. Expired conversations
                will be automatically skipped. This is not a group message.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 px-5 pb-5">
            <button
              onClick={onCancel}
              disabled={isSending}
              className="flex-1 py-3 text-sm font-medium text-gray-700 bg-gray-100 
                         rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!messageText.trim() || isSending}
              className="flex-1 py-3 text-sm font-medium text-white bg-emerald-500 
                         rounded-xl hover:bg-emerald-600 transition-colors 
                         disabled:bg-gray-300 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                  Send to {recipientCount}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center px-4"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">
                Send broadcast?
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                Send this message to{" "}
                <span className="font-semibold text-emerald-600">
                  {recipientCount} {recipientCount === 1 ? "chat" : "chats"}
                </span>
                ?
              </p>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-3 mb-5 max-h-20 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {messageText.length > 150
                  ? messageText.substring(0, 150) + "..."
                  : messageText}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSend}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-emerald-500 rounded-xl hover:bg-emerald-600"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BroadcastComposer;