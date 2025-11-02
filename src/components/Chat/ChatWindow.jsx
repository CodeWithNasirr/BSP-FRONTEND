import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { assest } from '../../assets/assets';
import RequireSubscription from '../Subscriptions/RequireSubscription';
import { Context } from '../context/Context';

const ChatWindow = ({ recipient }) => {
  const [messages, setMessages] = useState([]);
  console.log(messages)
  const [socket, setSocket] = useState(null);
  const token = localStorage.getItem('authToken');
  const chatContainerRef = useRef(null);
  const [isSending, setIsSending] = useState(false);
  const { subscriptionStatus } = useContext(Context);
  const [isConversationExpired, setIsConversationExpired] = useState(false);
  // Get allowed file types based on subscription plan
  const getAllowedFileTypes = () => {
    const plan = subscriptionStatus?.plan?.toUpperCase();
    switch (plan) {
      case 'BASIC':
        return {
          types: ['image/jpeg', 'image/png'],
          accept: 'image/jpeg,image/png',
          maxSize: 5 * 1024 * 1024, // 5MB
          description: 'Images (JPEG, PNG)'
        };
      case 'GROWTH':
        return {
          types: ['image/jpeg', 'image/png', 'video/mp4', 'video/avi', 'video/mov', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          accept: 'image/jpeg,image/png,video/mp4,video/avi,video/mov,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          maxSize: 25 * 1024 * 1024, // 25MB
          description: 'Images, Videos, Documents'
        };
      case 'BUSINESS PRO':
        return {
          types: ['image/jpeg', 'image/png', 'video/mp4', 'video/avi', 'video/mov', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
          accept: 'image/jpeg,image/png,video/mp4,video/avi,video/mov,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          maxSize: 50 * 1024 * 1024, // 50MB
          description: 'All media types'
        };
      default:
        return {
          types: [],
          accept: '',
          maxSize: 0,
          description: 'No file uploads allowed'
        };
    }
  };

  const allowedFiles = getAllowedFileTypes();

  // Check if file type is allowed
  const isFileTypeAllowed = (file) => {
    return allowedFiles.types.includes(file.type);
  };

  // Get file type category for display
  const getFileCategory = (fileType) => {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'video';
    if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('word') || fileType.includes('excel')) return 'document';
    return 'file';
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format timestamp to match ChatList
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  // Format date for separator
  const formatDateSeparator = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // WebSocket connection
  useEffect(() => {
    if (!recipient || !token) return;

    const connectWebSocket = () => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      const backendHost = API_BASE_URL.replace('http://', '').replace('https://', '');
      const wsUrl = `${wsProtocol}${backendHost}/ws/chat/${recipient}/?token=${token}`;

      const newSocket = new WebSocket(wsUrl);

      newSocket.onopen = () => {
        setSocket(newSocket);
      };

      newSocket.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'connection_success') {
            // WebSocket connection successful
          } else if (data.message?.action === 'new_message') {
            const newMessage = data.message.data;
            // console.log('Received new message via WebSocket:', newMessage);
            if (newMessage.recipient === recipient) {
              setMessages((prev) =>
                prev.some((msg) => msg.message_id === newMessage.message_id)
                  ? prev
                  : [...prev, newMessage]
              );
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      newSocket.onclose = (e) => {
        setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };

      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return newSocket;
    };

    const ws = connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [recipient, token]);

  // Fetch initial messages and reset on recipient change
  useEffect(() => {
  setMessages([]);
  setIsConversationExpired(false);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chats/${recipient}/`, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = response.data;
      const uniqueMessages = data.Data.reduce((acc, msg) => {
        if (!acc.some((m) => msg.message_id && m.message_id === msg.message_id)) {
          acc.push(msg);
        }
        return acc;
      }, []);
      setMessages(uniqueMessages);

      // Check expiration
      if (data.expired === true) {
        setIsConversationExpired(true);
      } else {
        // fallback: check from last message if backend didn't send `expired`
        if (uniqueMessages.length > 0) {
          const lastMsg = uniqueMessages.reduce((a, b) =>
            new Date(a.timestamp) > new Date(b.timestamp) ? a : b
          );
          const diffHours = (Date.now() - new Date(lastMsg.timestamp)) / (1000 * 60 * 60);
          if (diffHours > 24) {
            setIsConversationExpired(true);
          }
        }
      }
    } catch (error) {
      console.error('Initial chat fetch failed:', error);
      alert(`Error: ${error.response?.data?.error || 'Failed to fetch messages'}`);
    }
  };

  if (recipient) {
    fetchMessages();
  }
}, [recipient, token]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const [selectedFile, setSelectedFile] = useState(null);
  // console.log(selectedFile)
  const [filePreview, setFilePreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file type is allowed for current plan
    if (!isFileTypeAllowed(file)) {
      alert(`File type not allowed. Your ${subscriptionStatus?.plan || 'current'} plan supports: ${allowedFiles.description}`);
      return;
    }

    // Check file size
    if (file.size > allowedFiles.maxSize) {
      alert(`File size too large. Maximum allowed: ${formatFileSize(allowedFiles.maxSize)}`);
      return;
    }

    setSelectedFile(file);
    
    // Create preview based on file type
    const fileCategory = getFileCategory(file.type);
    if (fileCategory === 'image') {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
  };

  const cancelFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const confirmFileSend = (e) => {
    handleSubmit(e);
    cancelFile();
  };

  const [formData, setFormData] = useState({
    url: '',
    message_text: '',
    recipient: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message_text.trim() && !selectedFile) {
      alert('Please enter a message or select a file');
      return;
    }
    setIsSending(true);

    try {
      if (selectedFile) {
        const fileFormData = new FormData();
        fileFormData.append('recipient', recipient);
        fileFormData.append('message_text', formData.message_text);
        fileFormData.append('url', selectedFile);

        await axios.post(
          `${API_BASE_URL}/api/whatsapp/send-message/`,
          fileFormData,
          {
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        const updatedFormData = {
          recipient,
          message_text: formData.message_text,
          url: ''
        };

        await axios.post(
          `${API_BASE_URL}/api/whatsapp/send-message/`,
          updatedFormData,
          {
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      setFormData({
        url: '',
        message_text: '',
        recipient: ''
      });
      cancelFile();
    } catch (error) {
      console.error('Error sending message:', error);
      alert(`Error: ${error.response?.data?.error || 'Something went wrong'}`);
    } finally {
      setIsSending(false);
    }
  };

  // Render media content based on type and subscription
  const renderMediaContent = (msg, isOutbound = false) => {
    const plan = subscriptionStatus?.plan?.toUpperCase();
    
    if (msg.media_url) {
      // For BASIC plan users, only show images
      if (plan === 'BASIC' && msg.media_type !== 'image') {
        return (
          <div className="mb-2 p-3 bg-gray-100 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 7a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V7zM6 3a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Media content (Upgrade to view)</span>
            </div>
          </div>
        );
      }

      // Show media based on type
      if (msg.media_type === 'image') {
        return (
          <div className="mb-2">
            <img
              src={msg.media_url}
              crossOrigin="anonymous"
              alt={isOutbound ? "Sent media" : "Received media"}
              className="max-w-full h-auto rounded-lg max-h-40 md:max-h-60 object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
              loading="lazy"
            />
          </div>
        );
      } else if (msg.media_type === 'video') {
        return (
          <div className="mb-2">
            <video
              src={msg.media_url}
              controls
              className="max-w-full h-auto rounded-lg max-h-40 md:max-h-60"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          </div>
        );
      } else if (msg.media_type === 'document') {
        return (
          <div className="mb-2 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="text-sm font-medium text-gray-900">Document</div>
                <a 
                  href={`${msg.media_url}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Click to view
                </a>
                
              </div>
            </div>
          </div>
        );
      }
    }
    return null;
  };

  // Group messages by date for separators
  const groupedMessages = messages.reduce((acc, msg) => {
    const date = new Date(msg.timestamp).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <RequireSubscription>
      <div className="flex flex-col min-h-screen">
        {/* Chat Header */}
        <div className="hidden md:flex md:justify-between md:items-center md:text-emerald-600 md:p-2 md:sticky md:top-0 md:z-10 md:bg-white md:border-b">
          <span className="font-medium">{recipient}</span>
          <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {subscriptionStatus?.plan || 'Free'} Plan
          </div>
        </div>

        {/* Chat Content */}
        <div
          id="chat_container"
          ref={chatContainerRef}
          className="overflow-y-auto grow h-[calc(70vh-50px)] md:h-[calc(100vh-150px)] p-2 md:p-4 pb-16 md:pb-4"
        >
          <ul id="chat_messages" className="flex flex-col gap-3">
            {Object.keys(groupedMessages)
              .sort((a, b) => new Date(a) - new Date(b))
              .map((date) => (
                <React.Fragment key={date}>
                  <li className="text-center my-2">
                    <span className="inline-block bg-gray-200 text-gray-700 text-sm px-4 py-1 rounded-full">
                      {formatDateSeparator(date)}
                    </span>
                  </li>
                  {groupedMessages[date]
                    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                    .map((msg) => (
                      <li key={msg.id}>
                        {msg.direction === 'OUTBOUND' ? (
                          <>
                            <div className="flex justify-end mb-3">
                              <div className="bg-green-200 rounded-l-lg rounded-tr-lg p-3 md:p-4 max-w-[70%] shadow-sm">
                                {msg.header_text && (
                                  <h1 className="font-semibold text-sm md:text-base">{msg.header_text}</h1>
                                )}
                                {renderMediaContent(msg, true)}
                                <span className="text-sm md:text-base break-words whitespace-pre-wrap">{msg.text_content}</span>
                                <div className="text-xs md:text-sm text-gray-600 mt-1 flex justify-end">
                                  <span>{formatTimestamp(msg.timestamp)} · {msg.status}</span>
                                </div>
                              </div>
                              <div className="flex items-end">
                                <svg height="13" width="8">
                                  <path fill="#bbf7d0" d="M6.3,10.4C1.5,8.7,0.9,5.5,0,0.2L0,13l5.2,0C7,13,9.6,11.5,6.3,10.4z" />
                                </svg>
                              </div>
                            </div>
                            {msg.button_text && (
                              <div className="flex justify-end items-center mb-3">
                                <span className="bg-zinc-100 rounded-l-lg rounded-tr-lg min-w-[70%] text-center text-blue-500 text-sm md:text-base p-2 shadow-sm">
                                  {msg.button_text}
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex justify-start mb-3">
                            <div className="flex items-end">
                              <svg height="13" width="8">
                                <path fill="white" d="M2.8,13L8,13L8,0.2C7.1,5.5,6.5,8.7,1.7,10.4C-1.6,11.5,1,13,2.8,13z" />
                              </svg>
                            </div>
                            <div className="bg-white p-3 md:p-4 max-w-[75%] rounded-r-lg rounded-tl-lg shadow-sm">
                              {renderMediaContent(msg, false)}
                              <span className="text-sm md:text-base break-all break-words whitespace-pre-wrap overflow-hidden">{msg.text_content}</span>
                              <div className="text-xs md:text-sm text-gray-600 mt-1">
                                {formatTimestamp(msg.timestamp)} · {msg.status}
                              </div>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                </React.Fragment>
              ))}
          </ul>
        </div>

      {/* Chat Input */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 shadow-sm p-2 md:p-3">
        {isConversationExpired ? (
          // Show 24-hour Expired Notice
          <div className="bg-yellow-100 text-yellow-800 text-center py-2 px-3 text-sm border-t border-yellow-300">
            ⚠️ This conversation has expired. You can no longer send free-form messages after 24 hours.
          </div>
        ) : (
          <>
            <form
              id="chat_message_form"
              className="w-full flex items-center gap-2"
              onSubmit={handleSubmit}
            >
              {allowedFiles.types.length > 0 && (
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full cursor-pointer transition"
                  title={`Upload ${allowedFiles.description}`}
                >
                  <svg
                    className="w-4 md:w-5 h-4 md:h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                </label>
              )}

              <input
                onChange={handleFileChange}
                type="file"
                className="sr-only"
                accept={allowedFiles.accept}
                id="file-upload"
                name="url"
                disabled={allowedFiles.types.length === 0}
              />

              <input
                value={formData.message_text}
                onChange={handleChange}
                type="text"
                name="message_text"
                placeholder="Type your message..."
                maxLength="150"
                className="flex-1 px-2 md:px-4 py-1 md:py-2 bg-gray-100 rounded-full text-sm md:text-base text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="hidden"
                name="recipient"
                value={recipient}
                onChange={handleChange}
              />

              <button
                type="submit"
                disabled={isSending}
                className="flex items-center px-2 md:px-4 py-1 md:py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base font-medium rounded-full transition disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <svg
                      className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l5-5-5-5v4a12 12 0 00-12 12h4z"
                      />
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send'
                )}
              </button>
            </form>

            {/* File Preview */}
            {selectedFile && (
              <div className="mt-2 md:mt-4 bg-gray-50 border rounded-lg p-2 md:p-3">
                <p className="text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                  Selected {getFileCategory(selectedFile.type)}: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>

                {filePreview ? (
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-full h-auto rounded-lg mb-2 md:mb-3 max-h-40"
                  />
                ) : (
                  <div className="mb-2 md:mb-3 p-4 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-600">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-sm">{selectedFile.name}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    onClick={cancelFile}
                    type="button"
                    className="px-2 md:px-3 py-1 text-sm md:text-base text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmFileSend}
                    type="button"
                    disabled={isSending}
                    className="px-2 md:px-3 py-1 text-sm md:text-base text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSending ? 'Sending...' : `Send ${getFileCategory(selectedFile.type)}`}
                  </button>
                </div>
              </div>
            )}

            {/* Plan limitations notice */}
            {subscriptionStatus?.plan && (
              <div className="mt-2 text-xs text-gray-500 text-center">
                {subscriptionStatus.plan.toUpperCase()} Plan: {allowedFiles.description} allowed
                {allowedFiles.types.length === 0 && (
                  <span className="text-orange-600"> - Upgrade to send files</span>
                )}
              </div>
            )}
            </>
  )}
</div>

                  
          
      </div>
    </RequireSubscription>
  );
};

export default ChatWindow; 