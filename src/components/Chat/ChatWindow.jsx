import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { assest } from '../../assets/assets';
import RequireSubscription from '../Subscriptions/RequireSubscription';
import { Context } from '../context/Context';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
const ChatWindow = ({ recipient }) => {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const token = localStorage.getItem('authToken');
  const chatContainerRef = useRef(null);
  const [isSending, setIsSending] = useState(false);
  const { subscriptionStatus } = useContext(Context);
  const [isConversationExpired, setIsConversationExpired] = useState(false);
  const [error, setError] = useState(false);
  
  // ========== NEW: Flow Session States ==========
  const [activeFlow, setActiveFlow] = useState(null);
  const [isFlowPaused, setIsFlowPaused] = useState(false);
  const [availableFlows, setAvailableFlows] = useState([]);
  const [selectedFlowId, setSelectedFlowId] = useState(null);
  const [selectedSessionId, setSessionFlowId] = useState(null);

  const [showFlowSelector, setShowFlowSelector] = useState(false);
  const [interactiveButtons, setInteractiveButtons] = useState([]);
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);
  const [newButtonTitle, setNewButtonTitle] = useState('');
  // =============================================

  // Get allowed file types based on subscription plan
  const getAllowedFileTypes = () => {
    const plan = subscriptionStatus?.plan?.toUpperCase();
    switch (plan) {
      case 'BASIC':
        return {
          types: ['image/jpeg', 'image/png'],
          accept: 'image/jpeg,image/png',
          maxSize: 5 * 1024 * 1024,
          description: 'Images (JPEG, PNG)'
        };
      case 'GROWTH':
        return {
          types: ['image/jpeg', 'image/png', 'video/mp4', 'video/avi', 'video/mov', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          accept: 'image/jpeg,image/png,video/mp4,video/avi,video/mov,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          maxSize: 25 * 1024 * 1024,
          description: 'Images, Videos, Documents'
        };
      case 'BUSINESS PRO':
        return {
          types: ['image/jpeg', 'image/png', 'video/mp4', 'video/avi', 'video/mov', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
          accept: 'image/jpeg,image/png,video/mp4,video/avi,video/mov,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          maxSize: 50 * 1024 * 1024,
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

  const isFileTypeAllowed = (file) => {
    return allowedFiles.types.includes(file.type);
  };

  const getFileCategory = (fileType) => {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'video';
    if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('word') || fileType.includes('excel')) return 'document';
    return 'file';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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

  // ========== NEW: Fetch Available Flows ==========
  useEffect(() => {
    const fetchFlows = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/flows/list/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setAvailableFlows(response.data.data || []);
      } catch (error) {
        console.error('Error fetching flows:', error);
      }
    };

    if (token) {
      fetchFlows();
    }
  }, [token]);
  
  // ========== NEW: Fetch Flow Status for Recipient ==========
  useEffect(() => {
    const fetchFlowStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/flows/status/?phone_number=${recipient}`, {
          headers: { Authorization: `Token ${token}` }
        });
        const { success, data, message } = response.data;
      
          if (success && data) {
            // ✅ Active flow exists
            setActiveFlow(data);
            setSelectedFlowId(data.flow || null);
            setSessionFlowId(data.id || null);
            setIsFlowPaused(data.completed || false);
          } else {
            // ✅ No active session
            setActiveFlow(null);
            setSelectedFlowId(null);
            setSessionFlowId(null);
            setIsFlowPaused(false);
            // console.log(message || "No active flow session found");
          }
        } catch (error) {
          console.error(
            "Error fetching flow status:",
            error.response?.data?.error || error.message
          );
        }
      };

      if (recipient && token) {
        fetchFlowStatus();
      }
    }, [recipient, token]);

 
  // ========== NEW: Flow Control Handlers ==========
  const handleStartFlow = async () => {
    if (!selectedFlowId) {
      alert('Please select a flow first');
      return;
    }
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/flows/start/`,
        { phone_number:recipient, flow_id: selectedFlowId },
        { headers: { Authorization: `Token ${token}` } }
      );
      //  ✅ Use backend success structure
      const data = response.data;

      setActiveFlow(data?.data); // your backend uses "data" for session info
      setShowFlowSelector(false);
      toast.success(data?.message || 'Flow started successfully');
    } catch (error) {
      console.error('Error starting flow:', error);

      // ✅ Safely extract backend error message
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to start flow';

      toast.error(`Error: ${errorMessage}`);
    };
  }

  // ========= NEW: Unified Flow Action Handler ==========
  const handleFlowAction = async (action) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/flows/update-status/`,
        { 
          session_id: selectedSessionId,
          action, // 'pause', 'resume', or 'stop'
        },
        { headers: { Authorization: `Token ${token}` } }
      );

      const message = response.data.message || `Flow ${action}d successfully`;
      toast.success(message);

      // Update local state based on the action
      if (action === 'pause') {
        setIsFlowPaused(true);
      } else if (action === 'resume') {
        setIsFlowPaused(false);
      } else if (action === 'stop') {
        setActiveFlow(null);
        setIsFlowPaused(false);
      }

    } catch (error) {
      console.error(`Error performing ${action} on flow:`, error);
      const errorMsg = error.response?.data?.error || `Failed to ${action} flow`;
      toast.error(errorMsg);
    }
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
            if (newMessage.recipient === recipient) {
              setMessages((prev) =>
                prev.some((msg) => msg.message_id === newMessage.message_id)
                  ? prev
                  : [...prev, newMessage]
              );
            }
          }
          //  else if (data.flow_update) {
          //   // ========== NEW: Handle Flow Updates via WebSocket ==========
          //   setActiveFlow(data.flow_update);
          //   setIsFlowPaused(data.flow_update.paused || false);
          // }
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

  // Fetch initial messages
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

        if (data.expired === true) {
          setIsConversationExpired(true);
        } else {
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

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!isFileTypeAllowed(file)) {
      alert(`File type not allowed. Your ${subscriptionStatus?.plan || 'current'} plan supports: ${allowedFiles.description}`);
      return;
    }

    if (file.size > allowedFiles.maxSize) {
      alert(`File size too large. Maximum allowed: ${formatFileSize(allowedFiles.maxSize)}`);
      return;
    }

    setSelectedFile(file);
    
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
    // Basic validation
    if (
      !formData.message_text.trim() &&
      !selectedFile &&
      interactiveButtons.length === 0
    ) {
      alert('Please enter a message, select a file, or add buttons');
      return;
    }
    setIsSending(true);

    try {
      if (selectedFile) {
        const fileFormData = new FormData();
        fileFormData.append('recipient', recipient);
        fileFormData.append('message_text', formData.message_text);
        fileFormData.append('url', selectedFile);

        // ✅ include buttons if interactiveButtons exist
        if (interactiveButtons.length > 0) {
          fileFormData.append('buttons', JSON.stringify(interactiveButtons));
        }
        
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
        // ✅ include buttons when present
        if (interactiveButtons.length > 0) {
          updatedFormData.buttons = interactiveButtons;
        }

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

      // ✅ Reset interactive state
      setInteractiveButtons([]);
      setIsInteractiveMode(false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert(`Error: ${error.response?.data?.error || 'Something went wrong'}`);
    } finally {
      setIsSending(false);
    }
  };

  const renderMediaContent = (msg, isOutbound = false) => {
    const plan = subscriptionStatus?.plan?.toUpperCase();
    
    if (msg.media_url) {
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

      if (msg.media_type === 'image') {
        return (
          <div className="mb-2">
            {!error ? (
              <img
                src={msg.media_url}
                crossOrigin="anonymous"
                alt={isOutbound ? "Sent media" : "Received media"}
                className="max-w-full h-auto rounded-lg max-h-40 md:max-h-60 object-contain"
                loading="lazy"
                onError={() => setError(true)}
              />
            ) : (
              <div className="text-sm text-red-500 italic mt-2">
                Image not loaded
              </div>
            )}
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

  // ========== NEW: Render Interactive Buttons ==========
    const renderInteractiveButtons = (msg) => {
    if (!msg.buttons || msg.buttons.length === 0) return null;

    const isReadOnly = !!msg.button_text; // disable click if message has button_text

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {msg.buttons.map((btn, index) => (
          <button
            key={btn.id || index}
            // onClick={isReadOnly ? null : () => handleButtonClick(btn, msg.message_id)}
            disabled={isReadOnly}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors duration-200 shadow-sm ${
              isReadOnly
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {btn.title}
          </button>
        ))}
      </div>
    );
  };


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
        {/* ✅ Mobile Header with Flow Controls */}
      
        <div className="p-2  bg-white border-b border-gray-200 sticky top-0 z-50 flex justify-between items-center gap-2">

          {/* Back button + recipient */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="block md:hidden p-1.5 bg-gray-200 rounded-full hover:bg-gray-300 transition"
            >
              <svg
                className="h-5 w-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <span className="text-sm md:text-base font-semibold text-gray-800 truncate max-w-[150px] md:max-w-[250px]">
              {recipient}
            </span>
          </div>

         
          {/* Flow Control Buttons */}
          <div className="flex items-center gap-1.5 md:gap-2 justify-end">
            {!activeFlow ? (
              <button
                onClick={() => setShowFlowSelector(!showFlowSelector)}
                className="bg-green-500 hover:bg-green-600 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm transition-colors duration-200"
              >
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span className="hidden sm:inline">Start Flow</span>
                  <span className="sm:hidden">Start</span>
                </span>
              </button>
            ) : (
              <>
                {isFlowPaused ? (
                  <button
                    onClick={() => handleFlowAction('resume')}
                    className="bg-green-500 hover:bg-green-600 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm transition-colors duration-200"
                  >
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      <span className="hidden sm:inline">Resume</span>
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleFlowAction('pause')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm transition-colors duration-200"
                  >
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="hidden sm:inline">Pause</span>
                    </span>
                  </button>
                )}

                <button
                  onClick={() => handleFlowAction('stop')}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm ml-1 md:ml-2 transition-colors duration-200"
                >
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden sm:inline">Stop</span>
                  </span>
                </button>
              </>
            )}
          </div>

        </div>

        {/* ========== NEW: Flow Selector Dropdown ========== */}
        {showFlowSelector && (
          <div className="bg-blue-50 border-b border-blue-200 p-3">
            <div className="flex items-center gap-3">
              <select
                value={selectedFlowId || ''}
                onChange={(e) => setSelectedFlowId(e.target.value)}
                className="flex-1 px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a flow...</option>
                {availableFlows.map((flow) => (
                  <option key={flow.id} value={flow.id}>
                    {flow.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleStartFlow}
                disabled={!selectedFlowId}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Start
              </button>
              <button
                onClick={() => setShowFlowSelector(false)}
                className="text-gray-600 hover:text-gray-800 px-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ========== NEW: Active Flow Status Bar ========== */}
        {activeFlow && (
          <div className={`border-b p-3 ${isFlowPaused ? 'bg-yellow-50' : 'bg-green-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isFlowPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`}></div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">
                    {activeFlow.flow_name || 'Active Flow'}
                  </div>
                  <div className="text-xs text-gray-600">
                    {isFlowPaused ? 'Paused' : 'Running'} • Node: {activeFlow.current_node_id || 'Starting'}
                  </div>
                </div>
              </div>
              {activeFlow.progress !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-600">{activeFlow.progress}% Complete</div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${isFlowPaused ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${activeFlow.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
                                {renderInteractiveButtons(msg)}
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
                                  <div className="bg-zinc-100 rounded-l-lg rounded-tr-lg min-w-[70%] text-center p-3 shadow-sm">
                                    <div className="flex flex-wrap justify-center gap-2">
                                      {msg.button_text
                                        .split(',')
                                        .map((btnTitle, index) => (
                                          <span
                                            key={index}
                                            className="bg-white text-blue-500 text-sm md:text-base px-3 py-1.5 rounded-full shadow-sm cursor-default"
                                          >
                                            {btnTitle.trim()}
                                          </span>
                                        ))}
                                    </div>
                                  </div>
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
                              {renderInteractiveButtons(msg)}
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
          <div className="bg-yellow-100 text-yellow-800 text-center py-2 px-3 text-sm border-t border-yellow-300 rounded-md">
            ⚠️ This conversation has expired. You can no longer send free-form messages after 24 hours.
          </div>
        ) : (
          <>
            <form
              id="chat_message_form"
              className="w-full flex flex-wrap items-center gap-2 mb-2"
              onSubmit={handleSubmit}
            >
              {allowedFiles.types.length > 0 && (
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full cursor-pointer transition-colors p-2 sm:p-0"
                  title={`Upload ${allowedFiles.description}`}
                >
                  <svg
                    className="w-5 h-5"
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
                  placeholder={isInteractiveMode ? "Message body for buttons..." : "Type your message..."}
                  maxLength="150"
                  className="flex-1 min-w-[140px] px-3 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
                />
              
           

              <input
                type="hidden"
                name="recipient"
                value={recipient}
                onChange={handleChange}
              />

              <button
                type="submit"
                disabled={isSending ||(isInteractiveMode? !formData.message_text.trim() || interactiveButtons.length === 0
                      : (!formData.message_text.trim() && !selectedFile)
                  )
                }
                className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-full transition-colors shadow-sm min-h-[44px] min-w-[60px]"
              >
                {isSending ? (
                  <>
                    <svg
                      className="w-4 h-4 mr-2 animate-spin"
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

              {!isInteractiveMode && (
                <button
                  type="button"
                  onClick={() => {
                    setIsInteractiveMode(true);
                    setInteractiveButtons([]);
                    setNewButtonTitle('');
                  }}
                  className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 rounded-full transition-colors flex-shrink-0"
                >
                  + Interactive
                </button>
              )}
            </form>

            {/* Interactive Buttons Management */}
            {isInteractiveMode && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-semibold text-gray-800">Interactive Buttons</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setIsInteractiveMode(false);
                      setInteractiveButtons([]);
                      setNewButtonTitle('');
                    }}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Close
                  </button>
                </div>
                {interactiveButtons.length === 0 && (
                  <p className="text-xs text-gray-500 mb-2 italic">Add your first button below...</p>
                )}
                <div className="flex flex-wrap gap-2 mb-2">
                  {interactiveButtons.map((btn, i) => (
                    <span key={i} className="bg-white px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 flex items-center shadow-sm border border-gray-200">
                      {btn.title}
                      <button
                        type="button"
                        onClick={() => setInteractiveButtons(prev => prev.filter((_, idx) => idx !== i))}
                        className="ml-2 text-red-500 hover:text-red-600 p-0.5 rounded hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={newButtonTitle}
                    onChange={e => setNewButtonTitle(e.target.value)}
                    placeholder="e.g., Yes, No, Maybe"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[40px]"
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newButtonTitle.trim() && interactiveButtons.length < 4) {
                        setInteractiveButtons([...interactiveButtons, { id: `btn${Date.now()}`, title: newButtonTitle.trim() }]);
                        setNewButtonTitle('');
                      } else if (interactiveButtons.length >= 4) {
                        alert('Max 4 buttons allowed');
                      } else {
                        alert('Enter a button title');
                      }
                    }}
                    disabled={interactiveButtons.length >= 4 || !newButtonTitle.trim()}
                    className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors shadow-sm min-h-[40px] disabled:cursor-not-allowed"
                  >
                    + Add Button
                  </button>
                </div>
                {interactiveButtons.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">Max 4 buttons. Send to dispatch interactive message.</p>
                )}
              </div>
            )}

            {/* File Preview */}
            {selectedFile && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2 shadow-sm">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Selected {getFileCategory(selectedFile.type)}: <span className="text-gray-900">{selectedFile.name}</span> ({formatFileSize(selectedFile.size)})
                </p>

                {filePreview ? (
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-full h-auto rounded-lg mb-3 max-h-40 object-contain border"
                  />
                ) : (
                  <div className="mb-3 p-4 bg-gray-100 rounded-lg flex items-center justify-center">
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

                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <button
                    onClick={cancelFile}
                    type="button"
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmFileSend}
                    type="button"
                    disabled={isSending || (!formData.message_text.trim() && !selectedFile && (!isInteractiveMode || interactiveButtons.length === 0))}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-md transition-colors shadow-sm disabled:cursor-not-allowed"
                  >
                    {isSending ? 'Sending...' : `Send ${getFileCategory(selectedFile.type)}`}
                  </button>
                </div>
              </div>
            )}

            {subscriptionStatus?.plan && (
              <div className="text-xs text-gray-500 text-center pt-1">
                <span className="font-medium">{subscriptionStatus.plan.toUpperCase()} Plan:</span> {allowedFiles.description} allowed
                {allowedFiles.types.length === 0 && (
                  <span className="text-orange-600 font-medium"> - Upgrade to send files</span>
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