// src/components/Chat/ChatInputArea.jsx — WITH CLIPBOARD INTEGRATION
// Full theme support + Mobile optimized
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  MicrophoneIcon,
  ClockIcon,
  XMarkIcon,
  StopIcon,
} from "@heroicons/react/24/solid";
import { ClipboardDocumentListIcon as ClipboardOutlineIcon } from "@heroicons/react/24/outline";
import { ReplyInputPreview } from "./ReplyPreview";
import ClipboardModal from "./ClipboardModal";
import { toast } from "react-toastify";

const ChatInputArea = ({
  recipient,
  onSendText,
  onSendFile,
  onSendVoice,
  isConversationExpired,
  isSending,
  allowedFiles,
  subscriptionStatus,
  replyTo = null,
  onCancelReply,
  onScrollToReply,
  billingStatus = null,
  onEnableBilling,
}) => {
  // ═══════════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════════
  const [messageText, setMessageText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [buttons, setButtons] = useState([]);
  const [showButtonInput, setShowButtonInput] = useState(false);
  const [buttonText, setButtonText] = useState("");
  const [showClipboard, setShowClipboard] = useState(false);

  // Refs
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTO-FOCUS ON REPLY
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo]);

  // ═══════════════════════════════════════════════════════════════════════════
  // TEXT INPUT
  // ═══════════════════════════════════════════════════════════════════════════

  const handleTextChange = useCallback((e) => {
    setMessageText(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // SEND MESSAGE
  // ═══════════════════════════════════════════════════════════════════════════

  const handleSend = useCallback(() => {
    if (!messageText.trim() && !selectedFile) return;
    if (isSending) return;

    const scheduleAt =
      showScheduler && scheduleDate && scheduleTime
        ? `${scheduleDate}T${scheduleTime}`
        : null;

    if (selectedFile) {
      onSendFile({
        file: selectedFile,
        caption: messageText.trim(),
        scheduleAt,
      });
      setSelectedFile(null);
      setFilePreview(null);
    } else {
      onSendText({
        message_text: messageText.trim(),
        buttons: buttons.length > 0 ? buttons : [],
        scheduleAt,
      });
    }

    setMessageText("");
    setButtons([]);
    setShowScheduler(false);
    setScheduleDate("");
    setScheduleTime("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [
    messageText,
    selectedFile,
    isSending,
    showScheduler,
    scheduleDate,
    scheduleTime,
    buttons,
    onSendText,
    onSendFile,
  ]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // FILE HANDLING
  // ═══════════════════════════════════════════════════════════════════════════

  const handleFileSelect = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const isAllowed =
        allowedFiles.types.includes(file.type) ||
        (file.type.startsWith("audio/") && allowedFiles.accept.includes("audio/*"));

      if (!isAllowed) {
        toast.error(
          `File type not allowed. Your ${subscriptionStatus?.plan || "current"} plan supports: ${allowedFiles.description}`
        );
        return;
      }

      if (file.size > allowedFiles.maxSize) {
        const maxMB = Math.round(allowedFiles.maxSize / (1024 * 1024));
        toast.error(`File too large. Maximum: ${maxMB}MB`);
        return;
      }

      setSelectedFile(file);

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    },
    [allowedFiles, subscriptionStatus]
  );

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // CLIPBOARD HANDLING
  // ═══════════════════════════════════════════════════════════════════════════

  const handleClipboardSelect = useCallback(
    async (item) => {
      if (item.item_type === "text") {
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const before = messageText.substring(0, start);
          const after = messageText.substring(end);
          const newText = before + item.content + after;
          setMessageText(newText);

          setTimeout(() => {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
            const newCursorPos = start + item.content.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
            textarea.focus();
          }, 0);
        } else {
          setMessageText((prev) => prev + item.content);
        }
      } else {
        const mediaUrl = item.file_url || item.media_url;
        
        if (!mediaUrl) {
          toast.error("No media URL found");
          return;
        }

        try {
          const response = await fetch(mediaUrl);
          const blob = await response.blob();

          const mimeTypeMap = {
            image: "image/jpeg",
            video: "video/mp4",
            audio: "audio/mpeg",
            document: "application/pdf",
          };

          let mimeType = blob.type;
          if (!mimeType || mimeType === "application/octet-stream") {
            mimeType = mimeTypeMap[item.item_type] || "application/octet-stream";
          }

          const extMap = { image: ".jpg", video: ".mp4", audio: ".mp3", document: ".pdf" };
          const filename = item.original_filename || 
            `clipboard_${item.item_type}${extMap[item.item_type] || ""}`;

          const file = new File([blob], filename, { type: mimeType });
          file._fromClipboard = true;

          setSelectedFile(file);

          if (item.item_type === "image") {
            setFilePreview(mediaUrl);
          } else {
            setFilePreview(null);
          }

          if (item.content) {
            setMessageText(item.content);
          }

          toast.success(`${item.item_type} loaded from clipboard`);
          
        } catch (error) {
          console.error("Failed to load clipboard media:", error);
          toast.error("Failed to load media from clipboard");
        }
      }

      setShowClipboard(false);
    },
    [messageText]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // VOICE RECORDING
  // ═══════════════════════════════════════════════════════════════════════════

  const startRecording = useCallback(async () => {
    if (!allowedFiles.allowVoice) {
      toast.error("Voice messages not available on your plan");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // ── VOICE_DIAG (temporary): what the browser actually supports. Logged BEFORE
      //    the MediaRecorder constructor, because on iOS Safari `new MediaRecorder(
      //    ..., {mimeType:"audio/webm;codecs=opus"})` THROWS (webm unsupported) — this
      //    ensures we still capture the userAgent + support map in that case.
      const _requestedMime = "audio/webm;codecs=opus";
      const _support = {};
      try {
        ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus",
         "audio/ogg", "audio/mp4", "audio/mp4;codecs=opus"].forEach((t) => {
          _support[t] = (typeof MediaRecorder !== "undefined" &&
            MediaRecorder.isTypeSupported) ? MediaRecorder.isTypeSupported(t) : "n/a";
        });
      } catch (e) { /* ignore */ }
      console.info("[VOICE_DIAG] pre-record", {
        userAgent: navigator.userAgent,
        requestedMime: _requestedMime,
        isTypeSupported: _support,
      });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      console.info("[VOICE_DIAG] recorder-created", {
        recorderMimeType: mediaRecorder.mimeType,   // actual negotiated type
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        console.info("[VOICE_DIAG] dataavailable", {
          chunkIndex: audioChunksRef.current.length,
          chunkSize: e.data && e.data.size,
          chunkType: e.data && e.data.type,
        });
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioFile = new File([audioBlob], "voice_message.webm", { type: "audio/webm" });

        // ── VOICE_DIAG (temporary): Blob/File actually produced vs the hardcoded
        //    "audio/webm" label. Note: recorderMimeType (logged at start) is the
        //    truth; the Blob/File type here are HARDCODED, so a mismatch here is
        //    expected and is exactly what we are trying to detect on mobile.
        console.info("[VOICE_DIAG] onstop", {
          chunks: audioChunksRef.current.length,
          recorderMimeType: mediaRecorder.mimeType,
          blobType: audioBlob.type,
          blobSize: audioBlob.size,
          fileName: audioFile.name,
          fileType: audioFile.type,
          fileSize: audioFile.size,
          durationSec: recordingDuration,
        });

        const scheduleAt =
          showScheduler && scheduleDate && scheduleTime
            ? `${scheduleDate}T${scheduleTime}`
            : null;

        onSendVoice(audioFile, recordingDuration, scheduleAt);
        setIsRecording(false);
        setRecordingDuration(0);

        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied:", err);
      toast.error("Microphone access is required for voice messages");
    }
  }, [allowedFiles, onSendVoice, showScheduler, scheduleDate, scheduleTime, recordingDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }, []);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
    setRecordingDuration(0);
    audioChunksRef.current = [];
  }, []);

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // BUTTON HANDLING
  // ═══════════════════════════════════════════════════════════════════════════

  const addButton = useCallback(() => {
    if (!buttonText.trim()) return;
    if (buttons.length >= 3) {
      toast.error("Maximum 3 buttons allowed");
      return;
    }
    setButtons((prev) => [...prev, { id: `btn_${Date.now()}`, title: buttonText.trim() }]);
    setButtonText("");
  }, [buttonText, buttons]);

  const removeButton = useCallback((id) => {
    setButtons((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEANUP
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // THEME-AWARE INPUT CLASSES
  // ═══════════════════════════════════════════════════════════════════════════
  
  const inputBaseClass = `
    w-full py-2 px-3 bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 
    rounded-2xl text-sm text-gray-900 dark:text-gray-100
    placeholder:text-gray-400 dark:placeholder:text-gray-600 
    resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 
    dark:focus:ring-emerald-400/30 max-h-[120px] transition-all duration-200
  `;

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: EXPIRED STATE — Full theme support
  // ═══════════════════════════════════════════════════════════════════════════

  if (isConversationExpired) {
    return (
      <div className="sticky bottom-0 bg-amber-50 dark:bg-amber-500/10 border-t border-amber-200 dark:border-amber-500/20 px-4 py-4 transition-colors duration-300">
        <div className="flex items-center gap-3 justify-center">
          <ClockIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div className="text-center">
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">24-hour window expired</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              You can only reply within 24 hours. Send a template message to re-engage.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Composer-lock: disable ONLY the composer; the chat above stays fully
  // readable. Backend is authoritative — this appears only when the backend says
  // the message cannot be sent. TWO distinct reasons, never conflated:
  //   • PAYMENT_METHOD_REQUIRED (CASE C) — a REAL Meta payment/billing error was
  //     returned on send. Show "Add Payment Method" (→ Meta billing setup).
  //   • TEMPLATE_REQUIRED / any other block — a WhatsApp MESSAGING-eligibility
  //     fact (24h window closed). NOT a payment issue: no card / no payment copy.
  if (billingStatus && billingStatus.can_send === false) {
    const isPayment =
      billingStatus.billing_state === "PAYMENT_METHOD_REQUIRED" ||
      billingStatus.requires_payment === true;
    return (
      <div className="sticky bottom-0 bg-red-50 dark:bg-red-500/10 border-t border-red-200 dark:border-red-500/20 px-4 py-4 transition-colors duration-300">
        <div className="flex items-center gap-3 justify-center flex-wrap">
          <ClockIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div className="text-center">
            <p className="text-sm font-bold text-red-800 dark:text-red-300">
              {isPayment ? "Payment method required to continue messaging"
                         : "Customer service window closed — approved template required"}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
              {isPayment
                ? "Add a payment method to your Meta WhatsApp Business account to continue sending billable messages."
                : "An approved template message is required to re-engage this contact."}
            </p>
          </div>
          {isPayment && onEnableBilling && (
            <button
              onClick={onEnableBilling}
              className="shrink-0 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 active:scale-95 transition-all"
            >
              Add Payment Method
            </button>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: RECORDING STATE — Full theme support
  // ═══════════════════════════════════════════════════════════════════════════

  if (isRecording) {
    return (
      <div className="sticky bottom-0 bg-white dark:bg-[#111827] border-t border-gray-200 dark:border-white/5 px-4 py-3 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <button
            onClick={cancelRecording}
            className="w-10 h-10 flex items-center justify-center rounded-full 
                       bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 
                       hover:bg-red-200 dark:hover:bg-red-500/20 transition-all active:scale-95"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          <div className="flex-1 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Recording {formatDuration(recordingDuration)}
            </span>
          </div>

          <button
            onClick={stopRecording}
            className="w-10 h-10 flex items-center justify-center rounded-full 
                       bg-emerald-500 text-white hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-500/25"
          >
            <StopIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: NORMAL INPUT — Full theme support
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <>
      <div className="sticky bottom-0 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
        {/* Reply Preview Bar */}
        <ReplyInputPreview
          replyTo={replyTo}
          onCancel={onCancelReply}
          onScrollTo={onScrollToReply}
        />

        {/* File Preview */}
        {selectedFile && (
          <div className="px-4 pt-3 pb-1">
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 rounded-xl p-2.5 border border-gray-200 dark:border-white/5">
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded-xl"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 dark:bg-white/10 rounded-xl flex items-center justify-center">
                  <PaperClipIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={clearFile}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-all active:scale-95"
              >
                <XMarkIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        )}

        {/* Buttons Preview */}
        {buttons.length > 0 && (
          <div className="px-4 pt-2">
            <div className="flex flex-wrap gap-2">
              {buttons.map((btn) => (
                <span
                  key={btn.id}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full border border-blue-200 dark:border-blue-500/20"
                >
                  {btn.title}
                  <button onClick={() => removeButton(btn.id)} className="hover:text-red-500 dark:hover:text-red-400 transition-colors">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Schedule Bar */}
        {showScheduler && (
          <div className="px-4 pt-2 pb-1">
            <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl px-3 py-2 border border-yellow-200 dark:border-yellow-500/20">
              <ClockIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="text-sm bg-transparent border-b border-yellow-300 dark:border-yellow-500/30 text-gray-900 dark:text-gray-100 focus:outline-none"
                min={new Date().toISOString().split("T")[0]}
              />
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="text-sm bg-transparent border-b border-yellow-300 dark:border-yellow-500/30 text-gray-900 dark:text-gray-100 focus:outline-none"
              />
              <button
                onClick={() => {
                  setShowScheduler(false);
                  setScheduleDate("");
                  setScheduleTime("");
                }}
                className="ml-auto p-1 hover:bg-yellow-100 dark:hover:bg-yellow-500/20 rounded-full transition-all"
              >
                <XMarkIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </button>
            </div>
          </div>
        )}

        {/* Button Input */}
        {showButtonInput && (
          <div className="px-4 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addButton();
                  }
                }}
                placeholder="Button text..."
                maxLength={20}
                className="flex-1 text-sm px-3 py-1.5 bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl
                           text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600
                           focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-400/30 transition-all"
              />
              <button
                onClick={addButton}
                disabled={!buttonText.trim() || buttons.length >= 3}
                className="px-3 py-1.5 text-xs font-bold bg-blue-500 dark:bg-blue-500 text-white rounded-xl
                           hover:bg-blue-600 dark:hover:bg-blue-400 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowButtonInput(false);
                  setButtonText("");
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all"
              >
                <XMarkIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        )}

        {/* Main Input Row */}
        <div className="flex items-end gap-2 px-3 py-2.5">
          {/* Attachment */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center 
                       rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95"
            title="Attach file"
          >
            <PaperClipIcon className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={allowedFiles.accept}
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Clipboard Button */}
          <button
            onClick={() => setShowClipboard(true)}
            className={`flex-shrink-0 w-9 h-9 flex items-center justify-center 
                       rounded-full transition-all active:scale-95
                       ${showClipboard ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"}`}
            title="Open clipboard"
          >
            <ClipboardOutlineIcon className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={messageText}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder={replyTo ? `Reply to ${replyTo.sender}...` : "Type a message..."}
              rows={1}
              className={inputBaseClass}
              style={{ fontSize: "16px" }}
              disabled={isSending}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Schedule toggle */}
            <button
              onClick={() => setShowScheduler((s) => !s)}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-95
                ${showScheduler ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"}`}
              title="Schedule message"
            >
              <ClockIcon className="w-[18px] h-[18px]" />
            </button>

            {/* Button toggle */}
            <button
              onClick={() => setShowButtonInput((s) => !s)}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-all text-xs font-bold active:scale-95
                ${showButtonInput ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"}`}
              title="Add buttons"
            >
              B
            </button>

            {/* Send or Voice */}
            {messageText.trim() || selectedFile ? (
              <button
                onClick={handleSend}
                disabled={isSending}
                className="w-9 h-9 flex items-center justify-center rounded-full 
                           bg-emerald-500 text-white hover:bg-emerald-600 
                           disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <PaperAirplaneIcon className="w-[18px] h-[18px]" />
                )}
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="w-9 h-9 flex items-center justify-center rounded-full 
                           text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95"
                title="Voice message"
              >
                <MicrophoneIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Clipboard Modal */}
      <ClipboardModal
        isOpen={showClipboard}
        onClose={() => setShowClipboard(false)}
        onSelect={handleClipboardSelect}
      />
    </>
  );
};

export default ChatInputArea;

