// ═══════════════════════════════════════════════════════════════════════════════
// src/components/Chat/SaveToClipboardButton.jsx — Message Action Button
// ═══════════════════════════════════════════════════════════════════════════════
//
// Usage: Add to message context menu or action buttons
// Shows a button to save message content to clipboard library
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import API_BASE_URL from "../../config";
import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";

/**
 * SaveToClipboardButton - Save a message to the clipboard library
 * 
 * @param {Object} props
 * @param {Object} props.message - The message object to save
 * @param {string} props.message.text_content - Text content of the message
 * @param {string} props.message.media_url - Media URL if exists
 * @param {string} props.message.media_type - Type of media (image/video/audio/document)
 * @param {string} props.variant - Button variant: "icon" | "button" | "menu-item"
 * @param {string} props.className - Additional CSS classes
 */
// ═══════════════════════════════════════════════════════════════════════════════
// src/components/Chat/SaveToClipboardButton.jsx — FIXED for Media
// ═══════════════════════════════════════════════════════════════════════════════


const SaveToClipboardButton = ({
  message,  // Can be named 'msg' from parent - handle both
  msg,      // Backward compatibility
  variant = "icon",
  className = "",
  onSuccess,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const token = localStorage.getItem("authToken");

  // Support both 'message' and 'msg' prop names
  const msgData = message || msg;

  const handleSave = useCallback(async (e) => {
    e?.stopPropagation();
    
    if (isSaving || isSaved || !msgData) return;

    // ✅ FIX: Check for EITHER text OR media content
    const hasText = msgData.text_content?.trim();
    const hasMedia = msgData.media_url || msgData.file_url;

    if (!hasText && !hasMedia) {
      toast.warning("No content to save");
      return;
    }

    setIsSaving(true);

    try {
      // ✅ FIX: Determine media type from message
      let mediaType = "text";
      if (msgData.media_type) {
        mediaType = msgData.media_type; // Already set (image, video, audio, document)
      } else if (msgData.message_type) {
        // Map WhatsApp message types
        const typeMap = {
          'IMAGE': 'image',
          'VIDEO': 'video',
          'AUDIO': 'audio',
          'DOCUMENT': 'document',
          'VOICE': 'audio',
          'STICKER': 'image',
        };
        mediaType = typeMap[msgData.message_type] || 'text';
      }

      const payload = {
        text_content: msgData.text_content || msgData.caption || "",
        media_url: msgData.media_url || msgData.file_url || "",
        media_type: hasMedia ? mediaType : "text",
        message_id: msgData.id || msgData.message_id,
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/clipboard/save-message/`,
        payload,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      if (response.data.success) {
        setIsSaved(true);
        toast.success("Saved to clipboard");
        onSuccess?.();
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save to clipboard:", error);
      toast.error(error.response?.data?.error || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }, [msgData, token, isSaving, isSaved, onSuccess]);

  // Don't render if no message data
  if (!msgData) return null;

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER VARIANTS
  // ═══════════════════════════════════════════════════════════════════════════

  if (variant === "icon") {
    return (
      <button
        onClick={handleSave}
        disabled={isSaving || isSaved}
        className={`w-7 h-7 flex items-center justify-center rounded-full
                   transition-all duration-200
                   ${isSaved
                     ? "bg-emerald-100 text-emerald-600"
                     : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                   }
                   disabled:opacity-50 ${className}`}
        title={isSaved ? "Saved to clipboard" : "Save to clipboard"}
      >
        {isSaving ? (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        ) : isSaved ? (
          <CheckIcon className="w-4 h-4" />
        ) : (
          <ClipboardDocumentIcon className="w-4 h-4" />
        )}
      </button>
    );
  }

  if (variant === "button") {
    return (
      <button
        onClick={handleSave}
        disabled={isSaving || isSaved}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                   rounded-lg transition-all duration-200
                   ${isSaved
                     ? "bg-emerald-100 text-emerald-700"
                     : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                   }
                   disabled:opacity-50 ${className}`}
      >
        {isSaving ? (
          <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        ) : isSaved ? (
          <CheckIcon className="w-3.5 h-3.5" />
        ) : (
          <ClipboardDocumentIcon className="w-3.5 h-3.5" />
        )}
        {isSaved ? "Saved" : "Save"}
      </button>
    );
  }

  if (variant === "menu-item") {
    return (
      <button
        onClick={handleSave}
        disabled={isSaving || isSaved}
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left
                   transition-colors hover:bg-gray-50 active:bg-gray-100
                   ${isSaved ? "text-emerald-600" : "text-gray-700"}
                   disabled:opacity-50 ${className}`}
      >
        {isSaving ? (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        ) : isSaved ? (
          <CheckIcon className="w-4 h-4" />
        ) : (
          <ClipboardDocumentIcon className="w-4 h-4 text-gray-500" />
        )}
        {isSaved ? "Saved!" : "Save to Clipboard"}
      </button>
    );
  }

  return null;
};

export default SaveToClipboardButton;


// ═══════════════════════════════════════════════════════════════════════════════
// USAGE EXAMPLES
// ═══════════════════════════════════════════════════════════════════════════════
//
// 1. Icon button (in message bubble):
//    <SaveToClipboardButton message={msg} variant="icon" />
//
// 2. Action button (in message action bar):
//    <SaveToClipboardButton message={msg} variant="button" />
//
// 3. Menu item (in dropdown menu):
//    <SaveToClipboardButton message={msg} variant="menu-item" />