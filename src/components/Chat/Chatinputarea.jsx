import React, { useState, useRef, useEffect, useCallback } from 'react';
import EmojiPicker from 'emoji-picker-react';
import VoiceRecorder from './VoiceRecorder';

/**
 * ChatInputArea - WhatsApp-style chat input
 * 
 * Props:
 * - recipient: string - Phone number to send to
 * - onSendText: ({ message_text, buttons? }) => void
 * - onSendFile: ({ file, caption }) => void
 * - onSendVoice: (audioFile, duration) => void
 * - isConversationExpired: boolean
 * - isSending: boolean
 * - allowedFiles: { types: [], accept: '', description: '', allowVoice: boolean }
 * - subscriptionStatus: { plan: string }
 */

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getFileCategory = (mimeType) => {
  if (mimeType?.startsWith('image/')) return 'Image';
  if (mimeType?.startsWith('video/')) return 'Video';
  if (mimeType?.startsWith('audio/')) return 'Audio';
  return 'Document';
};

const ChatInputArea = ({
  recipient,
  onSendText,
  onSendFile,
  onSendVoice,
  isConversationExpired = false,
  isSending = false,
  allowedFiles = { types: [], accept: '', description: 'No files', allowVoice: false },
  subscriptionStatus = null,
}) => {
  // State
  const [messageText, setMessageText] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);
  const [interactiveButtons, setInteractiveButtons] = useState([]);
  const [newButtonTitle, setNewButtonTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const [scheduleAt, setScheduleAt] = useState(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const resetScheduler = () => {
    setShowScheduler(false);
    setScheduleAt(null);
  };

  // Refs
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [messageText, adjustTextareaHeight]);

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (isSending) return;

    // Don't submit if no content
    if (!messageText.trim() && !selectedFile && interactiveButtons.length === 0) {
      return;
    }

    // Interactive message with buttons
    if (isInteractiveMode && interactiveButtons.length > 0 && messageText.trim()) {
      onSendText?.({
        message_text: messageText.trim(),
        buttons: interactiveButtons,
        scheduleAt,
      });
      resetForm();
      resetScheduler();
      return;
    }

    // Regular text message
    if (messageText.trim() && !selectedFile) {
      onSendText?.({
        message_text: messageText.trim(),
        buttons: [],
        scheduleAt,
      });
      setMessageText('');
      resetScheduler();
      return;
    }

    // File with optional caption
    if (selectedFile) {
      onSendFile?.({
        file: selectedFile,
        caption: messageText.trim(),
        scheduleAt,
      });
      cancelFile();
      setMessageText('');
      resetScheduler();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    // if (allowedFiles.types.length > 0 && !allowedFiles.types.includes(file.type)) {
    //   alert(`File type not allowed. Supported: ${allowedFiles.description}`);
    //   e.target.value = '';
    //   return;
    // }

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    e.target.value = '';
  };

  const confirmFileSend = () => {
    if (!selectedFile || isSending) return;
    handleSubmit();
  };

  const cancelFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleVoiceSend = (audioFile, duration) => {
    onSendVoice?.(audioFile, duration,scheduleAt);
    setIsVoiceMode(false);
    resetScheduler();
  };

  const resetForm = () => {
    setMessageText('');
    setInteractiveButtons([]);
    setIsInteractiveMode(false);
    setNewButtonTitle('');
    resetScheduler();
  };

  const addButton = () => {
    if (!newButtonTitle.trim() || interactiveButtons.length >= 3) return;
    setInteractiveButtons([
      ...interactiveButtons,
      { id: `btn_${Date.now()}`, title: newButtonTitle.trim() }
    ]);
    setNewButtonTitle('');
  };

  // Computed
  const hasContent = messageText.trim() || selectedFile;
  const canSend = isInteractiveMode
    ? messageText.trim() && interactiveButtons.length > 0
    : hasContent;

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  // Expired state
  if (isConversationExpired) {
    return (
      <div className="sticky bottom-0 z-10 bg-white border-t border-gray-100 pb-safe">
        <div className="bg-amber-50 py-3 px-4">
          <div className="flex items-center justify-center gap-2 text-amber-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-center">
              <p className="text-sm font-medium">Conversation expired</p>
              <p className="text-xs text-amber-600">Only template messages allowed after 24h</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Voice mode
  if (isVoiceMode) {
    return (
      <div className="sticky bottom-0 z-10 bg-white border-t border-gray-100 pb-safe">
        <div className="flex items-center justify-center py-3 px-4 bg-gray-50">
          <VoiceRecorder
            onSend={handleVoiceSend}
            onCancel={() => setIsVoiceMode(false)}
            disabled={isSending}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="sticky bottom-0 z-10 bg-white border-t border-gray-100 pb-safe">
      {/* File Preview */}
      {selectedFile && (
        <div className="border-b border-gray-100 bg-gray-50 p-3 animate-slideUp">
          <div className="max-w-md mx-auto">
            <div className="relative bg-white rounded-xl shadow-sm overflow-hidden mb-3">
              {filePreview ? (
                <div className="relative">
                  <img src={filePreview} alt="Preview" className="w-full max-h-48 object-contain bg-gray-900" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gray-50">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{getFileCategory(selectedFile.type)} • {formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
              )}
              <button
                onClick={cancelFile}
                type="button"
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2 min-w-0 w-full">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmFileSend()}
                placeholder="Add a caption..."
                className="flex-1 min-w-0 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                style={{ fontSize: '16px' }}
              />
              <button
                onClick={confirmFileSend}
                type="button"
                disabled={isSending}
                className="w-11 h-11 flex items-center justify-center bg-green-500 hover:bg-green-600 active:scale-95 disabled:bg-gray-300 text-white rounded-full transition-all shadow-lg shadow-green-500/30 disabled:shadow-none"
              >
                {isSending ? (
                  <div className="w-5 h-5 max-[318px]:w-4 max-[318px]:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Buttons Panel */}
      {isInteractiveMode && !selectedFile && (
        <div className="border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white p-3 animate-slideUp">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Interactive Buttons</h4>
                <p className="text-xs text-gray-500">{interactiveButtons.length}/3 buttons</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setIsInteractiveMode(false); setInteractiveButtons([]); setNewButtonTitle(''); }}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {interactiveButtons.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {interactiveButtons.map((btn, i) => (
                <span key={btn.id} className="inline-flex whitespace-nowrap
 items-center gap-1.5 max-[318px]:gap-0.5 pl-3 pr-1.5 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-full">
                  {btn.title}
                  <button
                    type="button"
                    onClick={() => setInteractiveButtons(prev => prev.filter((_, idx) => idx !== i))}
                    className="flex-shrink-0
                        min-w-[20px] min-h-[20px]
                        w-5 h-5
                        max-[318px]:w-4 max-[318px]:h-4
                        flex items-center justify-center
                        hover:bg-blue-600
                        rounded-full"
                  >
                    <svg className="w-3 h-3 max-[318px]:w-2.5 max-[318px]:h-2.5 " fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              value={newButtonTitle}
              onChange={(e) => setNewButtonTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addButton()}
              placeholder="Button title"
              maxLength={20}
              className="flex-1 px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              style={{ fontSize: '16px' }}
            />
            <button
              type="button"
              onClick={addButton}
              disabled={!newButtonTitle.trim() || interactiveButtons.length >= 3}
              className="px-4 py-2.5 text-sm font-medium bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl active:scale-95"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute bottom-full left-0 right-0 sm:left-3 sm:right-auto mb-1 z-50">
          <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl overflow-hidden border border-gray-200">
            <EmojiPicker
              height={320}
              width="100%"
              onEmojiClick={(emoji) => setMessageText(prev => prev + emoji.emoji)}
              searchPlaceholder="Search emoji..."
              previewConfig={{ showPreview: false }}
            />
          </div>
          <div className="fixed inset-0 bg-black/20 -z-10 sm:hidden" onClick={() => setShowEmojiPicker(false)} />
        </div>
      )}
      {/* Scheduler Picker */}
      {showScheduler && (
        <div className="absolute bottom-full left-0 right-0 sm:left-3 sm:right-auto mb-1 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-3">
            <label className="block text-xs text-gray-500 mb-1">
              Schedule message
            </label>
            <input
              type="datetime-local"
              value={scheduleAt || ""}
              onChange={(e) => setScheduleAt(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
            />
            <button
              type="button"
              onClick={() => setShowScheduler(false)}
              className="mt-2 text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
          <div
            className="fixed inset-0 bg-black/20 -z-10 sm:hidden"
            onClick={() => setShowScheduler(false)}
          />
        </div>
      )}


      {/* Main Input */}
      {!selectedFile && (
        <form onSubmit={handleSubmit} className="flex items-end gap-2 p-2 sm:p-3">
          {/* Attachment */}
          {allowedFiles.types.length > 0 && (
            <>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept={allowedFiles.accept} 
                onChange={handleFileChange} 
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 w-11 h-11 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full active:scale-95"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
            </>
          )}

          {/* Input Container */}
          <div className="relative flex-1 flex items-end bg-gray-100 rounded-[24px] min-h-[44px] focus-within:bg-white focus-within:ring-2 focus-within:ring-green-200 focus-within:shadow-sm transition-all">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(prev => !prev)}
              className={`flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full ${showEmojiPicker ? 'text-green-600 bg-green-50' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowScheduler(prev => !prev);
                setShowEmojiPicker(false);
              }}
              className="
                absolute right-2 bottom-2
                sm:static sm:right-auto sm:bottom-auto
                w-9 h-9
                flex items-center justify-center
                text-gray-500 hover:text-gray-700
                bg-white sm:bg-transparent
                rounded-full shadow sm:shadow-none
              "
            >
              ⏰
            </button>



            <textarea
              ref={textareaRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message"
              maxLength={1000}
              rows={1}
              className="flex-1 py-3 pr-12 sm:pr-3 bg-transparent text-gray-900 placeholder-gray-500 resize-none focus:outline-none min-h-[44px] max-h-[120px] leading-5 scrollbar-hide"
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 max-[318px]:gap-0.5 flex-shrink-0">
            {hasContent || (isInteractiveMode && interactiveButtons.length > 0) ? (
              <button
                type="submit"
                disabled={!canSend || isSending}
                className="w-11 h-11 max-[318px]:w-9 max-[318px]:h-9 flex items-center justify-center bg-green-500 hover:bg-green-600 active:scale-95 disabled:bg-gray-300 text-white rounded-full shadow-lg shadow-green-500/30 disabled:shadow-none transition-all"
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                )}
              </button>
            ) : (
              <>
                {allowedFiles.allowVoice && (
                  <button
                    type="button"
                    onClick={() => setIsVoiceMode(true)}
                    className="w-11 h-11 max-[318px]:w-9 max-[318px]:h-9 flex items-center justify-center bg-green-500 hover:bg-green-600 active:scale-95 text-white rounded-full shadow-lg shadow-green-500/30 transition-all"
                  >
                    <svg className="w-6 h-6 max-[318px]:w-5 max-[318px]:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/>
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                  </button>
                )}
                {!isInteractiveMode && (
                  <button
                    type="button"
                    onClick={() => setIsInteractiveMode(true)}
                    className="h-11 px-3 max-[318px]:h-9 max-[318px]:px-2 flex items-center max-[318px]:gap-0.5 text-green-600 hover:bg-green-50 text-sm max-[318px]:text-xs font-medium rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 max-[318px]:h-3 max-[318px]:w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">Buttons</span>
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      )}

      {/* Upgrade hint */}
      {subscriptionStatus?.plan && allowedFiles.types.length === 0 && (
        <div className="text-center pb-2 px-4">
          <p className="text-xs text-gray-400">
            <button className="text-green-600 font-medium hover:underline">Upgrade</button> to send files & voice
          </p>
        </div>
      )}

      {/* Inline styles */}
      <style jsx>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 0); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.2s ease-out; }
        button { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
};

export default ChatInputArea;