import React, {
  useState, useRef, useEffect, useContext, useCallback, useMemo, memo,
} from "react";
import axios from "axios";
import API_BASE_URL from "../../config";
import RequireSubscription from "../Subscriptions/RequireSubscription";
import { Context } from "../context/Context";
import ChatInputArea from "./Chatinputarea";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import VoiceMessage from "./VoiceMessage";
import MessageActions from "./MessageActions";
import { ReplyBubble } from "./ReplyPreview";
import MarkPurchaseModal from "./MarkPurchaseModal";
import ForwardModal from "./ForwardModal";

// ═══════════════════════════════════════════════════════════════════════════════
// STATIC HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString())
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (date.toDateString() === yesterday.toDateString())
    return `Yesterday ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  return date.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const formatDateSeparator = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileCategory = (fileType) => {
  if (fileType?.startsWith("image/")) return "image";
  if (fileType?.startsWith("video/")) return "video";
  if (fileType?.startsWith("audio/")) return "audio";
  if (fileType?.includes("pdf") || fileType?.includes("document") || fileType?.includes("word") || fileType?.includes("excel")) return "document";
  return "file";
};

const getRemainingTime = (sendAt) => {
  const now = new Date();
  const target = new Date(sendAt);
  const diffMs = target - now;
  if (diffMs <= 0) return "sending now";
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `in ${days}d ${hours}h`;
  if (hours > 0) return `in ${hours}h ${minutes}m`;
  return `in ${minutes}m`;
};

const getAllowedFileTypesForPlan = (plan) => {
  switch (plan?.toUpperCase()) {
    case "BASIC":
      return { types: ["image/jpeg", "image/png"], accept: "image/jpeg,image/png", maxSize: 5 * 1024 * 1024, description: "Images (JPEG, PNG)", allowVoice: true };
    case "GROWTH":
      return { types: ["image/jpeg", "image/png", "video/mp4", "video/avi", "video/mov", "audio/webm", "audio/ogg", "audio/mpeg", "audio/mp4", "audio/x-m4a", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"], accept: "image/jpeg,image/png,video/*,audio/*,application/pdf,.doc,.docx,.m4a", maxSize: 5 * 1024 * 1024, description: "Images, Videos, Audio, Documents", allowVoice: true };
    case "BUSINESS PRO":
      return { types: ["image/jpeg", "image/png", "video/mp4", "video/avi", "video/mov", "audio/webm", "audio/ogg", "audio/mpeg", "audio/mp4", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"], accept: "image/*,video/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx", maxSize: 16 * 1024 * 1024, description: "All media types", allowVoice: true };
    default:
      return { types: [], accept: "", maxSize: 0, description: "No file uploads allowed", allowVoice: true };
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ChatImage
// ═══════════════════════════════════════════════════════════════════════════════

const ChatImage = memo(({ src, alt }) => {
  const [error, setError] = useState(false);
  if (error) return <div className="text-sm text-red-500 dark:text-red-400 italic mt-2">Image not loaded</div>;
  return <img src={src} alt={alt} className="max-w-full h-auto rounded-xl max-h-40 md:max-h-60 object-contain" loading="lazy" onError={() => setError(true)} />;
});
ChatImage.displayName = "ChatImage";

// ═══════════════════════════════════════════════════════════════════════════════
// Loading skeleton
// ═══════════════════════════════════════════════════════════════════════════════

const MessageSkeleton = () => (
  <div className="flex flex-col gap-4 p-4 animate-pulse">
    {[false, true, false, true, false, true].map((right, i) => (
      <div key={i} className={`flex ${right ? "justify-end" : "justify-start"}`}>
        <div className={`${right ? "bg-green-100 dark:bg-green-500/10" : "bg-gray-200 dark:bg-white/10"} rounded-xl p-4 w-3/4 max-w-[300px]`}>
          <div className={`h-3 ${right ? "bg-green-200 dark:bg-green-500/20" : "bg-gray-300 dark:bg-white/10"} rounded-lg w-3/4 mb-2`} />
          <div className={`h-3 ${right ? "bg-green-200 dark:bg-green-500/20" : "bg-gray-300 dark:bg-white/10"} rounded-lg w-1/2`} />
        </div>
      </div>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MediaContent
// ═══════════════════════════════════════════════════════════════════════════════

const MediaContent = memo(({ msg, isOutbound, plan }) => {
  if (!msg.media_url) return null;
  if (plan === "BASIC" && msg.media_type !== "image")
    return <div className="mb-2 p-3 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5"><span className="text-sm text-gray-600 dark:text-gray-400">Media content (Upgrade to view)</span></div>;
  if (msg.media_type === "image")
    return <div className="mb-2"><ChatImage src={msg.media_url} alt={isOutbound ? "Sent media" : "Received media"} /></div>;
  if (msg.media_type === "audio")
    return <div className="mb-2"><VoiceMessage src={msg.media_url} duration={msg.voice_duration} isOutbound={isOutbound} timestamp={msg.timestamp} status={msg.status} /></div>;
  if (msg.media_type === "video")
    return <div className="mb-2"><video src={msg.media_url} controls className="max-w-full h-auto rounded-xl max-h-40 md:max-h-60" /></div>;
  if (msg.media_type === "document")
    return (
      <div className="mb-2 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2">
          <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
          <div><div className="text-sm font-medium text-gray-900 dark:text-gray-100">Document</div><a href={msg.media_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Click to view</a></div>
        </div>
      </div>
    );
  return null;
});
MediaContent.displayName = "MediaContent";

// ═══════════════════════════════════════════════════════════════════════════════
// InteractiveButtons
// ═══════════════════════════════════════════════════════════════════════════════

const InteractiveButtons = memo(({ buttons, buttonText }) => {
  if (!buttons || buttons.length === 0) return null;
  const isReadOnly = !!buttonText;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {buttons.map((btn, index) => (
        <button key={btn.id || index} disabled={isReadOnly}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors duration-200 shadow-sm ${isReadOnly ? "bg-gray-300 dark:bg-white/10 text-gray-600 dark:text-gray-400 cursor-not-allowed" : "bg-blue-500 dark:bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-400 text-white"}`}>
          {btn.title || btn.text || "Button"}
        </button>
      ))}
    </div>
  );
});
InteractiveButtons.displayName = "InteractiveButtons";

// ═══════════════════════════════════════════════════════════════════════════════
// SELECTION CHECKBOX
// ═══════════════════════════════════════════════════════════════════════════════

const SelectionCheckbox = memo(({ isSelected }) => (
  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
    ${isSelected ? "bg-blue-500 border-blue-500 scale-110" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111827]"}`}>
    {isSelected && (
      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    )}
  </div>
));
SelectionCheckbox.displayName = "SelectionCheckbox";

// ═══════════════════════════════════════════════════════════════════════════════
// SVG TAIL COMPONENTS — Fixed with explicit fill colors
// ═══════════════════════════════════════════════════════════════════════════════

const OutboundTail = memo(() => (
  <div className="flex items-end flex-shrink-0">
    <svg height="13" width="8" viewBox="0 0 8 13" className="block">
      <path
        d="M6.3,10.4C1.5,8.7,0.9,5.5,0,0.2L0,13l5.2,0C7,13,9.6,11.5,6.3,10.4z"
        className="fill-green-200 dark:fill-green-200"
      />
    </svg>
  </div>
));
OutboundTail.displayName = "OutboundTail";

const InboundTail = memo(() => (
  <div className="flex items-end flex-shrink-0">
    <svg height="13" width="8" viewBox="0 0 8 13" className="block">
      <path
        d="M2.8,13L8,13L8,0.2C7.1,5.5,6.5,8.7,1.7,10.4C-1.6,11.5,1,13,2.8,13z"
        className="fill-white dark:fill-[#1e293b]"
      />
    </svg>
  </div>
));
InboundTail.displayName = "InboundTail";

// ═══════════════════════════════════════════════════════════════════════════════
// MessageBubble — Fixed SVG tails + transparent background support
// ═══════════════════════════════════════════════════════════════════════════════

const MessageBubble = memo(({
  msg, isOutbound, isMenuOpen, plan,
  onOpenMenu, onCopy, onReply, onForward, onCloseMenu, onScrollToReply,
  isSelectMode, isSelected, onToggleSelect,
}) => {
  const msgId = msg.message_id || msg.id;
  const longPressRef = useRef(null);

  const handleTouchStart = useCallback(() => {
    if (isSelectMode) return;
    longPressRef.current = setTimeout(() => onOpenMenu(msgId), 500);
  }, [msgId, onOpenMenu, isSelectMode]);

  const handleTouchEnd = useCallback(() => {
    if (longPressRef.current) clearTimeout(longPressRef.current);
  }, []);

  const handleClick = useCallback((e) => {
    if (isSelectMode) {
      e.stopPropagation();
      onToggleSelect(msgId);
    }
  }, [isSelectMode, onToggleSelect, msgId]);

  const selectedBorder = isSelected ? "ring-2 ring-blue-400 dark:ring-blue-500 ring-offset-1 dark:ring-offset-[#0b1120]" : "";
  const selectCursor = isSelectMode ? "cursor-pointer" : "";

  // ── OUTBOUND ──
  if (isOutbound) {
    return (
      <div className={`flex justify-end mb-3 items-end gap-0 ${selectCursor}`} onClick={handleClick}>
        {isSelectMode && (
          <div className="mr-2 mb-1">
            <SelectionCheckbox isSelected={isSelected} />
          </div>
        )}

        <div
          className={`relative bg-green-200 dark:bg-[#144D37] p-3 rounded-l-xl rounded-tr-xl max-w-[85%] md:max-w-[420px] group transition-all duration-200 ${selectedBorder}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          {!isSelectMode && !isMenuOpen && (
            <button onClick={(e) => { e.stopPropagation(); onOpenMenu(msgId); }}
              className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-white dark:bg-[#111827] shadow-md items-center justify-center text-gray-400 hover:text-gray-600 hidden group-hover:flex z-10">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          )}
          {!isSelectMode && isMenuOpen && (
            <MessageActions msg={msg} onCopy={onCopy} onReply={onReply} onForward={onForward} onClose={onCloseMenu} isOutbound={true} />
          )}
          <ReplyBubble replyToPreview={msg.reply_to_preview} replyToSender={msg.reply_to_sender} isOutbound={true} onClick={() => !isSelectMode && onScrollToReply(msg.reply_to_message_id)} />
          {msg.header_text && <h1 className="font-semibold text-sm md:text-base text-gray-900 dark:text-gray-100">{msg.header_text}</h1>}
          <MediaContent msg={msg} isOutbound={true} plan={plan} />
          <span className="text-sm md:text-base break-words whitespace-pre-wrap text-gray-900 dark:text-gray-100">{msg.text_content}</span>
          <InteractiveButtons buttons={msg.buttons} buttonText={msg.button_text} />
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 flex justify-end">
            <span>{formatTimestamp(msg.timestamp)} · {msg.status}</span>
          </div>
        </div>
        {!isSelectMode && <OutboundTail />}
      </div>
    );
  }

  // ── INBOUND ──
  return (
    <div className={`flex justify-start mb-3 items-end gap-0 ${selectCursor}`} onClick={handleClick}>
      {isSelectMode && (
        <div className="mr-2 mb-1">
          <SelectionCheckbox isSelected={isSelected} />
        </div>
      )}

      {!isSelectMode && <InboundTail />}
      <div
        className={`relative bg-white dark:bg-[#1e293b] p-3 md:p-4 max-w-[75%] rounded-r-xl rounded-tl-xl shadow-sm dark:shadow-md dark:shadow-black/20 group transition-all duration-200 ${selectedBorder}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {!isSelectMode && !isMenuOpen && (
          <button onClick={(e) => { e.stopPropagation(); onOpenMenu(msgId); }}
            className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white dark:bg-[#111827] shadow-md items-center justify-center text-gray-400 hover:text-gray-600 flex z-10">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        )}
        {!isSelectMode && isMenuOpen && (
          <MessageActions msg={msg} onCopy={onCopy} onReply={onReply} onForward={onForward} onClose={onCloseMenu} isOutbound={false} />
        )}
        <ReplyBubble replyToPreview={msg.reply_to_preview} replyToSender={msg.reply_to_sender} isOutbound={false} onClick={() => !isSelectMode && onScrollToReply(msg.reply_to_message_id)} />
        <MediaContent msg={msg} isOutbound={false} plan={plan} />
        <span className="text-sm md:text-base break-all break-words whitespace-pre-wrap overflow-hidden text-gray-900 dark:text-gray-100">{msg.text_content}</span>
        <InteractiveButtons buttons={msg.buttons} buttonText={msg.button_text} />
        <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">{formatTimestamp(msg.timestamp)} · {msg.status}</div>
      </div>
    </div>
  );
}, (prev, next) => {
  return (
    prev.msg.id === next.msg.id &&
    prev.msg.status === next.msg.status &&
    prev.msg.text_content === next.msg.text_content &&
    prev.msg.media_url === next.msg.media_url &&
    prev.isMenuOpen === next.isMenuOpen &&
    prev.isSelectMode === next.isSelectMode &&
    prev.isSelected === next.isSelected
  );
});
MessageBubble.displayName = "MessageBubble";


// ═══════════════════════════════════════════════════════════════════════════════
// SELECTION TOOLBAR
// ═══════════════════════════════════════════════════════════════════════════════

const SelectionToolbar = memo(({ count, onForward, onCancel, onSelectAll, totalCount }) => (
  <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#111827] border-t border-gray-200 dark:border-white/5 shadow-lg dark:shadow-2xl px-4 py-3 flex items-center justify-between gap-3">
    <div className="flex items-center gap-3">
      <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" title="Cancel selection">
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
        {count} selected
      </span>
      {count < totalCount && (
        <button onClick={onSelectAll} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold">
          Select all
        </button>
      )}
    </div>

    <button
      onClick={onForward}
      disabled={count === 0}
      className="flex items-center gap-2 bg-emerald-500 dark:bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 active:scale-95"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
      </svg>
      Forward {count > 0 ? `(${count})` : ""}
    </button>
  </div>
));
SelectionToolbar.displayName = "SelectionToolbar";


// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — FIXED: Transparent background so whatsapp_bg shows through
// ═══════════════════════════════════════════════════════════════════════════════

const ChatWindow = ({ recipient }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const { subscriptionStatus } = useContext(Context);

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isConversationExpired, setIsConversationExpired] = useState(false);
  const [contactName, setContactName] = useState(recipient);

  const [replyTo, setReplyTo] = useState(null);
  const [activeMessageMenu, setActiveMessageMenu] = useState(null);
  const [forwardMessages, setForwardMessages] = useState([]);

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState(new Set());

  const [activeFlow, setActiveFlow] = useState(null);
  const [isFlowPaused, setIsFlowPaused] = useState(false);
  const [availableFlows, setAvailableFlows] = useState([]);
  const [selectedFlowId, setSelectedFlowId] = useState(null);
  const [selectedSessionId, setSessionFlowId] = useState(null);
  const [showFlowSelector, setShowFlowSelector] = useState(false);

  const [scheduledMessages, setScheduledMessages] = useState([]);
  const [, forceUpdate] = useState(0);

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({ full_name: "", amount: "", location: "", tags: [], tagInput: "" });

  const chatContainerRef = useRef(null);
  const socketRef = useRef(null);
  const isMountedRef = useRef(true);

  const allowedFiles = useMemo(() => getAllowedFileTypesForPlan(subscriptionStatus?.plan), [subscriptionStatus?.plan]);

  const isFileTypeAllowed = useCallback((file) => {
    if (allowedFiles.types.includes(file.type)) return true;
    if (file.type.startsWith("audio/") && allowedFiles.accept.includes("audio/*")) return true;
    return false;
  }, [allowedFiles]);

  const groupedMessages = useMemo(() => {
    const groups = {};
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const date = new Date(msg.timestamp).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    }
    return groups;
  }, [messages]);

  const sortedDates = useMemo(
    () => Object.keys(groupedMessages).sort((a, b) => new Date(a) - new Date(b)),
    [groupedMessages]
  );

  const plan = subscriptionStatus?.plan?.toUpperCase();

  // ═══════════════════════════════════════════════════════════════════════════
  // PARALLEL INITIAL LOAD
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!recipient || !token) return;
    isMountedRef.current = true;

    const loadCriticalData = async () => {
      setIsLoading(true);
      setMessages([]);
      setIsConversationExpired(false);
      setReplyTo(null);
      setForwardMessages([]);
      setActiveMessageMenu(null);
      setIsSelectMode(false);
      setSelectedMessageIds(new Set());
      setContactName(recipient);

      try {
        const [messagesRes, flowRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/api/chats/${recipient}/`, {
            headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
          }),
          axios.get(`${API_BASE_URL}/api/flows/status/?phone_number=${recipient}`, {
            headers: { Authorization: `Token ${token}` },
          }),
        ]);
        if (!isMountedRef.current) return;

        if (messagesRes.status === "fulfilled") {
          const data = messagesRes.value.data;
          const uniqueMessages = data.Data.reduce((acc, msg) => {
            if (!acc.some((m) => msg.message_id && m.message_id === msg.message_id)) acc.push(msg);
            return acc;
          }, []);
          if (uniqueMessages.length > 0 && uniqueMessages[0].user_name) setContactName(uniqueMessages[0].user_name);
          setMessages(uniqueMessages);
          setIsConversationExpired(data.expired);
        } else {
          toast.error("Failed to fetch messages");
        }
        if (flowRes.status === "fulfilled") {
          const { success, data } = flowRes.value.data;
          if (success && data) {
            setActiveFlow(data); setSelectedFlowId(data.flow || null); setSessionFlowId(data.id || null); setIsFlowPaused(data.is_paused || false);
          } else { setActiveFlow(null); setSelectedFlowId(null); setSessionFlowId(null); setIsFlowPaused(false); }
        }
      } catch (err) { console.error("Critical load error:", err); }
      finally { if (isMountedRef.current) setIsLoading(false); }
    };

    loadCriticalData();

    const deferTimer = setTimeout(async () => {
      try {
        const [scheduledRes, flowsRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/api/scheduled/${recipient}/`, { headers: { Authorization: `Token ${token}` } }),
          axios.get(`${API_BASE_URL}/api/flows/list/`, { headers: { Authorization: `Token ${token}` } }),
        ]);
        if (!isMountedRef.current) return;
        if (scheduledRes.status === "fulfilled") setScheduledMessages(scheduledRes.value.data || []);
        if (flowsRes.status === "fulfilled") setAvailableFlows(flowsRes.value.data.data || []);
      } catch (err) { console.error("Deferred load error:", err); }
    }, 100);

    return () => { isMountedRef.current = false; clearTimeout(deferTimer); };
  }, [recipient, token]);

  useEffect(() => {
    const interval = setInterval(() => forceUpdate((v) => v + 1), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const prevMessageCountRef = useRef(0);
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current && chatContainerRef.current) {
      requestAnimationFrame(() => {
        if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length]);

  // ═══════════════════════════════════════════════════════════════════════════
  // WEBSOCKET
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!recipient || !token) return;
    let reconnectTimer; let mounted = true;
    const connectWebSocket = () => {
      if (!mounted) return;
      const wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
      const backendHost = API_BASE_URL.replace("http://", "").replace("https://", "");
      const ws = new WebSocket(`${wsProtocol}${backendHost}/ws/chat/${recipient}/?token=${token}`);
      socketRef.current = ws;
      ws.onmessage = (e) => {
        if (!mounted) return;
        try {
          const data = JSON.parse(e.data);
          const msg = data.message;
          if (!msg) return;

          const updates = (msg.action === "batch_update" && msg.data?.batch)
            ? msg.data.batch
            : [{ action: msg.action, data: msg.data }];

          updates.forEach(({ action, data: payload }) => {
            if (action === "new_message") {
              setMessages((prev) => {
                if (prev.some((m) => m.message_id === payload.message_id)) return prev;
                if (payload.media_type === "audio") {
                  const index = prev.findIndex((m) => m.temp_id && m.media_type === "audio" && m.direction === "OUTBOUND");
                  if (index !== -1) { const updated = [...prev]; updated[index] = payload; return updated; }
                }
                const tempIndex = prev.findIndex((m) => m.temp_id);
                if (tempIndex !== -1) { const updated = [...prev]; updated[tempIndex] = payload; return updated; }
                return [...prev, payload];
              });
            }
            if (action === "update_status") {
              setMessages((prev) => prev.map((m) => m.message_id === payload.message_id ? { ...m, status: payload.status } : m));
            }
          });
        } catch (error) { console.error("WS parse error:", error); }
      };
      ws.onclose = () => { if (mounted) reconnectTimer = setTimeout(connectWebSocket, 3000); };
      ws.onerror = () => ws.close();
    };
    connectWebSocket();
    return () => { mounted = false; if (reconnectTimer) clearTimeout(reconnectTimer); if (socketRef.current) socketRef.current.close(); };
  }, [recipient, token]);

  // ═══════════════════════════════════════════════════════════════════════════
  // MESSAGE ACTION HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleCopyMessage = useCallback((msg) => {
    navigator.clipboard.writeText(msg.text_content || msg.media_url || "").then(() => {
      toast.success("Copied!", { autoClose: 1500, hideProgressBar: true });
    }).catch(() => toast.error("Failed to copy"));
    setActiveMessageMenu(null);
  }, []);

  const handleReplyMessage = useCallback((msg) => {
    setReplyTo({
      message_id: msg.message_id || msg.id,
      preview_text: (msg.text_content || (msg.media_type ? `[${msg.media_type}]` : "[Media]")).substring(0, 80),
      sender: msg.direction === "INBOUND" ? (msg.user_name || recipient) : "You",
      direction: msg.direction,
    });
    setActiveMessageMenu(null);
  }, [recipient]);

  const handleForwardMessage = useCallback((msg) => {
    setForwardMessages([msg]);
    setActiveMessageMenu(null);
  }, []);

  const cancelReply = useCallback(() => setReplyTo(null), []);

  const scrollToMessage = useCallback((messageId) => {
    if (!messageId || isSelectMode) return;
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("bg-yellow-100", "dark:bg-yellow-900/30");
      setTimeout(() => el.classList.remove("bg-yellow-100", "dark:bg-yellow-900/30"), 2000);
    }
  }, [isSelectMode]);

  const openMenu = useCallback((msgId) => setActiveMessageMenu(msgId), []);
  const closeMenu = useCallback(() => setActiveMessageMenu(null), []);

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTI-SELECT HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const enterSelectMode = useCallback(() => {
    setIsSelectMode(true);
    setSelectedMessageIds(new Set());
    setActiveMessageMenu(null);
    setReplyTo(null);
  }, []);

  const exitSelectMode = useCallback(() => {
    setIsSelectMode(false);
    setSelectedMessageIds(new Set());
  }, []);

  const toggleMessageSelect = useCallback((msgId) => {
    setSelectedMessageIds((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  }, []);

  const selectAllMessages = useCallback(() => {
    const allIds = new Set();
    messages.forEach((msg) => {
      const id = msg.message_id || msg.id;
      allIds.add(id);
    });
    setSelectedMessageIds(allIds);
  }, [messages]);

  const forwardSelectedMessages = useCallback(() => {
    if (selectedMessageIds.size === 0) return;
    const selectedMsgs = messages.filter((msg) => {
      const id = msg.message_id || msg.id;
      return selectedMessageIds.has(id);
    });
    selectedMsgs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    setForwardMessages(selectedMsgs);
  }, [selectedMessageIds, messages]);

  const handleForwardModalClose = useCallback(() => {
    setForwardMessages([]);
    if (isSelectMode) exitSelectMode();
  }, [isSelectMode, exitSelectMode]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SEND HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const fetchScheduledMessages = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/scheduled/${recipient}/`, { headers: { Authorization: `Token ${token}` } });
      if (isMountedRef.current) setScheduledMessages(res.data || []);
    } catch (err) { console.error("Failed to fetch scheduled messages", err); }
  }, [recipient, token]);

  const handleSendText = useCallback(async ({ message_text, buttons = [], scheduleAt = null }) => {
    if (!message_text.trim()) return;
    if (scheduleAt && subscriptionStatus?.plan === "BASIC") { toast.error("Scheduling is not available on the Basic plan"); return; }
    if (scheduleAt) {
      await axios.post(`${API_BASE_URL}/api/chat/schedule-message/`, { recipient, message_text, buttons, send_at: scheduleAt }, { headers: { Authorization: `Token ${token}` } });
      toast.success("Message scheduled"); await fetchScheduledMessages(); setReplyTo(null); return;
    }
    const tempId = "temp_" + Date.now();
    setMessages((prev) => [...prev, { id: tempId, temp_id: tempId, message_id: null, text_content: message_text, media_url: null, buttons, direction: "OUTBOUND", status: "sending", timestamp: new Date().toISOString(), reply_to_message_id: replyTo?.message_id || null, reply_to_preview: replyTo?.preview_text || null, reply_to_sender: replyTo?.sender || null }]);
    setIsSending(true); const currentReply = replyTo; setReplyTo(null);
    try {
      await axios.post(`${API_BASE_URL}/api/whatsapp/send-message/`, { recipient, message_text, buttons: buttons.length > 0 ? buttons : undefined, url: "", reply_to: currentReply ? { message_id: currentReply.message_id, preview_text: currentReply.preview_text, sender: currentReply.sender } : undefined }, { headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" } });
      setMessages((prev) => prev.map((m) => (m.temp_id === tempId ? { ...m, status: "sent" } : m)));
    } catch (error) {
      setMessages((prev) => prev.map((m) => (m.temp_id === tempId ? { ...m, status: "failed" } : m)));
      toast.error(error.response?.data?.error || "Failed to send message");
    } finally { setIsSending(false); }
  }, [recipient, token, replyTo, subscriptionStatus, fetchScheduledMessages]);

  const handleSendFile = useCallback(async ({ file, caption = "", scheduleAt = null }) => {
    if (!file) return;
    if (!isFileTypeAllowed(file)) { toast.error(`File type not allowed. Your ${subscriptionStatus?.plan || "current"} plan supports: ${allowedFiles.description}`); return; }
    if (file.size > allowedFiles.maxSize) { toast.error(`File too large. Maximum: ${formatFileSize(allowedFiles.maxSize)}`); return; }
    if (scheduleAt) {
      const formData = new FormData(); formData.append("recipient", recipient); formData.append("message_text", caption); formData.append("url", file); formData.append("send_at", scheduleAt);
      await axios.post(`${API_BASE_URL}/api/chat/schedule-message/`, formData, { headers: { Authorization: `Token ${token}` } });
      toast.success("File scheduled"); await fetchScheduledMessages(); return;
    }
    const tempId = "temp_" + Date.now();
    setMessages((prev) => [...prev, { id: tempId, temp_id: tempId, message_id: null, text_content: caption, media_url: URL.createObjectURL(file), media_type: getFileCategory(file.type), direction: "OUTBOUND", status: "sending", timestamp: new Date().toISOString() }]);
    setIsSending(true); setReplyTo(null);
    try {
      const formData = new FormData(); formData.append("recipient", recipient); formData.append("message_text", caption); formData.append("url", file);
      await axios.post(`${API_BASE_URL}/api/whatsapp/send-message/`, formData, { headers: { Authorization: `Token ${token}`, "Content-Type": "multipart/form-data" } });
      setMessages((prev) => prev.map((m) => (m.temp_id === tempId ? { ...m, status: "sent" } : m)));
    } catch (error) {
      setMessages((prev) => prev.map((m) => (m.temp_id === tempId ? { ...m, status: "failed" } : m)));
      toast.error(error.response?.data?.error || "Failed to send file");
    } finally { setIsSending(false); }
  }, [recipient, token, isFileTypeAllowed, allowedFiles, subscriptionStatus, fetchScheduledMessages]);

  const handleSendVoice = useCallback(async (audioFile, duration, scheduleAt = null) => {
    if (scheduleAt) {
      const formData = new FormData(); formData.append("recipient", recipient); formData.append("url", audioFile); formData.append("voice_duration", duration); formData.append("send_at", scheduleAt);
      await axios.post(`${API_BASE_URL}/api/chat/schedule-message/`, formData, { headers: { Authorization: `Token ${token}` } });
      toast.success("Voice message scheduled"); await fetchScheduledMessages(); return;
    }
    const tempId = "temp_" + Date.now();
    setMessages((prev) => [...prev, { id: tempId, temp_id: tempId, message_id: null, text_content: "", media_type: "audio", media_url: URL.createObjectURL(audioFile), voice_duration: duration, direction: "OUTBOUND", status: "sending", timestamp: new Date().toISOString() }]);
    try {
      const formData = new FormData(); formData.append("recipient", recipient); formData.append("message_text", ""); formData.append("url", audioFile);
      await axios.post(`${API_BASE_URL}/api/whatsapp/send-message/`, formData, { headers: { Authorization: `Token ${token}`, "Content-Type": "multipart/form-data" } });
      setMessages((prev) => prev.map((m) => (m.temp_id === tempId ? { ...m, status: "sent" } : m)));
    } catch (error) {
      setMessages((prev) => prev.map((m) => (m.temp_id === tempId ? { ...m, status: "failed" } : m)));
      toast.error(error.response?.data?.error || "Failed to send voice message");
    }
  }, [recipient, token, fetchScheduledMessages]);

  // ═══════════════════════════════════════════════════════════════════════════
  // FLOW ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleDeleteScheduled = useCallback(async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/scheduled/delete/${id}/`, { headers: { Authorization: `Token ${token}` } });
      setScheduledMessages((prev) => prev.filter((m) => m.id !== id));
      toast.success("Scheduled message deleted");
    } catch (err) { toast.error("Failed to delete scheduled message"); }
  }, [token]);

  const handleStartFlow = useCallback(async () => {
    if (!selectedFlowId) { alert("Please select a flow first"); return; }
    try {
      const response = await axios.post(`${API_BASE_URL}/api/flows/start/`, { phone_number: recipient, flow_id: selectedFlowId }, { headers: { Authorization: `Token ${token}` } });
      setActiveFlow(response.data?.data); setShowFlowSelector(false);
      toast.success(response.data?.message || "Flow started successfully");
    } catch (error) { toast.error(`Error: ${error.response?.data?.error || "Failed to start flow"}`); }
  }, [selectedFlowId, recipient, token]);

  const handleFlowAction = useCallback(async (action) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/flows/update-status/`, { session_id: selectedSessionId, action }, { headers: { Authorization: `Token ${token}` } });
      toast.success(response.data.message || `Flow ${action}d successfully`);
      if (action === "pause") setIsFlowPaused(true);
      else if (action === "resume") setIsFlowPaused(false);
      else if (action === "stop") { setActiveFlow(null); setIsFlowPaused(false); }
    } catch (error) { toast.error(error.response?.data?.error || `Failed to ${action} flow`); }
  }, [selectedSessionId, token]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — FIXED: No solid background on root, so whatsapp_bg shows through
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <RequireSubscription>
      <MarkPurchaseModal show={showPurchaseModal} onClose={() => setShowPurchaseModal(false)}
        contact={{ recipient, user_name: contactName, tags: [] }}
        purchaseForm={purchaseForm} setPurchaseForm={setPurchaseForm}
        availableTags={[]} fetchChatList={() => {}} token={token} loading={isSending} setLoading={() => {}} />

      <ForwardModal
        show={forwardMessages.length > 0}
        onClose={handleForwardModalClose}
        messages={forwardMessages}
        token={token}
        currentRecipient={recipient}
      />

      {/* 
        ROOT: No background-color here — transparent so the whatsapp_bg 
        from MainChat.jsx shows through. Only specific elements have backgrounds.
      */}
      <div className="flex flex-col min-h-screen">
        
        {/* ── HEADER ── */}
        <div className="px-3 py-2.5 bg-white dark:bg-[#111827] border-b border-gray-200 dark:border-white/5 sticky top-0 z-50 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={() => navigate(-1)} className="block md:hidden p-2 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95">
              <svg className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex flex-col min-w-0">
              <span className="text-sm md:text-base font-bold text-gray-900 dark:text-white truncate">{contactName || recipient}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{recipient}</span>
            </div>
            <button onClick={() => { setPurchaseForm((prev) => ({ ...prev, full_name: contactName })); setShowPurchaseModal(true); }}
              className="ml-1 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all flex-shrink-0" title="Edit name">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-1 md:gap-2 justify-end">
            {!isSelectMode ? (
              <button onClick={enterSelectMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95" title="Select messages">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            ) : (
              <button onClick={exitSelectMode} className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95">
                Cancel
              </button>
            )}

            {!activeFlow ? (
              <button onClick={() => setShowFlowSelector(!showFlowSelector)} className="bg-green-500 dark:bg-green-500 hover:bg-green-600 dark:hover:bg-green-400 text-white px-2 md:px-3 py-1.5 rounded-full text-xs md:text-sm font-bold transition-all shadow-sm active:scale-95">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  <span className="hidden sm:inline">Start Flow</span><span className="sm:hidden">Start</span>
                </span>
              </button>
            ) : (
              <>
                {isFlowPaused ? (
                  <button onClick={() => handleFlowAction("resume")} className="bg-green-500 dark:bg-green-500 hover:bg-green-600 dark:hover:bg-green-400 text-white px-2 md:px-3 py-1.5 rounded-full text-xs md:text-sm font-bold transition-all active:scale-95">Resume</button>
                ) : (
                  <button onClick={() => handleFlowAction("pause")} className="bg-yellow-500 dark:bg-yellow-500 hover:bg-yellow-600 dark:hover:bg-yellow-400 text-white px-2 md:px-3 py-1.5 rounded-full text-xs md:text-sm font-bold transition-all active:scale-95">Pause</button>
                )}
                <button onClick={() => handleFlowAction("stop")} className="bg-red-500 dark:bg-red-500 hover:bg-red-600 dark:hover:bg-red-400 text-white px-2 md:px-3 py-1.5 rounded-full text-xs md:text-sm font-bold ml-1 transition-all active:scale-95">Stop</button>
              </>
            )}
          </div>
        </div>

        {/* Flow Selector */}
        {showFlowSelector && (
          <div className="bg-blue-50 dark:bg-blue-500/10 border-b border-blue-200 dark:border-blue-500/20 p-3">
            <div className="flex items-center gap-3">
              <select value={selectedFlowId || ""} onChange={(e) => setSelectedFlowId(e.target.value)} className="flex-1 px-3 py-2 border border-blue-300 dark:border-blue-500/30 rounded-lg text-sm bg-white dark:bg-[#111827] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select a flow...</option>
                {availableFlows.map((flow) => <option key={flow.id} value={flow.id}>{flow.name}</option>)}
              </select>
              <button onClick={handleStartFlow} disabled={!selectedFlowId} className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition-all active:scale-95">Start</button>
              <button onClick={() => setShowFlowSelector(false)} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* Active Flow Status */}
        {activeFlow && (
          <div className={`border-b p-3 ${isFlowPaused ? "bg-yellow-50 dark:bg-yellow-500/10" : "bg-green-50 dark:bg-green-500/10"} border-gray-200 dark:border-white/5 flex items-center gap-3`}>
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${isFlowPaused ? "bg-yellow-500" : "bg-green-500 animate-pulse"}`} />
              <div>
                <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{activeFlow.flow_name || "Active Flow"}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{isFlowPaused ? "Paused" : "Running"} · Node: {activeFlow.current_node_id || "Starting"}</div>
              </div>
            </div>
          </div>
        )}

        {/* Scheduled Messages */}
        {scheduledMessages.length > 0 && (
          <div className="sticky top-[56px] z-40 bg-yellow-50 dark:bg-yellow-500/10 border-b border-yellow-200 dark:border-yellow-500/20 px-3 py-2">
            <div className="flex flex-col gap-2">
              {scheduledMessages.map((msg) => (
                <div key={msg.id} className="flex items-center justify-between text-xs bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 px-3 py-1.5 rounded-full shadow-sm">
                  <span>⏰ Scheduled {getRemainingTime(msg.send_at)}</span>
                  <button onClick={() => handleDeleteScheduled(msg.id)} className="ml-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-bold">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CHAT MESSAGES ── */}
        <div
          ref={chatContainerRef}
          className={`overflow-y-auto grow h-[calc(70vh-50px)] md:h-[calc(100vh-150px)] p-2 md:p-4 ${isSelectMode ? "pb-24" : "pb-16"} md:pb-4 scrollbar-thin`}
          onClick={!isSelectMode ? closeMenu : undefined}
        >
          {isLoading && <MessageSkeleton />}

          {!isLoading && messages.length > 0 && (
            <ul className="flex flex-col gap-3">
              {sortedDates.map((date) => (
                <React.Fragment key={date}>
                  <li className="text-center my-2">
                    <span className="inline-block bg-gray-200/80 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-sm px-4 py-1 rounded-full font-medium backdrop-blur-sm">
                      {formatDateSeparator(date)}
                    </span>
                  </li>
                  {groupedMessages[date]
                    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                    .map((msg) => {
                      const msgId = msg.message_id || msg.id;
                      return (
                        <li key={msg.id} id={`msg-${msgId}`} className="transition-colors duration-500">
                          <MessageBubble
                            msg={msg}
                            isOutbound={msg.direction === "OUTBOUND"}
                            isMenuOpen={activeMessageMenu === msgId}
                            plan={plan}
                            onOpenMenu={openMenu}
                            onCopy={handleCopyMessage}
                            onReply={handleReplyMessage}
                            onForward={handleForwardMessage}
                            onCloseMenu={closeMenu}
                            onScrollToReply={scrollToMessage}
                            isSelectMode={isSelectMode}
                            isSelected={selectedMessageIds.has(msgId)}
                            onToggleSelect={toggleMessageSelect}
                          />
                        </li>
                      );
                    })}
                </React.Fragment>
              ))}
            </ul>
          )}

          {!isLoading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
              <div className="w-16 h-16 bg-gray-100/80 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm font-medium">No messages yet. Start a conversation!</p>
            </div>
          )}
        </div>

        {/* ── SELECTION TOOLBAR ── */}
        {isSelectMode && (
          <SelectionToolbar
            count={selectedMessageIds.size}
            totalCount={messages.length}
            onForward={forwardSelectedMessages}
            onCancel={exitSelectMode}
            onSelectAll={selectAllMessages}
          />
        )}

        {/* ── CHAT INPUT ── */}
        {!isSelectMode && (
          <ChatInputArea
            recipient={recipient}
            onSendText={handleSendText}
            onSendFile={handleSendFile}
            onSendVoice={handleSendVoice}
            isConversationExpired={isConversationExpired}
            isSending={isSending}
            allowedFiles={allowedFiles}
            subscriptionStatus={subscriptionStatus}
            replyTo={replyTo}
            onCancelReply={cancelReply}
            onScrollToReply={scrollToMessage}
          />
        )}
      </div>
    </RequireSubscription>
  );
};

export default ChatWindow;
