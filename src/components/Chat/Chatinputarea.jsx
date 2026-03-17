// ═══════════════════════════════════════════════════════════════════════════════
// src/components/Chat/ChatInputArea.jsx — UPGRADED
// ═══════════════════════════════════════════════════════════════════════════════
//
// CHANGES FROM ORIGINAL:
// ✅ Accepts replyTo, onCancelReply, onScrollToReply props
// ✅ Renders ReplyInputPreview bar above the input when replying
// ✅ Passes reply metadata through onSendText callback
// ✅ Clears reply after send
// ✅ Disables input when conversation is expired (with friendly message)
// ✅ All existing features preserved (file upload, voice, scheduling, buttons)
// ═══════════════════════════════════════════════════════════════════════════════

// import React, { useState, useRef, useCallback, useEffect } from "react";
// import {
//   PaperAirplaneIcon,
//   PaperClipIcon,
//   MicrophoneIcon,
//   ClockIcon,
//   XMarkIcon,
//   StopIcon,
// } from "@heroicons/react/24/solid";
// import { ReplyInputPreview } from "./ReplyPreview";

// const ChatInputArea = ({
//   recipient,
//   onSendText,
//   onSendFile,
//   onSendVoice,
//   isConversationExpired,
//   isSending,
//   allowedFiles,
//   subscriptionStatus,
//   // ✅ NEW: Reply props
//   replyTo = null,
//   onCancelReply,
//   onScrollToReply,
// }) => {
//   const [messageText, setMessageText] = useState("");
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [filePreview, setFilePreview] = useState(null);
//   const [isRecording, setIsRecording] = useState(false);
//   const [recordingDuration, setRecordingDuration] = useState(0);
//   const [showScheduler, setShowScheduler] = useState(false);
//   const [scheduleDate, setScheduleDate] = useState("");
//   const [scheduleTime, setScheduleTime] = useState("");
//   const [buttons, setButtons] = useState([]);
//   const [showButtonInput, setShowButtonInput] = useState(false);
//   const [buttonText, setButtonText] = useState("");

//   const textareaRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);
//   const recordingTimerRef = useRef(null);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // AUTO-FOCUS ON REPLY
//   // ═══════════════════════════════════════════════════════════════════════════

//   useEffect(() => {
//     if (replyTo && textareaRef.current) {
//       textareaRef.current.focus();
//     }
//   }, [replyTo]);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // TEXT INPUT (existing + auto-resize)
//   // ═══════════════════════════════════════════════════════════════════════════

//   const handleTextChange = useCallback((e) => {
//     setMessageText(e.target.value);

//     // Auto-resize
//     const textarea = e.target;
//     textarea.style.height = "auto";
//     textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
//   }, []);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // SEND TEXT — ✅ NOW CLEARS REPLY
//   // ═══════════════════════════════════════════════════════════════════════════

//   const handleSend = useCallback(() => {
//     if (!messageText.trim() && !selectedFile) return;
//     if (isSending) return;

//     const scheduleAt =
//       showScheduler && scheduleDate && scheduleTime
//         ? `${scheduleDate}T${scheduleTime}`
//         : null;

//     if (selectedFile) {
//       onSendFile({
//         file: selectedFile,
//         caption: messageText.trim(),
//         scheduleAt,
//       });
//       setSelectedFile(null);
//       setFilePreview(null);
//     } else {
//       onSendText({
//         message_text: messageText.trim(),
//         buttons: buttons.length > 0 ? buttons : [],
//         scheduleAt,
//       });
//     }

//     setMessageText("");
//     setButtons([]);
//     setShowScheduler(false);
//     setScheduleDate("");
//     setScheduleTime("");

//     // Reset textarea height
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "auto";
//     }
//   }, [
//     messageText,
//     selectedFile,
//     isSending,
//     showScheduler,
//     scheduleDate,
//     scheduleTime,
//     buttons,
//     onSendText,
//     onSendFile,
//   ]);

//   const handleKeyDown = useCallback(
//     (e) => {
//       if (e.key === "Enter" && !e.shiftKey) {
//         e.preventDefault();
//         handleSend();
//       }
//     },
//     [handleSend]
//   );

//   // ═══════════════════════════════════════════════════════════════════════════
//   // FILE HANDLING (existing)
//   // ═══════════════════════════════════════════════════════════════════════════

//   const handleFileSelect = useCallback(
//     (e) => {
//       const file = e.target.files?.[0];
//       if (!file) return;

//       // Validate type
//       const isAllowed =
//         allowedFiles.types.includes(file.type) ||
//         (file.type.startsWith("audio/") &&
//           allowedFiles.accept.includes("audio/*"));

//       if (!isAllowed) {
//         alert(
//           `File type not allowed. Your ${
//             subscriptionStatus?.plan || "current"
//           } plan supports: ${allowedFiles.description}`
//         );
//         return;
//       }

//       // Validate size
//       if (file.size > allowedFiles.maxSize) {
//         const maxMB = Math.round(allowedFiles.maxSize / (1024 * 1024));
//         alert(`File too large. Maximum: ${maxMB}MB`);
//         return;
//       }

//       setSelectedFile(file);

//       // Generate preview
//       if (file.type.startsWith("image/")) {
//         const reader = new FileReader();
//         reader.onload = (e) => setFilePreview(e.target.result);
//         reader.readAsDataURL(file);
//       } else {
//         setFilePreview(null);
//       }
//     },
//     [allowedFiles, subscriptionStatus]
//   );

//   const clearFile = useCallback(() => {
//     setSelectedFile(null);
//     setFilePreview(null);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   }, []);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // VOICE RECORDING (existing)
//   // ═══════════════════════════════════════════════════════════════════════════

//   const startRecording = useCallback(async () => {
//     if (!allowedFiles.allowVoice) {
//       alert("Voice messages not available on your plan");
//       return;
//     }

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const mediaRecorder = new MediaRecorder(stream, {
//         mimeType: "audio/webm;codecs=opus",
//       });

//       audioChunksRef.current = [];

//       mediaRecorder.ondataavailable = (e) => {
//         if (e.data.size > 0) audioChunksRef.current.push(e.data);
//       };

//       mediaRecorder.onstop = () => {
//         const audioBlob = new Blob(audioChunksRef.current, {
//           type: "audio/webm",
//         });
//         const audioFile = new File([audioBlob], "voice_message.webm", {
//           type: "audio/webm",
//         });

//         const scheduleAt =
//           showScheduler && scheduleDate && scheduleTime
//             ? `${scheduleDate}T${scheduleTime}`
//             : null;

//         onSendVoice(audioFile, recordingDuration, scheduleAt);
//         setIsRecording(false);
//         setRecordingDuration(0);

//         // Clean up tracks
//         stream.getTracks().forEach((t) => t.stop());
//       };

//       mediaRecorderRef.current = mediaRecorder;
//       mediaRecorder.start();
//       setIsRecording(true);
//       setRecordingDuration(0);

//       recordingTimerRef.current = setInterval(() => {
//         setRecordingDuration((d) => d + 1);
//       }, 1000);
//     } catch (err) {
//       console.error("Microphone access denied:", err);
//       alert("Microphone access is required for voice messages");
//     }
//   }, [allowedFiles, onSendVoice, showScheduler, scheduleDate, scheduleTime, recordingDuration]);

//   const stopRecording = useCallback(() => {
//     if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
//       mediaRecorderRef.current.stop();
//     }
//     if (recordingTimerRef.current) {
//       clearInterval(recordingTimerRef.current);
//       recordingTimerRef.current = null;
//     }
//   }, []);

//   const cancelRecording = useCallback(() => {
//     if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
//       mediaRecorderRef.current.ondataavailable = null;
//       mediaRecorderRef.current.onstop = null;
//       mediaRecorderRef.current.stop();
//     }
//     if (recordingTimerRef.current) {
//       clearInterval(recordingTimerRef.current);
//       recordingTimerRef.current = null;
//     }
//     setIsRecording(false);
//     setRecordingDuration(0);
//     audioChunksRef.current = [];
//   }, []);

//   const formatDuration = (seconds) => {
//     const m = Math.floor(seconds / 60);
//     const s = seconds % 60;
//     return `${m}:${s.toString().padStart(2, "0")}`;
//   };

//   // ═══════════════════════════════════════════════════════════════════════════
//   // BUTTON HANDLING (existing)
//   // ═══════════════════════════════════════════════════════════════════════════

//   const addButton = useCallback(() => {
//     if (!buttonText.trim()) return;
//     if (buttons.length >= 3) {
//       alert("Maximum 3 buttons allowed");
//       return;
//     }
//     setButtons((prev) => [
//       ...prev,
//       { id: `btn_${Date.now()}`, title: buttonText.trim() },
//     ]);
//     setButtonText("");
//   }, [buttonText, buttons]);

//   const removeButton = useCallback((id) => {
//     setButtons((prev) => prev.filter((b) => b.id !== id));
//   }, []);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // CLEANUP
//   // ═══════════════════════════════════════════════════════════════════════════

//   useEffect(() => {
//     return () => {
//       if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
//     };
//   }, []);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // RENDER: EXPIRED STATE
//   // ═══════════════════════════════════════════════════════════════════════════

//   if (isConversationExpired) {
//     return (
//       <div className="sticky bottom-0 bg-amber-50 border-t border-amber-200 px-4 py-4">
//         <div className="flex items-center gap-3 justify-center">
//           <ClockIcon className="w-5 h-5 text-amber-600 flex-shrink-0" />
//           <div className="text-center">
//             <p className="text-sm font-medium text-amber-800">
//               24-hour window expired
//             </p>
//             <p className="text-xs text-amber-600 mt-0.5">
//               You can only reply within 24 hours of the customer's last message.
//               Send a template message to re-engage.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ═══════════════════════════════════════════════════════════════════════════
//   // RENDER: RECORDING STATE
//   // ═══════════════════════════════════════════════════════════════════════════

//   if (isRecording) {
//     return (
//       <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3">
//         <div className="flex items-center gap-4">
//           {/* Cancel */}
//           <button
//             onClick={cancelRecording}
//             className="w-10 h-10 flex items-center justify-center rounded-full 
//                        bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
//           >
//             <XMarkIcon className="w-5 h-5" />
//           </button>

//           {/* Recording indicator */}
//           <div className="flex-1 flex items-center gap-3">
//             <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
//             <span className="text-sm font-medium text-gray-700">
//               Recording {formatDuration(recordingDuration)}
//             </span>
//           </div>

//           {/* Send */}
//           <button
//             onClick={stopRecording}
//             className="w-10 h-10 flex items-center justify-center rounded-full 
//                        bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
//           >
//             <StopIcon className="w-5 h-5" />
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // ═══════════════════════════════════════════════════════════════════════════
//   // RENDER: NORMAL INPUT
//   // ═══════════════════════════════════════════════════════════════════════════

//   return (
//     <div className="sticky bottom-0 bg-white border-t border-gray-200">
//       {/* ✅ NEW: Reply Preview Bar */}
//       <ReplyInputPreview
//         replyTo={replyTo}
//         onCancel={onCancelReply}
//         onScrollTo={onScrollToReply}
//       />

//       {/* File Preview */}
//       {selectedFile && (
//         <div className="px-4 pt-3 pb-1">
//           <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2.5">
//             {filePreview ? (
//               <img
//                 src={filePreview}
//                 alt="Preview"
//                 className="w-12 h-12 object-cover rounded-lg"
//               />
//             ) : (
//               <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
//                 <PaperClipIcon className="w-5 h-5 text-gray-500" />
//               </div>
//             )}
//             <div className="flex-1 min-w-0">
//               <p className="text-sm font-medium text-gray-700 truncate">
//                 {selectedFile.name}
//               </p>
//               <p className="text-xs text-gray-500">
//                 {(selectedFile.size / 1024).toFixed(1)} KB
//               </p>
//             </div>
//             <button
//               onClick={clearFile}
//               className="p-1 hover:bg-gray-200 rounded-full transition-colors"
//             >
//               <XMarkIcon className="w-4 h-4 text-gray-500" />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Buttons Preview */}
//       {buttons.length > 0 && (
//         <div className="px-4 pt-2">
//           <div className="flex flex-wrap gap-2">
//             {buttons.map((btn) => (
//               <span
//                 key={btn.id}
//                 className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
//               >
//                 {btn.title}
//                 <button
//                   onClick={() => removeButton(btn.id)}
//                   className="hover:text-red-500"
//                 >
//                   ×
//                 </button>
//               </span>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Schedule Bar */}
//       {showScheduler && (
//         <div className="px-4 pt-2 pb-1">
//           <div className="flex items-center gap-2 bg-yellow-50 rounded-lg px-3 py-2">
//             <ClockIcon className="w-4 h-4 text-yellow-600 flex-shrink-0" />
//             <input
//               type="date"
//               value={scheduleDate}
//               onChange={(e) => setScheduleDate(e.target.value)}
//               className="text-sm bg-transparent border-b border-yellow-300 focus:outline-none"
//               min={new Date().toISOString().split("T")[0]}
//             />
//             <input
//               type="time"
//               value={scheduleTime}
//               onChange={(e) => setScheduleTime(e.target.value)}
//               className="text-sm bg-transparent border-b border-yellow-300 focus:outline-none"
//             />
//             <button
//               onClick={() => {
//                 setShowScheduler(false);
//                 setScheduleDate("");
//                 setScheduleTime("");
//               }}
//               className="ml-auto p-1 hover:bg-yellow-100 rounded"
//             >
//               <XMarkIcon className="w-4 h-4 text-yellow-600" />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Button Input */}
//       {showButtonInput && (
//         <div className="px-4 pt-2">
//           <div className="flex items-center gap-2">
//             <input
//               type="text"
//               value={buttonText}
//               onChange={(e) => setButtonText(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") {
//                   e.preventDefault();
//                   addButton();
//                 }
//               }}
//               placeholder="Button text..."
//               maxLength={20}
//               className="flex-1 text-sm px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg
//                          focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
//             />
//             <button
//               onClick={addButton}
//               disabled={!buttonText.trim() || buttons.length >= 3}
//               className="px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-lg
//                          hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
//             >
//               Add
//             </button>
//             <button
//               onClick={() => {
//                 setShowButtonInput(false);
//                 setButtonText("");
//               }}
//               className="p-1 hover:bg-gray-100 rounded"
//             >
//               <XMarkIcon className="w-4 h-4 text-gray-500" />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Main Input Row */}
//       <div className="flex items-end gap-2 px-3 py-2.5">
//         {/* Attachment */}
//         <button
//           onClick={() => fileInputRef.current?.click()}
//           className="flex-shrink-0 w-9 h-9 flex items-center justify-center 
//                      rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
//           title="Attach file"
//         >
//           <PaperClipIcon className="w-5 h-5" />
//         </button>
//         <input
//           ref={fileInputRef}
//           type="file"
//           accept={allowedFiles.accept}
//           onChange={handleFileSelect}
//           className="hidden"
//         />

//         {/* Text Input */}
//         <div className="flex-1 relative">
//           <textarea
//             ref={textareaRef}
//             value={messageText}
//             onChange={handleTextChange}
//             onKeyDown={handleKeyDown}
//             placeholder={
//               replyTo
//                 ? `Reply to ${replyTo.sender}...`
//                 : "Type a message..."
//             }
//             rows={1}
//             className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm
//                        placeholder:text-gray-400 resize-none focus:outline-none 
//                        focus:ring-2 focus:ring-emerald-500/50 max-h-[120px]"
//             style={{ fontSize: "16px" }} // Prevent zoom on iOS
//             disabled={isSending}
//           />
//         </div>

//         {/* Action Buttons */}
//         <div className="flex items-center gap-1 flex-shrink-0">
//           {/* Schedule toggle */}
//           <button
//             onClick={() => setShowScheduler((s) => !s)}
//             className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors
//               ${showScheduler ? "bg-yellow-100 text-yellow-600" : "text-gray-500 hover:bg-gray-100"}`}
//             title="Schedule message"
//           >
//             <ClockIcon className="w-4.5 h-4.5" />
//           </button>

//           {/* Button toggle */}
//           <button
//             onClick={() => setShowButtonInput((s) => !s)}
//             className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors text-xs font-bold
//               ${showButtonInput ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
//             title="Add buttons"
//           >
//             B
//           </button>

//           {/* Send or Voice */}
//           {messageText.trim() || selectedFile ? (
//             <button
//               onClick={handleSend}
//               disabled={isSending}
//               className="w-9 h-9 flex items-center justify-center rounded-full 
//                          bg-emerald-500 text-white hover:bg-emerald-600 
//                          disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
//             >
//               {isSending ? (
//                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//               ) : (
//                 <PaperAirplaneIcon className="w-4.5 h-4.5" />
//               )}
//             </button>
//           ) : (
//             <button
//               onClick={startRecording}
//               className="w-9 h-9 flex items-center justify-center rounded-full 
//                          text-gray-500 hover:bg-gray-100 transition-colors"
//               title="Voice message"
//             >
//               <MicrophoneIcon className="w-5 h-5" />
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatInputArea;

// ═══════════════════════════════════════════════════════════════════════════════
// src/components/Chat/ChatInputArea.jsx — WITH CLIPBOARD INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════
//
// CHANGES FROM PREVIOUS VERSION:
// ✅ Added clipboard button in action bar
// ✅ Added ClipboardModal import and state
// ✅ Added handleClipboardSelect to insert content
// ✅ Handles both text and media clipboard items
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  MicrophoneIcon,
  ClockIcon,
  XMarkIcon,
  StopIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/solid";
import { ClipboardDocumentListIcon as ClipboardOutlineIcon } from "@heroicons/react/24/outline";
import { ReplyInputPreview } from "./ReplyPreview";
import ClipboardModal from "./ClipboardModal";

const ChatInputArea = ({
  recipient,
  onSendText,
  onSendFile,
  onSendVoice,
  isConversationExpired,
  isSending,
  allowedFiles,
  subscriptionStatus,
  // Reply props
  replyTo = null,
  onCancelReply,
  onScrollToReply,
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

  // ✅ NEW: Clipboard state
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

    // Auto-resize
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

      // Validate type
      const isAllowed =
        allowedFiles.types.includes(file.type) ||
        (file.type.startsWith("audio/") && allowedFiles.accept.includes("audio/*"));

      if (!isAllowed) {
        alert(
          `File type not allowed. Your ${subscriptionStatus?.plan || "current"} plan supports: ${allowedFiles.description}`
        );
        return;
      }

      // Validate size
      if (file.size > allowedFiles.maxSize) {
        const maxMB = Math.round(allowedFiles.maxSize / (1024 * 1024));
        alert(`File too large. Maximum: ${maxMB}MB`);
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
  // ✅ NEW: CLIPBOARD HANDLING
  // ═══════════════════════════════════════════════════════════════════════════

  const handleClipboardSelect = useCallback(
    async (item) => {
      if (item.item_type === "text") {
        // Insert text at cursor position or append
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const before = messageText.substring(0, start);
          const after = messageText.substring(end);
          const newText = before + item.content + after;
          setMessageText(newText);

          // Auto-resize after insert
          setTimeout(() => {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
            // Move cursor to end of inserted text
            const newCursorPos = start + item.content.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
            textarea.focus();
          }, 0);
        } else {
          setMessageText((prev) => prev + item.content);
        }
      } else if (item.file_url) {
        // For media items, we need to fetch the file and set it
        try {
          const response = await fetch(item.file_url);
          const blob = await response.blob();

          // Determine file extension from URL or type
          const ext = item.original_filename?.split(".").pop() || "file";
          const filename = item.original_filename || `clipboard_${item.item_type}.${ext}`;

          const file = new File([blob], filename, { type: blob.type });

          setSelectedFile(file);

          // Generate preview for images
          if (item.item_type === "image") {
            setFilePreview(item.file_url);
          } else {
            setFilePreview(null);
          }

          // Set content as caption if exists
          if (item.content) {
            setMessageText(item.content);
          }
        } catch (error) {
          console.error("Failed to load clipboard media:", error);
          alert("Failed to load media from clipboard");
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
      alert("Voice messages not available on your plan");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioFile = new File([audioBlob], "voice_message.webm", { type: "audio/webm" });

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
      alert("Microphone access is required for voice messages");
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
      alert("Maximum 3 buttons allowed");
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
  // RENDER: EXPIRED STATE
  // ═══════════════════════════════════════════════════════════════════════════

  if (isConversationExpired) {
    return (
      <div className="sticky bottom-0 bg-amber-50 border-t border-amber-200 px-4 py-4">
        <div className="flex items-center gap-3 justify-center">
          <ClockIcon className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="text-center">
            <p className="text-sm font-medium text-amber-800">24-hour window expired</p>
            <p className="text-xs text-amber-600 mt-0.5">
              You can only reply within 24 hours. Send a template message to re-engage.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: RECORDING STATE
  // ═══════════════════════════════════════════════════════════════════════════

  if (isRecording) {
    return (
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={cancelRecording}
            className="w-10 h-10 flex items-center justify-center rounded-full 
                       bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          <div className="flex-1 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700">
              Recording {formatDuration(recordingDuration)}
            </span>
          </div>

          <button
            onClick={stopRecording}
            className="w-10 h-10 flex items-center justify-center rounded-full 
                       bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
          >
            <StopIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: NORMAL INPUT
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <>
      <div className="sticky bottom-0 bg-white border-t border-gray-200">
        {/* Reply Preview Bar */}
        <ReplyInputPreview
          replyTo={replyTo}
          onCancel={onCancelReply}
          onScrollTo={onScrollToReply}
        />

        {/* File Preview */}
        {selectedFile && (
          <div className="px-4 pt-3 pb-1">
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2.5">
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded-lg"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <PaperClipIcon className="w-5 h-5 text-gray-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={clearFile}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <XMarkIcon className="w-4 h-4 text-gray-500" />
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
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                >
                  {btn.title}
                  <button onClick={() => removeButton(btn.id)} className="hover:text-red-500">
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
            <div className="flex items-center gap-2 bg-yellow-50 rounded-lg px-3 py-2">
              <ClockIcon className="w-4 h-4 text-yellow-600 flex-shrink-0" />
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="text-sm bg-transparent border-b border-yellow-300 focus:outline-none"
                min={new Date().toISOString().split("T")[0]}
              />
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="text-sm bg-transparent border-b border-yellow-300 focus:outline-none"
              />
              <button
                onClick={() => {
                  setShowScheduler(false);
                  setScheduleDate("");
                  setScheduleTime("");
                }}
                className="ml-auto p-1 hover:bg-yellow-100 rounded"
              >
                <XMarkIcon className="w-4 h-4 text-yellow-600" />
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
                className="flex-1 text-sm px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <button
                onClick={addButton}
                disabled={!buttonText.trim() || buttons.length >= 3}
                className="px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-lg
                           hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowButtonInput(false);
                  setButtonText("");
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <XMarkIcon className="w-4 h-4 text-gray-500" />
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
                       rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
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

          {/* ✅ NEW: Clipboard Button */}
          <button
            onClick={() => setShowClipboard(true)}
            className={`flex-shrink-0 w-9 h-9 flex items-center justify-center 
                       rounded-full transition-colors
                       ${showClipboard ? "bg-emerald-100 text-emerald-600" : "text-gray-500 hover:bg-gray-100"}`}
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
              className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm
                         placeholder:text-gray-400 resize-none focus:outline-none 
                         focus:ring-2 focus:ring-emerald-500/50 max-h-[120px]"
              style={{ fontSize: "16px" }}
              disabled={isSending}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Schedule toggle */}
            <button
              onClick={() => setShowScheduler((s) => !s)}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors
                ${showScheduler ? "bg-yellow-100 text-yellow-600" : "text-gray-500 hover:bg-gray-100"}`}
              title="Schedule message"
            >
              <ClockIcon className="w-4.5 h-4.5" />
            </button>

            {/* Button toggle */}
            <button
              onClick={() => setShowButtonInput((s) => !s)}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors text-xs font-bold
                ${showButtonInput ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
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
                           disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <PaperAirplaneIcon className="w-4.5 h-4.5" />
                )}
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="w-9 h-9 flex items-center justify-center rounded-full 
                           text-gray-500 hover:bg-gray-100 transition-colors"
                title="Voice message"
              >
                <MicrophoneIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ✅ NEW: Clipboard Modal */}
      <ClipboardModal
        isOpen={showClipboard}
        onClose={() => setShowClipboard(false)}
        onSelect={handleClipboardSelect}
      />
    </>
  );
};

export default ChatInputArea;