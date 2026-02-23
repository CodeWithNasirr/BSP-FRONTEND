// ═══════════════════════════════════════════════════════════════════════════════
// src/components/Chat/ForwardModal.jsx
// WhatsApp-style forward modal — supports single or MULTI-message forwarding
//
// FEATURES:
// ✅ Forward single message (from action menu)
// ✅ Forward MULTIPLE selected messages (from select mode)
// ✅ Forward text, images, video, audio, documents
// ✅ Media blob fetched once → re-uploaded per recipient via FormData
// ✅ Rich preview: image thumbnails, media type icons, multi-message summary
// ✅ Searchable conversation list (name or phone)
// ✅ Multi-select recipients with checkboxes
// ✅ Expired conversations blocked
// ✅ Detailed progress: "Sending 3/7 messages to Ahmed..."
// ✅ Keyboard Escape to close
//
// PROPS:
//   show              — boolean
//   onClose           — () => void
//   messages          — Array of message objects to forward (1 or many)
//   token             — auth token
//   currentRecipient  — exclude from recipient list
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";
import { toast } from "react-toastify";

// ═══════════════════════════════════════════════════════════════════════════════
// STATIC HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const MEDIA_LABELS = {
  image: { icon: "📷", label: "Photo" },
  video: { icon: "🎥", label: "Video" },
  audio: { icon: "🎵", label: "Voice message" },
  document: { icon: "📄", label: "Document" },
};

const getMediaMimeType = (mediaType, mediaUrl) => {
  const ext = mediaUrl?.split(".")?.pop()?.split("?")[0]?.toLowerCase();
  switch (mediaType) {
    case "image":
      if (ext === "png") return "image/png";
      if (ext === "webp") return "image/webp";
      if (ext === "gif") return "image/gif";
      return "image/jpeg";
    case "video":
      if (ext === "mov") return "video/quicktime";
      if (ext === "avi") return "video/x-msvideo";
      return "video/mp4";
    case "audio":
      if (ext === "ogg") return "audio/ogg";
      if (ext === "mp3" || ext === "mpeg") return "audio/mpeg";
      if (ext === "m4a") return "audio/mp4";
      return "audio/webm";
    case "document":
      if (ext === "pdf") return "application/pdf";
      if (ext === "docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      if (ext === "doc") return "application/msword";
      if (ext === "xlsx") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      return "application/octet-stream";
    default:
      return "application/octet-stream";
  }
};

const getFileExtension = (mediaType, mimeType) => {
  if (mediaType === "image") {
    if (mimeType.includes("png")) return "png";
    if (mimeType.includes("webp")) return "webp";
    if (mimeType.includes("gif")) return "gif";
    return "jpg";
  }
  if (mediaType === "video") return mimeType.includes("quicktime") ? "mov" : "mp4";
  if (mediaType === "audio") {
    if (mimeType.includes("ogg")) return "ogg";
    if (mimeType.includes("mpeg")) return "mp3";
    if (mimeType.includes("mp4")) return "m4a";
    return "webm";
  }
  if (mediaType === "document") {
    if (mimeType.includes("pdf")) return "pdf";
    if (mimeType.includes("wordprocessingml") || mimeType.includes("msword")) return "docx";
    if (mimeType.includes("spreadsheetml") || mimeType.includes("ms-excel")) return "xlsx";
    return "bin";
  }
  return "bin";
};

// ═══════════════════════════════════════════════════════════════════════════════
// MULTI-MESSAGE PREVIEW — shows summary of all selected messages
// ═══════════════════════════════════════════════════════════════════════════════

const MessagesPreview = memo(({ messages }) => {
  if (!messages || messages.length === 0) return null;

  // Single message → detailed preview
  if (messages.length === 1) {
    const msg = messages[0];
    const hasMedia = !!msg.media_url;
    const info = MEDIA_LABELS[msg.media_type] || { icon: "📎", label: "Media" };

    if (hasMedia && msg.media_type === "image") {
      return (
        <div className="flex items-center gap-2.5">
          <img src={msg.media_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-200" onError={(e) => { e.target.style.display = "none"; }} />
          <span className="text-sm text-gray-600 truncate">
            {info.icon} {info.label}
            {msg.text_content ? ` · "${msg.text_content.substring(0, 40)}…"` : ""}
          </span>
        </div>
      );
    }
    if (hasMedia) {
      return (
        <span className="text-sm text-gray-600 truncate">
          {info.icon} {info.label}
          {msg.text_content ? ` · "${msg.text_content.substring(0, 50)}…"` : ""}
          {msg.media_type === "audio" && msg.voice_duration ? ` · ${Math.floor(msg.voice_duration / 60)}:${String(Math.round(msg.voice_duration % 60)).padStart(2, "0")}` : ""}
        </span>
      );
    }
    return (
      <p className="text-sm text-gray-600 line-clamp-2">
        {msg.text_content?.length > 100 ? msg.text_content.substring(0, 100) + "…" : msg.text_content}
      </p>
    );
  }

  // Multiple messages → summary with type breakdown
  const counts = { text: 0, image: 0, video: 0, audio: 0, document: 0 };
  messages.forEach((msg) => {
    if (msg.media_url && msg.media_type) counts[msg.media_type] = (counts[msg.media_type] || 0) + 1;
    else counts.text++;
  });

  const parts = [];
  if (counts.text > 0) parts.push(`${counts.text} text`);
  if (counts.image > 0) parts.push(`📷 ${counts.image} photo${counts.image > 1 ? "s" : ""}`);
  if (counts.video > 0) parts.push(`🎥 ${counts.video} video${counts.video > 1 ? "s" : ""}`);
  if (counts.audio > 0) parts.push(`🎵 ${counts.audio} voice`);
  if (counts.document > 0) parts.push(`📄 ${counts.document} doc${counts.document > 1 ? "s" : ""}`);

  // Show image thumbnails if any (max 4)
  const imageMessages = messages.filter((m) => m.media_type === "image" && m.media_url);

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">{messages.length} messages</span>
        <span className="text-xs text-gray-400">·</span>
        <span className="text-xs text-gray-500">{parts.join(", ")}</span>
      </div>
      {imageMessages.length > 0 && (
        <div className="flex gap-1.5 mt-2">
          {imageMessages.slice(0, 4).map((msg, i) => (
            <img key={msg.id || i} src={msg.media_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-200" onError={(e) => { e.target.style.display = "none"; }} />
          ))}
          {imageMessages.length > 4 && (
            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-500 font-medium">
              +{imageMessages.length - 4}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
MessagesPreview.displayName = "MessagesPreview";

// ═══════════════════════════════════════════════════════════════════════════════
// RECIPIENT ITEM
// ═══════════════════════════════════════════════════════════════════════════════

const RecipientItem = memo(({ conv, isSelected, isExpired, onToggle }) => (
  <button
    onClick={() => !isExpired && onToggle(conv.recipient)}
    disabled={isExpired}
    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left
      ${isExpired ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 active:bg-gray-100 cursor-pointer"}
      ${isSelected ? "bg-emerald-50" : ""}`}
  >
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
      ${isSelected ? "bg-emerald-500 border-emerald-500" : "border-gray-300"}
      ${isExpired ? "opacity-40" : ""}`}>
      {isSelected && (
        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
      {(conv.user_name || "U")[0].toUpperCase()}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900 truncate">{conv.user_name || conv.recipient}</span>
        {isExpired && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded-full flex-shrink-0">
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
// FORWARD MODAL — accepts `messages` array (1 or many)
// ═══════════════════════════════════════════════════════════════════════════════

const ForwardModal = ({ show, onClose, messages = [], token, currentRecipient }) => {
  const [conversations, setConversations] = useState([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState(new Set());
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState({ sentMessages: 0, totalMessages: 0, sentRecipients: 0, totalRecipients: 0, currentName: "" });
  const searchInputRef = useRef(null);
  const modalRef = useRef(null);

  // ── Fetch conversations when modal opens ──
  useEffect(() => {
    if (!show || !token) return;
    const fetchConversations = async () => {
      setIsLoadingConversations(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/chats/?page_size=50`, {
          headers: { Authorization: `Token ${token}` },
        });
        setConversations(res.data.results || []);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
        toast.error("Failed to load conversations");
      } finally {
        setIsLoadingConversations(false);
      }
    };
    fetchConversations();
    setSelectedRecipients(new Set());
    setSearchQuery("");
    setSendProgress({ sentMessages: 0, totalMessages: 0, sentRecipients: 0, totalRecipients: 0, currentName: "" });
    setTimeout(() => searchInputRef.current?.focus(), 200);
  }, [show, token]);

  // ── Keyboard ──
  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e) => { if (e.key === "Escape" && !isSending) onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [show, onClose, isSending]);

  const handleBackdropClick = useCallback((e) => {
    if (modalRef.current && !modalRef.current.contains(e.target) && !isSending) onClose();
  }, [onClose, isSending]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => (c.user_name || "").toLowerCase().includes(q) || (c.recipient || "").includes(q));
  }, [conversations, searchQuery]);

  const toggleRecipient = useCallback((recipient) => {
    setSelectedRecipients((prev) => {
      const next = new Set(prev);
      if (next.has(recipient)) next.delete(recipient);
      else next.add(recipient);
      return next;
    });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // FETCH MEDIA BLOB
  // ═══════════════════════════════════════════════════════════════════════════

  // const fetchMediaAsFile = useCallback(async (mediaUrl, mediaType) => {
  //   try {
  //     const response = await fetch(mediaUrl);
  //     if (!response.ok) throw new Error(`HTTP ${response.status}`);
  //     const blob = await response.blob();
  //     const contentType = blob.type || getMediaMimeType(mediaType, mediaUrl);
  //     const extension = getFileExtension(mediaType, contentType);
  //     const fileName = `forwarded_${mediaType}_${Date.now()}.${extension}`;
  //     return new File([blob], fileName, { type: contentType });
  //   } catch (err) {
  //     console.error("Failed to fetch media:", err);
  //     return null;
  //   }
  // }, []);

  const fetchMediaAsFile = useCallback(async (mediaUrl, mediaType) => {
    try {
      // 🔥 FORCE HTTPS (VERY IMPORTANT)
      const safeUrl = mediaUrl.replace(/^http:\/\//i, "https://");

      const response = await axios.get(safeUrl, {
        responseType: "blob",
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      const blob = response.data;
      const contentType = blob.type || getMediaMimeType(mediaType, safeUrl);
      const extension = getFileExtension(mediaType, contentType);

      const fileName = `forwarded_${mediaType}_${Date.now()}.${extension}`;

      return new File([blob], fileName, { type: contentType });

    } catch (err) {
      console.error("Failed to fetch media:", err);
      return null;
    }
  }, [token]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SEND A SINGLE MESSAGE TO A SINGLE RECIPIENT
  // ═══════════════════════════════════════════════════════════════════════════

  const sendOneMessage = useCallback(async (msg, recipientPhone, mediaFileCache) => {
    const isMedia = !!msg.media_url;

    if (isMedia) {
      // Check cache first, fetch if not cached
      const cacheKey = msg.media_url;
      if (!mediaFileCache.has(cacheKey)) {
        const file = await fetchMediaAsFile(msg.media_url, msg.media_type);
        if (!file) throw new Error("Media download failed");
        mediaFileCache.set(cacheKey, file);
      }
      const mediaFile = mediaFileCache.get(cacheKey);

      const formData = new FormData();
      formData.append("recipient", recipientPhone);
      formData.append("message_text", msg.text_content || "");
      formData.append("url", mediaFile, mediaFile.name);
      if (msg.media_type === "audio" && msg.voice_duration) {
        formData.append("voice_duration", msg.voice_duration);
      }

      await axios.post(`${API_BASE_URL}/api/whatsapp/send-message/`, formData, {
        headers: { Authorization: `Token ${token}`, "Content-Type": "multipart/form-data" },
      });
    } else {
      await axios.post(`${API_BASE_URL}/api/whatsapp/send-message/`, {
        recipient: recipientPhone,
        message_text: msg.text_content || "",
        url: "",
      }, {
        headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
      });
    }
  }, [token, fetchMediaAsFile]);

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH FORWARD HANDLER
  //
  // For each recipient:
  //   → Send all selected messages in chronological order
  //   → Media blobs are cached (fetched once, reused for all recipients)
  //
  // Progress: shows per-recipient + per-message counts
  // ═══════════════════════════════════════════════════════════════════════════

  const handleForward = useCallback(async () => {
    if (selectedRecipients.size === 0 || messages.length === 0) return;

    const recipients = Array.from(selectedRecipients);
    // Sort messages chronologically for consistent order
    const sortedMessages = [...messages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const totalMessages = sortedMessages.length * recipients.length;

    setIsSending(true);
    setSendProgress({ sentMessages: 0, totalMessages, sentRecipients: 0, totalRecipients: recipients.length, currentName: "" });

    // Cache media blobs so we don't re-download for each recipient
    const mediaFileCache = new Map();
    let successCount = 0;
    let failCount = 0;
    let sentSoFar = 0;

    // Pre-download all unique media files
    const uniqueMediaUrls = new Set();
    sortedMessages.forEach((msg) => { if (msg.media_url) uniqueMediaUrls.add(msg.media_url); });

    if (uniqueMediaUrls.size > 0) {
      setSendProgress((p) => ({ ...p, currentName: `Downloading ${uniqueMediaUrls.size} media file${uniqueMediaUrls.size > 1 ? "s" : ""}...` }));
      for (const url of uniqueMediaUrls) {
        const msg = sortedMessages.find((m) => m.media_url === url);
        const file = await fetchMediaAsFile(url, msg.media_type);
        if (file) mediaFileCache.set(url, file);
      }
    }

    // Send to each recipient
    for (let r = 0; r < recipients.length; r++) {
      const recipientPhone = recipients[r];
      const recipientConv = conversations.find((c) => c.recipient === recipientPhone);
      const recipientName = recipientConv?.user_name || recipientPhone;

      let recipientFailed = false;

      for (let m = 0; m < sortedMessages.length; m++) {
        const msg = sortedMessages[m];
        sentSoFar++;

        setSendProgress({
          sentMessages: sentSoFar - 1,
          totalMessages,
          sentRecipients: r,
          totalRecipients: recipients.length,
          currentName: recipientName,
        });

        try {
          await sendOneMessage(msg, recipientPhone, mediaFileCache);
        } catch (err) {
          console.error(`Forward msg ${m + 1} to ${recipientPhone} failed:`, err);
          recipientFailed = true;
        }
      }

      if (recipientFailed) failCount++;
      else successCount++;

      setSendProgress({
        sentMessages: sentSoFar,
        totalMessages,
        sentRecipients: r + 1,
        totalRecipients: recipients.length,
        currentName: "",
      });
    }

    setIsSending(false);

    // Toast
    const msgCount = sortedMessages.length;
    const msgLabel = msgCount === 1 ? "Message" : `${msgCount} messages`;
    if (failCount === 0) {
      toast.success(
        successCount === 1
          ? `${msgLabel} forwarded`
          : `${msgLabel} forwarded to ${successCount} chats`
      );
    } else {
      toast.warning(`Forwarded to ${successCount}, failed ${failCount}`);
    }

    onClose();
  }, [selectedRecipients, messages, token, onClose, sendOneMessage, fetchMediaAsFile, conversations]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  if (!show || messages.length === 0) return null;

  const progressPercent = sendProgress.totalMessages > 0
    ? (sendProgress.sentMessages / sendProgress.totalMessages) * 100
    : 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50" onClick={handleBackdropClick}>
      <div ref={modalRef} className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] sm:max-h-[70vh] flex flex-col animate-slideUp overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button onClick={() => !isSending && onClose()} disabled={isSending} className="p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-base font-semibold text-gray-900">
              Forward {messages.length > 1 ? `${messages.length} messages` : "message"}
            </h3>
          </div>
          {selectedRecipients.size > 0 && (
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              {selectedRecipients.size} selected
            </span>
          )}
        </div>

        {/* ── Messages Preview ── */}
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
            </svg>
            <div className="flex-1 min-w-0">
              <MessagesPreview messages={messages} />
            </div>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              ref={searchInputRef} type="text" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or number..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 border-0 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              disabled={isSending}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-200">
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
              <p className="text-sm">{searchQuery ? "No conversations found" : "No conversations available"}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredConversations.map((conv) => {
                if (conv.recipient === currentRecipient) return null;
                return (
                  <RecipientItem key={conv.recipient} conv={conv}
                    isSelected={selectedRecipients.has(conv.recipient)}
                    isExpired={conv.is_expired} onToggle={toggleRecipient}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-gray-200 px-4 py-3 bg-white">
          {isSending && (
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span className="truncate mr-2">
                  {sendProgress.currentName
                    ? `Sending to ${sendProgress.currentName}...`
                    : "Preparing..."}
                </span>
                <span className="flex-shrink-0">
                  {sendProgress.sentRecipients}/{sendProgress.totalRecipients} chats
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          )}

          <button onClick={handleForward} disabled={selectedRecipients.size === 0 || isSending}
            className="w-full py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Forwarding {messages.length} message{messages.length > 1 ? "s" : ""}...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
                </svg>
                {selectedRecipients.size === 0
                  ? "Select recipients"
                  : `Forward ${messages.length > 1 ? `${messages.length} messages` : "message"} to ${selectedRecipients.size} chat${selectedRecipients.size > 1 ? "s" : ""}`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForwardModal;