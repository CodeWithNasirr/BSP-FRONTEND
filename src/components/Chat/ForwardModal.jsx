// ═══════════════════════════════════════════════════════════════════════════════
// src/components/Chat/ForwardModal.jsx
// WhatsApp-style forward message modal with searchable conversation picker
//
// FEATURES:
// ✅ Fetches conversation list from existing /api/chats/ endpoint
// ✅ Search by name or phone number (client-side filtering)
// ✅ Multi-select recipients with checkboxes
// ✅ Expired conversations shown but blocked from selection
// ✅ Message preview (text + media type indicator)
// ✅ Forward sends individual messages via existing send-message API
// ✅ Loading + progress feedback during send
// ✅ Keyboard shortcuts (Escape to close)
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";
import { toast } from "react-toastify";

// ═══════════════════════════════════════════════════════════════════════════════
// RECIPIENT ITEM — memo'd for performance with large lists
// ═══════════════════════════════════════════════════════════════════════════════

const RecipientItem = memo(({ conv, isSelected, isExpired, onToggle }) => (
  <button
    onClick={() => !isExpired && onToggle(conv.recipient)}
    disabled={isExpired}
    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left
      ${isExpired ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 active:bg-gray-100 cursor-pointer"}
      ${isSelected ? "bg-emerald-50" : ""}`}
  >
    {/* Checkbox */}
    <div
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
        ${isSelected ? "bg-emerald-500 border-emerald-500" : "border-gray-300"}
        ${isExpired ? "opacity-40" : ""}`}
    >
      {isSelected && (
        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>

    {/* Avatar */}
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
      {(conv.user_name || "U")[0].toUpperCase()}
    </div>

    {/* Name + phone */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900 truncate">
          {conv.user_name || conv.recipient}
        </span>
        {isExpired && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded-full flex-shrink-0">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Expired
          </span>
        )}
      </div>
      <span className="text-xs text-gray-500 truncate block">{conv.recipient}</span>
    </div>
  </button>
));
RecipientItem.displayName = "RecipientItem";

// ═══════════════════════════════════════════════════════════════════════════════
// FORWARD MODAL
// ═══════════════════════════════════════════════════════════════════════════════

const ForwardModal = ({ show, onClose, message, token, currentRecipient }) => {
  const [conversations, setConversations] = useState([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState(new Set());
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState({ sent: 0, total: 0 });
  const searchInputRef = useRef(null);
  const modalRef = useRef(null);

  // ── Fetch conversations when modal opens ──
  useEffect(() => {
    if (!show || !token) return;

    const fetchConversations = async () => {
      setIsLoadingConversations(true);
      try {
        // Fetch enough conversations for the picker (first 50)
        const res = await axios.get(`${API_BASE_URL}/api/chats/?page_size=50`, {
          headers: { Authorization: `Token ${token}` },
        });
        setConversations(res.data.results || []);
      } catch (err) {
        console.error("Failed to fetch conversations for forward:", err);
        toast.error("Failed to load conversations");
      } finally {
        setIsLoadingConversations(false);
      }
    };

    fetchConversations();
    setSelectedRecipients(new Set());
    setSearchQuery("");
    setSendProgress({ sent: 0, total: 0 });

    // Auto-focus search after a tick (modal animation)
    setTimeout(() => searchInputRef.current?.focus(), 200);
  }, [show, token]);

  // ── Keyboard: Escape to close ──
  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isSending) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [show, onClose, isSending]);

  // ── Close on backdrop click ──
  const handleBackdropClick = useCallback(
    (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target) && !isSending) {
        onClose();
      }
    },
    [onClose, isSending]
  );

  // ── Client-side search filter ──
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        (c.user_name || "").toLowerCase().includes(q) ||
        (c.recipient || "").includes(q)
    );
  }, [conversations, searchQuery]);

  // ── Toggle recipient selection ──
  const toggleRecipient = useCallback((recipient) => {
    setSelectedRecipients((prev) => {
      const next = new Set(prev);
      if (next.has(recipient)) {
        next.delete(recipient);
      } else {
        next.add(recipient);
      }
      return next;
    });
  }, []);

  // ── Build message preview text ──
  const messagePreview = useMemo(() => {
    if (!message) return "";
    if (message.text_content) {
      return message.text_content.length > 100
        ? message.text_content.substring(0, 100) + "…"
        : message.text_content;
    }
    if (message.media_type) {
      const typeLabels = {
        image: "📷 Photo",
        video: "🎥 Video",
        audio: "🎵 Voice message",
        document: "📄 Document",
      };
      return typeLabels[message.media_type] || "📎 Media";
    }
    return "Message";
  }, [message]);

  // ═══════════════════════════════════════════════════════════════════════════
  // FORWARD HANDLER — sends to each selected recipient sequentially
  // ═══════════════════════════════════════════════════════════════════════════

  const handleForward = useCallback(async () => {
    if (selectedRecipients.size === 0 || !message) return;

    const recipients = Array.from(selectedRecipients);
    setIsSending(true);
    setSendProgress({ sent: 0, total: recipients.length });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < recipients.length; i++) {
      const recipientPhone = recipients[i];
      try {
        // Forward text messages
        if (message.text_content && !message.media_url) {
          await axios.post(
            `${API_BASE_URL}/api/whatsapp/send-message/`,
            {
              recipient: recipientPhone,
              message_text: message.text_content,
              url: "",
            },
            {
              headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
        }
        // Forward media messages (with optional caption)
        else if (message.media_url) {
          // For media, we need to send the media URL
          // The backend will handle re-sending it via WhatsApp
          await axios.post(
            `${API_BASE_URL}/api/whatsapp/send-message/`,
            {
              recipient: recipientPhone,
              message_text: message.text_content || "",
              media_url: message.media_url,
              media_type: message.media_type,
              url: "",
            },
            {
              headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
        }

        successCount++;
      } catch (err) {
        console.error(`Forward to ${recipientPhone} failed:`, err);
        failCount++;
      }

      setSendProgress({ sent: i + 1, total: recipients.length });
    }

    setIsSending(false);

    // Show result
    if (failCount === 0) {
      toast.success(
        successCount === 1
          ? "Message forwarded"
          : `Message forwarded to ${successCount} chats`
      );
    } else {
      toast.warning(
        `Forwarded to ${successCount}, failed ${failCount}`
      );
    }

    onClose();
  }, [selectedRecipients, message, token, onClose]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl 
                   max-h-[85vh] sm:max-h-[70vh] flex flex-col animate-slideUp overflow-hidden"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => !isSending && onClose()}
              disabled={isSending}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-base font-semibold text-gray-900">Forward message</h3>
          </div>
          {selectedRecipients.size > 0 && (
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              {selectedRecipients.size} selected
            </span>
          )}
        </div>

        {/* ── Message Preview ── */}
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
            </svg>
            <p className="text-sm text-gray-600 line-clamp-2">{messagePreview}</p>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or number..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 border-0 rounded-lg 
                         placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              disabled={isSending}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-200"
              >
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── Conversation List ── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoadingConversations ? (
            <div className="flex flex-col gap-1 p-2 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-5 h-5 rounded-full bg-gray-200" />
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-3.5 bg-gray-200 rounded w-[60%] mb-1.5" />
                    <div className="h-3 bg-gray-200 rounded w-[40%]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <p className="text-sm">
                {searchQuery ? "No conversations found" : "No conversations available"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredConversations.map((conv) => {
                // Skip the current conversation (can't forward to yourself)
                if (conv.recipient === currentRecipient) return null;

                return (
                  <RecipientItem
                    key={conv.recipient}
                    conv={conv}
                    isSelected={selectedRecipients.has(conv.recipient)}
                    isExpired={conv.is_expired}
                    onToggle={toggleRecipient}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer: Send Button ── */}
        <div className="border-t border-gray-200 px-4 py-3 bg-white">
          {/* Send progress */}
          {isSending && (
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Forwarding...</span>
                <span>{sendProgress.sent}/{sendProgress.total}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${sendProgress.total > 0 ? (sendProgress.sent / sendProgress.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleForward}
            disabled={selectedRecipients.size === 0 || isSending}
            className="w-full py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl
                       hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 
                       disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Forwarding...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
                </svg>
                {selectedRecipients.size === 0
                  ? "Select recipients"
                  : selectedRecipients.size === 1
                    ? "Forward to 1 chat"
                    : `Forward to ${selectedRecipients.size} chats`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForwardModal;